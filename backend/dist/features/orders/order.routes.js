import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, updateOrderStatus, } from "./order.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { orderWriteLimiter } from "../../shared/middleware/rateLimiter.js";
const router = Router();
// Order Routes (Strictly require auth)
router.post("/", requireAuth, orderWriteLimiter, createOrder);
router.get("/", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);
// Admin Routes
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);
export default router;
//# sourceMappingURL=order.routes.js.map