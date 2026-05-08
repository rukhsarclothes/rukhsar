"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { getApiBaseUrl, getApiConfigMessage, getApiUnavailableMessage } from "@/lib/api-base-url";

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
    const apiBaseUrl = getApiBaseUrl();
    const apiConfigMessage = getApiConfigMessage();

    if (!apiBaseUrl) {
      setError(apiConfigMessage || "Customer API URL is not configured.");
      return;
    }

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
      setError(getApiUnavailableMessage(apiBaseUrl));
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
        <div className="editorial-panel overflow-hidden px-8 py-10 text-[color:var(--rukhsar-ivory)] md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-[0.42em] text-white/60">Create account</p>
          <h1 className="mt-4 font-[family:var(--font-rukhsar-heading)] text-4xl leading-tight md:text-6xl">
            Join the new-generation tradition edit.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-8 text-white/75 md:text-base">
            Save your wishlist, revisit orders, and keep your premium regional-wear journey seamless across every return.
          </p>
        </div>
        <div className="surface-card p-8">
          <h2 className="font-[family:var(--font-rukhsar-heading)] text-4xl text-[color:var(--rukhsar-maroon)]">
            Sign Up
          </h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {[
              ["fullName", "Full Name"],
              ["email", "Email"],
              ["phoneNumber", "Phone Number"],
              ["password", "Password"]
            ].map(([key, label]) => (
              <input
                key={key}
                className="w-full rounded-[1.35rem] border border-stone-200 bg-white/[0.86] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--rukhsar-pink)] focus:ring-2 focus:ring-[rgba(255,78,168,0.18)]"
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
