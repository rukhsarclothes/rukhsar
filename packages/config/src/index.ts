import type { NavItem } from "@rukhsar/types";

export const brand = {
  name: "Rukhsar",
  city: "Aurangabad, Maharashtra",
  palette: {
    saffron: "#b5661d",
    ivory: "#f8f1e7",
    maroon: "#5a1e22",
    gold: "#c2a15a",
    sand: "#d8c2a0",
    ink: "#1f1612"
  }
};

export const primaryNavigation: NavItem[] = [
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Collections", href: "/shop" },
  { label: "Craft Story", href: "/#brand-story" },
  { label: "Track Order", href: "/track-order" }
];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Coupons", href: "/admin/coupons" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Analytics", href: "/admin/analytics" }
];
