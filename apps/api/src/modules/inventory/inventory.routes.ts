import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../../common/middleware/auth";
import { getProducts, updateInventory } from "../../common/utils/file-store";

const router = Router();

router.get("/admin/inventory", requireAuth, requireAdmin, (_request, response) => {
  const products = getProducts({ includeArchived: true });
  response.json({
    success: true,
    items: products.flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        productName: product.name,
        ...variant
      }))
    )
  });
});

router.patch("/admin/inventory/:variantId", requireAuth, requireAdmin, (request, response) => {
  const payload = z.object({ stock: z.number().int().min(0) }).parse(request.body);
  response.json({ success: true, item: updateInventory(String(request.params.variantId), payload.stock) });
});

export { router as inventoryRouter };
