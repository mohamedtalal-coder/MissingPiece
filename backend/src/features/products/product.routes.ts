import { Router } from "express";
import { productReadLimiter } from "../../shared/middleware/rateLimiter.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import {
  listProductsHandler,
  listCategoriesHandler,
  listAllProductsAdminHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./product.controller.js";

const router = Router();

// Public
router.get("/", productReadLimiter, listProductsHandler);
router.get("/categories", productReadLimiter, listCategoriesHandler);
router.get("/:slug", productReadLimiter, getProductHandler);

// Admin
router.get("/admin/all", requireAuth, requireAdmin, listAllProductsAdminHandler);
router.post("/", requireAuth, requireAdmin, createProductHandler);
router.patch("/:id", requireAuth, requireAdmin, updateProductHandler);
router.delete("/:id", requireAuth, requireAdmin, deleteProductHandler);

export default router;
