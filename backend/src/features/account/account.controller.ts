import type { Request, Response, NextFunction } from "express";
import { updateProfileSchema, objectId } from "./account.validation.js";
import * as accountService from "./account.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";

function getUserId(req: Request): string {
  const userId = req.userId;
  if (!userId) {
    const err: AppError = new Error("Missing userId on request");
    err.statusCode = 401;
    throw err;
  }
  return userId;
}

function getProductIdParam(req: Request): string {
  const raw = req.params["productId"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return objectId.parse(value);
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
 * Get the current user's wishlist
 * GET /api/account/wishlist
 */
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await accountService.getUserWishlist(getUserId(req));
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a product to the wishlist
 * POST /api/account/wishlist/:productId
 */
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = getProductIdParam(req);
    const wishlist = await accountService.addProductToWishlist(getUserId(req), productId);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a product from the wishlist
 * DELETE /api/account/wishlist/:productId
 */
export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = getProductIdParam(req);
    const wishlist = await accountService.removeProductFromWishlist(getUserId(req), productId);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};
