import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler.js";
import { redis } from "../utils/redis.js";
import { User } from "../../features/auth/user.model.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  try {
    const token = header.slice(7);
    const secret = process.env["JWT_SECRET"];
    if (!secret) throw new Error("JWT_SECRET is not configured");

    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as { userId: string; role?: string };
    
    let userDataString = await redis.get(`user:${payload.userId}`);
    let userRole = payload.role;

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      userRole = userData.role;
    } else {
      const user = await User.findById(payload.userId);
      if (!user) {
        throw new ApiError(401, "User no longer exists");
      }
      userRole = user.role;
      await redis.set(
        `user:${user._id}`,
        JSON.stringify({ role: user.role }),
        "EX",
        7 * 24 * 60 * 60
      );
    }

    req.userId = payload.userId;
    if (userRole !== undefined) {
      req.userRole = userRole;
    } else {
      delete req.userRole;
    }

    
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Invalid or expired token"));
    }
  }
}
