"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminNavigation } from "@rukhsar/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useStore } from "@/components/providers/store-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <AdminShell pathname={pathname}>{children}</AdminShell>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AdminShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const router = useRouter();
  const { adminUser, adminToken, setAdminSession } = useStore();
  const isLoginPage = pathname === "/admin/login";
  const hasAdminSession = Boolean(adminUser && adminToken);

  useEffect(() => {
    if (!isLoginPage && !hasAdminSession) {
      router.replace("/admin/login");
      return;
    }

    if (isLoginPage && hasAdminSession) {
      router.replace("/admin/dashboard");
    }
  }, [hasAdminSession, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,#f3eadf_0%,#efe5d8_100%)]">{children}</main>;
  }

  if (!hasAdminSession || !adminUser) {
    return <main className="min-h-screen bg-[#f4efe8] px-6 py-16 text-sm text-stone-600">Loading admin workspace...</main>;
  }

  return (
    <div className="min-h-screen bg-[#f4efe8] text-[color:var(--rukhsar-ink)]">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-[rgba(90,30,34,0.1)] bg-[color:var(--rukhsar-maroon)] px-6 py-8 text-[color:var(--rukhsar-ivory)]">
          <Link href="/admin/dashboard" className="font-serif text-2xl tracking-[0.18em]">
            RUKHSAR HQ
          </Link>
          <p className="mt-3 text-sm text-[rgba(248,241,231,0.72)]">Private admin operations workspace</p>
          <nav className="mt-10 flex flex-col gap-2 text-sm">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 transition ${pathname === item.href ? "bg-[rgba(248,241,231,0.12)]" : "hover:bg-[rgba(248,241,231,0.08)]"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-10 rounded-2xl bg-[rgba(248,241,231,0.08)] p-4 text-sm">
            <p className="font-medium">{adminUser.fullName}</p>
            <p className="mt-1 text-[rgba(248,241,231,0.72)]">{adminUser.email}</p>
            <button
              onClick={() => {
                setAdminSession(null, null);
                router.push("/admin/login");
              }}
              className="mt-4 rounded-full border border-[rgba(248,241,231,0.24)] px-4 py-2"
            >
              Logout
            </button>
          </div>
        </aside>
        <main>
          <div className="border-b border-[rgba(90,30,34,0.08)] bg-[rgba(255,255,255,0.72)] px-6 py-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Admin Portal</p>
          </div>
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
