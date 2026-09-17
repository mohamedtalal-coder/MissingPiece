import express, { type Application } from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./features/auth/auth.routes.js";
import { errorHandler, notFound } from "./shared/middleware/errorHandler.js";
import productRoutes from "./features/products/product.routes.js";
import accountRoutes from "./features/account/account.routes.js";
import wishlistRoutes from "./features/wishlist/wishlist.routes.js";
import orderRoutes from "./features/orders/order.routes.js";
import contactRoutes from "./features/contact/contact.routes.js";
import discountRoutes from "./features/discounts/discount.routes.js";
import reviewRoutes from "./features/reviews/review.routes.js";
import { webhookHandler } from "./features/payments/payment.controller.js";
import paymentRoutes from "./features/payments/payment.routes.js";

const app: Application = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] 
      ? process.env["CORS_ORIGIN"].split(',') 
      : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MUST be before app.use(express.json(...)) below
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/products", productRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;