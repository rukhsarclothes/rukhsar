import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../../common/middleware/auth";
import { createCoupon, getCouponByCode, getCoupons, updateCoupon } from "../../common/utils/file-store";

const router = Router();

router.post("/validate", (request, response) => {
  const payload = z.object({ code: z.string(), subtotal: z.number() }).parse(request.body);
  const coupon = getCouponByCode(payload.code);

  if (!coupon || payload.subtotal < coupon.minOrderValue) {
    response.status(400).json({ success: false, message: "Coupon is invalid or minimum order value not met" });
    return;
  }

  response.json({ success: true, item: coupon });
});

router.get("/", (_request, response) => {
  response.json({ success: true, items: getCoupons({ activeOnly: true }) });
});

router.post("/admin/coupons", requireAuth, requireAdmin, (request, response) => {
  const payload = z.object({
    code: z.string(),
    description: z.string(),
    discountType: z.enum(["flat", "percentage"]),
    discountValue: z.number().positive(),
    minOrderValue: z.number().min(0),
    active: z.boolean().optional()
  }).parse(request.body);

  response.status(201).json({ success: true, item: createCoupon(payload) });
});

router.get("/admin/coupons", requireAuth, requireAdmin, (_request, response) => {
  response.json({ success: true, items: getCoupons() });
});

router.patch("/admin/coupons/:id", requireAuth, requireAdmin, (request, response) => {
  const payload = z.object({
    code: z.string().optional(),
    description: z.string().optional(),
    discountType: z.enum(["flat", "percentage"]).optional(),
    discountValue: z.number().positive().optional(),
    minOrderValue: z.number().min(0).optional(),
    active: z.boolean().optional()
  }).parse(request.body);
  const coupon = updateCoupon(String(request.params.id), payload);

  if (!coupon) {
    response.status(404).json({ success: false, message: "Coupon not found" });
    return;
  }

  response.json({ success: true, item: coupon });
});

export { router as couponsRouter };
