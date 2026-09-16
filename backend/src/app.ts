import express, { type Application } from "express";
import cors from "cors";
import morgan from "morgan";

import { errorHandler, notFound } from "./shared/middleware/errorHandler.js";
import productRoutes from "./features/products/product.routes.js";
import accountRoutes from "./features/account/account.routes.js";
import orderRoutes from "./features/orders/order.routes.js";
import contactRoutes from "./features/contact/contact.routes.js";

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
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/products", productRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;