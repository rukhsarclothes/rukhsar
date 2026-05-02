import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[rgba(90,30,34,0.14)] bg-[linear-gradient(180deg,rgba(90,30,34,0.03),rgba(90,30,34,0.06))]">
      <div className="section-shell py-14">
        <div className="surface-card grid gap-10 p-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] md:p-10">
          <div>
            <h3 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Rukhsar</h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-stone-600">
              Premium womenswear inspired by Aurangabad's woven legacy, reinterpreted for contemporary wardrobes and memorable occasions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-stone-500">
              <span className="rounded-full bg-[rgba(194,161,90,0.14)] px-4 py-2">Secure checkout</span>
              <span className="rounded-full bg-[rgba(194,161,90,0.14)] px-4 py-2">Responsive support</span>
              <span className="rounded-full bg-[rgba(194,161,90,0.14)] px-4 py-2">Craft-first design</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Customer Care</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-stone-600">
              <Link href="/track-order">Track Order</Link>
              <span>Shipping Policy</span>
              <span>Returns and Refunds</span>
              <span>Size Guide</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Collections</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-stone-600">
              <Link href="/shop">Aurangabad Heritage</Link>
              <Link href="/shop">Festive Edit</Link>
              <Link href="/shop">Everyday Grace</Link>
              <Link href="/shop">New Arrivals</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Visit</h4>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Aurangabad, Maharashtra, India
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
