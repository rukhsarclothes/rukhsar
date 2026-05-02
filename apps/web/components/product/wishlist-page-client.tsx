"use client";

import type { Product } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { ProductCard } from "@/components/product/product-card";

export function WishlistPageClient({ products }: { products: Product[] }) {
  const { wishlist } = useStore();
  const items = products.filter((product) => wishlist.includes(product.id));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Wishlist</h1>
      <p className="mt-3 max-w-2xl text-sm text-stone-600">Saved pieces stay here between sessions on this device.</p>
      {items.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-white/70 bg-white/70 p-8 shadow-sm text-sm text-stone-600">
          Your wishlist is empty. Add products from the detail page to build your shortlist.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
