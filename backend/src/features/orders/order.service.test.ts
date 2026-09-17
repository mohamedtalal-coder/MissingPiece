import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createOrder, updateOrderStatus, getOrderById } from "./order.service.js";
import { Order } from "./order.model.js";
import { Product } from "../products/product.model.js";
import { Discount } from "../discounts/discount.model.js";

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await Discount.createCollection();
  await Order.createCollection();
  await Product.createCollection();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

describe("Order Service - Discounts Integration", () => {
  let product: any;
  let userId = new mongoose.Types.ObjectId().toString();
  const validFrom = new Date(Date.now() - 10000);
  const validTo = new Date(Date.now() + 10000);

  beforeEach(async () => {
    product = await Product.create({
      name: "Test Product",
      slug: "test-product",
      description: "A product",
      price: 100,
      stock: 10,
      category: "test",
      images: ["test.jpg"],
    });
  });

  it("should apply discount and compute totals correctly", async () => {
    await Discount.create({ code: "10OFF", type: "fixed", value: 10, validFrom, validTo });
    
    const input = {
      items: [{ product: product._id.toString(), quantity: 1 }], // 100
      shippingAddress: { street: "123", city: "A", state: "B", zipCode: "C", country: "D" },
      discountCode: "10OFF",
    };

    const order = await createOrder(userId, input);
    
    expect(order.totalAmount).toBe(90); // 100 - 10
    expect(order.discountCode).toBe("10OFF");
    expect(order.discountAmount).toBe(10);
    
    const d = await Discount.findOne({ code: "10OFF" });
    expect(d?.usesCount).toBe(1);
  });

  it("should abort transaction and not create order if discount code is invalid", async () => {
    const input = {
      items: [{ product: product._id.toString(), quantity: 1 }],
      shippingAddress: { street: "123", city: "A", state: "B", zipCode: "C", country: "D" },
      discountCode: "INVALID",
    };

    await expect(createOrder(userId, input)).rejects.toThrow("Invalid or expired code");
    
    const orderCount = await Order.countDocuments();
    expect(orderCount).toBe(0); // Transaction aborted
  });

  it("should enforce maxUses and fail the order when exceeded", async () => {
    await Discount.create({ code: "ONETIME", type: "fixed", value: 10, validFrom, validTo, maxUses: 1 });
    
    const input = {
      items: [{ product: product._id.toString(), quantity: 1 }],
      shippingAddress: { street: "123", city: "A", state: "B", zipCode: "C", country: "D" },
      discountCode: "ONETIME",
    };

    // First one succeeds
    await createOrder(userId, input);
    
    // Second one fails
    await expect(createOrder(userId, input)).rejects.toThrow("Invalid or expired code");
    
    const orderCount = await Order.countDocuments();
    expect(orderCount).toBe(1); 
  });

  describe("Order status transitions & stock", () => {
    let order: any;
    beforeEach(async () => {
      order = await createOrder(userId, {
        items: [{ product: product._id.toString(), quantity: 2 }],
        shippingAddress: { street: "123", city: "A", state: "B", zipCode: "C", country: "D" }
      });
      product = await Product.findById(product._id);
    });

    it("cancelling pending restores stock, twice does not double-restore", async () => {
      await updateOrderStatus(order._id.toString(), "cancelled");
      let p = await Product.findById(product._id);
      expect(p?.stock).toBe(10); // restored 2 (initial was 10, created was 8, cancelled is 10)

      await expect(updateOrderStatus(order._id.toString(), "cancelled")).rejects.toThrow();
      p = await Product.findById(product._id);
      expect(p?.stock).toBe(10); // still 10, no double-restore
    });

    it("invalid transition rejected with 409, valid succeeds", async () => {
      await expect(updateOrderStatus(order._id.toString(), "delivered")).rejects.toThrow(/Invalid status transition/);
      
      await updateOrderStatus(order._id.toString(), "paid"); // pending -> paid is valid
      const updated = await Order.findById(order._id);
      expect(updated?.status).toBe("paid");
    });
  });

  describe("getOrderById", () => {
    it("non-owner gets 404, owner gets it, admin gets it", async () => {
      const order = await createOrder(userId, {
        items: [{ product: product._id.toString(), quantity: 1 }],
        shippingAddress: { street: "123", city: "A", state: "B", zipCode: "C", country: "D" }
      });
      
      const ownerOrder = await getOrderById(order._id.toString(), userId, false);
      expect(ownerOrder).toBeDefined();
      expect(ownerOrder?._id.toString()).toBe(order._id.toString());

      const adminOrder = await getOrderById(order._id.toString(), new mongoose.Types.ObjectId().toString(), true);
      expect(adminOrder).toBeDefined();

      const nonOwnerOrder = await getOrderById(order._id.toString(), new mongoose.Types.ObjectId().toString(), false);
      expect(nonOwnerOrder).toBeNull(); // 404 behavior at controller
    });
  });

  describe("createOrder price security", () => {
    it("forged priceAtPurchase or totalAmount in request body has zero effect", async () => {
      // @ts-ignore - simulating a malicious client bypassing types/zod
      const maliciousInput = {
        items: [{ product: product._id.toString(), quantity: 1, priceAtPurchase: 1 }],
        shippingAddress: { street: "123", city: "A", state: "B", zipCode: "C", country: "D" },
        totalAmount: 1
      };

      const order = await createOrder(userId, maliciousInput as any);
      expect(order.totalAmount).toBe(100); // the real price is 100
      expect(order.items[0]!.priceAtPurchase).toBe(100);
    });
  });
});
