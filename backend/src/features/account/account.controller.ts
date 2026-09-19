import type { Request, Response, NextFunction } from "express";
import { updateProfileSchema, changePasswordSchema } from "./account.validation.js";
import * as accountService from "./account.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";
import { uploadImage } from "../../shared/utils/cloudinary.js";

function getUserId(req: Request): string {
  const userId = req.userId;
  if (!userId) {
    const err: AppError = new Error("Missing userId on request");
    err.statusCode = 401;
    throw err;
  }
  return userId;
}

/**
 * Get the current user's profile
 * GET /api/account/profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await accountService.getUserProfile(getUserId(req));
    if (!user) {
      const err: AppError = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current user's profile
 * PUT /api/account/profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const updatedUser = await accountService.updateUserProfile(getUserId(req), input);

    if (!updatedUser) {
      const err: AppError = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Change the current user's password (requires current password)
 * PATCH /api/account/password
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = changePasswordSchema.parse(req.body);
    await accountService.changeUserPassword(getUserId(req), input);
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload / replace the current user's profile picture
 * PATCH /api/account/avatar
 */
export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      throw new ApiError(400, "No image file provided");
    }

    const avatarUrl = await uploadImage(file.buffer, "missing-piece/avatars");
    const updatedUser = await accountService.updateUserAvatar(getUserId(req), avatarUrl);

    if (!updatedUser) {
      const err: AppError = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};


