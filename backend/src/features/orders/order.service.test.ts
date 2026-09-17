import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createOrder } from "./order.service.js";
import { Order } from "./order.model.js";
import { Product } from "../products/product.model.js";
import { Discount } from "../discounts/discount.model.js";

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
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
});
