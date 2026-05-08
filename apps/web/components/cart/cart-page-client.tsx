"use client";

import Link from "next/link";
import type { Coupon, Product } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { formatCurrency } from "@/lib/utils/currency";

export function CartPageClient({ products, coupons }: { products: Product[]; coupons: Coupon[] }) {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const lines = cart
    .map((line) => ({
      line,
      product: products.find((product) => product.id === line.productId)
    }))
    .filter((entry): entry is { line: typeof cart[number]; product: Product } => Boolean(entry.product));

  const subtotal = lines.reduce((sum, entry) => sum + entry.product.salePrice * entry.line.quantity, 0);
  const shipping = lines.length > 0 ? 199 : 0;
  const total = subtotal + shipping;

  return (
    <section className="section-shell py-12">
      <div className="editorial-panel mb-8 overflow-hidden px-6 py-8 text-[color:var(--rukhsar-ivory)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-white/60">Bag Preview</p>
            <h1 className="mt-4 max-w-3xl font-[family:var(--font-rukhsar-heading)] text-4xl leading-tight md:text-6xl">
              Your fashion edit is ready for checkout.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
              Review sizes, refine quantities, and move to checkout with a clearer view of totals, offers, and delivery.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              `${lines.length} curated pieces`,
              shipping === 0 ? "Shipping opens after selection" : "Shipping ready across India"
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.6rem] border border-white/[0.14] bg-white/[0.08] px-5 py-5 backdrop-blur"
              >
                <p className="text-sm font-medium text-white/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {lines.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-[family:var(--font-rukhsar-heading)] text-3xl text-[color:var(--rukhsar-maroon)]">
            Your bag is waiting for its first standout piece
          </p>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Add a few heritage-forward looks and build your edit before heading to checkout.
          </p>
          <Link href="/shop" className="cta-primary mt-6 inline-block">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {lines.map(({ line, product }) => (
              <div
                key={`${product.id}-${line.size ?? "default"}`}
                className="surface-card overflow-hidden border border-white/60 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div
                        className="h-32 w-24 shrink-0 rounded-[1.5rem] bg-cover bg-center shadow-[0_18px_32px_rgba(15,15,15,0.12)]"
                        style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
                      />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--rukhsar-pink)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-black">
                        In Bag
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="fashion-chip">{product.category}</span>
                        <span className="fashion-chip">{product.fabric}</span>
                      </div>
                      <h2 className="mt-3 font-[family:var(--font-rukhsar-heading)] text-2xl text-[color:var(--rukhsar-maroon)]">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        Size {line.size ?? product.sizes[0]} · Quantity {line.quantity}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => updateQuantity({ productId: product.id, size: line.size }, line.quantity - 1)}
                          className="rounded-full border border-[rgba(90,30,34,0.15)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--rukhsar-maroon)] transition hover:-translate-y-0.5"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateQuantity({ productId: product.id, size: line.size }, line.quantity + 1)}
                          className="rounded-full border border-[rgba(90,30,34,0.15)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--rukhsar-maroon)] transition hover:-translate-y-0.5"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart({ productId: product.id, size: line.size })}
                          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 transition hover:-translate-y-0.5 hover:text-[color:var(--rukhsar-maroon)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(248,241,231,0.9),rgba(255,255,255,0.72))] px-5 py-4 text-left md:min-w-[140px] md:text-right">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Line Total</p>
                    <p className="mt-2 font-semibold text-[color:var(--rukhsar-maroon)]">
                      {formatCurrency(product.salePrice * line.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="editorial-panel h-fit px-6 py-6 text-[color:var(--rukhsar-ivory)] lg:sticky lg:top-28">
            <h2 className="font-[family:var(--font-rukhsar-heading)] text-3xl">Order Summary</h2>
            <div className="mt-6 space-y-3 text-sm text-white/75">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="rounded-[1.6rem] border border-white/[0.14] bg-white/[0.08] p-4">
                <p className="font-semibold text-white">Available coupon</p>
                <p className="mt-1 text-[color:var(--rukhsar-pink)]">{coupons[0]?.code ?? "No coupon loaded"}</p>
                <p className="mt-2 text-xs text-white/65">Apply and verify coupons during checkout.</p>
              </div>
              <div className="flex justify-between border-t border-white/[0.14] pt-3 font-semibold text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-white/75">
              <div className="rounded-[1.4rem] border border-white/[0.12] bg-white/[0.06] p-4">
                Secure checkout with UPI, cards, and COD
              </div>
              <div className="rounded-[1.4rem] border border-white/[0.12] bg-white/[0.06] p-4">
                Support-led order assistance when you need it
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-[color:var(--rukhsar-pink)] px-6 py-3 text-center text-sm font-semibold text-black transition hover:-translate-y-0.5"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
