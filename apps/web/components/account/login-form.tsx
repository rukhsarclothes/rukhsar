"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { getApiBaseUrl, getApiConfigMessage, getApiUnavailableMessage } from "@/lib/api-base-url";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useStore();
  const [email, setEmail] = useState("shopper@rukhsar.in");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const apiBaseUrl = getApiBaseUrl();
    const apiConfigMessage = getApiConfigMessage();

    if (!apiBaseUrl) {
      setError(apiConfigMessage || "Customer API URL is not configured.");
      return;
    }

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
    } catch {
      setError(getApiUnavailableMessage(apiBaseUrl));
      return;
    }

    const data = (await response.json()) as {
      user?: { id: string; fullName: string; email: string; role: "customer" | "admin" };
      accessToken?: string;
      message?: string;
    };

    if (!response.ok || !data.user || !data.accessToken) {
      setError(data.message ?? "Login failed");
      return;
    }

    if (data.user.role === "admin") {
      setError("Admin accounts must use the admin portal at /admin/login.");
      return;
    }

    setSession(data.user, data.accessToken);
    router.push("/account");
  }

  return (
    <section className="section-shell py-16">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_460px]">
        <div className="editorial-panel overflow-hidden px-8 py-10 text-[color:var(--rukhsar-ivory)] md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-[0.42em] text-white/60">Customer Login</p>
          <h1 className="mt-4 max-w-2xl font-[family:var(--font-rukhsar-heading)] text-4xl leading-tight md:text-6xl">
            Wear Your Tradition, with your account ready when you return.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 md:text-base">
            Sign in to access saved pieces, orders, and a smoother checkout flow designed for premium fashion shopping.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white/80">
              Wishlist sync
            </span>
            <span className="rounded-full border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white/80">
              Faster checkout
            </span>
          </div>
        </div>
        <div className="surface-card p-8">
          <h1 className="font-[family:var(--font-rukhsar-heading)] text-4xl text-[color:var(--rukhsar-maroon)]">Login</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-[1.35rem] border border-stone-200 bg-white/[0.86] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--rukhsar-pink)] focus:ring-2 focus:ring-[rgba(255,78,168,0.18)]"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="w-full rounded-[1.35rem] border border-stone-200 bg-white/[0.86] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--rukhsar-pink)] focus:ring-2 focus:ring-[rgba(255,78,168,0.18)]"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{error}</p> : null}
            <button className="w-full rounded-full bg-[color:var(--rukhsar-pink)] px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5">
              Sign In
            </button>
            <div className="flex justify-between text-sm text-stone-600">
              <Link href="/forgot-password">Forgot password</Link>
              <Link href="/signup">Create account</Link>
            </div>
            <p className="text-xs text-stone-500">Demo customer: shopper@rukhsar.in / password123</p>
          </form>
        </div>
      </div>
    </section>
  );
}
