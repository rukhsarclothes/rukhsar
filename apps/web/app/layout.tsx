import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rukhsar | Aurangabad Luxury Womenswear",
  description: "Premium women's ethnic and contemporary clothing rooted in Aurangabad's textile heritage."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
