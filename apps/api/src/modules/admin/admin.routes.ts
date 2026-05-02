import { Router } from "express";
import { requireAdmin, requireAuth } from "../../common/middleware/auth";
import { getAdminMetrics, getCoupons, getCustomersDetailed, getOrders, getProducts } from "../../common/utils/file-store";

const router = Router();

router.get("/dashboard", requireAuth, requireAdmin, (_request, response) => {
  response.json({
    success: true,
    item: getAdminMetrics()
  });
});

router.get("/products", requireAuth, requireAdmin, (_request, response) => {
  response.json({ success: true, items: getProducts({ includeArchived: true }) });
});

router.get("/orders", requireAuth, requireAdmin, (_request, response) => {
  response.json({ success: true, items: getOrders() });
});

router.get("/inventory", requireAuth, requireAdmin, (_request, response) => {
  response.json({
    success: true,
    items: getProducts({ includeArchived: true }).flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        productName: product.name,
        ...variant
      }))
    )
  });
});

router.get("/coupons", requireAuth, requireAdmin, (_request, response) => {
  response.json({ success: true, items: getCoupons() });
});

router.get("/customers", requireAuth, requireAdmin, (_request, response) => {
  response.json({
    success: true,
    items: getCustomersDetailed()
  });
});

router.get("/analytics", requireAuth, requireAdmin, (_request, response) => {
  const metrics = getAdminMetrics();
  response.json({
    success: true,
    item: {
      ...metrics,
      averageOrderValue: metrics.totalOrders > 0 ? Math.round(metrics.totalRevenue / metrics.totalOrders) : 0,
      conversionRate: metrics.totalOrders > 0 ? Number(((metrics.totalOrders / Math.max(metrics.customers, 1)) * 12).toFixed(1)) : 0,
      repeatCustomerRate: metrics.customerHighlights.length
        ? Math.round(
            (metrics.customerHighlights.filter((customer) => customer.orderCount > 1).length /
              metrics.customerHighlights.length) *
              100
          )
        : 0
    }
  });
});

export { router as adminRouter };
