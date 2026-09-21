import { z } from "zod";
import { addressSchema, objectId } from "../account/account.validation.js";

export const orderItemSchema = z.object({
  product: objectId,
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100 per item"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item")
    .max(50, "Order cannot contain more than 50 different items"),
  shippingAddress: addressSchema,
  discountCode: z.string().trim().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"], "Invalid order status"),
});

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .positive("Page must be at least 1")
    .default(1),
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .positive("Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
});

export const adminOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]).optional(),
  search: z.string().trim().max(100, "Search query must be at most 100 characters").optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.coerce.number().min(0, "Min amount cannot be negative").optional(),
  maxAmount: z.coerce.number().min(0, "Max amount cannot be negative").optional(),
});
