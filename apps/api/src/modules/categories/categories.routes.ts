import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../../common/middleware/auth";
import { getCategories } from "../../common/utils/file-store";
const router = Router();

router.get("/", (_request, response) => {
  response.json({ success: true, items: getCategories() });
});

router.post("/", requireAuth, requireAdmin, (request, response) => {
  const payload = z.object({ name: z.string().min(2) }).parse(request.body);
  response.status(201).json({ success: true, item: payload });
});

router.patch("/:id", requireAuth, requireAdmin, (request, response) => {
  response.json({ success: true, message: `Category ${request.params.id} updated`, changes: request.body });
});

export { router as categoriesRouter };
