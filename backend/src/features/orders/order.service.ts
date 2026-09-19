import { withTransaction } from "../../shared/utils/withTransaction.js";
import { Order } from "./order.model.js";
import type { ShippingAddress } from "./order.model.js";
import { Product } from "../products/product.model.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import { findValidDiscountByCode, calculateDiscount, incrementDiscountUsage } from "../discounts/discount.service.js";
import { User } from "../auth/user.model.js";

export const AUTO_DELIVERY_DELAY_MS = 90_000;

async function markDueOrdersDelivered(userId?: string) {
  const filter: Record<string, unknown> = {
    status: { $in: ["pending", "paid", "shipped"] },
    createdAt: { $lte: new Date(Date.now() - AUTO_DELIVERY_DELAY_MS) },
  };
  if (userId) filter.user = userId;

  await Order.updateMany(filter, { $set: { status: "delivered" } });
}

export interface CreateOrderInput {
  items: { product: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  discountCode?: string | undefined;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  return withTransaction(async (session) => {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of input.items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        const err: AppError = new Error(`Product with ID ${item.product} not found`);
        err.statusCode = 404;
        throw err;
      }

      if (!product.isActive) {
        const err: AppError = new Error(`Product ${product.name} is no longer available`);
        err.statusCode = 400;
        throw err;
      }

      if (product.stock < item.quantity) {
        const err: AppError = new Error(`Insufficient stock for ${product.name}`);
        err.statusCode = 400;
        throw err;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      product.stock -= item.quantity;
      await product.save({ session });
    }

    let finalTotalAmount = totalAmount;
    let appliedDiscountAmount = 0;
    let appliedDiscountCode: string | undefined;

    if (input.discountCode) {
      const discount = await findValidDiscountByCode(input.discountCode, session);
      if (!discount) {
        const err: AppError = new Error("Invalid or expired code");
        err.statusCode = 400;
        throw err;
      }

      const { discountAmount } = calculateDiscount(discount, orderItems);
      appliedDiscountAmount = discountAmount;

      await incrementDiscountUsage(discount._id.toString(), session);

      finalTotalAmount = Math.max(0, totalAmount - appliedDiscountAmount);
      appliedDiscountCode = discount.code;
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: finalTotalAmount,
      shippingAddress: input.shippingAddress,
      status: "pending",
      discountCode: appliedDiscountCode,
      discountAmount: appliedDiscountAmount,
    });

    await order.save({ session });

    return order;
  });
}

export interface ListOrdersParams {
  page: number;
  limit: number;
}

export interface AdminListOrdersParams extends ListOrdersParams {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export async function getMyOrders(userId: string, params: ListOrdersParams) {
  await markDueOrdersDelivered(userId);
  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    Order.find({ user: userId })
      .populate("items.product", "name images price slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
    Order.countDocuments({ user: userId }),
  ]);

  return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}

async function buildAdminOrderFilter(params: AdminListOrdersParams) {
  const filter: Record<string, unknown> = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.minAmount !== undefined || params.maxAmount !== undefined) {
    const amount: Record<string, number> = {};
    if (params.minAmount !== undefined) amount.$gte = params.minAmount;
    if (params.maxAmount !== undefined) amount.$lte = params.maxAmount;
    filter.totalAmount = amount;
  }

  if (params.dateFrom || params.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (params.dateFrom) createdAt.$gte = new Date(params.dateFrom);
    if (params.dateTo) {
      const end = new Date(params.dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.$lte = end;
    }
    filter.createdAt = createdAt;
  }

  if (params.search) {
    const users = await User.find({
      $or: [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
      ],
    })
      .select("_id")
      .lean();
    const userIds = users.map((u) => u._id);
    filter.$or = [
      { user: { $in: userIds } },
      ...(params.search.match(/^[a-f\d]{24}$/i) ? [{ _id: params.search }] : []),
    ];
  }

  return filter;
}

export async function getAllOrdersAdmin(params: AdminListOrdersParams) {
  const skip = (params.page - 1) * params.limit;
  const filter = await buildAdminOrderFilter(params);

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images price slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}

export async function exportOrdersAdmin(params: Omit<AdminListOrdersParams, "page" | "limit">) {
  const filter = await buildAdminOrderFilter({ ...params, page: 1, limit: 1 });
  const items = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();
  return items;
}

export async function getOrderById(orderId: string, userId: string, isAdmin: boolean) {
  await markDueOrdersDelivered(isAdmin ? undefined : userId);
  const filter: Record<string, unknown> = { _id: orderId };

  if (!isAdmin) {
    filter.user = userId;
  }

  return Order.findOne(filter).populate("items.product", "name images price slug").lean();
}

/** Validated order status state machine */
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export async function restoreStock(
  items: { product: unknown; quantity: number }[],
  session: import("mongoose").ClientSession
) {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } },
      { session }
    );
  }
}

/**
 * Buyer-initiated cancellation. Unlike updateOrderStatus (admin-only, any
 * valid transition), this only allows a buyer to cancel their OWN order,
 * and only while it is still "pending" (spec: "if it hasn't shipped yet").
 */
export async function cancelOwnOrder(orderId: string, userId: string) {
  return withTransaction(async (session) => {
    const order = await Order.findOne({ _id: orderId, user: userId }).session(session);

    if (!order) {
      const err: AppError = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    if (order.status !== "pending") {
      const err: AppError = new Error(
        `Order cannot be cancelled once it is ${order.status}`
      );
      err.statusCode = 409;
      throw err;
    }

    await restoreStock(order.items, session);

    order.status = "cancelled";
    await order.save({ session });

    return order;
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return withTransaction(async (session) => {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      const err: AppError = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = order.status;

    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status)) {
      const err: AppError = new Error(`Invalid status transition from ${currentStatus} to ${status}`);
      err.statusCode = 409;
      throw err;
    }

    // Cancel from pending/paid restores stock; refund from paid/delivered restores stock.
    // Shipped cannot be cancelled (no transition) — must deliver or handle offline.
    if (
      (status === "cancelled" || status === "refunded") &&
      currentStatus !== "cancelled" &&
      currentStatus !== "refunded"
    ) {
      await restoreStock(order.items, session);
    }

    order.status = status as typeof order.status;
    await order.save({ session });

    return order;
  });
}
