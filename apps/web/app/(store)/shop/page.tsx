import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/api";

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string;
    collection?: string;
    fabric?: string;
    price?: string;
    search?: string;
    sort?: string;
  }>;
};

const quickFilters = [
  { label: "All", href: "/shop" },
  { label: "Suits", href: "/shop?category=Kurtas" },
  { label: "Unstitched", href: "/shop?collection=Everyday%20Grace" },
  { label: "Festive Edit", href: "/shop?collection=Festive%20Edit" }
];

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
  const selectedCollection = params.collection ?? "all";
  const selectedFabric = params.fabric ?? "all";
  const selectedPrice = params.price ?? "all";
  const selectedSearch = params.search?.trim() ?? "";
  const selectedSort = params.sort ?? "newest";

  const categories = [...new Set(products.map((product) => product.category))].sort((left, right) =>
    left.localeCompare(right)
  );
  const collections = [...new Set(products.map((product) => product.collection))].sort((left, right) =>
    left.localeCompare(right)
  );
  const fabrics = [...new Set(products.map((product) => product.fabric))].sort((left, right) =>
    left.localeCompare(right)
  );

  const filteredProducts = products
    .filter((product) =>
      !selectedSearch
        ? true
        : [
            product.name,
            product.category,
            product.collection,
            product.fabric,
            product.color,
            product.description,
            product.longDescription
          ]
            .join(" ")
            .toLowerCase()
            .includes(selectedSearch.toLowerCase())
    )
    .filter((product) => selectedCategory === "all" || product.category === selectedCategory)
    .filter((product) => selectedCollection === "all" || product.collection === selectedCollection)
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
    <section className="section-shell py-8 md:py-10">
      <div className="rounded-[2.1rem] bg-[linear-gradient(135deg,rgba(15,11,18,1),rgba(54,17,37,0.96)_46%,rgba(108,31,46,0.92)_100%)] px-6 py-8 text-white shadow-[0_28px_80px_rgba(17,11,18,0.24)] md:px-10 md:py-10">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--rukhsar-pink-soft)]">Product Listing</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-[family:var(--font-rukhsar-heading)] text-4xl font-semibold leading-tight md:text-6xl">
              {selectedSearch ? `Results for “${selectedSearch}”` : "New Arrivals"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              A sharper traditional wear catalog with quick filters, bold product styling, and a fashion-app rhythm
              made for mobile-first browsing.
            </p>
          </div>
          <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white/74 backdrop-blur-sm">
            Sort: {selectedSort === "newest" ? "Newest" : selectedSort === "price-asc" ? "Price Low To High" : selectedSort === "price-desc" ? "Price High To Low" : "Name A To Z"}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {quickFilters.map((item) => {
            const active =
              (item.label === "All" &&
                selectedCategory === "all" &&
                selectedCollection === "all" &&
                selectedFabric === "all") ||
              (item.label === "Suits" && selectedCategory === "Kurtas") ||
              (item.label === "Unstitched" && selectedCollection === "Everyday Grace") ||
              (item.label === "Festive Edit" && selectedCollection === "Festive Edit");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  active
                    ? "border-transparent bg-[color:var(--rukhsar-pink)] text-white"
                    : "border-white/[0.14] bg-white/[0.08] text-white/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/shop">
          <input
            type="search"
            name="search"
            defaultValue={selectedSearch}
            placeholder="Search by style name, fabric, color, or collection"
            className="min-w-0 flex-1 rounded-full border border-white/[0.14] bg-white/[0.08] px-5 py-3 text-sm text-white outline-none placeholder:text-white/50"
          />
          <button
            className="rounded-full bg-[color:var(--rukhsar-pink)] px-6 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Search Catalog
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="surface-card h-fit p-6 lg:sticky lg:top-28">
          <p className="eyebrow">Refine the edit</p>
          <form className="mt-5 space-y-4">
            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-semibold uppercase tracking-[0.14em] text-[color:var(--rukhsar-ink)]">
                Search
              </span>
              <input
                type="search"
                name="search"
                defaultValue={selectedSearch}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3"
                placeholder="Search the collection"
              />
            </label>

            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-semibold uppercase tracking-[0.14em] text-[color:var(--rukhsar-ink)]">
                Category
              </span>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3"
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
              <span className="mb-2 block font-semibold uppercase tracking-[0.14em] text-[color:var(--rukhsar-ink)]">
                Collection
              </span>
              <select
                name="collection"
                defaultValue={selectedCollection}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3"
              >
                <option value="all">All collections</option>
                {collections.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-semibold uppercase tracking-[0.14em] text-[color:var(--rukhsar-ink)]">
                Fabric
              </span>
              <select
                name="fabric"
                defaultValue={selectedFabric}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3"
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
              <span className="mb-2 block font-semibold uppercase tracking-[0.14em] text-[color:var(--rukhsar-ink)]">
                Price range
              </span>
              <select
                name="price"
                defaultValue={selectedPrice}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3"
              >
                <option value="all">All prices</option>
                <option value="under-5000">Under Rs. 5,000</option>
                <option value="5000-8000">Rs. 5,000 to Rs. 8,000</option>
                <option value="above-8000">Above Rs. 8,000</option>
              </select>
            </label>

            <label className="block text-sm text-stone-700">
              <span className="mb-2 block font-semibold uppercase tracking-[0.14em] text-[color:var(--rukhsar-ink)]">
                Sort
              </span>
              <select
                name="sort"
                defaultValue={selectedSort}
                className="w-full rounded-2xl border border-black/8 bg-white px-4 py-3"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price Low To High</option>
                <option value="price-desc">Price High To Low</option>
                <option value="name-asc">Name A To Z</option>
              </select>
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="cta-primary" type="submit">
                Apply
              </button>
              <Link href="/shop" className="cta-secondary">
                Reset
              </Link>
            </div>
          </form>

          <div className="mt-6 rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(255,79,163,0.1),rgba(201,163,95,0.12))] p-4 text-sm leading-7 text-stone-700">
            Looking for bold festive energy? Start with maroon tones, statement sarees, and the richer evening-facing
            edits.
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
            <span>{filteredProducts.length} styles available</span>
            <span>
              {selectedSearch
                ? `Search tuned for "${selectedSearch}"`
                : "Wishlist-ready | Fast add-to-bag | Fashion-first browsing"}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <p className="font-[family:var(--font-rukhsar-heading)] text-3xl font-semibold text-[color:var(--rukhsar-ink)]">
                No styles match this filter set
              </p>
              <p className="mt-4 text-sm text-stone-600">
                Try widening the price range, simplifying the search term, or resetting the current filters.
              </p>
              <Link href="/shop" className="cta-primary mt-6 inline-flex">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
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
