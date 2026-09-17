import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Order } from "../orders/order.model.js";
import { WebhookEvent } from "./webhookEvent.model.js";
import { jest } from "@jest/globals";

process.env["STRIPE_SECRET_KEY"] = "sk_test_123";
process.env["STRIPE_WEBHOOK_SECRET"] = "whsec_test";

import { createCheckoutSessionForOrder, handleStripeWebhook } from "./payment.service.js";
import { stripe } from "../../shared/config/stripe.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";
import Stripe from "stripe";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env["FRONTEND_URL"] = "http://localhost:5173";
  process.env["STRIPE_WEBHOOK_SECRET"] = "whsec_test";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection?.deleteMany({});
  }
});

describe("Payment Service", () => {
  const userIdA = new mongoose.Types.ObjectId();
  const userIdB = new mongoose.Types.ObjectId();
  let orderId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const order = await Order.create({
      user: userIdA,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          priceAtPurchase: 50,
        },
      ],
      totalAmount: 50,
      shippingAddress: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        country: "USA",
      },
      status: "pending",
    });
    orderId = order._id as mongoose.Types.ObjectId;
  });

  describe("createCheckoutSessionForOrder", () => {
    it("should prevent user B from creating a session for user A's order (404)", async () => {
      await expect(
        createCheckoutSessionForOrder(orderId.toString(), userIdB.toString())
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Order not found",
      });
    });

    it("should prevent creating a session for a non-pending order (409)", async () => {
      await Order.findByIdAndUpdate(orderId, { status: "paid" });

      await expect(
        createCheckoutSessionForOrder(orderId.toString(), userIdA.toString())
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "This order cannot be paid for in its current state",
      });
    });

    it("should store stripeSessionId on the order and return the mocked session URL", async () => {
      const mockSessionId = "cs_test_123";
      const mockSessionUrl = "https://checkout.stripe.com/test";

      // @ts-ignore
      stripe.checkout.sessions.create = jest.fn().mockResolvedValue({
        id: mockSessionId,
        url: mockSessionUrl,
      });

      const result = await createCheckoutSessionForOrder(
        orderId.toString(),
        userIdA.toString()
      );

      expect(result.url).toBe(mockSessionUrl);

      const updatedOrder = await Order.findById(orderId);
      expect(updatedOrder?.stripeSessionId).toBe(mockSessionId);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "payment",
          success_url: expect.stringContaining("/orders/"),
          metadata: { orderId: orderId.toString() },
        })
      );
    });
  });

  describe("handleStripeWebhook", () => {
    it("should reject a payload with a bad/mismatched signature before DB write", async () => {
      // @ts-ignore
      stripe.webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        handleStripeWebhook(Buffer.from("raw"), "bad_sig")
      ).rejects.toThrow(ApiError);

      await expect(
        handleStripeWebhook(Buffer.from("raw"), "bad_sig")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Webhook Error"),
      });

      const order = await Order.findById(orderId);
      expect(order?.status).toBe("pending"); // Unchanged
    });

    it("should process checkout.session.completed and update order", async () => {
      const eventId = "evt_test_123";
      const paymentIntentId = "pi_test_123";

      const mockEvent = {
        id: eventId,
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: { orderId: orderId.toString() },
            payment_intent: paymentIntentId,
          },
        },
      } as unknown as Stripe.Event;

      // @ts-ignore
      stripe.webhooks.constructEvent = jest.fn().mockReturnValue(mockEvent);

      await handleStripeWebhook(Buffer.from("raw"), "valid_sig");

      const updatedOrder = await Order.findById(orderId);
      expect(updatedOrder?.status).toBe("paid");
      expect(updatedOrder?.paymentIntentId).toBe(paymentIntentId);

      const webhookEvent = await WebhookEvent.findOne({ stripeEventId: eventId });
      expect(webhookEvent).not.toBeNull();
    });

    it("should guarantee idempotency for the same event.id", async () => {
      const eventId = "evt_test_idempotent";
      const paymentIntentId = "pi_test_123";

      const mockEvent = {
        id: eventId,
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: { orderId: orderId.toString() },
            payment_intent: paymentIntentId,
          },
        },
      } as unknown as Stripe.Event;

      // @ts-ignore
      stripe.webhooks.constructEvent = jest.fn().mockReturnValue(mockEvent);

      // First call
      await handleStripeWebhook(Buffer.from("raw"), "valid_sig");

      let order = await Order.findById(orderId);
      expect(order?.status).toBe("paid");
      
      // Simulate order status being changed elsewhere to prove no-op
      await Order.findByIdAndUpdate(orderId, { status: "shipped" });

      // Second call (same event ID)
      await handleStripeWebhook(Buffer.from("raw"), "valid_sig");

      // The status should still be "shipped", not changed back to "paid" or errored
      order = await Order.findById(orderId);
      expect(order?.status).toBe("shipped");
    });
  });
});
