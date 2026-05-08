"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@rukhsar/types";
import { getApiBaseUrl, getApiConfigMessage, getApiUnavailableMessage } from "@/lib/api-base-url";

export function TrackOrderClient({ fallbackOrder }: { fallbackOrder: Order }) {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") ?? fallbackOrder.orderNumber);
  const [order, setOrder] = useState<Order | null>(fallbackOrder);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const prefilled = searchParams.get("orderNumber");
    if (prefilled) {
      void lookup(prefilled);
    }
  }, [searchParams]);

  async function lookup(number: string) {
    setMessage("Looking up order...");
    const apiBaseUrl = getApiBaseUrl();
    const apiConfigMessage = getApiConfigMessage();

    if (!apiBaseUrl) {
      setMessage(apiConfigMessage || "Tracking API URL is not configured.");
      setOrder(null);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/orders/track/${number}`);
      const data = (await response.json()) as { item?: Order | null };
      if (!response.ok || !data.item) {
        setMessage("Order not found. Try the demo number RUK10452 or a newly placed order.");
        setOrder(null);
        return;
      }

      setOrder(data.item);
      setMessage("");
    } catch {
      setMessage(getApiUnavailableMessage(apiBaseUrl));
      setOrder(null);
    }
  }

  return (
    <section className="section-shell py-12">
      <div className="editorial-panel overflow-hidden px-6 py-8 text-[color:var(--rukhsar-ivory)] md:px-8 md:py-10">
        <p className="text-xs uppercase tracking-[0.42em] text-white/60">Track Order</p>
        <h1 className="mt-4 max-w-3xl font-[family:var(--font-rukhsar-heading)] text-4xl leading-tight md:text-6xl">
          Follow your order from checkout to doorstep.
        </h1>
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
            className="flex-1 rounded-full border border-white/[0.16] bg-white/[0.08] px-5 py-3 text-sm text-white placeholder:text-white/45 outline-none"
            placeholder="Enter order number"
          />
          <button
            onClick={() => lookup(orderNumber)}
            className="rounded-full bg-[color:var(--rukhsar-pink)] px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
          >
            Track
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-white/80">{message}</p> : null}
      </div>
      {order ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card p-6">
            <div className="flex flex-wrap gap-2">
              <span className="fashion-chip">{order.orderNumber}</span>
              <span className="fashion-chip">{order.paymentStatus}</span>
            </div>
            <h2 className="mt-4 font-[family:var(--font-rukhsar-heading)] text-3xl text-[color:var(--rukhsar-maroon)]">
              {order.status.replaceAll("_", " ")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Tracking number: {order.trackingNumber} | Current status: {order.status.replaceAll("_", " ")}
            </p>
            <div className="mt-6 space-y-3 text-sm text-stone-600">
              <div className="rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(248,241,231,0.92),rgba(255,255,255,0.72))] p-4">
                Order assistance remains available throughout the journey.
              </div>
              <div className="rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(248,241,231,0.92),rgba(255,255,255,0.72))] p-4">
                Status updates are visible as soon as your order changes.
              </div>
            </div>
          </div>
          <div className="surface-card p-6">
            <h2 className="font-[family:var(--font-rukhsar-heading)] text-3xl text-[color:var(--rukhsar-maroon)]">
              Timeline
            </h2>
            <div className="mt-6 space-y-4">
              {order.timeline.map((entry) => (
                <div
                  key={`${entry.status}-${entry.timestamp}`}
                  className="rounded-[1.5rem] border border-[rgba(90,30,34,0.08)] bg-[linear-gradient(180deg,rgba(248,241,231,0.92),rgba(255,255,255,0.72))] p-4"
                >
                  <p className="font-semibold text-[color:var(--rukhsar-maroon)]">{entry.label}</p>
                  <p className="mt-1 text-sm text-stone-600">{entry.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
