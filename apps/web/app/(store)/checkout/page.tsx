import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { getProducts } from "@/lib/api";

export default async function CheckoutPage() {
  const products = await getProducts();
  return <CheckoutPageClient products={products} />;
}
