export type Locale = "en" | "hi" | "mr";

export type UserRole = "customer" | "admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type DiscountType = "flat" | "percentage";
export type ShipmentStatus =
  | "pending"
  | "created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export type NavItem = {
  label: string;
  href: string;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
};

export type Product = {
  id: string;
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
  careInstructions: string[];
  sizes: string[];
  images: string[];
  tags: string[];
  status?: "active" | "draft" | "archived";
  featured?: boolean;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  reviews: Review[];
};

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  active?: boolean;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  color?: string;
};

export type OrderTimelineEntry = {
  label: string;
  status: OrderStatus;
  timestamp: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: "razorpay" | "cod";
  customerName: string;
  customerEmail?: string;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress?: CheckoutAddress;
  createdAt: string;
  trackingNumber?: string;
  items?: OrderItem[];
  timeline: OrderTimelineEntry[];
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type CartLine = {
  productId: string;
  quantity: number;
  size?: string;
};

export type CartLineIdentifier = {
  productId: string;
  size?: string;
};

export type CheckoutAddress = {
  fullName: string;
  mobileNumber: string;
  pincode: string;
  state: string;
  city: string;
  landmark?: string;
  addressLine: string;
};
