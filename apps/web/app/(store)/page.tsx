import {
  BrandStorySection,
  CollectionHighlights,
  FeaturedProducts,
  HeroSection,
  NewsletterSection
} from "@/components/home/home-sections";
import { getProducts } from "@/lib/api";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <HeroSection />
      <CollectionHighlights />
      <FeaturedProducts products={products} />
      <BrandStorySection />
      <NewsletterSection />
    </>
  );
}
