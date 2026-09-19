import type { Request, Response, NextFunction } from "express";
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsQuerySchema,
  reviewProductParamSchema,
} from "./review.validation.js";
import * as reviewService from "./review.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";

export async function createReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(req.userId!, input);
    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
}

export async function updateReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateReviewSchema.parse(req.body);
    const review = await reviewService.updateReview(
      req.params["id"] as string,
      req.userId!,
      req.userRole === "admin",
      input
    );
    res.json({ success: true, review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewService.deleteReview(
      req.params["id"] as string,
      req.userId!,
      req.userRole === "admin"
    );
    res.json({ success: true, review });
  } catch (err) {
    next(err);
  }
}

export async function listReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listReviewsQuerySchema.parse(req.query);
    const result = await reviewService.listReviewsForProduct(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function canReviewProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = reviewProductParamSchema.parse(req.params["product"]);
    const canReview = await reviewService.canReviewProduct(req.userId!, productId);
    res.json({ success: true, canReview });
  } catch (err) {
    next(err);
  }
}

import { logAdminAction } from "../audit/audit.service.js";

export async function listReviewsAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await reviewService.listAllReviewsAdmin(page, limit, status);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateReviewStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, moderationReason } = req.body;
    const reviewId = req.params["id"] as string;

    const review = await reviewService.updateReviewStatus(reviewId, status, moderationReason);
    if (!review) {
      const err: AppError = new Error("Review not found");
      err.statusCode = 404;
      throw err;
    }

    await logAdminAction({
      adminId: req.userId!,
      action: "MODERATE_REVIEW",
      resourceId: reviewId,
      resourceModel: "Review",
      details: { status, moderationReason },
      ipAddress: req.ip,
    });

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}
