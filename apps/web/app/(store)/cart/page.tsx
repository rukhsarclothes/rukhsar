import { CartPageClient } from "@/components/cart/cart-page-client";
import { getCoupons, getProducts } from "@/lib/api";

export default async function CartPage() {
  const [products, coupons] = await Promise.all([getProducts(), getCoupons()]);
  return <CartPageClient products={products} coupons={coupons} />;
}
