"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@rukhsar/types";

export function TrackOrderClient({ fallbackOrder }: { fallbackOrder: Order }) {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") ?? fallbackOrder.orderNumber);
  const [order, setOrder] = useState<Order | null>(fallbackOrder);
  const [message, setMessage] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

  useEffect(() => {
    const prefilled = searchParams.get("orderNumber");
    if (prefilled) {
      void lookup(prefilled);
    }
  }, [searchParams]);

  async function lookup(number: string) {
    setMessage("Looking up order...");

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
      setMessage(`Couldn't reach the local API at ${apiBaseUrl}. Start the API server on localhost:4000 and try again.`);
      setOrder(null);
    }
  }

  return (
    <section className="section-shell py-12">
      <div className="surface-card p-8">
        <p className="eyebrow">Track Order</p>
        <h1 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Follow your order with clarity</h1>
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
            className="flex-1 rounded-full border border-stone-200 bg-white/80 px-5 py-3 text-sm"
            placeholder="Enter order number"
          />
          <button onClick={() => lookup(orderNumber)} className="cta-primary">
            Track
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-[color:var(--rukhsar-maroon)]">{message}</p> : null}
      </div>
      {order ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card p-6">
            <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">{order.orderNumber}</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Tracking number: {order.trackingNumber} | Current status: {order.status.replaceAll("_", " ")}
            </p>
            <div className="mt-6 space-y-3 text-sm text-stone-600">
              <div className="rounded-2xl bg-[#faf6f1] p-4">Order assistance remains available throughout the journey.</div>
              <div className="rounded-2xl bg-[#faf6f1] p-4">Status updates are visible as soon as your order changes.</div>
            </div>
          </div>
          <div className="surface-card p-6">
            <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">Timeline</h2>
            <div className="mt-6 space-y-4">
              {order.timeline.map((entry) => (
                <div key={`${entry.status}-${entry.timestamp}`} className="rounded-2xl bg-[rgba(194,161,90,0.12)] p-4">
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
