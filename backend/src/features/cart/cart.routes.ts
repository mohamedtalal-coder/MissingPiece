import { Router } from "express";
import {
  getCartHandler,
  addItemHandler,
  updateItemHandler,
  removeItemHandler,
  mergeCartHandler,
  validateCart,
} from "./cart.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import {
  cartReadLimiter,
  cartWriteLimiter,
  mergeLimiter,
  validateLimiter,
} from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.get("/", requireAuth, cartReadLimiter, getCartHandler);

router.post("/items", requireAuth, cartWriteLimiter, addItemHandler);
router.patch("/items/:productId", requireAuth, cartWriteLimiter, updateItemHandler);
router.delete("/items/:productId", requireAuth, cartWriteLimiter, removeItemHandler);

router.post("/merge", requireAuth, mergeLimiter, mergeCartHandler);

router.post("/validate", validateLimiter, validateCart);

export default router;