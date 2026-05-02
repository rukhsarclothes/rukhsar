import type { Metadata } from "next";
import { PartnerWithUsPageClient } from "@/components/partners/partner-with-us-page-client";

export const metadata: Metadata = {
  title: "Partner With Us | Rukhsar Saree Seller Program",
  description:
    "Join Rukhsar as a saree seller partner and reach customers across India with premium merchandising, marketing support, and fast onboarding."
};

export default function PartnerWithUsPage() {
  return <PartnerWithUsPageClient />;
}
