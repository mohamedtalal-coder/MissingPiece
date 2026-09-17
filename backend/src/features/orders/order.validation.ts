import { z } from "zod";
import { addressSchema, objectId } from "../account/account.validation.js";

export const orderItemSchema = z.object({
  product: objectId,
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item").max(50),
  shippingAddress: addressSchema,
  discountCode: z.string().trim().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
