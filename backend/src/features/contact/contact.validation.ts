import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").trim().max(100),
  subject: z.string().trim().min(2, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters long").max(1000),
});

export const contactStatusSchema = z.object({
  status: z.enum(["unread", "read", "resolved"]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
