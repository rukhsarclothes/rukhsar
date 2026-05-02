import Link from "next/link";
import type { Collection, Product } from "@rukhsar/types";
import { SectionHeading } from "@rukhsar/ui";
import { collections } from "@/lib/data/store";
import { formatCurrency } from "@/lib/utils/currency";

export function HeroSection() {
  return (
    <section className="section-shell py-16 md:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/50 shadow-[0_24px_80px_rgba(90,30,34,0.18)]">
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="auto">
          <source src="/rukhsarbgvideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(28,14,11,0.84)_8%,rgba(90,30,34,0.62)_42%,rgba(194,161,90,0.28)_100%)]" />
        <div className="relative grid min-h-[680px] gap-8 p-8 text-[color:var(--rukhsar-ivory)] md:grid-cols-[1.08fr_0.92fr] md:p-12">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[rgba(248,241,231,0.8)]">
                Aurangabad heritage, reimagined
              </p>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
                Crafted for women who want cultural depth, quiet luxury, and modern ease.
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[rgba(248,241,231,0.88)]">
                Discover sarees, kurtas, co-ords, and festive silhouettes shaped by Himroo, Paithani, and Mashru
                influences with an elevated shopping experience built for confidence.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="cta-primary bg-[color:var(--rukhsar-ivory)] text-[color:var(--rukhsar-maroon)]"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/track-order"
                  className="rounded-full border border-white/50 bg-[rgba(255,255,255,0.06)] px-6 py-3 text-sm font-semibold backdrop-blur-sm"
                >
                  Track an Order
                </Link>
              </div>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {["Secure payments", "Craft-led fabrics", "Responsive support"].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/20 bg-[rgba(255,255,255,0.08)] p-5 backdrop-blur-sm"
                >
                  <p className="text-sm text-[rgba(248,241,231,0.78)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-end md:justify-end">
            <div className="max-w-md rounded-[2rem] border border-white/20 bg-[rgba(255,248,240,0.14)] p-8 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.35em] text-[rgba(248,241,231,0.72)]">Why it feels different</p>
              <h2 className="mt-3 font-serif text-3xl">Textile storytelling, polished for real shopping.</h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(248,241,231,0.86)]">
                Editorial visuals, clear fabric details, trustworthy checkout, and a calm mobile-first journey that
                feels as premium as the clothes themselves.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Easy support", "WhatsApp-ready and customer-first"],
          ["India-first checkout", "UPI, cards, and COD support"],
          ["Premium presentation", "Luxurious yet highly readable UI"],
          ["Fast browsing", "Built to feel light on mobile"]
        ].map(([title, body]) => (
          <div key={title} className="surface-card p-5">
            <p className="font-medium text-[color:var(--rukhsar-maroon)]">{title}</p>
            <p className="mt-2 text-sm text-stone-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CollectionHighlights({ items = collections }: { items?: Collection[] }) {
  return (
    <section className="section-shell py-12">
      <SectionHeading title="Featured Collections" eyebrow="Curated Drops">
        Collections shaped to feel ceremonial, personal, and deeply rooted in textile memory.
      </SectionHeading>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((collection) => (
          <article key={collection.id} className="surface-card p-7">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              {collection.slug.replaceAll("-", " ")}
            </p>
            <h3 className="mt-3 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{collection.name}</h3>
            <p className="mt-4 text-sm leading-7 text-stone-600">{collection.description}</p>
            <p className="mt-6 text-sm font-medium text-[color:var(--rukhsar-saffron)]">Explore collection</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter((product) => product.featured);
  return (
    <section className="section-shell py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading title="Bestsellers and New Icons" eyebrow="Shop">
          Signature pieces for festive dressing, heirloom-inspired gifting, and everyday elegance.
        </SectionHeading>
        <Link href="/shop" className="text-sm font-semibold text-[color:var(--rukhsar-maroon)]">
          View full catalog
        </Link>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {featured.map((product) => (
          <LinkCard
            key={product.id}
            href={`/product/${product.slug}`}
            eyebrow={product.category}
            title={product.name}
            body={product.description}
            meta={`${formatCurrency(product.salePrice)} | ${product.fabric}`}
          />
        ))}
      </div>
    </section>
  );
}

export function BrandStorySection() {
  return (
    <section id="brand-story" className="section-shell py-12">
      <div className="grid gap-6 rounded-[2rem] bg-[rgba(90,30,34,0.05)] p-8 md:grid-cols-[1fr_1.1fr] md:p-12">
        <div>
          <p className="eyebrow">Brand Story</p>
          <h2 className="mt-4 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">
            Born in Aurangabad, shaped by woven memory.
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-8 text-stone-600">
          <p>
            Rukhsar lives between craftsmanship and modern dressing. The storefront should communicate provenance as
            clearly as product utility: heritage textiles, fabric knowledge, considered silhouettes, and a checkout
            flow suited to Indian shoppers.
          </p>
          <p>
            The result should feel believable to first-time customers: premium imagery, generous whitespace, useful
            delivery cues, and trust-building content that makes purchase decisions easier.
          </p>
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="section-shell py-12">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(181,102,29,0.16),rgba(194,161,90,0.22))] p-8 md:p-12">
        <SectionHeading title="Stay close to new drops" eyebrow="Newsletter">
          Capture email and WhatsApp opt-ins for launches, festive edits, and limited craft capsules.
        </SectionHeading>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <form className="flex flex-col gap-4 md:flex-row">
            <input
              className="rounded-full border border-white/80 bg-white/90 px-5 py-3 text-sm outline-none"
              placeholder="Enter your email address"
            />
            <button className="cta-primary">Subscribe</button>
          </form>
          <div className="text-sm text-stone-600">
            Expect craft stories, launch alerts, and wardrobe-worthy seasonal edits.
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkCard(props: { href: string; eyebrow: string; title: string; body: string; meta: string }) {
  return (
    <Link href={props.href} className="surface-card block p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <p className="text-xs uppercase tracking-[0.35em] text-stone-500">{props.eyebrow}</p>
      <h3 className="mt-3 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{props.title}</h3>
      <p className="mt-4 text-sm leading-7 text-stone-600">{props.body}</p>
      <p className="mt-5 text-sm font-semibold text-[color:var(--rukhsar-saffron)]">{props.meta}</p>
    </Link>
  );
}
