import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AppError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    const err: AppError = new Error("Authentication required");
    err.statusCode = 401;
    next(err);
    return;
  }

  try {
    const token = header.slice(7);
    const secret = process.env["JWT_SECRET"];
    if (!secret) throw new Error("JWT_SECRET is not configured");

    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as { userId: string; role?: string };
    req.userId = payload.userId;
    if (payload.role !== undefined) {
      req.userRole = payload.role;
    }
    next();
  } catch {
    const err: AppError = new Error("Invalid or expired token");
    err.statusCode = 401;
    next(err);
  }
}
