import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const quantity = z.number().int().positive().max(1000);

export const validateCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity,
      })
    )
    .min(1)
    .max(100),
});

export const addItemSchema = z.object({
  productId: objectId,
  quantity: quantity.default(1),
});

export const updateItemSchema = z.object({
  quantity,
});

export const mergeCartSchema = validateCartSchema;