import type { Coupon, Order, Product } from "@rukhsar/types";
import { getApiBaseUrl, getApiConfigMessage } from "@/lib/api-base-url";

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export type DashboardAlert = {
  id: string;
  title: string;
  detail: string;
  tone: "critical" | "warning" | "info";
};

export type AdminMetrics = {
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  pendingOrders: number;
  customers: number;
  recentOrders: Order[];
  topProducts: { id: string; name: string; revenue: number; unitsSold: number; stock: number }[];
  customerHighlights: AdminCustomer[];
  alerts: DashboardAlert[];
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
  orderCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
};

export type InventoryRow = {
  productId: string;
  productName: string;
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
};

export type AnalyticsSnapshot = AdminMetrics & {
  averageOrderValue: number;
  conversionRate: number;
  repeatCustomerRate: number;
};

type ProductPayload = {
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
  status?: "active" | "draft" | "archived";
};

type CouponPayload = {
  code: string;
  description: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  minOrderValue: number;
  active?: boolean;
};

async function adminRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  const apiConfigMessage = getApiConfigMessage();
  if (!apiBaseUrl) {
    throw new AdminApiError(apiConfigMessage || "Admin API URL is not configured", 500);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });

  const data = (await response.json()) as {
    success?: boolean;
    item?: T;
    items?: T;
    message?: string;
  };
  if (!response.ok) {
    throw new AdminApiError(data.message ?? "Admin request failed", response.status);
  }

  return (data.items ?? data.item) as T;
}

export function getAdminDashboard(token: string) {
  return adminRequest<AdminMetrics>("/admin/dashboard", token);
}

export function getAdminProducts(token: string) {
  return adminRequest<Product[]>("/admin/products", token);
}

export function getAdminOrders(token: string) {
  return adminRequest<Order[]>("/admin/orders", token);
}

export function getAdminInventory(token: string) {
  return adminRequest<InventoryRow[]>("/admin/inventory", token);
}

export function getAdminCoupons(token: string) {
  return adminRequest<Coupon[]>("/admin/coupons", token);
}

export function getAdminCustomers(token: string) {
  return adminRequest<AdminCustomer[]>("/admin/customers", token);
}

export function getAdminAnalytics(token: string) {
  return adminRequest<AnalyticsSnapshot>("/admin/analytics", token);
}

export function createAdminProduct(token: string, payload: ProductPayload) {
  return adminRequest<Product>("/products", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAdminProduct(token: string, productId: string, payload: Partial<ProductPayload>) {
  return adminRequest<Product>(`/products/${productId}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function archiveAdminProduct(token: string, productId: string) {
  return adminRequest<Product>(`/products/${productId}`, token, {
    method: "DELETE"
  });
}

export function updateOrderStatus(token: string, orderId: string, status: string) {
  return adminRequest<Order>(`/orders/${orderId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function updateInventoryStock(token: string, variantId: string, stock: number) {
  return adminRequest<unknown>(`/admin/inventory/${variantId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ stock })
  });
}

export function createAdminCoupon(token: string, payload: CouponPayload) {
  return adminRequest<Coupon>("/coupons/admin/coupons", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAdminCoupon(token: string, couponId: string, payload: Partial<CouponPayload>) {
  return adminRequest<Coupon>(`/coupons/admin/coupons/${couponId}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
