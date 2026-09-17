import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  calculateDiscount,
  findValidDiscountByCode,
  incrementDiscountUsage,
  createDiscount
} from "./discount.service.js";
import { Discount } from "./discount.model.js";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
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

describe("Discount Service", () => {
  describe("calculateDiscount", () => {
    const items = [
      { product: new mongoose.Types.ObjectId(), quantity: 2, priceAtPurchase: 50 }, // 100
      { product: new mongoose.Types.ObjectId(), quantity: 1, priceAtPurchase: 200 } // 200
    ]; // Total = 300

    it("should calculate percentage discount correctly", () => {
      const discount: any = { type: "percentage", value: 20, applicableProducts: [] };
      const { discountAmount, applied } = calculateDiscount(discount, items);
      expect(applied).toBe(true);
      expect(discountAmount).toBe(60); // 20% of 300
    });

    it("should calculate fixed discount correctly", () => {
      const discount: any = { type: "fixed", value: 50, applicableProducts: [] };
      const { discountAmount, applied } = calculateDiscount(discount, items);
      expect(applied).toBe(true);
      expect(discountAmount).toBe(50);
    });

    it("should cap percentage discount at subtotal (should not exceed total)", () => {
      // Though value <= 100 is validated, calculateDiscount should handle edge cases safely
      const discount: any = { type: "percentage", value: 150, applicableProducts: [] };
      const { discountAmount, applied } = calculateDiscount(discount, items);
      expect(applied).toBe(true);
      expect(discountAmount).toBe(300); // Capped at total
    });

    it("should cap fixed discount at subtotal", () => {
      const discount: any = { type: "fixed", value: 500, applicableProducts: [] };
      const { discountAmount, applied } = calculateDiscount(discount, items);
      expect(applied).toBe(true);
      expect(discountAmount).toBe(300); // Capped at total
    });

    it("should only apply to applicable products", () => {
      const discount: any = { 
        type: "percentage", 
        value: 10, 
        applicableProducts: [items[0]!.product] 
      };
      const { discountAmount, applied } = calculateDiscount(discount, items);
      expect(applied).toBe(true);
      expect(discountAmount).toBe(10); // 10% of 100
    });

    it("should return 0 if no applicable products are in the cart", () => {
      const discount: any = { 
        type: "percentage", 
        value: 10, 
        applicableProducts: [new mongoose.Types.ObjectId()] 
      };
      const { discountAmount, applied } = calculateDiscount(discount, items);
      expect(applied).toBe(false);
      expect(discountAmount).toBe(0);
    });
  });

  describe("findValidDiscountByCode", () => {
    const validFrom = new Date(Date.now() - 10000);
    const validTo = new Date(Date.now() + 10000);

    it("should find a valid discount", async () => {
      await createDiscount({ code: "SAVE20", type: "percentage", value: 20, validFrom, validTo });
      const discount = await findValidDiscountByCode("save20"); // case-insensitive search
      expect(discount).not.toBeNull();
      expect(discount?.code).toBe("SAVE20");
    });

    it("should return null for expired discount", async () => {
      await createDiscount({ 
        code: "EXPIRED", type: "percentage", value: 20, 
        validFrom: new Date(Date.now() - 20000), 
        validTo: new Date(Date.now() - 10000) 
      });
      const discount = await findValidDiscountByCode("EXPIRED");
      expect(discount).toBeNull();
    });

    it("should return null for inactive discount", async () => {
      const d = await createDiscount({ code: "INACTIVE", type: "percentage", value: 20, validFrom, validTo });
      d.isActive = false;
      await d.save();
      
      const discount = await findValidDiscountByCode("INACTIVE");
      expect(discount).toBeNull();
    });

    it("should return null if maxUses reached", async () => {
      const d = await createDiscount({ code: "MAXUSES", type: "percentage", value: 20, validFrom, validTo, maxUses: 1 });
      d.usesCount = 1;
      await d.save();

      const discount = await findValidDiscountByCode("MAXUSES");
      expect(discount).toBeNull();
    });
  });

  describe("incrementDiscountUsage", () => {
    it("should increment usage and respect maxUses with concurrent requests", async () => {
      const validFrom = new Date(Date.now() - 10000);
      const validTo = new Date(Date.now() + 10000);
      const discount = await createDiscount({ code: "LIMIT1", type: "percentage", value: 20, validFrom, validTo, maxUses: 1 });

      const session1 = await mongoose.startSession();
      const session2 = await mongoose.startSession();

      // Fire both concurrently
      const p1 = incrementDiscountUsage(discount._id.toString(), session1);
      const p2 = incrementDiscountUsage(discount._id.toString(), session2);

      const results = await Promise.allSettled([p1, p2]);
      
      const fulfilled = results.filter(r => r.status === "fulfilled");
      const rejected = results.filter(r => r.status === "rejected");

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      expect((rejected[0] as PromiseRejectedResult).reason.statusCode).toBe(409);

      session1.endSession();
      session2.endSession();
    });
  });
});
