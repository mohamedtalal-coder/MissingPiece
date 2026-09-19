import { Router } from "express";
import {
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
  listReviewsHandler,
  canReviewProductHandler,
  listReviewsAdminHandler,
  updateReviewStatusHandler,
} from "./review.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { reviewWriteLimiter, reviewReadLimiter, adminRateLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.get("/", reviewReadLimiter, listReviewsHandler);
router.get("/can-review/:product", requireAuth, reviewReadLimiter, canReviewProductHandler);
router.post("/", requireAuth, reviewWriteLimiter, createReviewHandler);
router.patch("/:id", requireAuth, reviewWriteLimiter, updateReviewHandler);
router.delete("/:id", requireAuth, reviewWriteLimiter, deleteReviewHandler);

// Admin routes
router.get("/admin/all", requireAuth, requireAdmin, listReviewsAdminHandler);
router.patch("/:id/status", requireAuth, requireAdmin, adminRateLimiter, updateReviewStatusHandler);

export default router;
