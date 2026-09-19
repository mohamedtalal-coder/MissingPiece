import { z } from "zod";
import { objectId } from "../account/account.validation.js";
import { paginationSchema } from "../orders/order.validation.js";

export const createReviewSchema = z.object({
  product: objectId,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).default(""),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(1000).optional(),
});

export const listReviewsQuerySchema = paginationSchema.extend({
  product: objectId,
});

export const reviewProductParamSchema = objectId;
