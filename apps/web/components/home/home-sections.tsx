import Link from "next/link";
import type { Collection, Product } from "@rukhsar/types";
import { SectionHeading } from "@rukhsar/ui";
import { collections } from "@/lib/data/store";
import { formatCurrency } from "@/lib/utils/currency";
import { ProductCard } from "@/components/product/product-card";

const categoryCards = [
  {
    title: "New Arrivals",
    subtitle: "Fresh drops with modern craft energy",
    accent: "bg-[linear-gradient(135deg,#ff4fa3,#ff87c2)] text-white"
  },
  {
    title: "Unstitched",
    subtitle: "Build your own silhouette with statement fabrics",
    accent: "bg-[linear-gradient(135deg,#f3e5d8,#d8bfaa)] text-[color:var(--rukhsar-ink)]"
  },
  {
    title: "Suits",
    subtitle: "Fashion-first sets for easy elevated dressing",
    accent: "bg-[linear-gradient(135deg,#6c1f2e,#3f0f1c)] text-white"
  },
  {
    title: "Festive Edit",
    subtitle: "Made for mehfils, wedding lights, and mood",
    accent: "bg-[linear-gradient(135deg,#c9902f,#f0c56c)] text-[color:var(--rukhsar-ink)]"
  },
  {
    title: "Dupattas",
    subtitle: "Lightweight drama with movement and shine",
    accent: "bg-[linear-gradient(135deg,#224238,#3d6d5f)] text-white"
  }
];

