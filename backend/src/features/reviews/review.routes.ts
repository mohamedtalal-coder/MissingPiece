import { Router } from "express";
import {
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
  listReviewsHandler,
} from "./review.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { reviewWriteLimiter, reviewReadLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.get("/", reviewReadLimiter, listReviewsHandler);
router.post("/", requireAuth, reviewWriteLimiter, createReviewHandler);
router.patch("/:id", requireAuth, reviewWriteLimiter, updateReviewHandler);
router.delete("/:id", requireAuth, reviewWriteLimiter, deleteReviewHandler);

export default router;
