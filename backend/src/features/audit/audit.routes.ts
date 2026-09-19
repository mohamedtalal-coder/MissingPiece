import { Router } from "express";
import { getAuditLogs } from "./audit.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAuditLogs);

export default router;
