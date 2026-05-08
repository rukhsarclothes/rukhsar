"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Coupon, Order, Product } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import {
  AdminApiError,
  archiveAdminProduct,
  createAdminCoupon,
  createAdminProduct,
  getAdminAnalytics,
  getAdminCoupons,
  getAdminCustomers,
  getAdminDashboard,
  getAdminInventory,
  getAdminOrders,
  getAdminProducts,
  type AdminCustomer,
  type AdminMetrics,
  type AnalyticsSnapshot,
  type InventoryRow,
  updateAdminCoupon,
  updateAdminProduct,
  updateInventoryStock,
  updateOrderStatus
} from "@/lib/admin-api";

function useAdminToken() {
  const { adminToken } = useStore();
  if (!adminToken) {
    throw new Error("Admin session is required");
  }
  return adminToken;
}

function useAdminErrorHandler() {
  const router = useRouter();
  const { setAdminSession } = useStore();

  return (error: unknown) => {
    if (error instanceof AdminApiError && error.status === 401) {
      setAdminSession(null, null);
      router.replace("/admin/login?reason=session-expired");
      return;
    }

    throw error;
  };
}

function currency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No orders yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function SectionShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="max-w-3xl">
        <h1 className="font-serif text-4xl text-[color:var(--rukhsar-maroon)]">{title}</h1>
        {description ? <p className="mt-3 text-sm text-stone-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Toolbar({
  search,
  setSearch,
  searchPlaceholder,
  children
}: {
  search: string;
  setSearch: (value: string) => void;
  searchPlaceholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <input
        className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 lg:max-w-md"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </div>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-6 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-3 font-serif text-3xl text-[color:var(--rukhsar-maroon)]">{value}</p>
      {helper ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">{helper}</p> : null}
    </div>
  );
}

