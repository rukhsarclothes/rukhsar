import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/6 bg-[linear-gradient(180deg,rgba(15,11,18,0.02),rgba(15,11,18,0.08))]">
      <div className="section-shell py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-black/6 bg-white/[0.74] px-5 py-4 text-sm text-stone-600 shadow-[0_18px_42px_rgba(17,11,18,0.08)]">
          <span>Secure checkout experience</span>
          <span>Customer-first order tracking</span>
          <span>Curated regional fashion with premium presentation</span>
        </div>

        <div className="grid gap-8 rounded-[2rem] bg-[color:var(--rukhsar-black)] px-6 py-8 text-[color:var(--rukhsar-offwhite)] shadow-[0_30px_80px_rgba(17,11,18,0.22)] md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] md:px-10 md:py-10">
          <div>
            <h3 className="font-[family:var(--font-rukhsar-heading)] text-3xl font-semibold tracking-[0.18em]">
              RUKHSAR
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
              A fashion-forward traditional wear label for women who want editorial presence, strong color, and rooted
              cultural elegance in one wardrobe.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.24em] text-white/72">
              <span className="rounded-full bg-white/10 px-4 py-2">Wear Your Tradition</span>
              <span className="rounded-full bg-[color:var(--rukhsar-pink)] px-4 py-2 text-white">Gen-Z Luxury</span>
              <span className="rounded-full bg-[color:var(--rukhsar-forest)] px-4 py-2 text-white">Craft Forward</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Customer Care</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/74">
              <Link href="/track-order">Track Order</Link>
              <Link href="/cart">Shipping and bag review</Link>
              <Link href="/checkout">Checkout support</Link>
              <Link href="/login">Account and order access</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Fashion Edit</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/74">
              <Link href="/shop?sort=newest">New Arrivals</Link>
              <Link href="/shop?collection=Festive%20Edit">Festive Edit</Link>
              <Link href="/shop?category=Kurtas">Statement Sets</Link>
              <Link href="/wishlist">Saved Pieces</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Studio</h4>
            <p className="mt-4 text-sm leading-7 text-white/74">
              Aurangabad, Maharashtra
              <br />
              <a href="mailto:hello@rukhsar.in" className="hover:text-white">
                hello@rukhsar.in
              </a>
              <br />
              <a href="tel:+919876543210" className="hover:text-white">
                +91 98765 43210
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
