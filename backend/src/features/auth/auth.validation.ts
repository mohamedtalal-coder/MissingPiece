import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().regex(emailRegex, "Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().regex(emailRegex, "Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().regex(emailRegex, "Invalid email"),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().regex(emailRegex, "Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().regex(emailRegex, "Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().regex(emailRegex, "Invalid email"),
});