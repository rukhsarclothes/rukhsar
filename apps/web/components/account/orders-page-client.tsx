"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { formatCurrency } from "@/lib/utils/currency";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

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
  const [message, setMessage] = useState("Loading orders...");

  useEffect(() => {
    if (!user || !token) {
      setMessage("Sign in to view your order history.");
      return;
    }

    async function loadOrders() {
      let response: Response;
      try {
        response = await fetch(`${apiBaseUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch {
        setMessage(`Couldn't reach the local API at ${apiBaseUrl}. Start the API server on localhost:4000 and try again.`);
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
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">{message}</p>
          <Link href="/login" className="cta-primary mt-6 inline-block">
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-12">
      <div className="surface-card p-8 md:p-10">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Order History</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          Review your recent purchases, payment state, and tracking references in one place.
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
            <div key={order.id} className="surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{order.orderNumber}</p>
                  <h2 className="mt-2 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">
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
                    <div key={`${order.id}-${item.productId}-${index}`} className="rounded-2xl bg-[#faf6f1] px-4 py-4">
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
                <Link href={`/track-order?orderNumber=${order.orderNumber}`} className="font-medium text-[color:var(--rukhsar-maroon)]">
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
