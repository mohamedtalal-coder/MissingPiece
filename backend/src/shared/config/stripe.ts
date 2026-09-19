import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env["STRIPE_SECRET_KEY"];
    if (!key) {
      throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
    }
    stripeInstance = new Stripe(key, {
      // @ts-expect-error - Stripe's TS definitions are strictly pinned to their latest beta, we override it here for production stability.
      apiVersion: "2024-06-20",
    });
  }
  return stripeInstance;
}

export const stripe = getStripe();
