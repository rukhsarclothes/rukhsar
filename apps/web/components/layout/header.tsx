import { Suspense } from "react";
import { SessionHeader } from "@/components/layout/session-header";

export function Header() {
  return (
    <Suspense fallback={null}>
      <SessionHeader />
    </Suspense>
  );
}
