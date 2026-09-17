import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";
import { redis } from "../../shared/utils/redis.js";

function generateToken(userId: string, role: string): string {
const secret = process.env["JWT_SECRET"];

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId, role },
    secret,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = generateToken(user._id.toString(), user.role);

  await redis.set(
    `user:${user._id}`,
    JSON.stringify({ role: user.role }),
    "EX",
    7 * 24 * 60 * 60
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id.toString(), user.role);

  await redis.set(
    `user:${user._id}`,
    JSON.stringify({ role: user.role }),
    "EX",
    7 * 24 * 60 * 60
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}