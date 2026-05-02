"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function SignupForm() {
  const router = useRouter();
  const { setSession } = useStore();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: ""
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password
        })
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
      setError(data.message ?? "Signup failed");
      return;
    }

    setSession(data.user, data.accessToken);
    router.push("/account");
  }

  return (
    <section className="section-shell py-16">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_460px]">
        <div className="surface-card p-8 md:p-10">
          <p className="eyebrow">Create account</p>
          <h1 className="mt-3 font-serif text-5xl text-[color:var(--rukhsar-maroon)]">Join a calmer way to shop premium Indian fashion.</h1>
          <p className="mt-6 max-w-xl text-sm leading-8 text-stone-600">
            Save your wishlist, keep track of orders, and move through checkout with more ease whenever you return.
          </p>
        </div>
        <div className="surface-card p-8">
          <h2 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Sign Up</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {[
              ["fullName", "Full Name"],
              ["email", "Email"],
              ["phoneNumber", "Phone Number"],
              ["password", "Password"]
            ].map(([key, label]) => (
              <input
                key={key}
                className="w-full rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm"
                placeholder={label}
                type={key === "password" ? "password" : "text"}
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            ))}
            {error ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{error}</p> : null}
            <button className="cta-primary w-full">Create Account</button>
          </form>
        </div>
      </div>
    </section>
  );
}
