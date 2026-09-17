import mongoose from "mongoose";
import { Order } from "./order.model.js";
import type { ShippingAddress } from "./order.model.js";
import { Product } from "../products/product.model.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import { findValidDiscountByCode, calculateDiscount, incrementDiscountUsage } from "../discounts/discount.service.js";

export interface CreateOrderInput {
  items: { product: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  discountCode?: string | undefined;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const orderItems = [];

    // Validate products, check stock, and calculate total using DB prices
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

      // Deduct stock
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

    // Create the order
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

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export interface ListOrdersParams {
  page: number;
  limit: number;
}

export async function getMyOrders(userId: string, params: ListOrdersParams) {
  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    Order.find({ user: userId })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
    Order.countDocuments({ user: userId }),
  ]);

  return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}

export async function getOrderById(orderId: string, userId: string, isAdmin: boolean) {
  const filter: Record<string, any> = { _id: orderId };
  
  // Enforce IDOR protection: if not admin, must own the order
  if (!isAdmin) {
    filter.user = userId;
  }

  return Order.findOne(filter).populate("items.product", "name images price").lean();
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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

    if (status === "cancelled" && currentStatus !== "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    order.status = status as any;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
