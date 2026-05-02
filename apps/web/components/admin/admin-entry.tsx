"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";

export function AdminEntry() {
  const router = useRouter();
  const { adminUser } = useStore();

  useEffect(() => {
    router.replace(adminUser ? "/admin/dashboard" : "/admin/login");
  }, [adminUser, router]);

  return <section className="px-6 py-16 text-sm text-stone-600">Opening admin portal...</section>;
}
