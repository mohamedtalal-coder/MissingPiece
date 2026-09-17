import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../app.js";
import { User } from "../../../features/auth/user.model.js";
import { getUserProfile, updateUserProfile } from "../../../features/account/account.service.js";
import { registerUser } from "../../../features/auth/auth.service.js";

let mongoServer: MongoMemoryServer;
let testToken: string;
let testUserId: string;

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
  await User.deleteMany({});
  const { user, token } = await registerUser("Test User", "test@example.com", "Password123!");
  testUserId = user.id.toString();
  testToken = token;
});

describe("Account Service & Controller", () => {
  describe("getUserProfile (Service)", () => {
    it("returns the user without passwordHash present", async () => {
      const profile = await getUserProfile(testUserId);
      expect(profile).toBeDefined();
      expect(profile!.email).toBe("test@example.com");
      expect((profile as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe("updateUserProfile (Service)", () => {
    it("updates name, email, and addresses successfully", async () => {
      const updated = await updateUserProfile(testUserId, {
        name: "New Name",
        email: "newemail@example.com",
        addresses: [{ street: "123 Main St", city: "Anytown", state: "NY", zipCode: "12345", country: "USA" }]
      });
      expect(updated!.name).toBe("New Name");
      expect(updated!.email).toBe("newemail@example.com");
      expect(updated!.addresses!.length).toBe(1);
    });

    it("throws 11000 on duplicate email", async () => {
      await registerUser("Another User", "another@example.com", "Password123!");
      await expect(
        updateUserProfile(testUserId, { email: "another@example.com" })
      ).rejects.toThrow(/E11000/);
    });
  });

  describe("HTTP API (Controller)", () => {
    it("silently strips fields not in schema (e.g. role) avoiding privilege escalation", async () => {
      const response = await request(app)
        .put("/api/account/profile")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          name: "Hacked Name",
          role: "admin", // malicious field
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Hacked Name");

      const userInDb = await User.findById(testUserId);
      expect(userInDb!.role).toBe("buyer"); // must not change
    });
  });
});
