import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../../common/middleware/auth";
import { archiveProduct, createProduct, getProductBySlug, getProducts, updateProduct } from "../../common/utils/file-store";

const router = Router();
const productCreateSchema = z
  .object({
    name: z.string().min(2),
    slug: z.string().min(2),
    category: z.string().min(2),
    collection: z.string().default("Admin Collection"),
    salePrice: z.number().positive(),
    basePrice: z.number().positive(),
    fabric: z.string().min(2),
    color: z.string().default("Ivory"),
    description: z.string().default("Admin created product."),
    longDescription: z.string().default("Admin created product."),
    sizes: z.array(z.string().min(1)).min(1).default(["S", "M", "L"]),
    status: z.enum(["active", "draft", "archived"]).optional()
  })
  .refine((payload) => payload.salePrice <= payload.basePrice, {
    message: "Sale price cannot exceed base price",
    path: ["salePrice"]
  });

const productUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    collection: z.string().min(2).optional(),
    salePrice: z.number().positive().optional(),
    basePrice: z.number().positive().optional(),
    fabric: z.string().min(2).optional(),
    color: z.string().min(1).optional(),
    description: z.string().min(2).optional(),
    longDescription: z.string().min(2).optional(),
    sizes: z.array(z.string().min(1)).min(1).optional(),
    status: z.enum(["active", "draft", "archived"]).optional()
  })
  .refine(
    (payload) =>
      payload.salePrice === undefined ||
      payload.basePrice === undefined ||
      payload.salePrice <= payload.basePrice,
    {
      message: "Sale price cannot exceed base price",
      path: ["salePrice"]
    }
  );

router.get("/", (request, response) => {
  const products = getProducts();
  const search = String(request.query.search ?? "").toLowerCase();
  const filtered = search
    ? products.filter((product) => product.name.toLowerCase().includes(search) || product.category.toLowerCase().includes(search))
    : products;

  response.json({ success: true, items: filtered });
});

router.get("/:slug", (request, response) => {
  const product = getProductBySlug(request.params.slug);

  if (!product) {
    response.status(404).json({ success: false, message: "Product not found" });
    return;
  }

  response.json({ success: true, item: product });
});

router.post("/", requireAuth, requireAdmin, (request, response) => {
  const payload = productCreateSchema.parse(request.body);

  response.status(201).json({ success: true, item: createProduct(payload) });
});

router.patch("/:id", requireAuth, requireAdmin, (request, response) => {
  const payload = productUpdateSchema.parse(request.body);

  const product = updateProduct(String(request.params.id), payload);
  if (!product) {
    response.status(404).json({ success: false, message: "Product not found" });
    return;
  }

  response.json({ success: true, item: product });
});

router.delete("/:id", requireAuth, requireAdmin, (request, response) => {
  const product = archiveProduct(String(request.params.id));
  if (!product) {
    response.status(404).json({ success: false, message: "Product not found" });
    return;
  }

  response.json({ success: true, item: product });
});

export { router as productsRouter };
