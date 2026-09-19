import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const addressSchema = z.object({
  street: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  zipCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().trim().max(100).optional(),
  addresses: z.array(addressSchema).max(10).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });
