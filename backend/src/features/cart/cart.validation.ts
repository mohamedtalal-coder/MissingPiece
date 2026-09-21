import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format");

const quantity = z
  .number()
  .int("Quantity must be a whole number")
  .positive("Quantity must be at least 1")
  .max(1000, "Quantity cannot exceed 1000 per item");

export const validateCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity,
      })
    )
    .min(1, "Cart must contain at least one item")
    .max(100, "Cart cannot contain more than 100 different items"),
});

export const addItemSchema = z.object({
  productId: objectId,
  quantity: quantity.default(1),
});

export const updateItemSchema = z.object({
  quantity,
});

export const mergeCartSchema = validateCartSchema;