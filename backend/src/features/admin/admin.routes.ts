import { Router } from "express";
import { getAdminDashboard } from "./dashboard.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";

const router = Router();

router.get("/dashboard", requireAuth, requireAdmin, getAdminDashboard);

export default router;
