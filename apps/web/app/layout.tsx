import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rukhsar | Wear Your Tradition",
  description: "Bold Gen-Z fashion rooted in traditional Indian and regional elegance."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-[family:var(--font-rukhsar-body)]">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
