import { Router } from "express";
import { z } from "zod";
import { getOrders } from "../../common/utils/file-store";

const router = Router();

router.post("/create-shipment", (request, response) => {
  const payload = z.object({ orderId: z.string(), courierPreference: z.string().optional() }).parse(request.body);
  response.status(201).json({
    success: true,
    item: {
      orderId: payload.orderId,
      trackingNumber: "SHIPRKT12345",
      provider: "Shiprocket",
      status: "created"
    }
  });
});

router.get("/track/:trackingNumber", (request, response) => {
  const order = getOrders().find((item) => item.trackingNumber === request.params.trackingNumber);
  response.json({
    success: true,
    item: order
      ? {
          trackingNumber: order.trackingNumber,
          currentStatus: order.status,
          timeline: order.timeline
        }
      : null
  });
});

export { router as shippingRouter };
