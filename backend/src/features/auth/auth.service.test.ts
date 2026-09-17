import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";
import { registerUser, loginUser } from "./auth.service.js";
import { registerSchema } from "./auth.validation.js";

let mongoServer: MongoMemoryServer;

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

afterEach(async () => {
  await User.deleteMany({});
});

describe("Auth Service", () => {
  describe("registerUser", () => {
    it("succeeds with valid input and returns a token", async () => {
      const { user, token } = await registerUser("Test User", "test@example.com", "Password123!");
      expect(user.email).toBe("test@example.com");
      expect(user.role).toBe("buyer");
      
      const payload = jwt.verify(token, "test-secret") as { userId: string, role: string };
      expect(payload.userId).toBe(user.id.toString());
      expect(payload.role).toBe("buyer");
    });

    it("rejects a duplicate email", async () => {
      await registerUser("User 1", "duplicate@example.com", "Password123!");
      await expect(registerUser("User 2", "duplicate@example.com", "Password123!"))
        .rejects.toThrow(/E11000/);
    });

    it("hashes the password correctly", async () => {
      await registerUser("Test User", "hash@example.com", "SecretPass1!");
      const userInDb = await User.findOne({ email: "hash@example.com" }).select("+passwordHash");
      expect(userInDb).toBeDefined();
      expect(userInDb!.passwordHash).not.toBe("SecretPass1!");
      const isMatch = await bcrypt.compare("SecretPass1!", userInDb!.passwordHash);
      expect(isMatch).toBe(true);
    });
  });

  describe("loginUser", () => {
    beforeEach(async () => {
      await registerUser("Login User", "login@example.com", "LoginPass1!");
    });

    it("succeeds with correct credentials", async () => {
      const { user, token } = await loginUser("login@example.com", "LoginPass1!");
      expect(user.email).toBe("login@example.com");
      expect(token).toBeDefined();
    });

    it("rejects wrong password with a generic message", async () => {
      await expect(loginUser("login@example.com", "WrongPass1!"))
        .rejects.toThrow("Invalid email or password");
    });

    it("rejects nonexistent email with the same generic message", async () => {
      await expect(loginUser("nonexistent@example.com", "SomePass1!"))
        .rejects.toThrow("Invalid email or password");
    });
  });

  describe("Zod validation", () => {
    it("rejects weak passwords and invalid emails", () => {
      expect(registerSchema.safeParse({ name: "A", email: "invalid", password: "Password123!" }).success).toBe(false);
      expect(registerSchema.safeParse({ name: "A", email: "test@ex.com", password: "short" }).success).toBe(false); // length
      expect(registerSchema.safeParse({ name: "A", email: "test@ex.com", password: "lowercase1!" }).success).toBe(false); // no uppercase
      expect(registerSchema.safeParse({ name: "A", email: "test@ex.com", password: "UPPERCASE1!" }).success).toBe(false); // no lowercase
      expect(registerSchema.safeParse({ name: "A", email: "test@ex.com", password: "NoSpecialChar1" }).success).toBe(false); // no symbol
    });

    it("accepts valid payload", () => {
      expect(registerSchema.safeParse({ name: "Valid User", email: "valid@example.com", password: "ValidPass1!" }).success).toBe(true);
    });
  });
});
