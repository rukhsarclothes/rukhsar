import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { ProductCard } from "@/components/product/product-card";
import { ProductActions } from "@/components/product/product-actions";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProduct(slug), getProducts()]);

  if (!product) {
    notFound();
  }

  const related = products.filter((item) => item.slug !== slug).slice(0, 3);
  const discount = Math.max(0, Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100));

  return (
    <section className="section-shell py-8 md:py-10">
      <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-[color:var(--rukhsar-black)] shadow-[0_28px_70px_rgba(17,11,18,0.2)]">
            <div
              className="h-[520px] bg-cover bg-center"
              style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(15,11,18,0.2)_100%)]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.images.slice(1).map((image) => (
              <div
                key={image}
                className="h-60 rounded-[1.7rem] bg-cover bg-center shadow-[0_18px_42px_rgba(17,11,18,0.12)]"
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
            {product.images.length < 3 ? (
              <div className="flex min-h-[240px] items-end rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(255,79,163,0.18),rgba(201,163,95,0.2),rgba(255,255,255,0.9))] p-6 shadow-[0_18px_42px_rgba(17,11,18,0.1)]">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--rukhsar-maroon)]">Styled detail</p>
                  <p className="mt-3 font-[family:var(--font-rukhsar-heading)] text-2xl font-semibold text-[color:var(--rukhsar-ink)]">
                    Bold regional wear, framed with premium finish.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="surface-card p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[rgba(255,79,163,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--rukhsar-pink)]">
              {product.collection}
            </span>
            <span className="rounded-full bg-[rgba(201,163,95,0.18)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--rukhsar-maroon)]">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          <h1 className="mt-5 font-[family:var(--font-rukhsar-heading)] text-4xl font-semibold leading-tight text-[color:var(--rukhsar-ink)] md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-sm leading-8 text-stone-600 md:text-[15px]">{product.longDescription}</p>

          <div className="mt-7 rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(15,11,18,1),rgba(108,31,46,0.94),rgba(34,66,56,0.92))] p-6 text-white shadow-[0_22px_56px_rgba(17,11,18,0.22)]">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--rukhsar-pink-soft)]">Price</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="text-4xl font-bold">{formatCurrency(product.salePrice)}</span>
              <span className="text-white/50 line-through">{formatCurrency(product.basePrice)}</span>
              <span className="rounded-full bg-[color:var(--rukhsar-pink)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                {discount}% off
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Timeless craftsmanship, premium finish, and styling that feels built for modern celebration.
            </p>
          </div>

          <div className="mt-8 grid gap-4 text-sm md:grid-cols-2">
            {[
              ["Fabric", product.fabric],
              ["Color", product.color],
              ["Sizes", product.sizes.join(", ")],
              ["Mood", "Editorial traditional wear with modern ease"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.6rem] border border-black/6 bg-[rgba(255,255,255,0.74)] p-4">
                <dt className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{label}</dt>
                <dd className="mt-2 font-semibold text-[color:var(--rukhsar-ink)]">{value}</dd>
              </div>
            ))}
          </div>

          <ProductActions productId={product.id} sizes={product.sizes} variants={product.variants} />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Delivery", "Typically dispatched within 48 hours"],
              ["Returns", "Support-led help on eligible orders"],
              ["Styling", "Strong traditional pieces with a cleaner, younger finish"]
            ].map(([title, body]) => (
              <div key={title} className="rounded-[1.5rem] border border-black/6 bg-white/70 p-4">
                <p className="font-semibold uppercase tracking-[0.16em] text-[color:var(--rukhsar-maroon)]">{title}</p>
                <p className="mt-3 text-sm leading-6 text-stone-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(255,79,163,0.08),rgba(201,163,95,0.12),rgba(255,255,255,0.86))] p-5 text-sm text-stone-700">
            <p className="font-semibold uppercase tracking-[0.18em] text-[color:var(--rukhsar-maroon)]">Care and craft notes</p>
            <ul className="mt-3 space-y-2 leading-7">
              {product.careInstructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">You may also like</p>
            <h2 className="mt-2 font-[family:var(--font-rukhsar-heading)] text-3xl font-semibold text-[color:var(--rukhsar-ink)] md:text-4xl">
              More fashion-forward traditional picks
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
