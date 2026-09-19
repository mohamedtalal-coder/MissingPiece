
import { z } from "zod";

const imageUrl = z.string().url();

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
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    cursor: z.string().trim().optional(),
    category: z.string().trim().min(1).max(100).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(["price_asc", "price_desc", "newest"]).optional(),
    search: z.string().trim().min(1).max(100).optional(),
  })
  .refine(
    (d) =>
      d.minPrice === undefined ||
      d.maxPrice === undefined ||
      d.minPrice <= d.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    }
  );

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().default(0),
  category: z.string().trim().min(1).max(100),
  images: z.array(imageUrl).max(10).default([]),
  isActive: booleanFromFormData.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const slugParamSchema = z.string().trim().min(1);
