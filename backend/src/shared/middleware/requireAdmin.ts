import type { Request, Response, NextFunction } from "express";
import type { AppError } from "./errorHandler.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.userRole !== "admin") {
    const err: AppError = new Error("Admin access required");
    err.statusCode = 403;
    next(err);
    return;
  }
  next();
}
