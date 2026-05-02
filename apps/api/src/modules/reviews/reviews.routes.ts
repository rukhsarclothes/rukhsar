import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth, type AuthenticatedRequest } from "../../common/middleware/auth";
import { addReview, getProducts } from "../../common/utils/file-store";

const router = Router();

router.get("/products/:id/reviews", (request, response) => {
  const productId = String(request.params.id);
  const product = getProducts().find((item) => item.id === productId);
  response.json({ success: true, items: product?.reviews ?? [] });
});

router.post("/products/:id/reviews", requireAuth, (request: AuthenticatedRequest, response) => {
  const payload = z.object({
    rating: z.number().min(1).max(5),
    title: z.string().min(2),
    comment: z.string().min(4)
  }).parse(request.body);

  response.status(201).json({
    success: true,
    item: addReview(String(request.params.id), {
      ...payload,
      author: request.user?.email ?? "Verified Customer"
    })
  });
});

router.patch("/reviews/:id/moderate", requireAuth, requireAdmin, (request, response) => {
  const payload = z.object({ isApproved: z.boolean() }).parse(request.body);
  response.json({ success: true, item: { id: request.params.id, ...payload } });
});

export { router as reviewsRouter };
