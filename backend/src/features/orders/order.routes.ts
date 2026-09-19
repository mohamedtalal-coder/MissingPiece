import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  updateOrderStatus,
  getAllOrdersAdmin,
  exportOrdersAdmin,
} from "./order.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { requireVerifiedEmail } from "../../shared/middleware/requireVerifiedEmail.js";
import { requireStepUpForOrderMutation } from "../../shared/middleware/requireStepUpForOrderMutation.js";
import { orderWriteLimiter, adminRateLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

// Order Routes (Strictly require auth)
router.post("/", requireAuth, requireVerifiedEmail, orderWriteLimiter, createOrder);
router.get("/", requireAuth, getMyOrders);

// Admin routes MUST be registered before /:id so "admin" is not treated as an id
router.get("/admin/all", requireAuth, requireAdmin, getAllOrdersAdmin);
router.get("/admin/export", requireAuth, requireAdmin, adminRateLimiter, exportOrdersAdmin);
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  requireStepUpForOrderMutation,
  updateOrderStatus
);

router.patch("/:id/cancel", requireAuth, orderWriteLimiter, cancelMyOrder);
router.get("/:id", requireAuth, getOrderById);

export default router;
