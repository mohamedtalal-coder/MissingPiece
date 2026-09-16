import { Router } from "express";
import { getProfile, updateProfile, getWishlist, addToWishlist, removeFromWishlist, } from "./account.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { accountWriteLimiter, wishlistWriteLimiter } from "../../shared/middleware/rateLimiter.js";
const router = Router();
// Profile Routes
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, accountWriteLimiter, updateProfile);
// Wishlist Routes (Stored on the User model)
router.get("/wishlist", requireAuth, getWishlist);
router.post("/wishlist/:productId", requireAuth, wishlistWriteLimiter, addToWishlist);
router.delete("/wishlist/:productId", requireAuth, wishlistWriteLimiter, removeFromWishlist);
export default router;
//# sourceMappingURL=account.routes.js.map