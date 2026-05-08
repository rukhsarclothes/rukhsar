"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.25c-4.8-3.16-8-5.93-8-10.11 0-2.5 1.94-4.39 4.33-4.39 1.53 0 2.97.76 3.67 2.08.7-1.32 2.14-2.08 3.67-2.08 2.39 0 4.33 1.89 4.33 4.39 0 4.18-3.2 6.95-8 10.11Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 8.25 20.25 3M20.25 3H16.5M20.25 3V6.75" />
      <path d="M20.25 12v5.25A2.25 2.25 0 0 1 18 19.5H6.75A2.25 2.25 0 0 1 4.5 17.25V6A2.25 2.25 0 0 1 6.75 3.75H12" />
    </svg>
  );
}

export function ProductActions({
  productId,
  sizes,
  variants
}: {
  productId: string;
  sizes: string[];
  variants: ProductVariant[];
}) {
  const sizeAvailability = useMemo(
    () =>
      sizes.map((size) => ({
        size,
        available: variants.some((variant) => variant.size === size && variant.stock > 0)
      })),
    [sizes, variants]
  );
  const [selectedSize, setSelectedSize] = useState(
    sizeAvailability.find((entry) => entry.available)?.size ?? sizes[0] ?? "Free Size"
  );
  const [message, setMessage] = useState("");
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.includes(productId);

  async function handleShare() {
    const shareData = {
      title: "Rukhsar product",
      text: "Take a look at this Rukhsar style.",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setMessage("Shared successfully.");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setMessage("Product link copied.");
    } catch {
      setMessage("Could not share right now.");
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {sizeAvailability.map(({ size, available }) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            disabled={!available}
            className={`rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition ${
              selectedSize === size
                ? "border-transparent bg-[color:var(--rukhsar-black)] text-white shadow-[0_16px_32px_rgba(17,11,18,0.18)]"
                : "border-black/10 bg-white text-[color:var(--rukhsar-ink)]"
            } ${available ? "" : "cursor-not-allowed opacity-35"}`}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const selectedSizeState = sizeAvailability.find((entry) => entry.size === selectedSize);
            if (!selectedSizeState?.available) {
              setMessage("Select an in-stock size before adding this piece to the bag.");
              return;
            }

            addToCart(productId, selectedSize);
            setMessage(`Added size ${selectedSize} to your bag.`);
          }}
          className="cta-primary min-w-[180px]"
        >
          Add to Bag
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(productId)}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${
            isWishlisted
              ? "border-transparent bg-[color:var(--rukhsar-pink)] text-white"
              : "border-black/10 bg-white text-[color:var(--rukhsar-ink)]"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon filled={isWishlisted} />
        </button>
        <button
          type="button"
          onClick={() => {
            void handleShare();
          }}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-[color:var(--rukhsar-ink)] transition hover:border-[color:var(--rukhsar-pink)] hover:text-[color:var(--rukhsar-pink)]"
          aria-label="Share product"
        >
          <ShareIcon />
        </button>
      </div>
      {message ? <p className="mt-4 text-sm text-[color:var(--rukhsar-maroon)]">{message}</p> : null}
    </div>
  );
}
