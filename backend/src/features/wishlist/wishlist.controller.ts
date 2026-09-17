import type { Request, Response, NextFunction } from "express";
import * as wishlistService from "./wishlist.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

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
 * Get the current user's wishlist
 * GET /api/wishlist
 */
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await wishlistService.getUserWishlist(getUserId(req));
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a product to the wishlist
 * POST /api/wishlist/:productId
 */
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = getProductIdParam(req);
    const wishlist = await wishlistService.addProductToWishlist(getUserId(req), productId);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a product from the wishlist
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = getProductIdParam(req);
    const wishlist = await wishlistService.removeProductFromWishlist(getUserId(req), productId);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};
