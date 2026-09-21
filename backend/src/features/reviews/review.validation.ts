import { z } from "zod";
import { objectId } from "../account/account.validation.js";
import { paginationSchema } from "../orders/order.validation.js";

export const createReviewSchema = z.object({
  product: objectId,
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .trim()
    .max(1000, "Comment must be at most 1000 characters")
    .default(""),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars")
    .optional(),
  comment: z
    .string()
    .trim()
    .max(1000, "Comment must be at most 1000 characters")
    .optional(),
});

export const listReviewsQuerySchema = paginationSchema.extend({
  product: objectId,
});

export const reviewProductParamSchema = objectId;