export function AdminDashboardClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [data, setData] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    void getAdminDashboard(token).then(setData).catch(handleAdminError);
  }, [handleAdminError, token]);

  if (!data) {
    return <section className="px-6 py-10 text-sm text-stone-600">Loading dashboard...</section>;
  }

  return (
    <SectionShell
      title="Business Operations Dashboard"
      description="Run catalog, fulfillment, stock planning, and customer follow-up from one operational workspace."
    >
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Revenue" value={currency(data.totalRevenue)} helper="gross sales tracked" />
        <SummaryCard label="Orders" value={String(data.totalOrders)} helper="all orders" />
        <SummaryCard label="Customers" value={String(data.customers)} helper="customer records" />
        <SummaryCard label="Low stock" value={String(data.lowStockCount)} helper="below threshold" />
        <SummaryCard label="Open orders" value={String(data.pendingOrders)} helper="active fulfillment" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Action Queue</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-400">today</span>
          </div>
          <div className="mt-5 space-y-4">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border px-4 py-4 ${
                  alert.tone === "critical"
                    ? "border-rose-200 bg-rose-50"
                    : alert.tone === "warning"
                      ? "border-amber-200 bg-amber-50"
                      : "border-stone-200 bg-[#faf6f1]"
                }`}
              >
                <p className="font-medium text-[color:var(--rukhsar-maroon)]">{alert.title}</p>
                <p className="mt-1 text-sm text-stone-600">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Recent Orders</h2>
          <div className="mt-5 space-y-4">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-[#faf6f1] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{order.orderNumber}</p>
                    <p className="mt-2 font-medium text-[color:var(--rukhsar-maroon)]">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone-500">{statusLabel(order.status)}</p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--rukhsar-maroon)]">
                      {currency(order.totalAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-stone-400">
                  <span>{order.paymentStatus}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Top Styles</h2>
          <div className="mt-5 space-y-4">
            {data.topProducts.map((product) => (
              <div key={product.id} className="rounded-2xl bg-[#faf6f1] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-[color:var(--rukhsar-maroon)]">{product.name}</p>
                  <p className="text-sm text-stone-500">{product.unitsSold} units</p>
                </div>
                <div className="mt-2 flex justify-between text-sm text-stone-600">
                  <span>Revenue {currency(product.revenue)}</span>
                  <span>Stock {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Customer Highlights</h2>
          <div className="mt-5 space-y-4">
            {data.customerHighlights.map((customer) => (
              <div key={customer.id} className="rounded-2xl bg-[#faf6f1] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[color:var(--rukhsar-maroon)]">{customer.fullName}</p>
                    <p className="mt-1 text-sm text-stone-600">{customer.email}</p>
                  </div>
                  <div className="text-right text-sm text-stone-600">
                    <p>{customer.orderCount} orders</p>
                    <p className="mt-1">{currency(customer.totalSpend)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

type ProductFormState = {
  name: string;
  slug: string;
  category: string;
  collection: string;
  basePrice: number;
  salePrice: number;
  fabric: string;
  color: string;
  description: string;
  longDescription: string;
  sizes: string;
  status: "active" | "draft" | "archived";
};

const defaultProductForm: ProductFormState = {
  name: "",
  slug: "",
  category: "Kurtas",
  collection: "Admin Collection",
  basePrice: 0,
  salePrice: 0,
  fabric: "",
  color: "",
  description: "",
  longDescription: "",
  sizes: "S,M,L",
  status: "active"
};

export function AdminProductsClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormState>(defaultProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refresh = useCallback(async () => {
    try {
      setProducts(await getAdminProducts(token));
    } catch (error) {
      handleAdminError(error);
    }
  }, [handleAdminError, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        [product.name, product.category, product.collection, product.fabric, product.color]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      const productStatus = product.status ?? "active";
      const matchesStatus = statusFilter === "all" || productStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  function populateForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      collection: product.collection,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      fabric: product.fabric,
      color: product.color,
      description: product.description,
      longDescription: product.longDescription,
      sizes: product.sizes.join(", "),
      status: product.status ?? "active"
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(defaultProductForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
      basePrice: Number(form.basePrice),
      salePrice: Number(form.salePrice)
    };

    if (editingId) {
      try {
        await updateAdminProduct(token, editingId, payload);
      } catch (error) {
        handleAdminError(error);
        return;
      }
      setMessage("Product updated");
    } else {
      try {
        await createAdminProduct(token, payload);
      } catch (error) {
        handleAdminError(error);
        return;
      }
      setMessage("Product created");
    }

    resetForm();
    await refresh();
  }

  return (
    <SectionShell
      title="Product Operations"
      description="Create, refine, and control the live catalog with draft and archive states for clean merchandising."
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search by style, category, fabric, collection, or color"
      >
        <select
          className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </Toolbar>

      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">
              {editingId ? "Edit Product" : "Create Product"}
            </h2>
            {editingId ? (
              <button
                type="button"
                className="text-sm text-stone-500"
                onClick={resetForm}
              >
                Reset
              </button>
            ) : null}
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["name", "Product name"],
              ["slug", "Slug"],
              ["category", "Category"],
              ["collection", "Collection"],
              ["fabric", "Fabric"],
              ["color", "Color"],
              ["description", "Short description"],
              ["longDescription", "Long description"],
              ["sizes", "Sizes (comma separated)"]
            ].map(([key, label]) => (
              <input
                key={key}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
                placeholder={label}
                value={String(form[key as keyof ProductFormState])}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-stone-200 px-4 py-3 text-sm"
                placeholder="Base price"
                type="number"
                value={form.basePrice}
                onChange={(event) => setForm((current) => ({ ...current, basePrice: Number(event.target.value) }))}
              />
              <input
                className="rounded-2xl border border-stone-200 px-4 py-3 text-sm"
                placeholder="Sale price"
                type="number"
                value={form.salePrice}
                onChange={(event) => setForm((current) => ({ ...current, salePrice: Number(event.target.value) }))}
              />
            </div>
            <select
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as ProductFormState["status"]
                }))
              }
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            {message ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{message}</p> : null}
            <button className="w-full rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]">
              {editingId ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">Catalog</h2>
            <span className="text-sm text-stone-500">{filteredProducts.length} styles</span>
          </div>
          <div className="mt-6 space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-2xl bg-[#faf6f1] px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[color:var(--rukhsar-maroon)]">{product.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {[product.category, product.fabric, product.color, product.collection].join(" | ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                      <span>{product.status ?? "active"}</span>
                      <span>{product.sizes.join(", ")}</span>
                      <span>{totalStockLabel(product)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <p className="text-right text-sm font-semibold text-[color:var(--rukhsar-maroon)]">
                      {currency(product.salePrice)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700"
                        onClick={() => populateForm(product)}
                      >
                        Edit
                      </button>
                      {(product.status ?? "active") !== "archived" ? (
                        <button
                          type="button"
                          className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700"
                          onClick={async () => {
                            try {
                              await archiveAdminProduct(token, product.id);
                            } catch (error) {
                              handleAdminError(error);
                              return;
                            }
                            setMessage("Product archived");
                            await refresh();
                          }}
                        >
                          Archive
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function totalStockLabel(product: Product) {
  return `${product.variants.reduce((sum, variant) => sum + variant.stock, 0)} stock`;
}

export function AdminOrdersClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refresh = useCallback(async () => {
    try {
      setOrders(await getAdminOrders(token));
    } catch (error) {
      handleAdminError(error);
    }
  }, [handleAdminError, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const haystack = [order.orderNumber, order.customerName, order.paymentStatus, order.trackingNumber ?? ""]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <SectionShell
      title="Order Operations"
      description="Track fulfillment, change statuses, and keep finance and shipping teams aligned from one queue."
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search by order number, customer, payment state, or tracking number"
      >
        <select
          className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          {["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"].map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </Toolbar>

      <div className="mt-8 space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{order.orderNumber}</p>
                <h2 className="mt-2 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{order.customerName}</h2>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-stone-600">
                  <span>{currency(order.totalAmount)}</span>
                  <span>Payment {order.paymentStatus}</span>
                  <span>{formatDate(order.createdAt)}</span>
                  {order.trackingNumber ? <span>{order.trackingNumber}</span> : null}
                </div>
              </div>
              <select
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm"
                value={order.status}
                onChange={async (event) => {
                  try {
                    await updateOrderStatus(token, order.id, event.target.value);
                  } catch (error) {
                    handleAdminError(error);
                    return;
                  }
                  await refresh();
                }}
              >
                {["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"].map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            {order.items?.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${item.productId}-${index}`} className="rounded-2xl bg-[#faf6f1] px-4 py-4">
                    <p className="font-medium text-[color:var(--rukhsar-maroon)]">{item.productName}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      Qty {item.quantity} | {currency(item.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {order.timeline.map((entry, index) => (
                <div key={`${order.id}-${index}`} className="rounded-full bg-[#faf6f1] px-4 py-2 text-xs uppercase tracking-[0.14em] text-stone-500">
                  {entry.label} | {formatDate(entry.timestamp)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function AdminInventoryClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setInventory(await getAdminInventory(token));
    } catch (error) {
      handleAdminError(error);
    }
  }, [handleAdminError, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !search ||
        [item.productName, item.size, item.color, item.sku].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesThreshold = !lowStockOnly || item.stock < 6;
      return matchesSearch && matchesThreshold;
    });
  }, [inventory, lowStockOnly, search]);

  return (
    <SectionShell
      title="Inventory Control"
      description="Monitor SKU-level stock, surface replenishment risks, and update quantities directly from the operations desk."
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search by style, size, color, or SKU"
      >
        <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
          />
          Low stock only
        </label>
      </Toolbar>

      <div className="mt-8 space-y-4">
        {filteredInventory.map((item) => (
          <div
            key={item.id}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border p-5 shadow-sm ${
              item.stock < 4
                ? "border-amber-200 bg-amber-50"
                : "border-white/70 bg-white/80"
            }`}
          >
            <div>
              <p className="font-medium text-[color:var(--rukhsar-maroon)]">{item.productName}</p>
              <p className="mt-1 text-sm text-stone-600">
                {[item.size, item.color, item.sku].join(" | ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                className="w-24 rounded-full border border-stone-300 px-4 py-2 text-sm"
                type="number"
                defaultValue={item.stock}
                onBlur={async (event) => {
                  try {
                    await updateInventoryStock(token, item.id, Number(event.target.value));
                  } catch (error) {
                    handleAdminError(error);
                    return;
                  }
                  await refresh();
                }}
              />
              <span className="text-sm text-stone-500">{item.stock < 4 ? "urgent" : "stock"}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

type CouponFormState = {
  code: string;
  description: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  minOrderValue: number;
  active: boolean;
};

const defaultCouponForm: CouponFormState = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderValue: 5000,
  active: true
};

export function AdminCouponsClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponFormState>(defaultCouponForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    try {
      setCoupons(await getAdminCoupons(token));
    } catch (error) {
      handleAdminError(error);
    }
  }, [handleAdminError, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) =>
      [coupon.code, coupon.description].join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [coupons, search]);

  function populateForm(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      active: coupon.active ?? true
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(defaultCouponForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      try {
        await updateAdminCoupon(token, editingId, form);
      } catch (error) {
        handleAdminError(error);
        return;
      }
      setMessage("Coupon updated");
    } else {
      try {
        await createAdminCoupon(token, form);
      } catch (error) {
        handleAdminError(error);
        return;
      }
      setMessage("Coupon created");
    }

    resetForm();
    await refresh();
  }

  return (
    <SectionShell
      title="Coupons And Promotions"
      description="Create, adjust, and pause promotions cleanly so finance and growth campaigns stay aligned."
    >
      <Toolbar search={search} setSearch={setSearch} searchPlaceholder="Search by coupon code or promotion description" />

      <div className="mt-8 grid gap-8 xl:grid-cols-[400px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">
              {editingId ? "Edit Coupon" : "Create Coupon"}
            </h2>
            {editingId ? (
              <button type="button" className="text-sm text-stone-500" onClick={resetForm}>
                Reset
              </button>
            ) : null}
          </div>
          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              placeholder="Code"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
            />
            <input
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
            <select
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              value={form.discountType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountType: event.target.value as "flat" | "percentage"
                }))
              }
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-stone-200 px-4 py-3 text-sm"
                type="number"
                placeholder="Discount value"
                value={form.discountValue}
                onChange={(event) => setForm((current) => ({ ...current, discountValue: Number(event.target.value) }))}
              />
              <input
                className="rounded-2xl border border-stone-200 px-4 py-3 text-sm"
                type="number"
                placeholder="Min order value"
                value={form.minOrderValue}
                onChange={(event) => setForm((current) => ({ ...current, minOrderValue: Number(event.target.value) }))}
              />
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
              />
              Coupon is active
            </label>
            {message ? <p className="text-sm text-[color:var(--rukhsar-maroon)]">{message}</p> : null}
            <button className="w-full rounded-full bg-[color:var(--rukhsar-maroon)] px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-ivory)]">
              {editingId ? "Update Coupon" : "Save Coupon"}
            </button>
          </div>
        </form>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">Promotions Library</h2>
            <span className="text-sm text-stone-500">{filteredCoupons.length} campaigns</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.id} className="rounded-2xl bg-[#faf6f1] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-stone-500">{coupon.code}</p>
                    <h3 className="mt-2 font-serif text-2xl text-[color:var(--rukhsar-maroon)]">{coupon.description}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                    {coupon.active === false ? "inactive" : "active"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {coupon.discountType} | Min order {currency(coupon.minOrderValue)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700"
                    onClick={() => populateForm(coupon)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700"
                    onClick={async () => {
                      try {
                        await updateAdminCoupon(token, coupon.id, { active: !(coupon.active ?? true) });
                      } catch (error) {
                        handleAdminError(error);
                        return;
                      }
                      setMessage(`Coupon ${(coupon.active ?? true) ? "paused" : "reactivated"}`);
                      await refresh();
                    }}
                  >
                    {(coupon.active ?? true) ? "Pause" : "Reactivate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function AdminCustomersClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void getAdminCustomers(token).then(setCustomers).catch(handleAdminError);
  }, [handleAdminError, token]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      [customer.fullName, customer.email].join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  return (
    <SectionShell
      title="Customer CRM"
      description="Keep customer records, order history signals, and high-value accounts visible for service and retention."
    >
      <Toolbar search={search} setSearch={setSearch} searchPlaceholder="Search by customer name or email" />

      <div className="mt-8 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#faf6f1] px-4 py-4">
              <div>
                <p className="font-medium text-[color:var(--rukhsar-maroon)]">{customer.fullName}</p>
                <p className="mt-1 text-sm text-stone-600">{customer.email}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                <span className="rounded-full bg-white px-4 py-2">{customer.orderCount} orders</span>
                <span className="rounded-full bg-white px-4 py-2">{currency(customer.totalSpend)}</span>
                <span className="rounded-full bg-white px-4 py-2">{formatDate(customer.lastOrderAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function AdminAnalyticsClient() {
  const token = useAdminToken();
  const handleAdminError = useAdminErrorHandler();
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);

  useEffect(() => {
    void getAdminAnalytics(token).then(setData).catch(handleAdminError);
  }, [handleAdminError, token]);

  if (!data) {
    return <section className="px-6 py-10 text-sm text-stone-600">Loading analytics...</section>;
  }

  return (
    <SectionShell
      title="Performance Analytics"
      description="Understand commercial health at a glance with order efficiency, repeat behavior, and product movement."
    >
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <SummaryCard label="Average order value" value={currency(data.averageOrderValue)} />
        <SummaryCard label="Conversion proxy" value={`${data.conversionRate}%`} helper="internal estimate" />
        <SummaryCard label="Repeat customer rate" value={`${data.repeatCustomerRate}%`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Top Products Snapshot</h2>
          <div className="mt-5 grid gap-4">
            {data.topProducts.map((product) => (
              <div key={product.id} className="rounded-2xl bg-[#faf6f1] p-4">
                <p className="font-medium text-[color:var(--rukhsar-maroon)]">{product.name}</p>
                <div className="mt-2 flex flex-wrap justify-between gap-3 text-sm text-stone-600">
                  <span>Revenue {currency(product.revenue)}</span>
                  <span>Units {product.unitsSold}</span>
                  <span>Stock {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Best Customers</h2>
          <div className="mt-5 grid gap-4">
            {data.customerHighlights.map((customer) => (
              <div key={customer.id} className="rounded-2xl bg-[#faf6f1] p-4">
                <p className="font-medium text-[color:var(--rukhsar-maroon)]">{customer.fullName}</p>
                <div className="mt-2 flex flex-wrap justify-between gap-3 text-sm text-stone-600">
                  <span>{customer.orderCount} orders</span>
                  <span>{currency(customer.totalSpend)}</span>
                  <span>{formatDate(customer.lastOrderAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
