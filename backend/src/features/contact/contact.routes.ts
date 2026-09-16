import { Router } from "express";
import {
  submitContact,
  getContacts,
  updateContactStatus,
} from "./contact.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";
import { contactSubmitLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

// Public route to submit a contact message (Strict Rate Limit)
router.post("/", contactSubmitLimiter, submitContact);

// Admin routes to view and manage messages
router.get("/", requireAuth, requireAdmin, getContacts);
router.patch("/:id/status", requireAuth, requireAdmin, updateContactStatus);

export default router;
