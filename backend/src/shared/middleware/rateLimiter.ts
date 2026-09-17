import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

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

const sharedOpts = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  handler: rateLimitHandler,
  validate: false,
};

export const cartReadLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 120,
  keyGenerator: keyByUser,
});

export const cartWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: keyByUser,
});

export const mergeLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: keyByUser,
});

export const validateLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: keyByIp,
});

export const productReadLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: keyByIp,
});

export const contactSubmitLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  keyGenerator: keyByIp,
});

export const accountWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: keyByUser,
});

export const wishlistWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: keyByUser,
});

export const orderWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: keyByUser,
});

export const registerLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: keyByIp,
});

export const loginLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: keyByIp,
});

export const discountValidateLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: keyByIp,
});

export const reviewReadLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyGenerator: keyByIp,
});

export const reviewWriteLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: keyByUser,
});

export const paymentLimiter = rateLimit({
  ...sharedOpts,
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: keyByUser,
});
