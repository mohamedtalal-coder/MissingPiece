import { Router } from "express";
import { createDiscount, listDiscounts, updateDiscount, softDeleteDiscount, validateDiscount } from "./discount.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { discountValidateLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

// Public route with rate limiting
router.post("/validate", discountValidateLimiter, validateDiscount);

// Admin routes
router.use(requireAuth, requireAdmin);

router.post("/", createDiscount);
router.get("/", listDiscounts);
router.patch("/:id", updateDiscount);
router.delete("/:id", softDeleteDiscount);

export default router;
