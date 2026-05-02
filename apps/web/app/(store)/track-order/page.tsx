import { Suspense } from "react";
import { TrackOrderClient } from "@/components/account/track-order-client";
import { getFallbackOrders } from "@/lib/api";

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-12 md:px-8 text-sm text-stone-600">Loading order tracker...</div>}>
      <TrackOrderClient fallbackOrder={getFallbackOrders()[0]} />
    </Suspense>
  );
}
