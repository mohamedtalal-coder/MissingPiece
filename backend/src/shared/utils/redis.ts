import { Redis } from "ioredis";

const db = process.env.NODE_ENV === "test" ? process.env.JEST_WORKER_ID || 1 : 0;
export const redis = new Redis(process.env["REDIS_URL"] || `redis://localhost:6379/${db}`);

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
