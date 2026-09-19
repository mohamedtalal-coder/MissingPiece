import mongoose from "mongoose";
import { Review } from "./review.model.js";
import { Product } from "../products/product.model.js";
import type { z } from "zod";
import type { createReviewSchema, updateReviewSchema, listReviewsQuerySchema } from "./review.validation.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";

async function recalculateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const averageRating = Math.round(stats[0].averageRating * 10) / 10;
    const reviewCount = stats[0].reviewCount;
    await Product.findByIdAndUpdate(productId, { averageRating, reviewCount });
  } else {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, reviewCount: 0 });
  }
}

export async function createReview(userId: string, input: z.infer<typeof createReviewSchema>) {
  const productExists = await Product.exists({ _id: input.product });
  if (!productExists) {
    const err: AppError = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const review = await Review.create({ ...input, user: userId });
  await recalculateProductRating(input.product);
  return review;
}

export async function updateReview(
  reviewId: string,
  userId: string,
  isAdmin: boolean,
  input: z.infer<typeof updateReviewSchema>
) {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err: AppError = new Error("Review not found");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin && review.user.toString() !== userId) {
    const err: AppError = new Error("Not authorized to edit this review");
    err.statusCode = 403;
    throw err;
  }

  if (input.rating !== undefined) review.rating = input.rating;
  if (input.comment !== undefined) review.comment = input.comment;

  await review.save();
  await recalculateProductRating(review.product.toString());

  return review;
}

export async function deleteReview(reviewId: string, userId: string, isAdmin: boolean) {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err: AppError = new Error("Review not found");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin && review.user.toString() !== userId) {
    const err: AppError = new Error("Not authorized to edit this review");
    err.statusCode = 403;
    throw err;
  }

  await review.deleteOne();
  await recalculateProductRating(review.product.toString());

  return review;
}

export async function listReviewsForProduct(params: z.infer<typeof listReviewsQuerySchema>) {
  const { product, page, limit } = params;
  const skip = (page - 1) * limit;

  // We should only show approved reviews to the public. 
  // Admin routes will bypass this by using a new admin specific fetch if necessary, 
  // but for the product detail page, only approved reviews.
  const filter = { product, status: "approved" as const };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name")
      .lean(),
    Review.countDocuments(filter),
  ]);

  return { reviews, total, page, limit };
}

export async function listAllReviewsAdmin(page: number, limit: number, status?: string) {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("product", "name")
      .lean(),
    Review.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateReviewStatus(reviewId: string, status: string, moderationReason?: string) {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { status, moderationReason },
    { new: true, runValidators: true }
  );

  if (review) {
    await recalculateProductRating(review.product.toString());
  }

  return review;
}
