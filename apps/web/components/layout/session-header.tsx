"use client";

import Link from "next/link";
import { primaryNavigation } from "@rukhsar/config";
import { useStore } from "@/components/providers/store-provider";

function IconButton({
  label,
  href,
  accent
}: {
  label: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        accent
          ? "border-transparent bg-[color:var(--rukhsar-pink)] text-white shadow-[0_14px_28px_rgba(255,79,163,0.25)]"
          : "border-white/10 bg-white/[0.06] text-[color:var(--rukhsar-offwhite)] backdrop-blur-sm"
      }`}
    >
      {label}
    </Link>
  );
}

export function SessionHeader() {
  const { cart, wishlist, user, setSession } = useStore();
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(15,11,18,0.82)] text-[color:var(--rukhsar-offwhite)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(255,79,163,0.16),rgba(201,163,95,0.12),rgba(15,11,18,0.05))]">
        <div className="section-shell flex items-center justify-between py-2 text-[10px] uppercase tracking-[0.32em] text-white/70">
          <span>Wear Your Tradition</span>
          <span className="hidden md:inline">Bold regional fashion for everyday statements</span>
        </div>
      </div>
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link href="/" className="leading-none">
            <span className="block font-[family:var(--font-rukhsar-heading)] text-[1.8rem] font-semibold tracking-[0.3em] text-white">
              RUKHSAR
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.36em] text-[color:var(--rukhsar-pink-soft)]">
              Wear Your Tradition
            </span>
          </Link>
          <nav className="hidden gap-6 text-sm lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 transition hover:text-[color:var(--rukhsar-pink-soft)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="w-full max-w-xl rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-white/50 backdrop-blur-sm">
            Search sets, festive edits, handloom textures, and modern heirlooms
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <button
              onClick={() => setSession(null, null)}
              className="hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 md:inline-flex"
            >
              Logout {user.fullName.split(" ")[0]}
            </button>
          ) : (
            <IconButton label="Login" href="/login" />
          )}
          <IconButton label={`Wishlist ${wishlist.length}`} href="/wishlist" />
          <IconButton label={`Bag ${cartCount}`} href="/cart" accent />
        </div>
      </div>
    </header>
  );
}
