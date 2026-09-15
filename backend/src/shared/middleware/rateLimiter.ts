import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response } from "express";

function rateLimitHandler(_req: Request, res: Response) {
  res.status(429).json({
    success: false,
    message: "Too many requests — please try again later",
  });
}

function keyByUser(req: Request): string {
  return req.userId ?? ipKeyGenerator(req.ip ?? "unknown");
}

function keyByIp(req: Request): string {
  return ipKeyGenerator(req.ip ?? "unknown");
}

const sharedOpts = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  handler: rateLimitHandler,
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
