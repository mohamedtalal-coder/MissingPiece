import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";

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
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email is already registered") as Error & {
      statusCode?: number;
    };

    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = generateToken(user._id.toString(), user.role);

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
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password") as Error & {
      statusCode?: number;
    };

    error.statusCode = 401;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password") as Error & {
      statusCode?: number;
    };

    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id.toString(), user.role);

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