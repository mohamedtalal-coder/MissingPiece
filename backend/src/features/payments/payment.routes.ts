import { Router } from "express";
import { createCheckoutSessionHandler } from "./payment.controller.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { paymentLimiter } from "../../shared/middleware/rateLimiter.js";

const router = Router();

router.post("/checkout-session", requireAuth, paymentLimiter, createCheckoutSessionHandler);

export default router;
