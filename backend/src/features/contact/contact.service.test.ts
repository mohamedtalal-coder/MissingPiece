import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../app.js";
import { Contact } from "./contact.model.js";
import { createContactMessage, listContacts, updateContactStatus } from "./contact.service.js";
import { registerUser } from "../auth/auth.service.js";
import { User } from "../auth/user.model.js";
import jwt from "jsonwebtoken";

let mongoServer: MongoMemoryServer;
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
  await Contact.deleteMany({});
  await User.deleteMany({});
  const adminRes = await registerUser("Admin", "admin@example.com", "Password123!");
  await User.findByIdAndUpdate(adminRes.user.id, { role: "admin" });
  adminToken = jwt.sign({ userId: adminRes.user.id.toString(), role: "admin" }, "test-secret", { expiresIn: "7d" });
});

describe("Contact Service", () => {
  describe("createContactMessage", () => {
    it("succeeds and defaults to unread", async () => {
      const msg = await createContactMessage({ name: "N", email: "e@e.com", subject: "S", message: "M" });
      expect(msg.status).toBe("unread");
    });
  });

  describe("listContacts", () => {
    it("paginates and sorts newest first", async () => {
      await createContactMessage({ name: "1", email: "e@e.com", subject: "S", message: "M" });
      await new Promise(resolve => setTimeout(resolve, 10)); // assure different timestamps
      await createContactMessage({ name: "2", email: "e@e.com", subject: "S", message: "M" });
      
      const list = await listContacts({ page: 1, limit: 1 });
      expect(list.items.length).toBe(1);
      expect(list.items[0]!.name).toBe("2");
      expect(list.totalPages).toBe(2);
    });
  });

  describe("updateContactStatus", () => {
    it("transitions to valid status", async () => {
      const msg = await createContactMessage({ name: "N", email: "e@e.com", subject: "S", message: "M" });
      const updated = await updateContactStatus(msg._id.toString(), "read");
      expect(updated!.status).toBe("read");
    });
  });

  describe("HTTP API", () => {
    it("rate limits POST /api/contact after 5 requests", async () => {
      // 5 requests should pass
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/contact").send({ name: "John", email: "j@e.com", subject: "Valid Subject", message: "Valid Message." }).expect(201);
      }
      // 6th should 429
      await request(app).post("/api/contact").send({ name: "John", email: "j@e.com", subject: "Valid Subject", message: "Valid Message." }).expect(429);
    });

    it("requires admin for GET and PATCH", async () => {
      await request(app).get("/api/contact").expect(401); // no token
      
      const buyerRes = await registerUser("Buyer", "buyer@example.com", "Password123!");
      await request(app).get("/api/contact").set("Authorization", `Bearer ${buyerRes.token}`).expect(403);
      
      await request(app).get("/api/contact").set("Authorization", `Bearer ${adminToken}`).expect(200);
    });
  });
});
