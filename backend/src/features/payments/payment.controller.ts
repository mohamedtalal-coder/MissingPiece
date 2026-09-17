import type { Request, Response, NextFunction } from "express";
import { createCheckoutSessionSchema } from "./payment.validation.js";
import { createCheckoutSessionForOrder, handleStripeWebhook } from "./payment.service.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";

export const createCheckoutSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = createCheckoutSessionSchema.parse(req.body);
    const userId = req.userId as string;

    const { url } = await createCheckoutSessionForOrder(orderId, userId);
    res.status(200).json({ success: true, url });
  } catch (err) {
    next(err);
  }
};

// To test webhooks locally:
// 1. stripe listen --forward-to localhost:5000/api/payments/webhook
// 2. stripe trigger checkout.session.completed
export const webhookHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    res.status(400).send("Webhook Error: Missing stripe-signature header");
    return;
  }

  try {
    await handleStripeWebhook(req.body as Buffer, signature as string);
    res.sendStatus(200);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 400) {
      // Signature verification failure
      res.status(400).send(err.message);
    } else {
      console.error("Webhook processing error:", err);
      // Unexpected error - let Stripe retry
      res.sendStatus(500);
    }
  }
};
