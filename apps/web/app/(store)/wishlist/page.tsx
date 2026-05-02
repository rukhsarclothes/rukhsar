import { WishlistPageClient } from "@/components/product/wishlist-page-client";
import { getProducts } from "@/lib/api";

export default async function WishlistPage() {
  const products = await getProducts();
  return <WishlistPageClient products={products} />;
}
