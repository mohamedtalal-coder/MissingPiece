import type { Request, Response, NextFunction } from "express";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import {
  objectId,
  validateCartSchema,
  addItemSchema,
  updateItemSchema,
  mergeCartSchema,
} from "./cart.validation.js";
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  mergeGuestCart,
  validateCartItems,
} from "./cart.service.js";

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

export async function getCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await getCart(getUserId(req));
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

export async function addItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, quantity } = addItemSchema.parse(req.body);
    const items = await addItem(getUserId(req), productId, quantity);
    res.status(201).json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

export async function updateItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = getProductIdParam(req);
    const { quantity } = updateItemSchema.parse(req.body);
    const items = await updateItemQuantity(getUserId(req), productId, quantity);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

export async function removeItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = getProductIdParam(req);
    const items = await removeItem(getUserId(req), productId);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

export async function mergeCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { items: guestItems } = mergeCartSchema.parse(req.body);
    const items = await mergeGuestCart(getUserId(req), guestItems);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

export async function validateCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = validateCartSchema.parse(req.body);
    const results = await validateCartItems(items);
    res.json({ success: true, items: results });
  } catch (err) {
    next(err);
  }
}