import type { Request, Response, NextFunction } from "express";
import { createOrderSchema, orderStatusSchema, paginationSchema, adminOrdersQuerySchema } from "./order.validation.js";
import * as orderService from "./order.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import { logAdminAction } from "../audit/audit.service.js";

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
 * Cancel own order (Buyer only, own order, pending only)
 * PATCH /api/orders/:id/cancel
 */
export const cancelMyOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params["id"] as string;
    const order = await orderService.cancelOwnOrder(orderId, getUserId(req));
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
    const orderId = req.params["id"] as string;
    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      const err: AppError = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    await logAdminAction({
      adminId: getUserId(req),
      action: status === "refunded" ? "REFUND_ORDER" : "UPDATE_ORDER_STATUS",
      resourceId: orderId,
      resourceModel: "Order",
      details: { newStatus: status },
      ipAddress: req.ip,
    });

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
    const query = adminOrdersQuerySchema.parse(req.query);
    const result = await orderService.getAllOrdersAdmin(query as unknown as orderService.AdminListOrdersParams);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Export orders as CSV (Admin only)
 * GET /api/orders/admin/export
 */
export const exportOrdersAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = adminOrdersQuerySchema.omit({ page: true, limit: true }).parse(req.query);
    const items = await orderService.exportOrdersAdmin(query as unknown as Omit<orderService.AdminListOrdersParams, "page" | "limit">);

    const header = "id,customer,email,status,totalAmount,createdAt,city,country\n";
    const rows = items
      .map((o) => {
        const user = o.user as { name?: string; email?: string } | null;
        const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        return [
          o._id,
          escape(user?.name ?? ""),
          escape(user?.email ?? ""),
          o.status,
          o.totalAmount,
          o.createdAt?.toISOString?.() ?? "",
          escape(o.shippingAddress?.city ?? ""),
          escape(o.shippingAddress?.country ?? ""),
        ].join(",");
      })
      .join("\n");

    await logAdminAction({
      adminId: getUserId(req),
      action: "EXPORT_ORDERS",
      resourceId: "orders",
      resourceModel: "Order",
      details: { count: items.length, filters: query },
      ipAddress: req.ip,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="orders-export.csv"');
    res.status(200).send(header + rows);
  } catch (error) {
    next(error);
  }
};
