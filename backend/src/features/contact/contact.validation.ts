import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Please enter a valid email address").trim().max(100, "Email must be at most 100 characters"),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters long").max(150, "Subject must be at most 150 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters long").max(1000, "Message must be at most 1000 characters"),
});

export const contactStatusSchema = z.object({
  status: z.enum(["unread", "read", "resolved"]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
