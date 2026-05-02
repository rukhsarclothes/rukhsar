import Link from "next/link";
import type { Product } from "@rukhsar/types";
import { formatCurrency } from "@/lib/utils/currency";

export function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group surface-card block overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className="relative h-72 rounded-[1.35rem] bg-[rgba(194,161,90,0.18)] bg-cover bg-center"
        style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
      >
        <div className="absolute left-4 top-4 rounded-full bg-[rgba(255,251,246,0.92)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-stone-500">
          {product.category}
        </div>
        {discount > 0 ? (
          <div className="absolute right-4 top-4 rounded-full bg-[color:var(--rukhsar-maroon)] px-3 py-1 text-xs font-semibold text-[color:var(--rukhsar-ivory)]">
            {discount}% off
          </div>
        ) : null}
      </div>
      <div className="px-2 pb-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{product.collection}</p>
            <h3 className="mt-2 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{product.name}</h3>
          </div>
          <div className="rounded-full bg-[rgba(194,161,90,0.12)] px-3 py-1 text-xs text-[color:var(--rukhsar-saffron)]">
            {product.rating} / 5
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-600">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-[color:var(--rukhsar-maroon)]">
                {formatCurrency(product.salePrice)}
              </span>
              <span className="text-stone-400 line-through">{formatCurrency(product.basePrice)}</span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">{product.fabric}</p>
          </div>
          <span className="text-sm font-medium text-[color:var(--rukhsar-maroon)] transition group-hover:translate-x-1">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
