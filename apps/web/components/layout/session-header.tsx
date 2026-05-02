"use client";

import Link from "next/link";
import { primaryNavigation } from "@rukhsar/config";
import { useStore } from "@/components/providers/store-provider";

export function SessionHeader() {
  const { cart, wishlist, user, setSession } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-[rgba(248,241,231,0.86)] backdrop-blur-xl">
      <div className="border-b border-[rgba(90,30,34,0.08)] bg-[rgba(90,30,34,0.03)]">
        <div className="section-shell flex items-center justify-between py-2 text-[11px] uppercase tracking-[0.28em] text-stone-500">
          <span>Craft-led pieces from Aurangabad</span>
          <span className="hidden md:inline">Secure checkout | Easy support | India-first delivery</span>
        </div>
      </div>
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl tracking-[0.2em] text-[color:var(--rukhsar-maroon)]">
            RUKHSAR
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            {primaryNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[color:var(--rukhsar-saffron)]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden flex-1 justify-center lg:flex">
          <div className="w-full max-w-md rounded-full border border-[rgba(90,30,34,0.12)] bg-white/80 px-5 py-3 text-sm text-stone-400">
            Search festive edits, kurtas, sarees, or collections
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="hidden text-stone-600 md:inline">Hi, {user.fullName.split(" ")[0]}</span>
              <button onClick={() => setSession(null, null)} className="text-stone-600">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
          <Link href="/wishlist">Wishlist ({wishlist.length})</Link>
          <Link
            href="/cart"
            className="rounded-full bg-[color:var(--rukhsar-maroon)] px-4 py-2 text-[color:var(--rukhsar-ivory)]"
          >
            Cart ({cart.reduce((sum, line) => sum + line.quantity, 0)})
          </Link>
        </div>
      </div>
    </header>
  );
}
