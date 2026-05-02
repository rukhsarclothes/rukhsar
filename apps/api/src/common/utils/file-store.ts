import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { Coupon, Order, OrderItem, OrderStatus, Product, UserRole } from "@rukhsar/types";

type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

type StoreShape = {
  categories: string[];
  users: StoredUser[];
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
};

type ProductInput = {
  name: string;
  slug: string;
  category: string;
  collection: string;
  basePrice: number;
  salePrice: number;
  fabric: string;
  color: string;
  description: string;
  longDescription: string;
  sizes: string[];
  status?: Product["status"];
};

type ProductUpdateInput = Partial<ProductInput>;

type CouponInput = {
  code: string;
  description: string;
  discountType: Coupon["discountType"];
  discountValue: number;
  minOrderValue: number;
  active?: boolean;
};

type CouponUpdateInput = Partial<CouponInput>;

type CustomerSummary = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  orderCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
};

type DashboardAlert = {
  id: string;
  title: string;
  detail: string;
  tone: "critical" | "warning" | "info";
};

const storePath = path.resolve(__dirname, "../../../data/store.json");

function readStore(): StoreShape {
  const raw = fs.readFileSync(storePath, "utf8");
  const parsed = JSON.parse(raw) as StoreShape;

  return {
    ...parsed,
    products: parsed.products.map((product) => ({
      ...product,
      status: product.status ?? "active"
    })),
    coupons: parsed.coupons.map((coupon) => ({
      ...coupon,
      active: coupon.active ?? true
    })),
    orders: parsed.orders.map((order) => ({
      ...order,
      items: order.items ?? []
    }))
  };
}

function writeStore(store: StoreShape) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function normaliseSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function totalProductStock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

function buildCustomerSummaries(store: StoreShape): CustomerSummary[] {
  return store.users
    .filter((user) => user.role === "customer")
    .map((user) => {
      const matchingOrders = store.orders.filter(
        (order) => order.customerName.trim().toLowerCase() === user.fullName.trim().toLowerCase()
      );
      const lastOrder = [...matchingOrders].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt)
      )[0];

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        orderCount: matchingOrders.length,
        totalSpend: matchingOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        lastOrderAt: lastOrder?.createdAt ?? null
      };
    })
    .sort((left, right) => right.totalSpend - left.totalSpend);
}

function buildTopProducts(store: StoreShape) {
  const salesByProduct = new Map<
    string,
    {
      id: string;
      name: string;
      revenue: number;
      unitsSold: number;
      stock: number;
    }
  >();

  for (const product of store.products) {
    salesByProduct.set(product.id, {
      id: product.id,
      name: product.name,
      revenue: 0,
      unitsSold: 0,
      stock: totalProductStock(product)
    });
  }

  for (const order of store.orders) {
    for (const item of order.items ?? []) {
      const entry = salesByProduct.get(item.productId);
      if (!entry) {
        continue;
      }

      entry.revenue += item.unitPrice * item.quantity;
      entry.unitsSold += item.quantity;
    }
  }

  return [...salesByProduct.values()]
    .sort((left, right) => {
      if (right.revenue !== left.revenue) {
        return right.revenue - left.revenue;
      }
      if (right.unitsSold !== left.unitsSold) {
        return right.unitsSold - left.unitsSold;
      }
      return left.stock - right.stock;
    })
    .slice(0, 5);
}

function buildAlerts(store: StoreShape): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const lowStockVariants = store.products.flatMap((product) =>
    product.variants
      .filter((variant) => variant.stock < 4)
      .map((variant) => ({
        productName: product.name,
        sku: variant.sku,
        stock: variant.stock
      }))
  );
  const paymentPending = store.orders.filter((order) => order.paymentStatus === "pending");
  const unfulfilled = store.orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status)
  );

  if (lowStockVariants.length > 0) {
    alerts.push({
      id: "low-stock",
      title: "Low stock needs replenishment",
      detail: `${lowStockVariants.length} SKU variants are below the safe threshold.`,
      tone: lowStockVariants.some((item) => item.stock === 0) ? "critical" : "warning"
    });
  }

  if (paymentPending.length > 0) {
    alerts.push({
      id: "payment-followup",
      title: "Pending payment follow-up",
      detail: `${paymentPending.length} orders still need payment confirmation or COD review.`,
      tone: "warning"
    });
  }

  if (unfulfilled.length > 0) {
    alerts.push({
      id: "fulfillment-queue",
      title: "Fulfillment queue is active",
      detail: `${unfulfilled.length} orders are still moving through packing or shipping.`,
      tone: "info"
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "steady-state",
      title: "Operations are stable",
      detail: "No urgent issues detected across inventory, payments, or fulfillment.",
      tone: "info"
    });
  }

  return alerts;
}

export function getCategories() {
  return readStore().categories;
}

export function getUsers() {
  return readStore().users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  }));
}

export function getCustomersDetailed() {
  return buildCustomerSummaries(readStore());
}

