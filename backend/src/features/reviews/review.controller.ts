import type { Request, Response, NextFunction } from "express";
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsQuerySchema,
} from "./review.validation.js";
import * as reviewService from "./review.service.js";

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
