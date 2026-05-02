import type { Collection, Coupon, Order, Product } from "@rukhsar/types";

export const collections: Collection[] = [
  {
    id: "c1",
    name: "Aurangabad Heritage",
    slug: "aurangabad-heritage",
    description: "Hand-finished silhouettes inspired by Himroo and Paithani artistry."
  },
  {
    id: "c2",
    name: "Festive Edit",
    slug: "festive-edit",
    description: "Occasion-ready drapes, co-ords, and heirloom-toned separates."
  },
  {
    id: "c3",
    name: "Everyday Grace",
    slug: "everyday-grace",
    description: "Lightweight pieces designed for daily elegance."
  }
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Noor Himroo Jacket Set",
    slug: "noor-himroo-jacket-set",
    category: "Co-ord Sets",
    collection: "Aurangabad Heritage",
    basePrice: 7499,
    salePrice: 6799,
    fabric: "Himroo Blend",
    color: "Deep Maroon",
    description: "A modern co-ord framed by heritage Himroo texture and tailored ease.",
    longDescription:
      "The Noor set layers a lightly structured Himroo-inspired jacket over a fluid inner kurta and cigarette pants. It is built for festive evenings, intimate gatherings, and statement daywear.",
    careInstructions: ["Dry clean only", "Steam lightly before wear", "Store flat for long-term preservation"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["featured", "festive", "artisan"],
    featured: true,
    rating: 4.8,
    reviewCount: 36,
    variants: [
      { id: "v1", size: "S", color: "Deep Maroon", stock: 8, sku: "RUK-NOOR-S-MAR" },
      { id: "v2", size: "M", color: "Deep Maroon", stock: 5, sku: "RUK-NOOR-M-MAR" }
    ],
    reviews: [
      {
        id: "r1",
        author: "Ayesha K",
        rating: 5,
        title: "Beautiful finish",
        comment: "The jacket feels premium and the color is even richer in person."
      }
    ]
  },
  {
    id: "p2",
    name: "Paithani Bloom Saree",
    slug: "paithani-bloom-saree",
    category: "Sarees",
    collection: "Festive Edit",
    basePrice: 11299,
    salePrice: 9999,
    fabric: "Silk Blend",
    color: "Saffron Gold",
    description: "A celebratory drape with a luminous pallu and delicate woven motifs.",
    longDescription:
      "Crafted to evoke festive grandeur, the Paithani Bloom Saree pairs saffron warmth with antique gold detailing. Designed for weddings, celebrations, and milestone gatherings.",
    careInstructions: ["Dry clean only", "Do not wring", "Store with muslin wrap"],
    sizes: ["Free Size"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["bridal-guest", "signature"],
    featured: true,
    rating: 4.9,
    reviewCount: 19,
    variants: [{ id: "v3", size: "Free Size", color: "Saffron Gold", stock: 3, sku: "RUK-PAI-FS-SAF" }],
    reviews: []
  },
  {
    id: "p3",
    name: "Mashru Everyday Kurta",
    slug: "mashru-everyday-kurta",
    category: "Kurtas",
    collection: "Everyday Grace",
    basePrice: 3499,
    salePrice: 2999,
    fabric: "Mashru Cotton Silk",
    color: "Ivory",
    description: "An easy straight kurta elevated by a soft Mashru-inspired sheen.",
    longDescription:
      "For women who want comfort without losing polish, this kurta balances breathable structure, flattering lines, and subtle craft cues.",
    careInstructions: ["Gentle hand wash", "Dry in shade"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["daily-wear", "lightweight"],
    rating: 4.6,
    reviewCount: 24,
    variants: [{ id: "v4", size: "M", color: "Ivory", stock: 11, sku: "RUK-MAS-M-IVR" }],
    reviews: []
  }
];

export const coupons: Coupon[] = [
  {
    id: "cp1",
    code: "AURANGABAD10",
    description: "10% off on orders above Rs. 5,000",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 5000
  }
];

export const orders: Order[] = [
  {
    id: "o1",
    orderNumber: "RUK10452",
    status: "shipped",
    paymentStatus: "paid",
    customerName: "Rukhsar Demo",
    totalAmount: 6799,
    createdAt: "2026-04-18T09:00:00.000Z",
    trackingNumber: "SHIPRKT12345",
    timeline: [
      { label: "Order placed", status: "pending", timestamp: "2026-04-18 14:30" },
      { label: "Confirmed", status: "confirmed", timestamp: "2026-04-18 15:00" },
      { label: "Packed", status: "packed", timestamp: "2026-04-19 11:15" },
      { label: "Shipped", status: "shipped", timestamp: "2026-04-20 08:00" }
    ]
  }
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
