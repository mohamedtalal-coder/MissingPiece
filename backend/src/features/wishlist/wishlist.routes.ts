import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { wishlistWriteLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.get("/", requireAuth, getWishlist);
router.post("/:productId", requireAuth, wishlistWriteLimiter, addToWishlist);
router.delete("/:productId", requireAuth, wishlistWriteLimiter, removeFromWishlist);

export default router;
