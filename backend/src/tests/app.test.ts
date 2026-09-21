import { jest } from "@jest/globals";

// Mock connectDB so the per-request middleware doesn't require a real MONGO_URI
jest.mock("../config/db.js", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

import request from "supertest";
import app from "../app.js";

describe("Application smoke tests", () => {
  it("reports a healthy API", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns a JSON 404 for an unknown API route", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found: /api/does-not-exist");
  });
});
