import { z } from "zod";
import { objectId } from "../account/account.validation.js";

export const discountBaseSchema = z.object({
  code: z.string().trim().min(3).max(20),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  maxUses: z.number().int().positive().optional(),
  applicableProducts: z.array(objectId).default([]),
});

export const createDiscountSchema = discountBaseSchema
  .refine((data) => data.validFrom < data.validTo, {
    message: "validFrom must be before validTo",
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
      message: "Percentage discount value cannot exceed 100",
      path: ["value"],
    }
  );

export const updateDiscountSchema = discountBaseSchema.partial();

export const validateCodeSchema = z.object({
  code: z.string().trim(),
  items: z.array(
    z.object({
      product: objectId,
      quantity: z.number().int().min(1),
    })
  ).min(1),
});
