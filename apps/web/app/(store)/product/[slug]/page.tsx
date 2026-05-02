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

  return (
    <section className="section-shell py-12">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {product.images.map((image) => (
            <div
              key={image}
              className="h-[440px] rounded-[1.9rem] border border-white/70 bg-cover bg-center shadow-sm"
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="surface-card p-8">
          <p className="eyebrow">{product.collection}</p>
          <h1 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)] md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-sm leading-8 text-stone-600">{product.longDescription}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-semibold text-[color:var(--rukhsar-maroon)]">{formatCurrency(product.salePrice)}</span>
            <span className="text-stone-400 line-through">{formatCurrency(product.basePrice)}</span>
            <span className="rounded-full bg-[rgba(181,102,29,0.12)] px-3 py-1 text-sm text-[color:var(--rukhsar-saffron)]">
              {Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}% off
            </span>
          </div>
          <div className="mt-8 grid gap-4 text-sm md:grid-cols-2">
            {[
              ["Fabric", product.fabric],
              ["Color", product.color],
              ["Sizes", product.sizes.join(", ")],
              ["Reviews", `${product.rating} / 5 (${product.reviewCount})`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#faf6f1] p-4">
                <dt className="text-stone-500">{label}</dt>
                <dd className="mt-1 font-medium text-[color:var(--rukhsar-maroon)]">{value}</dd>
              </div>
            ))}
          </div>
          <ProductActions productId={product.id} sizes={product.sizes} variants={product.variants} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Delivery", "Typically dispatched within 48 hours"],
              ["Returns", "Easy support-led assistance on eligible orders"],
              ["Craft", "Detailed fabric information at every step"]
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-[rgba(90,30,34,0.08)] bg-white/70 p-4">
                <p className="font-medium text-[color:var(--rukhsar-maroon)]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-[rgba(194,161,90,0.12)] p-5 text-sm text-stone-700">
            <p className="font-semibold text-[color:var(--rukhsar-maroon)]">Care and craft notes</p>
            <ul className="mt-3 space-y-2">
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
            <h2 className="mt-2 font-serif text-3xl text-[color:var(--rukhsar-maroon)]">Editorially related picks</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
