import crypto from "node:crypto";
import { Router } from "express";
import Razorpay from "razorpay";
import { z } from "zod";
import { env } from "../../config/env";

const router = Router();

const createOrderSchema = z.object({
  amount: z.number().int().min(100),
  currency: z.string().length(3).default("INR"),
  receipt: z.string().min(1).max(40).optional()
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

function getRazorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("Razorpay credentials are missing");
  }

  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret
  });
}

router.post("/create-order", async (request, response) => {
  const payload = createOrderSchema.safeParse(request.body);
  if (!payload.success) {
    response.status(400).json({ success: false, message: "Amount must be at least 100 paise and currency must be valid" });
    return;
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: payload.data.amount,
      currency: payload.data.currency,
      receipt: payload.data.receipt ?? `rukhsar-${Date.now()}`
    });

    response.json({
      success: true,
      item: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error: unknown) {
    const apiError = error as {
      statusCode?: number;
      error?: { description?: string };
      message?: string;
    };

    if (apiError.statusCode === 401) {
      response.status(401).json({
        success: false,
        message: apiError.error?.description ?? apiError.message ?? "Razorpay authentication failed"
      });
      return;
    }

    response.status(500).json({
      success: false,
      message: apiError.error?.description ?? apiError.message ?? "Unable to create Razorpay order"
    });
  }
});

router.post("/verify-payment", (request, response) => {
  const payload = verifyPaymentSchema.safeParse(request.body);
  if (!payload.success) {
    response.status(400).json({ success: false, message: "Missing required payment verification fields" });
    return;
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload.data;
  if (orderId !== razorpayOrderId) {
    response.status(400).json({ success: false, message: "Order mismatch during payment verification" });
    return;
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${orderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    response.status(400).json({ success: false, message: "Payment signature mismatch" });
    return;
  }

  response.json({
    success: true,
    message: "Payment signature verified",
    item: {
      orderId,
      razorpayPaymentId,
      razorpayOrderId
    }
  });
});

router.post("/cod", (request, response) => {
  const payload = z.object({ orderId: z.string(), totalAmount: z.number().positive() }).parse(request.body);
  response.json({ success: true, message: "COD registered", item: payload });
});

export { router as paymentsRouter };