export function HeroSection() {
  return (
    <section className="section-shell py-8 md:py-10">
      <div className="editorial-panel relative min-h-[720px] bg-[color:var(--rukhsar-black)] text-[color:var(--rukhsar-offwhite)]">
        <video className="absolute inset-0 h-full w-full object-cover opacity-35" autoPlay loop muted playsInline preload="auto">
          <source src="/rukhsarbgvideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,79,163,0.42),transparent_22%),radial-gradient(circle_at_18%_76%,rgba(201,144,47,0.18),transparent_20%),linear-gradient(135deg,rgba(10,8,13,0.92),rgba(25,10,20,0.76)_40%,rgba(15,11,18,0.92)_100%)]" />
        <div className="relative grid min-h-[720px] gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[color:var(--rukhsar-pink-soft)]">
                Wear Your Tradition
              </p>
              <div className="mt-6">
                <p className="font-[family:var(--font-rukhsar-heading)] text-[clamp(2.6rem,8vw,6rem)] font-semibold leading-none tracking-[0.28em] text-white">
                  RUKHSAR
                </p>
                <h1 className="mt-6 max-w-3xl font-[family:var(--font-rukhsar-heading)] text-4xl font-semibold leading-[1.02] text-white md:text-6xl">
                  Timeless Tradition. Modern You.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/74 md:text-lg">
                  Fresh Styles, Rooted in Tradition. A bold wardrobe language for women who want regional craft,
                  premium fashion energy, and a little more presence every time they step out.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/shop" className="cta-primary">
                  Explore Rukhsar
                </Link>
                <Link href="/shop?collection=Festive%20Edit" className="cta-secondary border-white/20 bg-white/[0.08] text-white">
                  Shop Now
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Premium regional wear", "Fashion-led styling", "Editorial product drops"].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/80">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Hot pink highlights", "Dark luxury tone with fashion-editorial contrast"],
                ["Craft with edge", "Traditional textures styled with a sharper modern lens"],
                ["Mobile-first feel", "Premium shopping flow that still feels fast and light"]
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1.6rem] border border-white/12 bg-white/[0.08] p-5 backdrop-blur-md">
                  <p className="font-semibold uppercase tracking-[0.16em] text-[color:var(--rukhsar-pink-soft)]">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-end">
            <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] p-6 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--rukhsar-pink-soft)]">
                Featured Collection Banner
              </p>
              <h2 className="mt-4 font-[family:var(--font-rukhsar-heading)] text-3xl font-semibold leading-tight text-white md:text-5xl">
                Festive ’24 Edit
                <span className="mt-2 block text-[color:var(--rukhsar-pink-soft)]">Made for Every Moment</span>
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72 md:text-base">
                Think heirloom color, shimmer that reads premium, and silhouettes that feel right for intimate nights,
                wedding scenes, and statement festive dressing.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="fashion-chip bg-white text-[color:var(--rukhsar-black)]">New season mood</span>
                <span className="fashion-chip bg-[color:var(--rukhsar-pink)] text-white">Hot picks</span>
                <span className="fashion-chip bg-[color:var(--rukhsar-mustard)] text-[color:var(--rukhsar-black)]">Occasion ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CollectionHighlights({ items = collections }: { items?: Collection[] }) {
  return (
    <section className="section-shell py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading title="Fresh Styles, Rooted in Tradition" eyebrow="Home Page">
          A category-led entry point that feels like a fashion app first, while still staying grounded in regional
          craft and occasion dressing.
        </SectionHeading>
        <Link href="/shop" className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rukhsar-maroon)]">
          Shop all drops
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {categoryCards.map((card) => (
          <article key={card.title} className={`rounded-[1.8rem] p-5 shadow-[0_20px_40px_rgba(17,11,18,0.12)] ${card.accent}`}>
            <p className="text-[11px] uppercase tracking-[0.32em] opacity-80">Edit</p>
            <h3 className="mt-3 font-[family:var(--font-rukhsar-heading)] text-2xl font-semibold">{card.title}</h3>
            <p className="mt-3 text-sm leading-7 opacity-86">{card.subtitle}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((collection, index) => (
          <article
            key={collection.id}
            className={`surface-card p-7 ${
              index === 0
                ? "bg-[linear-gradient(180deg,rgba(255,79,163,0.08),rgba(255,255,255,0.85))]"
                : index === 1
                  ? "bg-[linear-gradient(180deg,rgba(201,144,47,0.12),rgba(255,255,255,0.85))]"
                  : "bg-[linear-gradient(180deg,rgba(34,66,56,0.08),rgba(255,255,255,0.86))]"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-stone-500">{collection.slug.replaceAll("-", " ")}</p>
            <h3 className="mt-3 font-[family:var(--font-rukhsar-heading)] text-3xl font-semibold text-[color:var(--rukhsar-ink)]">
              {collection.name}
            </h3>
            <p className="mt-4 text-sm leading-7 text-stone-600">{collection.description}</p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rukhsar-pink)]">
              Explore collection
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter((product) => product.featured);

  return (
    <section className="section-shell py-10">
      <div className="rounded-[2.1rem] bg-[linear-gradient(135deg,rgba(15,11,18,1),rgba(42,17,31,0.96)_55%,rgba(97,31,48,0.92))] px-6 py-8 text-white shadow-[0_28px_70px_rgba(17,11,18,0.24)] md:px-10 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading title="Best Sellers" eyebrow="Gen-Z Fashion Spotlight" className="text-white [&_p]:text-white/72 [&_h2]:text-white">
            The pieces that already feel like instant signatures: premium mood, rich fabric language, and strong
            regional character.
          </SectionHeading>
          <Link href="/shop" className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--rukhsar-pink-soft)]">
            Explore collection
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featured.map((product) => (
            <div key={product.id} className="rounded-[1.8rem] bg-white/[0.08] p-2 backdrop-blur-md">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandStorySection() {
  return (
    <section id="brand-story" className="section-shell py-10">
      <div className="luxury-grid overflow-hidden rounded-[2.2rem] border border-black/6 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(255,240,247,0.62),rgba(255,248,242,0.8))] px-6 py-8 shadow-[0_22px_60px_rgba(17,11,18,0.12)] md:px-10 md:py-10">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Brand Story</p>
            <h2 className="mt-4 font-[family:var(--font-rukhsar-heading)] text-4xl font-semibold text-[color:var(--rukhsar-ink)] md:text-5xl">
              Traditional wear, but styled with a louder point of view.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-8 text-stone-600 md:text-[15px]">
            <p>
              Rukhsar is designed for women who love regional craft but do not want their wardrobe language to feel
              old, quiet, or flat. The interface should mirror that same attitude.
            </p>
            <p>
              We balance premium editorial energy with grounded Indian elegance: soft golds, deep maroons, sharp black
              contrast, hot pink light, and enough breathing room for every product to feel styled, not stacked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="section-shell py-10">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,79,163,0.92),rgba(108,31,46,0.94),rgba(15,11,18,1))] px-6 py-8 text-white shadow-[0_24px_64px_rgba(108,31,46,0.24)] md:px-10 md:py-10">
        <SectionHeading title="Stay close to every new drop" eyebrow="Newsletter" className="[&_h2]:text-white [&_p]:text-white/80">
          Launch alerts, festive edits, regional wear styling stories, and the strongest looks before everyone else
          catches on.
        </SectionHeading>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <form className="flex flex-col gap-4 md:flex-row">
            <input
              className="rounded-full border border-white/16 bg-white/14 px-5 py-3 text-sm text-white outline-none placeholder:text-white/60"
              placeholder="Enter your email address"
            />
            <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-black)]">
              Subscribe
            </button>
          </form>
          <div className="text-sm leading-7 text-white/80">
            Fashion-first traditional wear for wedding plans, festive nights, and every rooted modern moment in
            between.
          </div>
        </div>
      </div>
    </section>
  );
}
