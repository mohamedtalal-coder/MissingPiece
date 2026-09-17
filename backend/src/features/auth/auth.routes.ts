import { Router } from "express";
import { register, login, logout } from "./auth.controller.js";
import {
  registerLimiter,
  loginLimiter,
} from "../../shared/middleware/rateLimiter.js";
import { requireAuth } from "../../shared/middleware/requireAuth.js";

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", requireAuth, logout);

export default router;