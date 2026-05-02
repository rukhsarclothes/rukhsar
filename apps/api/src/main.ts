import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./common/middleware/error-handler";
import { notFoundHandler } from "./common/middleware/not-found";
import { authRouter } from "./modules/auth/auth.routes";
import { productsRouter } from "./modules/products/products.routes";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { reviewsRouter } from "./modules/reviews/reviews.routes";
import { ordersRouter } from "./modules/orders/orders.routes";
import { couponsRouter } from "./modules/coupons/coupons.routes";
import { inventoryRouter } from "./modules/inventory/inventory.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { shippingRouter } from "./modules/shipping/shipping.routes";
import { usersRouter } from "./modules/users/users.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { partnersRouter } from "./modules/partners/partners.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.siteUrl, "http://localhost:3000", "http://localhost:3005"],
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({ success: true, status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1", reviewsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/coupons", couponsRouter);
app.use("/api/v1", inventoryRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/shipping", shippingRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/partners", partnersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Rukhsar API running on http://localhost:${env.port}`);
});
