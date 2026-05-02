"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useStore();
  const [email, setEmail] = useState("shopper@rukhsar.in");
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
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-sm">
        <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Login</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{error}</p> : null}
          <button className="w-full rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]">
            Sign In
          </button>
          <div className="flex justify-between text-sm text-stone-600">
            <Link href="/forgot-password">Forgot password</Link>
            <Link href="/signup">Create account</Link>
          </div>
          <p className="text-xs text-stone-500">Demo customer: shopper@rukhsar.in / password123</p>
        </form>
      </div>
    </section>
  );
}
