"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";

export function AccountPageClient() {
  const { user } = useStore();

  if (!user) {
    return (
      <section className="section-shell py-12">
        <div className="surface-card p-10">
          <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">My Account</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
            Sign in to view your saved details, order progress, and wishlist in one calmer customer space.
          </p>
          <Link href="/login" className="cta-primary mt-6 inline-block">
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-12">
      <div className="surface-card p-8 md:p-10">
        <p className="eyebrow">Customer account</p>
        <h1 className="mt-3 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Welcome back, {user.fullName.split(" ")[0]}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          Keep track of saved pieces, active orders, and account details without losing the premium storefront feel.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="surface-card p-6">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Profile</h2>
          <p className="mt-4 text-sm text-stone-600">{user.fullName}</p>
          <p className="mt-1 text-sm text-stone-600">{user.email}</p>
          <p className="mt-1 text-sm text-stone-500">Role: {user.role}</p>
        </div>
        <div className="surface-card p-6">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Shopping Shortcuts</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-stone-600">
            <Link href="/orders">View orders</Link>
            <Link href="/wishlist">Open wishlist</Link>
            <Link href="/track-order">Track an order</Link>
          </div>
        </div>
        <div className="surface-card p-6">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Shopping Confidence</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Signed-in previews now keep your order history available here while wishlist state still stays on this device.
          </p>
        </div>
      </div>
    </section>
  );
}
