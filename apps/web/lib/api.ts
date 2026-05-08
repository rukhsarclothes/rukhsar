import type { Coupon, Order, Product } from "@rukhsar/types";
import { coupons as fallbackCoupons, orders as fallbackOrders, products as fallbackProducts } from "@/lib/data/store";
import { getApiBaseUrl } from "@/lib/api-base-url";

const isDevelopment = process.env.NODE_ENV === "development";

async function getJson<T>(path: string, fallback: T): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return fallback;
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: isDevelopment ? "no-store" : undefined,
      next: isDevelopment ? undefined : { revalidate: 30 }
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as { items?: T; item?: T };
    return (data.items ?? data.item ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function getProducts() {
  return getJson<Product[]>("/products", fallbackProducts);
}

export function getProduct(slug: string) {
  return getJson<Product | null>(`/products/${slug}`, fallbackProducts.find((product) => product.slug === slug) ?? null);
}

export function getCoupons() {
  return getJson<Coupon[]>("/coupons", fallbackCoupons);
}

export function getFallbackOrders(): Order[] {
  return fallbackOrders;
}
