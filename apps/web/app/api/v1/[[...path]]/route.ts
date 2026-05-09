import { NextRequest, NextResponse } from "next/server";
import type { Coupon, Order, OrderStatus, Product } from "@rukhsar/types";
import {
  coupons as seedCoupons,
  orders as seedOrders,
  products as seedProducts
} from "@/lib/data/store";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin";
};

type CustomerSummary = {
  id: string;
  fullName: string;
  email: string;
  role: "customer";
  orderCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
};

const adminUser: AdminUser = {
  id: "admin-demo",
  fullName: "Rukhsar Admin",
  email: "demo@rukhsar.in",
  role: "admin"
};

const adminEmails = new Set(["demo@rukhsar.in", "demo@gmail.com"]);
const demoToken = "rukhsar-demo-admin-token";
const products: Product[] = structuredClone(seedProducts);
const coupons: Coupon[] = structuredClone(seedCoupons);
const orders: Order[] = structuredClone(seedOrders);

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL ?? "https://rukhsar-web.vercel.app",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
    }
  });
}

function unauthorized() {
  return json({ success: false, message: "Authentication required" }, 401);
}

function isAdminRequest(request: NextRequest) {
  return request.headers.get("authorization") === `Bearer ${demoToken}`;
}

async function getPath(context: RouteContext) {
  return (await context.params).path ?? [];
}

async function readJson<T>(request: NextRequest): Promise<T> {
  return (await request.json()) as T;
}

function normaliseSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function totalStock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

function buildCustomers(): CustomerSummary[] {
  const byEmail = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const email = order.customerEmail ?? "demo@rukhsar.in";
    const current =
      byEmail.get(email) ??
      ({
        id: `customer-${byEmail.size + 1}`,
        fullName: order.customerName,
        email,
        role: "customer",
        orderCount: 0,
        totalSpend: 0,
        lastOrderAt: null
      } satisfies CustomerSummary);

    current.orderCount += 1;
    current.totalSpend += order.totalAmount;
    current.lastOrderAt =
      !current.lastOrderAt || order.createdAt > current.lastOrderAt ? order.createdAt : current.lastOrderAt;
    byEmail.set(email, current);
  }

  return [...byEmail.values()];
}

function buildDashboard() {
  const customers = buildCustomers();
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lowStockCount = products.flatMap((product) => product.variants).filter((variant) => variant.stock < 6).length;
  const pendingOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    lowStockCount,
    pendingOrders,
    customers: customers.length,
    recentOrders: orders.slice(0, 5),
    topProducts: products.slice(0, 5).map((product) => ({
      id: product.id,
      name: product.name,
      revenue: 0,
      unitsSold: 0,
      stock: totalStock(product)
    })),
    customerHighlights: customers.slice(0, 5),
    alerts: [
      {
        id: "vercel-demo-api",
        title: "Vercel admin demo API is active",
        detail: "Admin portal is connected to the Next.js API route. Use a real backend before accepting live orders.",
        tone: "info"
      }
    ]
  };
}

function requireAdmin(request: NextRequest) {
  return isAdminRequest(request) ? null : unauthorized();
}

