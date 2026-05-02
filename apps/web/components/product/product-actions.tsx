"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";

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

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {sizeAvailability.map(({ size, available }) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            disabled={!available}
            className={`rounded-full border px-4 py-2 text-sm ${
              selectedSize === size
                ? "border-[color:var(--rukhsar-maroon)] bg-[rgba(90,30,34,0.08)] text-[color:var(--rukhsar-maroon)]"
                : "border-stone-200 text-stone-600"
            } ${available ? "" : "cursor-not-allowed opacity-40"}`}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const selectedSizeState = sizeAvailability.find((entry) => entry.size === selectedSize);
            if (!selectedSizeState?.available) {
              setMessage("Select an in-stock size before adding this piece to cart.");
              return;
            }

            addToCart(productId, selectedSize);
            setMessage(`Added size ${selectedSize} to your cart.`);
          }}
          className="rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(productId)}
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold"
        >
          {wishlist.includes(productId) ? "Wishlisted" : "Add to Wishlist"}
        </button>
      </div>
      {message ? <p className="mt-4 text-sm text-[color:var(--rukhsar-maroon)]">{message}</p> : null}
    </div>
  );
}
