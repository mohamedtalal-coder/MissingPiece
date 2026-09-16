import { createOrderSchema, orderStatusSchema, paginationSchema } from "./order.validation.js";
import * as orderService from "./order.service.js";
function getUserId(req) {
    const userId = req.userId;
    if (!userId) {
        const err = new Error("Missing userId on request");
        err.statusCode = 401;
        throw err;
    }
    return userId;
}
/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
    try {
        const input = createOrderSchema.parse(req.body);
        const order = await orderService.createOrder(getUserId(req), input);
        res.status(201).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all orders for the current user
 * GET /api/orders
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const query = paginationSchema.parse(req.query);
        const result = await orderService.getMyOrders(getUserId(req), query);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get a specific order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
    try {
        const isAdmin = req.userRole === "admin";
        const order = await orderService.getOrderById(req.params["id"], getUserId(req), isAdmin);
        if (!order) {
            const err = new Error("Order not found");
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Update order status (Admin only)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = orderStatusSchema.parse(req.body);
        const order = await orderService.updateOrderStatus(req.params["id"], status);
        if (!order) {
            const err = new Error("Order not found");
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=order.controller.js.map