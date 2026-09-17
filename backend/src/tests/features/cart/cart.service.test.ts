import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../app.js";
import { Cart } from "../../../features/cart/cart.model.js";
import { Product } from "../../../features/products/product.model.js";
import { User } from "../../../features/auth/user.model.js";
import { addItem, updateItemQuantity, removeItem, mergeGuestCart, validateCartItems, getCart } from "../../../features/cart/cart.service.js";
import { registerUser } from "../../../features/auth/auth.service.js";

let mongoServer: MongoMemoryServer;
let userId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env["JWT_SECRET"] = "test-secret";
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Cart.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});
  const res = await registerUser("Cart User", "cart@example.com", "Password123!");
  userId = res.user.id.toString();
});

describe("Cart Service", () => {
  describe("addItem", () => {
    it("handles concurrent addItem calls for the SAME new product by retrying correctly", async () => {
      const p = await Product.create({ name: "P1", slug: "p1", description: "D", price: 10, category: "cat", stock: 100 });
      const pid = p._id.toString();

      await Promise.all([
        addItem(userId, pid, 2),
        addItem(userId, pid, 3)
      ]);

      const cart = await getCart(userId);
      expect(cart.length).toBe(1);
      expect(cart[0]!.quantity).toBe(5);
    });

    it("caps quantity at 1000", async () => {
      const p = await Product.create({ name: "P2", slug: "p2", description: "D", price: 10, category: "cat", stock: 10000 });
      await addItem(userId, p._id.toString(), 900);
      await addItem(userId, p._id.toString(), 200);
      
      const cart = await getCart(userId);
      expect(cart[0]!.quantity).toBe(1000); // capped
    });

    it("handles concurrent addItem calls and never exceeds 1000", async () => {
      const p = await Product.create({ name: "P3", slug: "p3", description: "D", price: 10, category: "cat", stock: 10000 });
      const pid = p._id.toString();

      // Start near the limit
      await addItem(userId, pid, 900);

      // Fire 10 concurrent requests of 50 each
      await Promise.all(
        Array.from({ length: 10 }).map(() => addItem(userId, pid, 50))
      );

      const cart = await getCart(userId);
      expect(cart[0]!.quantity).toBe(1000);
    });
  });

  describe("updateItemQuantity & removeItem", () => {
    it("updates and removes correctly without side effects", async () => {
      const p1 = await Product.create({ name: "P1", slug: "p1", description: "D", price: 10, category: "cat", stock: 100 });
      const p2 = await Product.create({ name: "P2", slug: "p2", description: "D", price: 20, category: "cat", stock: 100 });
      
      await addItem(userId, p1._id.toString(), 1);
      await addItem(userId, p2._id.toString(), 2);
      
      await updateItemQuantity(userId, p1._id.toString(), 5);
      let cart = await getCart(userId);
      expect(cart.find(i => i.productId.toString() === p1._id.toString())!.quantity).toBe(5);
      
      await removeItem(userId, p1._id.toString());
      cart = await getCart(userId);
      expect(cart.length).toBe(1);
      expect(cart[0]!.productId.toString()).toBe(p2._id.toString());

      // removing nonexistent is no-op
      await removeItem(userId, p1._id.toString());
      cart = await getCart(userId);
      expect(cart.length).toBe(1);
    });
  });

  describe("mergeGuestCart", () => {
    it("sums overlapping and adds new ones", async () => {
      const p1 = await Product.create({ name: "P1", slug: "p1", description: "D", price: 10, category: "cat", stock: 100 });
      const p2 = await Product.create({ name: "P2", slug: "p2", description: "D", price: 20, category: "cat", stock: 100 });
      
      await addItem(userId, p1._id.toString(), 2);

      const guestItems = [
        { productId: p1._id.toString(), quantity: 3 }, // overlap
        { productId: p2._id.toString(), quantity: 1 }  // new
      ];

      const merged = await mergeGuestCart(userId, guestItems);
      expect(merged.length).toBe(2);
      expect(merged.find(i => i.productId.toString() === p1._id.toString())!.quantity).toBe(5);
      expect(merged.find(i => i.productId.toString() === p2._id.toString())!.quantity).toBe(1);
    });
  });

  describe("validateCartItems", () => {
    it("validates items returning proper valid status and DB prices", async () => {
      const valid = await Product.create({ name: "P1", slug: "p1", description: "D", price: 10, category: "cat", stock: 100 });
      const oos = await Product.create({ name: "P2", slug: "p2", description: "D", price: 20, category: "cat", stock: 0 });
      const inactive = await Product.create({ name: "P3", slug: "p3", description: "D", price: 30, category: "cat", stock: 10, isActive: false });

      const results = await validateCartItems([
        { productId: valid._id.toString(), quantity: 2 },
        { productId: oos._id.toString(), quantity: 1 },
        { productId: inactive._id.toString(), quantity: 1 },
        { productId: new mongoose.Types.ObjectId().toString(), quantity: 1 },
      ]);

      expect(results[0]!.valid).toBe(true);
      expect(results[0]!.product!.price).toBe(10); // DB price

      expect(results[1]!.valid).toBe(false);
      expect(results[1]!.reason).toMatch(/Out of stock/);

      expect(results[2]!.valid).toBe(false);
      expect(results[2]!.reason).toBe("Product is no longer available");

      expect(results[3]!.valid).toBe(false);
      expect(results[3]!.reason).toBe("Product not found");
    });
  });

  describe("HTTP API", () => {
    it("protects endpoints except POST /validate", async () => {
      await request(app).get("/api/cart").expect(401);
      await request(app).post("/api/cart/items").send({ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }).expect(401);
      
      const p = await Product.create({ name: "API Test", slug: "api-test", description: "D", price: 10, category: "cat", stock: 10 });
      const res = await request(app).post("/api/cart/validate").send({ items: [{ productId: p._id.toString(), quantity: 1 }] });
      expect(res.status).toBe(200); // no auth required
    });
  });
});
