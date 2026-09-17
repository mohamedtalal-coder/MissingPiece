import { Router } from "express";
import {
  getProfile,
  updateProfile,
} from "./account.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { accountWriteLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

// Profile Routes
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, accountWriteLimiter, updateProfile);

export default router;
