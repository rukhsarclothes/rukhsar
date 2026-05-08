"use client";

import Link from "next/link";
import type { Product } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { formatCurrency } from "@/lib/utils/currency";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.25c-4.8-3.16-8-5.93-8-10.11 0-2.5 1.94-4.39 4.33-4.39 1.53 0 2.97.76 3.67 2.08.7-1.32 2.14-2.08 3.67-2.08 2.39 0 4.33 1.89 4.33 4.39 0 4.18-3.2 6.95-8 10.11Z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.75 8.25h10.5l-.84 10.5H7.59l-.84-10.5Z" />
      <path d="M9 9V7.75a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const discount = Math.max(0, Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100));
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const preferredSize = product.variants.find((variant) => variant.stock > 0)?.size ?? product.sizes[0];
  const isWishlisted = wishlist.includes(product.id);

  return (
    <article className="group overflow-hidden rounded-[1.7rem] border border-black/6 bg-[rgba(255,255,255,0.72)] p-3 shadow-[0_18px_42px_rgba(17,11,18,0.1)] backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(17,11,18,0.16)]">
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="block overflow-hidden rounded-[1.35rem] bg-[rgba(15,11,18,0.05)]"
        >
          <div
            className="relative h-52 bg-cover bg-center sm:h-64"
            style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(15,11,18,0.22)_100%)]" />
          </div>
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(15,11,18,0.82)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
            {product.category}
          </span>
          {discount > 0 ? (
            <span className="rounded-full bg-[color:var(--rukhsar-pink)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
              {discount}% off
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
              isWishlisted
                ? "border-transparent bg-[color:var(--rukhsar-pink)] text-white"
                : "border-white/30 bg-white/[0.82] text-[color:var(--rukhsar-ink)]"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon filled={isWishlisted} />
          </button>
          <button
            type="button"
            onClick={() => addToCart(product.id, preferredSize)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-[color:var(--rukhsar-black)] text-white shadow-[0_14px_28px_rgba(17,11,18,0.22)] transition hover:bg-[color:var(--rukhsar-maroon)]"
            aria-label="Add to bag"
          >
            <BagIcon />
          </button>
        </div>
      </div>

      <div className="px-1 pb-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-stone-500">{product.collection}</p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="mt-2 font-[family:var(--font-rukhsar-heading)] text-xl font-semibold leading-tight text-[color:var(--rukhsar-ink)] md:text-2xl">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="rounded-full bg-[rgba(201,163,95,0.18)] px-3 py-1 text-[11px] font-semibold text-[color:var(--rukhsar-maroon)]">
            {product.rating} / 5
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-lg font-bold text-[color:var(--rukhsar-ink)]">{formatCurrency(product.salePrice)}</span>
              <span className="text-stone-400 line-through">{formatCurrency(product.basePrice)}</span>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-stone-500">{product.fabric}</p>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--rukhsar-ink)] transition group-hover:bg-[color:var(--rukhsar-pink)] group-hover:text-white"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
