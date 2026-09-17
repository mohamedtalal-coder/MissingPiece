import { Redis } from "ioredis";

export const redis = new Redis(process.env["REDIS_URL"] || "redis://localhost:6379");

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
