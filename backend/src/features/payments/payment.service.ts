import { getStripe } from "../../shared/config/stripe.js";
import { Order } from "../orders/order.model.js";
import { WebhookEvent } from "./webhookEvent.model.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";
import Stripe from "stripe";

export const createCheckoutSessionForOrder = async (
  orderId: string,
  userId: string,
): Promise<{ url: string | null }> => {
  const order = await Order.findById(orderId);

  if (!order || order.user.toString() !== userId) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "pending") {
    throw new ApiError(
      409,
      "This order cannot be paid for in its current state",
    );
  }

  // order.totalAmount is already the server-verified, discount-adjusted total
  // computed in order.service.createOrder — reconstructing itemized line items
  // here would risk the Stripe-side total drifting from your own total if the
  // math is duplicated instead of reused. One line item keeps a single source of truth.
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `MissingPiece Order #${order._id}` },
            unit_amount: Math.round(order.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env["FRONTEND_URL"]}/orders/${order._id}?payment=success`,
      cancel_url: `${process.env["FRONTEND_URL"]}/orders/${order._id}?payment=cancelled`,
      metadata: { orderId: order._id.toString() },
    });
  } catch (error: unknown) {
    const stripeError = error as { type?: string; statusCode?: number };
    if (
      stripeError.type === "StripeAuthenticationError" ||
      stripeError.statusCode === 401
    ) {
      throw new ApiError(503, "Payments are temporarily unavailable");
    }
    throw error;
  }

  order.stripeSessionId = session.id;
  await order.save();

  return { url: session.url };
};

export const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string,
): Promise<void> => {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    // Controller catches this and must respond 400 immediately
    throw new ApiError(400, `Webhook Error: ${(err as Error).message}`);
  }

  try {
    await WebhookEvent.create({ stripeEventId: event.id });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: unknown }).code === 11000
    ) {
      // Event already processed
      return;
    }
    throw err;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status === "pending") {
        order.status = "paid";
        order.paymentIntentId = session.payment_intent as string;
        await order.save();
      }
    }
  }
};
