import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "../../../shared/middleware/requireAuth.js";
import { redis } from "../../../shared/utils/redis.js";
import { revokeAllUserTokens } from "../../../shared/utils/tokenRevocation.js";

jest.mock("ioredis", () => require("ioredis-mock"));

describe("requireAuth middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(async () => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    await redis.flushall();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it("rejects a token issued before a stored revocation timestamp", async () => {
    const userId = "user123";
    
    // Create token with iat in the past (e.g. 1 hour ago)
    const iat = Math.floor(Date.now() / 1000) - 3600;
    const token = jwt.sign({ userId, iat }, process.env["JWT_SECRET"]!, { algorithm: "HS256" });
    req.headers!.authorization = `Bearer ${token}`;

    // Revoke now
    await revokeAllUserTokens(userId);

    await requireAuth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: "Session expired, please log in again.",
    }));
  });

  it("still allows a token when Redis throws/is unreachable (fail-open)", async () => {
    const userId = "user123";
    const token = jwt.sign({ userId }, process.env["JWT_SECRET"]!, { algorithm: "HS256" });
    req.headers!.authorization = `Bearer ${token}`;

    // Force redis to throw
    const originalGet = redis.get.bind(redis);
    redis.get = jest.fn<any>().mockImplementation(() => Promise.reject(new Error("Redis connection failed")));

    try {
      await requireAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(); // Next called without error
      expect(req.userId).toBe(userId);
    } finally {
      redis.get = originalGet;
    }
  });

  it("allows a token that was issued after a revocation timestamp", async () => {
    const userId = "user123";
    
    // Revoke first
    await revokeAllUserTokens(userId);

    // Wait slightly to ensure timestamp is strictly older (or we can just mock timestamp)
    // Actually our revokeAllUserTokens uses Math.floor(Date.now() / 1000)
    // So if we create a token with iat = now + 10, it's considered after.
    const iat = Math.floor(Date.now() / 1000) + 10;
    const token = jwt.sign({ userId, iat }, process.env["JWT_SECRET"]!, { algorithm: "HS256" });

    req.headers!.authorization = `Bearer ${token}`;

    await requireAuth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.userId).toBe(userId);
  });
});
