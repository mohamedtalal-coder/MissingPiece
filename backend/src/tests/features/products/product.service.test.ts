import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../app.js";
import { Product } from "../../../features/products/product.model.js";
import { createProduct, updateProduct, softDeleteProduct, listProducts } from "../../../features/products/product.service.js";
import { Order } from "../../../features/orders/order.model.js";
import { registerUser } from "../../../features/auth/auth.service.js";
import { User } from "../../../features/auth/user.model.js";
import jwt from "jsonwebtoken";

let mongoServer: MongoMemoryServer;
let buyerToken: string;
let adminToken: string;

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
  await Product.deleteMany({});
  await Order.deleteMany({});
  await User.deleteMany({});
  
  const buyerRes = await registerUser("Buyer", "buyer@example.com", "Password123!");
  buyerToken = buyerRes.token;

  const adminRes = await registerUser("Admin", "admin@example.com", "Password123!");
  await User.findByIdAndUpdate(adminRes.user.id, { role: "admin" });
  
  adminToken = jwt.sign({ userId: adminRes.user.id.toString(), role: "admin" }, "test-secret", { expiresIn: "7d" });
});

describe("Product Service", () => {
  describe("listProducts", () => {
    it("filters and paginates correctly", async () => {
      await Product.create([
        { name: "P1", slug: "p1", description: "D", price: 10, category: "cat1", stock: 10 },
        { name: "P2", slug: "p2", description: "D", price: 20, category: "cat2", stock: 10 },
        { name: "P3", slug: "p3", description: "Match me", price: 30, category: "cat1", stock: 10, isActive: false },
      ]);

      const res1 = await listProducts({ page: 1, limit: 10, category: "cat1", minPrice: 5, maxPrice: 15 });
      expect(res1.items.length).toBe(1);
      expect(res1.items[0]!.name).toBe("P1");

      const res2 = await listProducts({ page: 1, limit: 10, search: "Match" });
      expect(res2.items.length).toBe(0); // P3 is inactive

      const res3 = await listProducts({ page: 1, limit: 10, search: "Match", includeInactive: true });
      expect(res3.items.length).toBe(1); // P3 included
      expect(res3.items[0]!.name).toBe("P3");
    });

    it("ranks name matches above description-only matches via text index", async () => {
      await Product.create([
        {
          name: "Quiet Landscape",
          slug: "quiet-landscape",
          description: "Features an oak motif in the border",
          price: 40,
          category: "cat1",
          stock: 5,
        },
        {
          name: "Oak Atlas Edition",
          slug: "oak-atlas-edition",
          description: "A cartographic commission",
          price: 90,
          category: "cat1",
          stock: 5,
        },
      ]);
      await Product.syncIndexes();

      const res = await listProducts({ page: 1, limit: 10, search: "oak" });
      expect(res.items.length).toBe(2);
      expect(res.items[0]!.name).toBe("Oak Atlas Edition");
    });
  });

  describe("createProduct & updateProduct", () => {
    it("slugifies correctly and handles collisions", async () => {
      const p1 = await createProduct({ name: "My Product!", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      expect(p1.slug).toBe("my-product");

      const p2 = await createProduct({ name: "My Product!", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      expect(p2.slug).toBe("my-product-1");
      
      const p3 = await createProduct({ name: "My Product!", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      expect(p3.slug).toBe("my-product-2");

      const p4 = await createProduct({ name: "My Product!", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      expect(p4.slug).toBe("my-product-3");

      await expect(
        createProduct({ name: "My Product!", description: "D", price: 10, category: "cat", stock: 10, images: [] })
      ).rejects.toThrow("Could not generate a unique slug after 3 attempts");
    });

    it("does not change slug on update", async () => {
      const p = await createProduct({ name: "Original Name", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      const updated = await updateProduct(p._id.toString(), { name: "New Name" });
      expect(updated!.slug).toBe("original-name"); // slug unchanged
      expect(updated!.name).toBe("New Name");
    });
  });

  describe("softDeleteProduct", () => {
    it("hides product from listings but keeps it in DB and populated orders", async () => {
      const p = await createProduct({ name: "To Delete", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      
      const order = await Order.create({
        user: new mongoose.Types.ObjectId(),
        items: [{ product: p._id, quantity: 1, priceAtPurchase: 10 }],
        totalAmount: 10,
        shippingAddress: { street: "S", city: "C", state: "S", zipCode: "Z", country: "C" },
        status: "pending"
      });

      await softDeleteProduct(p._id.toString());
      
      const listing = await listProducts({ page: 1, limit: 10 });
      expect(listing.items.length).toBe(0); // hidden

      const populatedOrder = await Order.findById(order._id).populate("items.product");
      expect((populatedOrder!.items[0]!.product as unknown as { name: string }).name).toBe("To Delete"); // still resolves
    });
  });

  describe("HTTP API Authorization", () => {
    it("rejects unauthorized and non-admin requests", async () => {
      const p = await createProduct({ name: "API Test", description: "D", price: 10, category: "cat", stock: 10, images: [] });
      
      await request(app).post("/api/products").send({ name: "X", description: "X", price: 10, category: "cat", stock: 10 }).expect(401);
      
      await request(app).post("/api/products").set("Authorization", `Bearer ${buyerToken}`).send({ name: "X", description: "X", price: 10, category: "cat", stock: 10 }).expect(403);
      await request(app).patch(`/api/products/${p._id}`).set("Authorization", `Bearer ${buyerToken}`).send({ price: 20 }).expect(403);
      await request(app).delete(`/api/products/${p._id}`).set("Authorization", `Bearer ${buyerToken}`).expect(403);
      
      await request(app).post("/api/products").set("Authorization", `Bearer ${adminToken}`).send({ name: "Admin Prod", description: "X", price: 10, category: "cat", stock: 10, images: [] }).expect(201);
      await request(app).patch(`/api/products/${p._id}`).set("Authorization", `Bearer ${adminToken}`).send({ price: 20 }).expect(200);
      await request(app).delete(`/api/products/${p._id}`).set("Authorization", `Bearer ${adminToken}`).expect(200);
    });
  });
});
