import { rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "../utils/redis.js";

function rateLimitHandler(_req: Request, res: Response) {
  res.status(429).json({
    success: false,
    message: "Too many requests — please try again later",
  });
}

function getIpBucket(ip: string): string {
  if (ip.includes(".")) {
    return ip;
  }
  if (ip.includes(":")) {
    return ip.split(":").slice(0, 4).join(":");
  }
  return ip;
}

function keyByUser(req: Request): string {
  const ip = req.ip ?? req.headers["x-forwarded-for"]?.toString() ?? "unknown";
  return req.userId ?? getIpBucket(ip);
}

function keyByIp(req: Request): string {
  const ip = req.ip ?? req.headers["x-forwarded-for"]?.toString() ?? "unknown";
  return getIpBucket(ip);
}

const store = new RedisStore({
  sendCommand: async (...args: string[]) => {
    try {
      return (await redis.call(...(args as [string, ...string[]]))) as RedisReply;
    } catch (error) {
      console.warn("Redis rate limiter store error:", error);
      throw error;
    }
  },
});

const sharedOpts = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  handler: rateLimitHandler,
  validate: false,
  store,
  passOnStoreError: true, // Fail open if Redis is down
};


export const cartReadLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 120,
  keyGenerator: (req) => `cart_read:${keyByUser(req)}`,
});

export const cartWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: (req) => `cart_write:${keyByUser(req)}`,
});

export const mergeLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req) => `merge:${keyByUser(req)}`,
});

export const validateLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `validate:${keyByIp(req)}`,
});

export const productReadLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: (req) => `product_read:${keyByIp(req)}`,
});

export const contactSubmitLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  keyGenerator: (req) => `contact_submit:${keyByIp(req)}`,
});

export const accountWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `account_write:${keyByUser(req)}`,
});

export const accountPasswordLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => `account_password:${keyByUser(req)}`,
});

export const wishlistWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `wishlist_write:${keyByUser(req)}`,
});

export const orderWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `order_write:${keyByUser(req)}`,
});

export const registerLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `register:${keyByIp(req)}`,
});

export const loginLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `login:${keyByIp(req)}`,
});

export const resendVerificationLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 5 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => `resend_verification:${keyByIp(req)}`,
});

export const verifyEmailLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `verify_email:${keyByIp(req)}`,
});

export const discountValidateLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: (req) => `discount_val:${keyByIp(req)}`,
});

export const reviewReadLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyGenerator: (req) => `review_read:${keyByIp(req)}`,
});

export const reviewWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `review_write:${keyByUser(req)}`,
});

export const paymentLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `payment:${keyByUser(req)}`,
});

export const adminRateLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 50,
  keyGenerator: (req) => `admin_action:${keyByUser(req)}`,
});
