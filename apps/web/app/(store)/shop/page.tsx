import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/api";

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string;
    fabric?: string;
    price?: string;
    sort?: string;
  }>;
};

function matchesPriceRange(price: number, range: string) {
  if (range === "under-5000") {
    return price < 5000;
  }

  if (range === "5000-8000") {
    return price >= 5000 && price <= 8000;
  }

  if (range === "above-8000") {
    return price > 8000;
  }

  return true;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts();
  const params = (await searchParams) ?? {};
  const selectedCategory = params.category ?? "all";
  const selectedFabric = params.fabric ?? "all";
  const selectedPrice = params.price ?? "all";
  const selectedSort = params.sort ?? "newest";

  const categories = [...new Set(products.map((product) => product.category))].sort((left, right) =>
    left.localeCompare(right)
  );
  const fabrics = [...new Set(products.map((product) => product.fabric))].sort((left, right) =>
    left.localeCompare(right)
  );

  const filteredProducts = products
    .filter((product) => selectedCategory === "all" || product.category === selectedCategory)
    .filter((product) => selectedFabric === "all" || product.fabric === selectedFabric)
    .filter((product) => matchesPriceRange(product.salePrice, selectedPrice))
    .sort((left, right) => {
      if (selectedSort === "price-asc") {
        return left.salePrice - right.salePrice;
      }

      if (selectedSort === "price-desc") {
        return right.salePrice - left.salePrice;
      }

      if (selectedSort === "name-asc") {
        return left.name.localeCompare(right.name);
      }

      return 0;
    });

  return (
    <section className="section-shell py-12">
      <div className="surface-card mb-8 p-8 md:p-10">
        <p className="eyebrow">Catalog</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)] md:text-5xl">Shop Rukhsar</h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Browse premium sarees, kurtas, co-ords, and occasionwear through a calmer, more confident shopping
              layout designed for real decision-making.
            </p>
          </div>
          <div className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm text-stone-600">
            Sort: {selectedSort === "newest" ? "Newest" : selectedSort === "price-asc" ? "Price Low To High" : selectedSort === "price-desc" ? "Price High To Low" : "Name A To Z"}
          </div>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <aside className="surface-card h-fit p-6 md:sticky md:top-28">
          <p className="eyebrow">Filter and refine</p>
          <form className="mt-5 space-y-4">
            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-medium text-[color:var(--rukhsar-maroon)]">Category</span>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-medium text-[color:var(--rukhsar-maroon)]">Fabric</span>
              <select
                name="fabric"
                defaultValue={selectedFabric}
                className="w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3"
              >
                <option value="all">All fabrics</option>
                {fabrics.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-medium text-[color:var(--rukhsar-maroon)]">Price range</span>
              <select
                name="price"
                defaultValue={selectedPrice}
                className="w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3"
              >
                <option value="all">All prices</option>
                <option value="under-5000">Under Rs. 5,000</option>
                <option value="5000-8000">Rs. 5,000 to Rs. 8,000</option>
                <option value="above-8000">Above Rs. 8,000</option>
              </select>
            </label>
            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-medium text-[color:var(--rukhsar-maroon)]">Sort</span>
              <select
                name="sort"
                defaultValue={selectedSort}
                className="w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price Low To High</option>
                <option value="price-desc">Price High To Low</option>
                <option value="name-asc">Name A To Z</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="cta-primary" type="submit">
                Apply filters
              </button>
              <Link href="/shop" className="cta-secondary">
                Reset
              </Link>
            </div>
          </form>
          <div className="mt-6 rounded-2xl bg-[rgba(194,161,90,0.12)] p-4 text-sm text-stone-700">
            Looking for a festive outfit? Start with Paithani-inspired drapes and richer maroon edits.
          </div>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
            <span>{filteredProducts.length} styles available</span>
            <span>Secure checkout | Responsive support | Easy browsing</span>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <p className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">No styles match this filter set</p>
              <p className="mt-4 text-sm text-stone-600">
                Try widening the price range or clearing one of the fabric and category filters.
              </p>
              <Link href="/shop" className="cta-primary mt-6 inline-block">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
