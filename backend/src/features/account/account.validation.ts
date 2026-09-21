import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const addressSchema = z.object({
  street: z.string().trim().min(5, "Street address must be at least 5 characters").max(200, "Street address must be at most 200 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters").max(100, "City must be at most 100 characters"),
  state: z.string().trim().min(2, "State/Province must be at least 2 characters").max(100, "State must be at most 100 characters"),
  zipCode: z.string().trim().min(3, "Zip/Postal code must be at least 3 characters").max(20, "Zip code must be at most 20 characters"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country must be at most 100 characters"),
  deletedAt: z.string().nullable().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  email: z.string().email("Please enter a valid email address").trim().max(100, "Email must be at most 100 characters").optional(),
  addresses: z.array(addressSchema).max(10, "You can save a maximum of 10 addresses").optional(),
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
