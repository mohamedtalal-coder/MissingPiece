import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../../app.js";
import { User } from "../../../features/auth/user.model.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { redis } from "../../../shared/utils/redis.js";

jest.mock("ioredis", () => require("ioredis-mock"));

describe("Auth Routes", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await redis.flushall();
  });

  it("POST /api/auth/logout revokes the token and makes it unusable", async () => {
    // 1. Register a user
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      });

    expect(regRes.status).toBe(201);
    const token = regRes.body.data.token;

    // 2. Use the token to access a protected route (e.g., GET /api/account/profile)
    const profileRes1 = await request(app)
      .get("/api/account/profile")
      .set("Authorization", `Bearer ${token}`);
    
    expect(profileRes1.status).toBe(200);

    // 3. Logout
    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    
    expect(logoutRes.status).toBe(200);

    // 4. Try to access the protected route again with the SAME token
    const profileRes2 = await request(app)
      .get("/api/account/profile")
      .set("Authorization", `Bearer ${token}`);
    
    expect(profileRes2.status).toBe(401);
    expect(profileRes2.body.message).toMatch(/Session expired/);
  });

  it("Rate Limiter correctly uses RedisStore instead of MemoryStore", async () => {
    // Make enough requests to trigger the register rate limit
    // registerLimiter allows 10 requests per 15 minutes.
    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/auth/register").send({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: "Password123!",
      });
    }

    const limitedRes = await request(app).post("/api/auth/register").send({
      name: "Limited User",
      email: "limited@example.com",
      password: "Password123!",
    });

    expect(limitedRes.status).toBe(429);

    // Verify it used Redis by checking if redis has keys
    const keys = await redis.keys("rl:*"); // rate-limit-redis uses rl: prefix by default
    expect(keys.length).toBeGreaterThan(0);
  });
});
