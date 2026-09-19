import type { Request, Response, NextFunction } from "express";
import { requireStepUp } from "./requireStepUp.js";

/** Only demand password re-entry for cancel/refund transitions. */
export function requireStepUpForOrderMutation(req: Request, res: Response, next: NextFunction) {
  const status = req.body?.status;
  if (status === "cancelled" || status === "refunded") {
    return requireStepUp(req, res, next);
  }
  next();
}
