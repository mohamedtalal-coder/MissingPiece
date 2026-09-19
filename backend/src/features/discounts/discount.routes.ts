import { Router } from "express";
import { createDiscount, listDiscounts, updateDiscount, softDeleteDiscount, validateDiscount } from "./discount.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { discountValidateLimiter, adminRateLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.post("/validate", discountValidateLimiter, validateDiscount);

router.use(requireAuth, requireAdmin);

router.post("/", adminRateLimiter, createDiscount);
router.get("/", listDiscounts);
router.patch("/:id", adminRateLimiter, updateDiscount);
router.delete("/:id", adminRateLimiter, softDeleteDiscount);

export default router;
