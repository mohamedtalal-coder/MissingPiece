
import { z } from "zod";

const imageUrl = z.string().url("Each image must be a valid URL");

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return value === "true";
  });

export const listProductsQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int("Page must be a whole number")
      .positive("Page must be at least 1")
      .default(1),
    limit: z.coerce
      .number()
      .int("Limit must be a whole number")
      .positive("Limit must be at least 1")
      .max(50, "Limit cannot exceed 50")
      .default(20),
    cursor: z.string().trim().optional(),
    category: z.string().trim().min(1, "Category cannot be empty").max(100, "Category must be at most 100 characters").optional(),
    minPrice: z.coerce.number().nonnegative("Min price cannot be negative").optional(),
    maxPrice: z.coerce.number().nonnegative("Max price cannot be negative").optional(),
    sort: z.enum(["price_asc", "price_desc", "newest"], "Sort must be one of: price_asc, price_desc, newest").optional(),
    search: z.string().trim().min(1, "Search query cannot be empty").max(100, "Search query must be at most 100 characters").optional(),
  })
  .refine(
    (d) =>
      d.minPrice === undefined ||
      d.maxPrice === undefined ||
      d.minPrice <= d.maxPrice,
    {
      message: "Min price must be less than or equal to max price",
      path: ["minPrice"],
    }
  );

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200, "Product name must be at most 200 characters"),
  description: z.string().trim().max(5000, "Description must be at most 5000 characters").optional(),
  price: z.coerce
    .number()
    .nonnegative("Price cannot be negative"),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative")
    .default(0),
  category: z.string().trim().min(1, "Category is required").max(100, "Category must be at most 100 characters"),
  images: z.array(imageUrl).max(10, "You can upload a maximum of 10 images").default([]),
  isActive: booleanFromFormData.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const slugParamSchema = z.string().trim().min(1, "Product slug is required");
