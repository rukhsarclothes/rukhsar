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
      <div className="surface-card mb-8 p-8">
        <p className="eyebrow">Cart</p>
        <h1 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Review your selections</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          A calmer cart built for confidence: clear quantities, transparent totals, and a direct path to checkout.
        </p>
      </div>
      {lines.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">Your cart is empty</p>
          <p className="mt-4 text-sm text-stone-600">Add a few heritage pieces to continue shopping with confidence.</p>
          <Link href="/shop" className="cta-primary mt-6 inline-block">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {lines.map(({ line, product }) => (
              <div key={`${product.id}-${line.size ?? "default"}`} className="surface-card p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div
                      className="h-28 w-24 shrink-0 rounded-[1.25rem] bg-cover bg-center"
                      style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{product.category}</p>
                      <h2 className="mt-2 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{product.name}</h2>
                      <p className="mt-2 text-sm text-stone-600">
                        {product.fabric} | Qty {line.quantity} | Size {line.size ?? product.sizes[0]}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => updateQuantity({ productId: product.id, size: line.size }, line.quantity - 1)}
                          className="rounded-full border border-stone-200 px-3 py-1 text-sm"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateQuantity({ productId: product.id, size: line.size }, line.quantity + 1)}
                          className="rounded-full border border-stone-200 px-3 py-1 text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart({ productId: product.id, size: line.size })}
                          className="rounded-full border border-stone-200 px-3 py-1 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="font-semibold text-[color:var(--rukhsar-maroon)]">
                    {formatCurrency(product.salePrice * line.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <aside className="surface-card h-fit p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Order Summary</h2>
            <div className="mt-6 space-y-3 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="rounded-2xl bg-[rgba(194,161,90,0.12)] p-4">
                <p className="font-semibold text-[color:var(--rukhsar-maroon)]">Available coupon</p>
                <p className="mt-1">{coupons[0]?.code ?? "No coupon loaded"}</p>
                <p className="mt-2 text-xs text-stone-600">Apply and verify coupons during checkout.</p>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-[color:var(--rukhsar-maroon)]">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-stone-600">
              <div className="rounded-2xl bg-[#faf6f1] p-4">Secure checkout with UPI, cards, and COD</div>
              <div className="rounded-2xl bg-[#faf6f1] p-4">Support-led order assistance when you need it</div>
            </div>
            <Link href="/checkout" className="cta-primary mt-6 block text-center">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
