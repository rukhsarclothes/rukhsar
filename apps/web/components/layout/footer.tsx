import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/6 bg-[linear-gradient(180deg,rgba(15,11,18,0.02),rgba(15,11,18,0.08))]">
      <div className="section-shell py-14">
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
              <span>Shipping Policy</span>
              <span>Returns and Refunds</span>
              <span>Size Guide</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Fashion Edit</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/74">
              <Link href="/shop">New Arrivals</Link>
              <Link href="/shop">Festive Edit</Link>
              <Link href="/shop">Statement Sets</Link>
              <Link href="/shop">Everyday Icons</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Studio</h4>
            <p className="mt-4 text-sm leading-7 text-white/74">
              Aurangabad, Maharashtra
              <br />
              hello@rukhsar.in
              <br />
              +91 98765 43210
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
