"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { getApiBaseUrl, getApiConfigMessage, getApiUnavailableMessage } from "@/lib/api-base-url";
import { formatCurrency } from "@/lib/utils/currency";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function OrdersPageClient() {
  const { user, token } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const signedOutMessage = "Sign in to view your order history.";

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    async function loadOrders() {
      const apiBaseUrl = getApiBaseUrl();
      const apiConfigMessage = getApiConfigMessage();
      if (!apiBaseUrl) {
        setMessage(apiConfigMessage || "Order API URL is not configured.");
        return;
      }

      let response: Response;
      try {
        response = await fetch(`${apiBaseUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch {
        setMessage(getApiUnavailableMessage(apiBaseUrl));
        return;
      }

      const data = (await response.json()) as {
        items?: Order[];
        message?: string;
      };

      if (!response.ok) {
        setMessage(data.message ?? "Could not load orders right now.");
        return;
      }

      setOrders(data.items ?? []);
      setMessage("");
    }

    void loadOrders();
  }, [token, user]);

  if (!user || !token) {
    return (
      <section className="section-shell py-12">
        <div className="surface-card p-10">
          <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Order History</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">{signedOutMessage}</p>
          <Link href="/login" className="cta-primary mt-6 inline-block">
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-12">
      <div className="editorial-panel overflow-hidden px-6 py-8 text-[color:var(--rukhsar-ivory)] md:px-8 md:py-10">
        <p className="text-xs uppercase tracking-[0.42em] text-white/60">Account</p>
        <h1 className="mt-4 max-w-3xl font-[family:var(--font-rukhsar-heading)] text-4xl leading-tight md:text-6xl">
          Every order, tracked in one premium timeline.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
          Review purchases, payment state, and delivery progress without losing the editorial feel of the storefront.
        </p>
      </div>

      {message ? (
        <div className="surface-card mt-8 p-10 text-center text-sm text-stone-600">{message}</div>
      ) : orders.length === 0 ? (
        <div className="surface-card mt-8 p-10 text-center">
          <p className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">No orders yet</p>
          <p className="mt-4 text-sm text-stone-600">Once you place an order while signed in, it will appear here.</p>
          <Link href="/shop" className="cta-primary mt-6 inline-block">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="surface-card overflow-hidden p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="fashion-chip">{order.orderNumber}</span>
                    <span className="fashion-chip">{order.paymentMethod?.toUpperCase() ?? "ORDER"}</span>
                  </div>
                  <h2 className="mt-3 font-[family:var(--font-rukhsar-heading)] text-2xl text-[color:var(--rukhsar-maroon)]">
                    {order.status.replaceAll("_", " ")}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    {formatDate(order.createdAt)} | Payment {order.paymentStatus}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-500">Total</p>
                  <p className="mt-1 font-semibold text-[color:var(--rukhsar-maroon)]">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
              {order.items?.length ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${item.productId}-${index}`}
                      className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(248,241,231,0.92),rgba(255,255,255,0.72))] px-4 py-4"
                    >
                      <p className="font-medium text-[color:var(--rukhsar-maroon)]">{item.productName}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        Qty {item.quantity} | {item.size ?? "Default size"} | {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-600">
                {order.trackingNumber ? <span>Tracking {order.trackingNumber}</span> : null}
                <Link
                  href={`/track-order?orderNumber=${order.orderNumber}`}
                  className="font-medium text-[color:var(--rukhsar-maroon)] underline decoration-[color:var(--rukhsar-pink)] decoration-2 underline-offset-4"
                >
                  Track this order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
