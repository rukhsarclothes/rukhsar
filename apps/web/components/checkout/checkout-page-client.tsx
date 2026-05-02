"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckoutAddress, Coupon, Product } from "@rukhsar/types";
import { useStore } from "@/components/providers/store-provider";
import { formatCurrency } from "@/lib/utils/currency";

const steps = ["Address", "Delivery", "Payment", "Review"];

const initialAddress: CheckoutAddress = {
  fullName: "",
  mobileNumber: "",
  pincode: "",
  state: "",
  city: "",
  landmark: "",
  addressLine: ""
};

type RazorpaySuccessPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailurePayload = {
  error?: {
    description?: string;
    reason?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailurePayload) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessPayload) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function CheckoutPageClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const { cart, clearCart, user } = useStore();
  const [address, setAddress] = useState<CheckoutAddress>(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((line) => ({
          line,
          product: products.find((product) => product.id === line.productId)
        }))
        .filter((entry): entry is { line: typeof cart[number]; product: Product } => Boolean(entry.product)),
    [cart, products]
  );

  const subtotal = lines.reduce((sum, entry) => sum + entry.product.salePrice * entry.line.quantity, 0);
  const discount =
    appliedCoupon === null
      ? 0
      : appliedCoupon.discountType === "percentage"
        ? Math.min(Math.round((subtotal * appliedCoupon.discountValue) / 100), subtotal)
        : Math.min(appliedCoupon.discountValue, subtotal);
  const shipping = lines.length > 0 ? 199 : 0;
  const total = Math.max(subtotal - discount, 0) + shipping;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const apiUnavailableMessage = `Couldn't reach the local API at ${apiBaseUrl}. Start the API server on localhost:4000 and try again.`;

  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderValue) {
      setAppliedCoupon(null);
      setCouponMessage(`Coupon removed because the cart subtotal fell below ${formatCurrency(appliedCoupon.minOrderValue)}.`);
    }
  }, [appliedCoupon, subtotal]);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code before applying it.");
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage("");

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotal
        })
      });
    } catch {
      setApplyingCoupon(false);
      setCouponMessage(apiUnavailableMessage);
      return;
    }

    const data = (await response.json()) as {
      item?: Coupon;
      message?: string;
    };

    if (!response.ok || !data.item) {
      setAppliedCoupon(null);
      setCouponMessage(data.message ?? "Coupon could not be applied.");
      setApplyingCoupon(false);
      return;
    }

    setAppliedCoupon(data.item);
    setCouponCode(data.item.code);
    setCouponMessage(`${data.item.code} applied successfully.`);
    setApplyingCoupon(false);
  }

  async function createLocalOrder(paymentStatus?: "pending" | "authorized" | "paid" | "failed" | "refunded") {
    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: address.fullName,
          customerEmail: user?.email,
          shippingAddress: address,
          paymentMethod,
          paymentStatus,
          couponCode: appliedCoupon?.code,
          items: lines.map(({ line }) => ({
            productId: line.productId,
            quantity: line.quantity,
            size: line.size
          }))
        })
      });
    } catch {
      throw new Error(apiUnavailableMessage);
    }

    const data = (await response.json()) as { item?: { orderNumber?: string }; message?: string };
    if (!response.ok || !data.item?.orderNumber) {
      throw new Error(data.message ?? "Could not place the order");
    }

    return data.item.orderNumber;
  }

  async function handleCodOrder() {
    const orderNumber = await createLocalOrder();
    clearCart();
    setStatus(`Order created successfully: ${orderNumber}`);
    router.push(`/track-order?orderNumber=${orderNumber}`);
  }

  async function handleRazorpayCheckout() {
    if (!razorpayKeyId) {
      throw new Error("Razorpay public key is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to your environment.");
    }

    if (!window.Razorpay) {
      throw new Error("Razorpay Checkout failed to load. Refresh the page and try again.");
    }

    let orderResponse: Response;
    try {
      orderResponse = await fetch(`${apiBaseUrl}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total * 100,
          currency: "INR",
          receipt: `rukhsar-${Date.now()}`
        })
      });
    } catch {
      throw new Error(apiUnavailableMessage);
    }

    const orderData = (await orderResponse.json()) as {
      success?: boolean;
      item?: {
        order_id: string;
        amount: number;
        currency: string;
      };
      message?: string;
    };

    if (!orderResponse.ok || !orderData.item) {
      throw new Error(orderData.message ?? "Unable to create Razorpay order");
    }

    const createdOrder = orderData.item;

    await new Promise<void>((resolve, reject) => {
      const razorpay = new window.Razorpay!({
        key: razorpayKeyId,
        amount: createdOrder.amount,
        currency: createdOrder.currency,
        name: "Rukhsar",
        description: "Rukhsar order payment",
        order_id: createdOrder.order_id,
        prefill: {
          name: address.fullName,
          contact: address.mobileNumber
        },
        notes: {
          customer_name: address.fullName,
          city: address.city
        },
        theme: {
          color: "#5A1E22"
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled. No charge was made."))
        },
        handler: async (payment) => {
          try {
            let verifyResponse: Response;
            try {
              verifyResponse = await fetch(`${apiBaseUrl}/payments/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: createdOrder.order_id,
                  razorpayOrderId: payment.razorpay_order_id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature
                })
              });
            } catch {
              throw new Error(apiUnavailableMessage);
            }

            const verifyData = (await verifyResponse.json()) as { success?: boolean; message?: string };
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.message ?? "Payment verification failed");
            }

            const orderNumber = await createLocalOrder("paid");
            clearCart();
            setStatus(`Payment successful. Order created: ${orderNumber}`);
            router.push(`/track-order?orderNumber=${orderNumber}`);
            resolve();
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Payment verification failed"));
          }
        }
      });

      razorpay.on("payment.failed", (response) => {
        reject(
          new Error(response.error?.description ?? response.error?.reason ?? "Payment failed. Please try again.")
        );
      });

      razorpay.open();
    });
  }

  async function handlePlaceOrder() {
    if (!address.fullName || !address.mobileNumber || !address.addressLine || !address.city || !address.state || !address.pincode) {
      setStatus("Please complete the delivery address before placing the order.");
      return;
    }
    if (lines.length === 0) {
      setStatus("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setStatus(paymentMethod === "razorpay" ? "Opening secure payment..." : "Creating order...");

    try {
      if (paymentMethod === "razorpay") {
        await handleRazorpayCheckout();
      } else {
        await handleCodOrder();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Order creation failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-shell py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="surface-card mb-8 p-8">
        <div className="flex flex-wrap gap-3">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`rounded-full px-4 py-2 text-sm ${index === 0 ? "bg-[color:var(--rukhsar-maroon)] text-[color:var(--rukhsar-ivory)]" : "bg-white/70 text-stone-600"}`}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
        <h1 className="mt-6 font-serif text-4xl text-[color:var(--rukhsar-maroon)]">Checkout with confidence</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          A cleaner, calmer checkout built for mobile completion, transparent totals, and trustworthy payment choice.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="surface-card p-6 md:p-8">
          <h2 className="font-serif text-3xl text-[color:var(--rukhsar-maroon)]">Delivery Address</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["fullName", "Full Name"],
              ["mobileNumber", "Mobile Number"],
              ["pincode", "Pincode"],
              ["state", "State"],
              ["city", "City"],
              ["landmark", "Landmark"]
            ].map(([key, label]) => (
              <input
                key={key}
                className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm"
                placeholder={label}
                value={address[key as keyof CheckoutAddress] ?? ""}
                onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
              />
            ))}
          </div>
          <textarea
            className="mt-4 min-h-28 w-full rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm"
            placeholder="Address line"
            value={address.addressLine}
            onChange={(event) => setAddress((current) => ({ ...current, addressLine: event.target.value }))}
          />
          <div className="mt-8">
            <p className="eyebrow">Payment method</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setPaymentMethod("razorpay")}
                className={`rounded-2xl border px-4 py-4 text-left text-sm ${paymentMethod === "razorpay" ? "border-[color:var(--rukhsar-maroon)] bg-[rgba(90,30,34,0.08)]" : "border-stone-200 bg-white/70"}`}
              >
                Razorpay
                <div className="mt-1 text-stone-600">UPI, cards, net banking</div>
              </button>
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`rounded-2xl border px-4 py-4 text-left text-sm ${paymentMethod === "cod" ? "border-[color:var(--rukhsar-maroon)] bg-[rgba(90,30,34,0.08)]" : "border-stone-200 bg-white/70"}`}
              >
                Cash on Delivery
                <div className="mt-1 text-stone-600">Available for selected preview orders</div>
              </button>
            </div>
          </div>
          <div className="mt-8">
            <p className="eyebrow">Coupon code</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                className="flex-1 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm uppercase"
                placeholder="Enter coupon"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applyingCoupon || subtotal <= 0}
                className="rounded-full border border-[rgba(90,30,34,0.18)] bg-white/70 px-6 py-3 text-sm font-semibold text-[color:var(--rukhsar-maroon)] disabled:opacity-60"
              >
                {applyingCoupon ? "Applying..." : "Apply Coupon"}
              </button>
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponMessage("Coupon removed.");
                  }}
                  className="rounded-full border border-stone-200 px-6 py-3 text-sm text-stone-600"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {couponMessage ? <p className="mt-3 text-sm text-[color:var(--rukhsar-maroon)]">{couponMessage}</p> : null}
          </div>
          {status ? <p className="mt-5 text-sm text-[color:var(--rukhsar-maroon)]">{status}</p> : null}
        </div>
        <aside className="surface-card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl text-[color:var(--rukhsar-maroon)]">Summary</h2>
          <div className="mt-5 space-y-3 text-sm text-stone-600">
            {lines.map(({ line, product }) => (
              <div key={`${product.id}-${line.size ?? "default"}`} className="flex justify-between gap-3">
                <span>{product.name} x {line.quantity}</span>
                <span>{formatCurrency(product.salePrice * line.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between">
                <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-[color:var(--rukhsar-maroon)]">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="rounded-2xl bg-[#faf6f1] p-4">Secure payment flow powered for Indian shoppers</div>
            <div className="rounded-2xl bg-[#faf6f1] p-4">Order tracking available immediately after placement</div>
          </div>
          <button onClick={handlePlaceOrder} disabled={submitting} className="cta-primary mt-6 w-full disabled:opacity-70">
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </section>
  );
}
