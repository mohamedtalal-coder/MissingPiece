import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
} from "./account.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { accountWriteLimiter, accountPasswordLimiter } from "../../shared/middleware/rateLimiter.js";
import { uploadImages } from "../../shared/middleware/upload.js";

const router = Router();

// Profile Routes
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, accountWriteLimiter, updateProfile);
router.patch("/password", requireAuth, accountPasswordLimiter, changePassword);
router.patch("/avatar", requireAuth, accountWriteLimiter, uploadImages.single("avatar"), updateAvatar);

export default router;
