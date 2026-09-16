import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { registerLimiter, loginLimiter, } from "../../shared/middleware/rateLimiter.js";
const router = Router();
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
export default router;
//# sourceMappingURL=auth.routes.js.map