"use client";

import type { Product } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { ProductCard } from "@/components/product/product-card";

export function WishlistPageClient({ products }: { products: Product[] }) {
  const { wishlist } = useStore();
  const items = products.filter((product) => wishlist.includes(product.id));

  return (
    <section className="section-shell py-12">
      <div className="editorial-panel overflow-hidden px-6 py-8 text-[color:var(--rukhsar-ivory)] md:px-8 md:py-10">
        <p className="text-xs uppercase tracking-[0.42em] text-white/60">Wishlist</p>
        <h1 className="mt-4 max-w-3xl font-[family:var(--font-rukhsar-heading)] text-4xl leading-tight md:text-6xl">
          Your saved fashion shortlist.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
          Keep standout looks close, compare them later, and build a stronger edit before you commit.
        </p>
      </div>
      {items.length === 0 ? (
        <div className="surface-card mt-8 p-8 text-sm leading-7 text-stone-600">
          Your wishlist is empty. Save products from the collection or product page to build your shortlist.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
