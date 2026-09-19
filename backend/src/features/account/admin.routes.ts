import { Router } from "express";
import {
  getAllUsersAdmin,
  getUserDetailAdmin,
  updateUserRoleAdmin,
  updateUserStatusAdmin,
  exportUsersAdmin,
} from "./admin.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { requireStepUp } from "../../shared/middleware/requireStepUp.js";
import { adminRateLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllUsersAdmin);
router.get("/export", adminRateLimiter, exportUsersAdmin);
router.get("/:id", getUserDetailAdmin);

// Destructive / high-privilege: rate limit + step-up password confirmation
router.patch("/:id/role", adminRateLimiter, requireStepUp, updateUserRoleAdmin);
router.patch("/:id/status", adminRateLimiter, requireStepUp, updateUserStatusAdmin);

export default router;