export function getProducts(options?: { includeArchived?: boolean }) {
  const products = readStore().products;

  if (options?.includeArchived) {
    return products;
  }

  return products.filter((product) => (product.status ?? "active") === "active");
}

export function getProductBySlug(slug: string) {
  return readStore().products.find(
    (product) => product.slug === slug && (product.status ?? "active") === "active"
  );
}

export function createProduct(input: ProductInput) {
  const store = readStore();
  const slug = normaliseSlug(input.slug);

  if (store.products.some((product) => product.slug === slug)) {
    throw new Error("A product with this slug already exists");
  }

  const now = Date.now();
  const product: Product = {
    id: `p${now}`,
    name: input.name,
    slug,
    category: input.category,
    collection: input.collection,
    basePrice: input.basePrice,
    salePrice: input.salePrice,
    fabric: input.fabric,
    color: input.color,
    description: input.description,
    longDescription: input.longDescription,
    careInstructions: ["Dry clean only"],
    sizes: input.sizes,
    images: [],
    tags: ["new"],
    status: input.status ?? "active",
    featured: false,
    rating: 0,
    reviewCount: 0,
    variants: input.sizes.map((size, index) => ({
      id: `v${now}-${index + 1}`,
      size,
      color: input.color,
      stock: 0,
      sku: `RUK-${slug.toUpperCase().slice(0, 8)}-${size.replace(/\s+/g, "").toUpperCase()}`
    })),
    reviews: []
  };

  store.products.unshift(product);
  writeStore(store);
  return product;
}

export function updateProduct(id: string, input: ProductUpdateInput) {
  const store = readStore();
  const product = store.products.find((entry) => entry.id === id);

  if (!product) {
    return null;
  }

  const nextSlug = input.slug ? normaliseSlug(input.slug) : product.slug;
  if (store.products.some((entry) => entry.id !== id && entry.slug === nextSlug)) {
    throw new Error("A product with this slug already exists");
  }

  product.name = input.name ?? product.name;
  product.slug = nextSlug;
  product.category = input.category ?? product.category;
  product.collection = input.collection ?? product.collection;
  product.basePrice = input.basePrice ?? product.basePrice;
  product.salePrice = input.salePrice ?? product.salePrice;
  if (product.salePrice > product.basePrice) {
    throw new Error("Sale price cannot exceed base price");
  }
  product.fabric = input.fabric ?? product.fabric;
  product.color = input.color ?? product.color;
  product.description = input.description ?? product.description;
  product.longDescription = input.longDescription ?? product.longDescription;
  product.status = input.status ?? product.status ?? "active";

  if (input.sizes && input.sizes.length > 0) {
    const previousVariantsBySize = new Map(product.variants.map((variant) => [variant.size, variant]));
    product.sizes = input.sizes;
    product.variants = input.sizes.map((size, index) => {
      const existing = previousVariantsBySize.get(size);
      return {
        id: existing?.id ?? `v${Date.now()}-${index + 1}`,
        size,
        color: input.color ?? existing?.color ?? product.color,
        stock: existing?.stock ?? 0,
        sku:
          existing?.sku ??
          `RUK-${product.slug.toUpperCase().slice(0, 8)}-${size.replace(/\s+/g, "").toUpperCase()}`
      };
    });
  } else if (input.color) {
    product.variants = product.variants.map((variant) => ({
      ...variant,
      color: input.color ?? variant.color
    }));
  }

  writeStore(store);
  return product;
}

export function archiveProduct(id: string) {
  return updateProduct(id, { status: "archived" });
}

export function getCoupons(options?: { activeOnly?: boolean }) {
  const coupons = readStore().coupons;
  return options?.activeOnly ? coupons.filter((coupon) => coupon.active !== false) : coupons;
}

export function getCouponByCode(code: string) {
  return readStore().coupons.find(
    (coupon) =>
      coupon.code.toUpperCase() === code.toUpperCase() &&
      coupon.active !== false
  );
}

export function createCoupon(input: CouponInput) {
  const store = readStore();
  if (store.coupons.some((coupon) => coupon.code.toUpperCase() === input.code.toUpperCase())) {
    throw new Error("Coupon already exists");
  }

  const coupon: Coupon = {
    id: `cp${Date.now()}`,
    code: input.code.toUpperCase(),
    description: input.description,
    discountType: input.discountType,
    discountValue: input.discountValue,
    minOrderValue: input.minOrderValue,
    active: input.active ?? true
  };

  store.coupons.unshift(coupon);
  writeStore(store);
  return coupon;
}

export function updateCoupon(id: string, input: CouponUpdateInput) {
  const store = readStore();
  const coupon = store.coupons.find((entry) => entry.id === id);

  if (!coupon) {
    return null;
  }

  const nextCode = input.code ? input.code.toUpperCase() : coupon.code;
  if (store.coupons.some((entry) => entry.id !== id && entry.code.toUpperCase() === nextCode)) {
    throw new Error("Coupon already exists");
  }

  coupon.code = nextCode;
  coupon.description = input.description ?? coupon.description;
  coupon.discountType = input.discountType ?? coupon.discountType;
  coupon.discountValue = input.discountValue ?? coupon.discountValue;
  coupon.minOrderValue = input.minOrderValue ?? coupon.minOrderValue;
  coupon.active = input.active ?? coupon.active ?? true;

  writeStore(store);
  return coupon;
}

