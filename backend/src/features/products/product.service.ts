import { Product } from "./product.model.js";
import type { Types } from "mongoose";

const categoryAliases: Record<string, string[]> = {
  jigsaw: ["jigsaw", "puzzle", "Jigsaw Puzzles"],
  "3d": ["3d", "3d-puzzle", "3D Puzzles", "3D Architectural"],
  wooden: ["wooden", "chess", "Wooden Puzzles"],
  mystery: ["mystery", "puzzle-game", "Mystery Puzzles"],
};

export function resolveCategoryFilter(category: string): string | { $in: string[] } {
  const aliases = categoryAliases[category.toLowerCase()];
  return aliases ? { $in: aliases } : category;
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export interface ListProductsParams {
  page: number;
  limit: number;
  cursor?: string | undefined;
  category?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sort?: "price_asc" | "price_desc" | "newest" | undefined;
  search?: string | undefined;
  includeInactive?: boolean | undefined; // admin-only, set by controller
}

export async function listProducts(params: ListProductsParams) {
  const filter: Record<string, unknown> = {};
  if (!params.includeInactive) filter.isActive = true;
  if (params.category) {
    filter.category = resolveCategoryFilter(params.category);
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (params.minPrice !== undefined) priceFilter.$gte = params.minPrice;
    if (params.maxPrice !== undefined) priceFilter.$lte = params.maxPrice;
    filter.price = priceFilter;
  }

  const searchTerm = params.search?.trim();
  if (searchTerm) {
    const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: safeTerm, $options: 'i' } },
      { description: { $regex: safeTerm, $options: 'i' } }
    ];
  }

  if (params.cursor) {
    if (params.sort === "newest" || !params.sort) {
      filter._id = { $lt: params.cursor };
    }
  }

  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { _id: -1 } } as const;
  const sortOption = sortMap[params.sort ?? "newest"];
  const skip = params.cursor ? 0 : (params.page - 1) * params.limit;

  let query = Product.find(filter);

  const [items, total] = await Promise.all([
    query.sort(sortOption as Record<string, 1 | -1>).skip(skip).limit(params.limit).lean(),
    Product.countDocuments(filter),
  ]);

  const nextCursor = items.length > 0 ? items[items.length - 1]?._id?.toString() : null;

  return { items, total, page: params.page, limit: params.limit, nextCursor, totalPages: Math.ceil(total / params.limit) };
}

export async function getProductBySlug(slug: string, includeInactive = false) {
  const filter: Record<string, unknown> = { slug };
  if (!includeInactive) filter.isActive = true;
  return Product.findOne(filter).lean();
}

export async function getProductById(id: string) {
  return Product.findById(id).lean();
}

export interface CreateProductInput {
  name: string;
  description?: string | undefined;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export interface CreateProductOutput {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
}

export async function createProduct(input: CreateProductInput, attempt = 0): Promise<CreateProductOutput> {
  const base = slugify(input.name);
  const slug = attempt === 0 ? base : `${base}-${attempt}`;
  
  const doc = { ...input, slug };
  Object.keys(doc).forEach(
    (key) => doc[key as keyof typeof doc] === undefined && delete doc[key as keyof typeof doc]
  );
  
  try {
    return (await Product.create(doc as Omit<CreateProductInput, "description"> & { description?: string; slug: string })) as unknown as CreateProductOutput;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: unknown }).code === 11000) {
      if ("keyPattern" in error && (error as { keyPattern: { slug?: unknown } }).keyPattern?.slug) {
        if (attempt >= 3) throw new Error("Could not generate a unique slug after 3 attempts", { cause: error });
        return createProduct(input, attempt + 1);
      }
    }
    throw error;
  }
}

export type UpdateProductInput = {
  [K in keyof CreateProductInput]?: CreateProductInput[K] | undefined;
};

export async function updateProduct(id: string, input: UpdateProductInput) {
  // Slug intentionally NOT regenerated on rename — keeps existing links/bookmarks stable.
  const update = input.images?.length === 0
    ? { ...input, images: undefined }
    : input;

  return Product.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
}

export async function softDeleteProduct(id: string) {
  return Product.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
}

export async function listCategories() {
  return Product.distinct("category", { isActive: true });
}
