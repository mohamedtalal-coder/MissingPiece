import express, { type Application, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
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
import cartRoutes from "./features/cart/cart.routes.js";
import auditRoutes from "./features/audit/audit.routes.js";
import faqRoutes from "./features/faq/faq.routes.js";
import adminUserRoutes from "./features/account/admin.routes.js";
import adminDashboardRoutes from "./features/admin/admin.routes.js";
import { connectDB } from "./config/db.js";

const app: Application = express();

app.set("trust proxy", 1);

// Ensure Mongo is connected on serverless (Vercel) before handling a request.
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] 
      ? process.env["CORS_ORIGIN"].split(',') 
      : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MUST be before app.use(express.json(...)) below
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

app.use(helmet());
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
app.use("/api/cart", cartRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin", adminDashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;