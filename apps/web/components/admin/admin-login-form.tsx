"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function AdminLoginForm() {
  const router = useRouter();
  const { setAdminSession } = useStore();
  const [email, setEmail] = useState("demo@rukhsar.in");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
    } catch {
      setError(`Couldn't reach the local API at ${apiBaseUrl}. Start the API server on localhost:4000 and try again.`);
      return;
    }

    const data = (await response.json()) as {
      user?: { id: string; fullName: string; email: string; role: "customer" | "admin" };
      accessToken?: string;
      message?: string;
    };

    if (!response.ok || !data.user || !data.accessToken) {
      setError(data.message ?? "Admin login failed");
      return;
    }

    if (data.user.role !== "admin") {
      setError("This account is not allowed in the admin portal.");
      return;
    }

    setAdminSession(data.user, data.accessToken);
    router.push("/admin/dashboard");
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16 md:px-8">
      <div className="grid w-full gap-8 md:grid-cols-[1fr_460px]">
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#5a1e22,#7c3a2d_45%,#c2a15a)] p-8 text-[color:var(--rukhsar-ivory)] md:p-12">
          <p className="text-xs uppercase tracking-[0.4em] text-[rgba(248,241,231,0.72)]">Rukhsar admin</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight">Separate operations portal for catalog, orders, and revenue.</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[rgba(248,241,231,0.82)]">
            This workspace is intentionally isolated from the customer storefront. Staff should enter through the admin login only.
          </p>
          <div className="mt-8 text-sm text-[rgba(248,241,231,0.8)]">
            Demo admin credentials: demo@rukhsar.in / password123
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
          <h2 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Admin Login</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <input className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{error}</p> : null}
            <button className="w-full rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]">
              Enter Admin Portal
            </button>
          </form>
          <div className="mt-6 text-sm text-stone-600">
            Customer account area lives at <Link href="/login" className="text-[color:var(--rukhsar-maroon)]">/login</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
