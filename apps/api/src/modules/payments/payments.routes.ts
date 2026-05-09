import crypto from "node:crypto";
import { Router } from "express";
import Razorpay from "razorpay";
import { z } from "zod";
import { env } from "../../config/env";
import { getCouponByCode, getProducts } from "../../common/utils/file-store";

const router = Router();

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      size: z.string().optional()
    })
  ).min(1),
  couponCode: z.string().optional(),
  currency: z.string().length(3).default("INR"),
  receipt: z.string().min(1).max(40).optional()
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

function getRazorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("Razorpay credentials are missing");
  }

  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret
  });
}

function calculateCheckoutTotal(input: z.infer<typeof createOrderSchema>) {
  const productsById = new Map(getProducts().map((product) => [product.id, product]));
  let subtotal = 0;

  for (const item of input.items) {
    const product = productsById.get(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (item.size && !product.sizes.includes(item.size)) {
      throw new Error(`Size ${item.size} is not available for ${product.name}`);
    }

    const matchingVariants = item.size
      ? product.variants.filter((variant) => variant.size === item.size)
      : product.variants;
    const availableStock = matchingVariants.reduce((sum, variant) => sum + variant.stock, 0);

    if (availableStock < item.quantity) {
      throw new Error(
        `Only ${availableStock} unit(s) available for ${product.name}${item.size ? ` in size ${item.size}` : ""}`
      );
    }

    subtotal += item.quantity * product.salePrice;
  }

  const coupon = input.couponCode ? getCouponByCode(input.couponCode) : undefined;
  if (input.couponCode && !coupon) {
    throw new Error("Coupon is invalid or inactive");
  }

  if (coupon && subtotal < coupon.minOrderValue) {
    throw new Error("Minimum order value not met for this coupon");
  }

  const discountAmount = coupon
    ? coupon.discountType === "percentage"
      ? Math.min(Math.round((subtotal * coupon.discountValue) / 100), subtotal)
      : Math.min(coupon.discountValue, subtotal)
    : 0;
  const shippingAmount = input.items.length > 0 ? 199 : 0;

  return {
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount: Math.max(subtotal - discountAmount, 0) + shippingAmount
  };
}

router.post("/create-order", async (request, response) => {
  const payload = createOrderSchema.safeParse(request.body);
  if (!payload.success) {
    response.status(400).json({ success: false, message: "Cart items and currency must be valid" });
    return;
  }

  try {
    const totals = calculateCheckoutTotal(payload.data);
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: totals.totalAmount * 100,
      currency: payload.data.currency,
      receipt: payload.data.receipt ?? `rukhsar-${Date.now()}`
    });

    response.json({
      success: true,
      item: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        totals
      }
    });
  } catch (error: unknown) {
    const apiError = error as {
      statusCode?: number;
      error?: { description?: string };
      message?: string;
    };

    if (apiError.statusCode === 401) {
      response.status(401).json({
        success: false,
        message: apiError.error?.description ?? apiError.message ?? "Razorpay authentication failed"
      });
      return;
    }

    response.status(500).json({
      success: false,
      message: apiError.error?.description ?? apiError.message ?? "Unable to create Razorpay order"
    });
  }
});

router.post("/verify-payment", (request, response) => {
  const payload = verifyPaymentSchema.safeParse(request.body);
  if (!payload.success) {
    response.status(400).json({ success: false, message: "Missing required payment verification fields" });
    return;
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload.data;
  if (!env.razorpayKeySecret) {
    response.status(500).json({ success: false, message: "Razorpay credentials are missing" });
    return;
  }

  if (orderId !== razorpayOrderId) {
    response.status(400).json({ success: false, message: "Order mismatch during payment verification" });
    return;
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${orderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expected = Buffer.from(generatedSignature, "hex");
  const received = Buffer.from(razorpaySignature, "hex");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    response.status(400).json({ success: false, message: "Payment signature mismatch" });
    return;
  }

  response.json({
    success: true,
    message: "Payment signature verified",
    item: {
      orderId,
      razorpayPaymentId,
      razorpayOrderId
    }
  });
});

router.post("/cod", (request, response) => {
  const payload = z.object({ orderId: z.string(), totalAmount: z.number().positive() }).parse(request.body);
  response.json({ success: true, message: "COD registered", item: payload });
});

export { router as paymentsRouter };