export function getOrders() {
  return readStore().orders;
}

export function getOrderById(id: string) {
  return readStore().orders.find((order) => order.id === id);
}

export function getOrderByNumber(orderNumber: string) {
  return readStore().orders.find(
    (order) => order.orderNumber.toUpperCase() === orderNumber.toUpperCase()
  );
}

export function getAdminMetrics() {
  const store = readStore();
  const totalRevenue = store.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = store.orders.length;
  const lowStockCount = store.products
    .filter((product) => product.status !== "archived")
    .flatMap((item) => item.variants)
    .filter((variant) => variant.stock < 6).length;
  const pendingOrders = store.orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  ).length;
  const customers = buildCustomerSummaries(store);

  return {
    totalRevenue,
    totalOrders,
    lowStockCount,
    pendingOrders,
    recentOrders: store.orders.slice(0, 5),
    topProducts: buildTopProducts(store),
    customers: customers.length,
    customerHighlights: customers.slice(0, 5),
    alerts: buildAlerts(store)
  };
}

export function createUser(input: { fullName: string; email: string; password: string; role?: UserRole }) {
  const store = readStore();
  const existing = store.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());

  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const user: StoredUser = {
    id: `u${Date.now()}`,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: input.role ?? "customer"
  };

  store.users.push(user);
  writeStore(store);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };
}

export function authenticateUser(email: string, password: string) {
  const user = readStore().users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };
}

export function createOrder(input: {
  customerName: string;
  customerEmail?: string;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus?: Order["paymentStatus"];
  couponCode?: string;
  shippingAddress?: Order["shippingAddress"];
  items: Array<{ productId: string; quantity: number; size?: string }>;
}) {
  const store = readStore();
  const orderNumber = `RUK${10000 + store.orders.length + 1}`;
  const createdAt = new Date().toISOString();
  const orderItems: OrderItem[] = input.items.map((item) => {
    const product = store.products.find((entry) => entry.id === item.productId);
    const variant = product?.variants.find((entry) => entry.size === item.size);
    return {
      productId: item.productId,
      productName: product?.name ?? "Rukhsar Product",
      quantity: item.quantity,
      unitPrice: product?.salePrice ?? 2999,
      size: item.size,
      color: variant?.color ?? product?.color
    };
  });

  const order: Order = {
    id: `o${Date.now()}`,
    orderNumber,
    status: "confirmed",
    paymentStatus: input.paymentStatus ?? (input.paymentMethod === "cod" ? "pending" : "authorized"),
    paymentMethod: input.paymentMethod,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    subtotal: input.subtotal ?? input.totalAmount,
    discountAmount: input.discountAmount ?? 0,
    shippingAmount: input.shippingAmount ?? 0,
    totalAmount: input.totalAmount,
    couponCode: input.couponCode,
    shippingAddress: input.shippingAddress,
    createdAt,
    trackingNumber: `SHIPRKT${10000 + store.orders.length + 1}`,
    items: orderItems,
    timeline: [
      { label: "Order placed", status: "pending", timestamp: createdAt },
      { label: "Confirmed", status: "confirmed", timestamp: createdAt }
    ]
  };

  store.orders.unshift(order);
  writeStore(store);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const store = readStore();
  const order = store.orders.find((entry) => entry.id === id);

  if (!order) {
    return null;
  }

  order.status = status;
  if (status === "delivered") {
    order.paymentStatus = order.paymentStatus === "pending" ? "paid" : order.paymentStatus;
  }

  order.timeline.push({
    label: status.replaceAll("_", " "),
    status,
    timestamp: new Date().toISOString()
  });
  writeStore(store);
  return order;
}

export function updateInventory(variantId: string, stock: number) {
  const store = readStore();
  let updatedProduct: Product | null = null;

  for (const product of store.products) {
    const variant = product.variants.find((entry) => entry.id === variantId);
    if (variant) {
      variant.stock = stock;
      updatedProduct = product;
      break;
    }
  }

  if (!updatedProduct) {
    return null;
  }

  writeStore(store);
  return updatedProduct;
}

export function addReview(productId: string, input: { rating: number; title: string; comment: string; author: string }) {
  const store = readStore();
  const product = store.products.find((entry) => entry.id === productId);

  if (!product) {
    return null;
  }

  product.reviews.unshift({
    id: `review-${Date.now()}`,
    author: input.author,
    rating: input.rating,
    title: input.title,
    comment: input.comment
  });
  product.reviewCount = product.reviews.length;
  product.rating = Number(
    (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
  );
  writeStore(store);
  return product.reviews[0];
}
