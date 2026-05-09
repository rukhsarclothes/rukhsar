import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth, type AuthenticatedRequest } from "../../common/middleware/auth";
import {
  createOrder,
  getCouponByCode,
  getOrderById,
  getOrderByNumber,
  getOrders,
  getProducts,
  updateOrderStatus
} from "../../common/utils/file-store";

const router = Router();
const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  mobileNumber: z.string().min(10),
  pincode: z.string().min(4),
  state: z.string().min(2),
  city: z.string().min(2),
  landmark: z.string().optional(),
  addressLine: z.string().min(5)
});

router.post("/", (request, response) => {
  const payload = z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().positive(),
        size: z.string().optional()
      })
    ),
    paymentMethod: z.enum(["razorpay", "cod"]),
    couponCode: z.string().optional(),
    customerName: z.string().min(2),
    customerEmail: z.string().email().optional(),
    shippingAddress: shippingAddressSchema.optional(),
    paymentStatus: z.enum(["pending", "authorized", "paid", "failed", "refunded"]).optional()
  }).parse(request.body);

  const productsById = new Map(getProducts().map((product) => [product.id, product]));
  const missingItem = payload.items.find((item) => !productsById.has(item.productId));
  if (missingItem) {
    response.status(400).json({ success: false, message: `Product not found: ${missingItem.productId}` });
    return;
  }

  for (const item of payload.items) {
    const product = productsById.get(item.productId)!;
    if (item.size && !product.sizes.includes(item.size)) {
      response.status(400).json({
        success: false,
        message: `Size ${item.size} is not available for ${product.name}`
      });
      return;
    }

    const matchingVariants = item.size
      ? product.variants.filter((variant) => variant.size === item.size)
      : product.variants;
    const availableStock = matchingVariants.reduce((sum, variant) => sum + variant.stock, 0);

    if (availableStock < item.quantity) {
      response.status(400).json({
        success: false,
        message: `Only ${availableStock} unit(s) available for ${product.name}${item.size ? ` in size ${item.size}` : ""}`
      });
      return;
    }
  }

  const subtotal = payload.items.reduce((sum, item) => {
    const product = productsById.get(item.productId)!;
    return sum + item.quantity * product.salePrice;
  }, 0);

  const coupon = payload.couponCode ? getCouponByCode(payload.couponCode) : undefined;
  if (payload.couponCode && !coupon) {
    response.status(400).json({ success: false, message: "Coupon is invalid or inactive" });
    return;
  }

  if (coupon && subtotal < coupon.minOrderValue) {
    response.status(400).json({ success: false, message: "Minimum order value not met for this coupon" });
    return;
  }

  const discountAmount = coupon
    ? coupon.discountType === "percentage"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue
    : 0;
  const shippingAmount = payload.items.length > 0 ? 199 : 0;
  const totalAmount = Math.max(subtotal - discountAmount, 0) + shippingAmount;
  let order;
  try {
    order = createOrder({
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      subtotal,
      discountAmount,
      shippingAmount,
      totalAmount,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      couponCode: coupon?.code,
      shippingAddress: payload.shippingAddress,
      items: payload.items
    });
  } catch (error) {
    response.status(409).json({
      success: false,
      message: error instanceof Error ? error.message : "Unable to create order"
    });
    return;
  }

  response.status(201).json({
    success: true,
    item: order
  });
});

router.get("/", requireAuth, (request: AuthenticatedRequest, response) => {
  const orders = getOrders();
  if (request.user?.role === "admin") {
    response.json({ success: true, items: orders });
    return;
  }

  const visibleOrders = orders.filter((order) => {
    if (order.customerEmail && request.user?.email) {
      return order.customerEmail.toLowerCase() === request.user.email.toLowerCase();
    }

    return request.user?.fullName
      ? order.customerName.trim().toLowerCase() === request.user.fullName.trim().toLowerCase()
      : false;
  });

  response.json({ success: true, items: visibleOrders });
});

router.get("/track/:orderNumber", (request, response) => {
  const order = getOrderByNumber(request.params.orderNumber);
  response.json({ success: true, item: order ?? null });
});

router.get("/:id", requireAuth, (request: AuthenticatedRequest, response) => {
  const order = getOrderById(String(request.params.id));
  if (!order) {
    response.status(404).json({ success: false, message: "Order not found" });
    return;
  }

  const isAdmin = request.user?.role === "admin";
  const ownsByEmail =
    Boolean(order.customerEmail) &&
    Boolean(request.user?.email) &&
    order.customerEmail!.toLowerCase() === request.user!.email.toLowerCase();
  const ownsByName =
    Boolean(request.user?.fullName) &&
    order.customerName.trim().toLowerCase() === request.user!.fullName!.trim().toLowerCase();

  if (!isAdmin && !ownsByEmail && !ownsByName) {
    response.status(403).json({ success: false, message: "You do not have access to this order" });
    return;
  }

  response.json({ success: true, item: order });
});

router.patch("/:id/status", requireAuth, requireAdmin, (request, response) => {
  const payload = z.object({
    status: z.enum(["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"])
  }).parse(request.body);
  response.json({ success: true, item: updateOrderStatus(String(request.params.id), payload.status) });
});

export { router as ordersRouter };
