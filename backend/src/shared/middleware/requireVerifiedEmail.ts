import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler.js";
import { User } from "../../features/auth/user.model.js";

/**
 * Must run after requireAuth. Blocks the request unless the authenticated
 * user has verified their email — e.g. placing an order.
 * Admins are exempt (seeded/admin accounts don't go through the OTP flow).
 */
export async function requireVerifiedEmail(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    if (req.userRole === "admin") {
      next();
      return;
    }

    const user = await User.findById(req.userId).select("isEmailVerified");

    if (!user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!user.isEmailVerified) {
      next(
        new ApiError(
          403,
          "Please verify your email before placing an order"
        )
      );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
