import { jest } from "@jest/globals";

// ESM: jest.mock() is not hoisted — use unstable_mockModule + dynamic import
// so connectDB is mocked before app loads.
await jest.unstable_mockModule("../config/db.js", () => ({
  connectDB: jest.fn(async () => undefined),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");

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