export function OPTIONS() {
  return json({ success: true });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const path = await getPath(context);
  const [resource, id, action] = path;

  if (resource === "products" && !id) {
    return json({ success: true, items: products.filter((product) => product.status !== "archived") });
  }

  if (resource === "products" && id) {
    const product = products.find((item) => item.slug === id || item.id === id);
    return product
      ? json({ success: true, item: product })
      : json({ success: false, message: "Product not found" }, 404);
  }

  if (resource === "coupons" && !id) {
    return json({ success: true, items: coupons.filter((coupon) => coupon.active !== false) });
  }

  if (resource === "admin") {
    const blocked = requireAdmin(request);
    if (blocked) {
      return blocked;
    }

    if (id === "dashboard") {
      return json({ success: true, item: buildDashboard() });
    }
    if (id === "products") {
      return json({ success: true, items: products });
    }
    if (id === "orders") {
      return json({ success: true, items: orders });
    }
    if (id === "inventory") {
      return json({
        success: true,
        items: products.flatMap((product) =>
          product.variants.map((variant) => ({
            productId: product.id,
            productName: product.name,
            ...variant
          }))
        )
      });
    }
    if (id === "coupons") {
      return json({ success: true, items: coupons });
    }
    if (id === "customers") {
      return json({ success: true, items: buildCustomers() });
    }
    if (id === "analytics") {
      const dashboard = buildDashboard();
      return json({
        success: true,
        item: {
          ...dashboard,
          averageOrderValue: dashboard.totalOrders ? Math.round(dashboard.totalRevenue / dashboard.totalOrders) : 0,
          conversionRate: dashboard.totalOrders ? 12 : 0,
          repeatCustomerRate: 0
        }
      });
    }
  }

  if (resource === "orders" && id === "track" && action) {
    const order = orders.find((item) => item.orderNumber.toLowerCase() === action.toLowerCase());
    return json({ success: true, item: order ?? null });
  }

  return json({ success: false, message: "Not found" }, 404);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const path = await getPath(context);
  const [resource, id, action] = path;

  if (resource === "auth" && id === "login") {
    const payload = await readJson<{ email?: string; password?: string }>(request);
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (!adminEmails.has(email) || payload.password !== "password123") {
      return json({ success: false, message: "Invalid credentials" }, 401);
    }

    return json({
      success: true,
      user: { ...adminUser, email },
      accessToken: demoToken,
      refreshToken: demoToken
    });
  }

  if (resource === "coupons" && id === "validate") {
    const payload = await readJson<{ code?: string; subtotal?: number }>(request);
    const coupon = coupons.find((item) => item.code.toUpperCase() === payload.code?.toUpperCase());
    if (!coupon || Number(payload.subtotal ?? 0) < coupon.minOrderValue) {
      return json({ success: false, message: "Coupon is invalid or minimum order value not met" }, 400);
    }

    return json({ success: true, item: coupon });
  }

  const blocked = requireAdmin(request);
  if (blocked) {
    return blocked;
  }

  if (resource === "products") {
    const payload = await readJson<Partial<Product> & { sizes?: string[] }>(request);
    if (!payload.name || !payload.slug || !payload.category || !payload.salePrice || !payload.basePrice) {
      return json({ success: false, message: "Product name, slug, category, and prices are required" }, 400);
    }

    const slug = normaliseSlug(payload.slug);
    const product: Product = {
      id: `p${Date.now()}`,
      name: payload.name,
      slug,
      category: payload.category,
      collection: payload.collection ?? "Admin Collection",
      basePrice: Number(payload.basePrice),
      salePrice: Number(payload.salePrice),
      fabric: payload.fabric ?? "Cotton",
      color: payload.color ?? "Ivory",
      description: payload.description ?? "Admin created product.",
      longDescription: payload.longDescription ?? "Admin created product.",
      careInstructions: ["Dry clean only"],
      sizes: payload.sizes?.length ? payload.sizes : ["S", "M", "L"],
      images: [],
      tags: ["admin"],
      status: payload.status ?? "active",
      featured: false,
      rating: 0,
      reviewCount: 0,
      variants: (payload.sizes?.length ? payload.sizes : ["S", "M", "L"]).map((size, index) => ({
        id: `v${Date.now()}-${index}`,
        size,
        color: payload.color ?? "Ivory",
        stock: 0,
        sku: `RUK-${slug.toUpperCase().slice(0, 8)}-${size.toUpperCase()}`
      })),
      reviews: []
    };
    products.unshift(product);
    return json({ success: true, item: product }, 201);
  }

  if (resource === "coupons" && id === "admin" && action === "coupons") {
    const payload = await readJson<Partial<Coupon>>(request);
    if (!payload.code || !payload.description || !payload.discountType || !payload.discountValue) {
      return json({ success: false, message: "Coupon code, description, type, and value are required" }, 400);
    }

    const coupon: Coupon = {
      id: `cp${Date.now()}`,
      code: payload.code.toUpperCase(),
      description: payload.description,
      discountType: payload.discountType,
      discountValue: Number(payload.discountValue),
      minOrderValue: Number(payload.minOrderValue ?? 0),
      active: payload.active ?? true
    };
    coupons.unshift(coupon);
    return json({ success: true, item: coupon }, 201);
  }

  return json({ success: false, message: "Not found" }, 404);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = requireAdmin(request);
  if (blocked) {
    return blocked;
  }

  const path = await getPath(context);
  const [resource, id, action, nestedId] = path;
  const payload = await readJson<Record<string, unknown>>(request);

  if (resource === "products" && id) {
    const product = products.find((item) => item.id === id);
    if (!product) {
      return json({ success: false, message: "Product not found" }, 404);
    }
    Object.assign(product, payload);
    if (typeof payload.slug === "string") {
      product.slug = normaliseSlug(payload.slug);
    }
    return json({ success: true, item: product });
  }

  if (resource === "orders" && id && action === "status") {
    const order = orders.find((item) => item.id === id);
    if (!order) {
      return json({ success: false, message: "Order not found" }, 404);
    }
    order.status = String(payload.status) as OrderStatus;
    order.timeline.push({
      label: order.status.replaceAll("_", " "),
      status: order.status,
      timestamp: new Date().toISOString()
    });
    return json({ success: true, item: order });
  }

  if (resource === "admin" && id === "inventory" && action) {
    const variant = products.flatMap((product) => product.variants).find((item) => item.id === action);
    if (!variant) {
      return json({ success: false, message: "Inventory item not found" }, 404);
    }
    variant.stock = Number(payload.stock ?? variant.stock);
    return json({ success: true, item: variant });
  }

  if (resource === "coupons" && id === "admin" && action === "coupons" && nestedId) {
    const coupon = coupons.find((item) => item.id === nestedId);
    if (!coupon) {
      return json({ success: false, message: "Coupon not found" }, 404);
    }
    Object.assign(coupon, payload);
    if (typeof payload.code === "string") {
      coupon.code = payload.code.toUpperCase();
    }
    return json({ success: true, item: coupon });
  }

  return json({ success: false, message: "Not found" }, 404);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = requireAdmin(request);
  if (blocked) {
    return blocked;
  }

  const path = await getPath(context);
  const [resource, id] = path;
  if (resource === "products" && id) {
    const product = products.find((item) => item.id === id);
    if (!product) {
      return json({ success: false, message: "Product not found" }, 404);
    }
    product.status = "archived";
    return json({ success: true, item: product });
  }

  return json({ success: false, message: "Not found" }, 404);
}
