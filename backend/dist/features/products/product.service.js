import { Product } from "./product.model.js";
function slugify(input) {
    return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
export async function listProducts(params) {
    const filter = {};
    if (!params.includeInactive)
        filter.isActive = true;
    if (params.category)
        filter.category = params.category;
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        filter.price = {};
        if (params.minPrice !== undefined)
            filter.price.$gte = params.minPrice;
        if (params.maxPrice !== undefined)
            filter.price.$lte = params.maxPrice;
    }
    if (params.search) {
        filter.$text = { $search: params.search };
    }
    if (params.cursor) {
        if (params.sort === "newest" || !params.sort) {
            filter._id = { $lt: params.cursor };
        }
    }
    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { _id: -1 } };
    const sortOption = sortMap[params.sort ?? "newest"];
    const skip = params.cursor ? 0 : (params.page - 1) * params.limit;
    const [items, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(skip).limit(params.limit).lean(),
        Product.countDocuments(filter),
    ]);
    const nextCursor = items.length > 0 ? items[items.length - 1]?._id?.toString() : null;
    return { items, total, page: params.page, limit: params.limit, nextCursor, totalPages: Math.ceil(total / params.limit) };
}
export async function getProductBySlug(slug, includeInactive = false) {
    const filter = { slug };
    if (!includeInactive)
        filter.isActive = true;
    return Product.findOne(filter).lean();
}
export async function getProductById(id) {
    return Product.findById(id).lean();
}
export async function createProduct(input, attempt = 0) {
    const base = slugify(input.name);
    const slug = attempt === 0 ? base : `${base}-${attempt}`;
    const doc = { ...input, slug };
    Object.keys(doc).forEach((key) => doc[key] === undefined && delete doc[key]);
    try {
        return await Product.create(doc);
    }
    catch (error) {
        if (error.code === 11000 && error.keyPattern?.slug) {
            if (attempt >= 3)
                throw new Error("Could not generate a unique slug after 3 attempts");
            return createProduct(input, attempt + 1);
        }
        throw error;
    }
}
export async function updateProduct(id, input) {
    // Slug intentionally NOT regenerated on rename — keeps existing links/bookmarks stable.
    return Product.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean();
}
export async function softDeleteProduct(id) {
    return Product.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
}
export async function listCategories() {
    return Product.distinct("category", { isActive: true });
}
//# sourceMappingURL=product.service.js.map