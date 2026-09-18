import type { Request, Response, NextFunction } from "express";
import { createOrderSchema, orderStatusSchema, paginationSchema } from "./order.validation.js";
import * as orderService from "./order.service.js";
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

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(getUserId(req), input);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders for the current user
 * GET /api/orders
 */
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await orderService.getMyOrders(getUserId(req), query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.userRole === "admin";
    const order = await orderService.getOrderById(req.params["id"] as string, getUserId(req), isAdmin);

    if (!order) {
      const err: AppError = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin only)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = orderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(req.params["id"] as string, status);

    if (!order) {
      const err: AppError = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (Admin only)
 * GET /api/orders/admin/all
 */
export const getAllOrdersAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await orderService.getAllOrdersAdmin(query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
