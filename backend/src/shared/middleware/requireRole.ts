import type { Request, Response, NextFunction } from "express";
import type { AppError } from "./errorHandler.js";

export function requireRole(role: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      const err: AppError = new Error("Forbidden");
      err.statusCode = 403;
      next(err);
      return;
    }

    next();
  };
}
