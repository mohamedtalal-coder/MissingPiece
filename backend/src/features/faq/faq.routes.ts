import { Router } from "express";
import {
  getFAQs,
  getFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "./faq.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { adminRateLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

// Public — published only
router.get("/", getFAQs);

// Admin — all statuses (must be before /:id if we add one later)
router.get("/admin/all", requireAuth, requireAdmin, getFAQsAdmin);
router.post("/", requireAuth, requireAdmin, adminRateLimiter, createFAQ);
router.put("/:id", requireAuth, requireAdmin, adminRateLimiter, updateFAQ);
router.delete("/:id", requireAuth, requireAdmin, adminRateLimiter, deleteFAQ);

export default router;
