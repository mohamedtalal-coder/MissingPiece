import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../../features/auth/user.model.js";
import type { AppError } from "./errorHandler.js";

/**
 * Step-up auth: require the admin to re-enter their password in the request body
 * (`confirmPassword`) before destructive / high-privilege actions.
 */
export async function requireStepUp(req: Request, _res: Response, next: NextFunction) {
  try {
    const password = req.body?.confirmPassword;
    if (!password || typeof password !== "string") {
      const err: AppError = new Error("Password confirmation required for this action");
      err.statusCode = 403;
      throw err;
    }

    if (!req.userId) {
      const err: AppError = new Error("Authentication required");
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findById(req.userId).select("+passwordHash");
    if (!user) {
      const err: AppError = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err: AppError = new Error("Invalid password confirmation");
      err.statusCode = 403;
      throw err;
    }

    // Do not persist confirmPassword into downstream body handlers
    delete req.body.confirmPassword;
    next();
  } catch (error) {
    next(error);
  }
}
