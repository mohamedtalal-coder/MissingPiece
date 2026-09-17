import Stripe from "stripe";

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];

if (!stripeSecretKey) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(stripeSecretKey, {
  // @ts-expect-error - Stripe's TS definitions are strictly pinned to their latest beta, we override it here for production stability.
  apiVersion: "2024-06-20",
});