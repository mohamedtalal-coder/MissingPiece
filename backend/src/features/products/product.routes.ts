import { Router } from "express";
import { productReadLimiter, adminRateLimiter } from "../../shared/middleware/rateLimiter.js";
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
import { uploadImages } from "../../shared/middleware/upload.js";

const router = Router();

// Public
router.get("/", productReadLimiter, listProductsHandler);
router.get("/categories", productReadLimiter, listCategoriesHandler);

// Admin routes MUST be registered before /:slug so "admin" is not treated as a slug
router.get("/admin/all", requireAuth, requireAdmin, listAllProductsAdminHandler);
router.post(
  "/",
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  uploadImages.array("images", 10),
  createProductHandler
);
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  uploadImages.array("images", 10),
  updateProductHandler
);
router.delete("/:id", requireAuth, requireAdmin, adminRateLimiter, deleteProductHandler);

router.get("/:slug", productReadLimiter, getProductHandler);

export default router;
