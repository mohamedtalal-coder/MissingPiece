import { z } from "zod";
import { objectId } from "../account/account.validation.js";

export const discountBaseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Discount code must be at least 3 characters")
    .max(20, "Discount code must be at most 20 characters"),
  type: z.enum(["percentage", "fixed"], "Discount type must be 'percentage' or 'fixed'"),
  value: z.number().positive("Discount value must be greater than 0"),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  maxUses: z
    .number()
    .int("Max uses must be a whole number")
    .positive("Max uses must be greater than 0")
    .optional(),
  applicableProducts: z.array(objectId).default([]),
});

export const createDiscountSchema = discountBaseSchema
  .refine((data) => data.validFrom < data.validTo, {
    message: "'Valid From' date must be before 'Valid To' date",
    path: ["validFrom"],
  })
  .refine(
    (data) => {
      if (data.type === "percentage") {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount value cannot exceed 100%",
      path: ["value"],
    }
  );

export const updateDiscountSchema = discountBaseSchema.partial();

export const validateCodeSchema = z.object({
  code: z.string().trim().min(1, "Discount code is required"),
  items: z.array(
    z.object({
      product: objectId,
      quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one item is required to validate a discount code"),
});
