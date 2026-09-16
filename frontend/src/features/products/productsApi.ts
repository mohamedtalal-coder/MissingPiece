const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
    slug: string;
    isActive: boolean;
}

export interface ListProductsParams {
    page?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "price_asc" | "price_desc" | "newest";
    search?: string;
}

export interface ListProductsResponse {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    nextCursor: string | null;
    totalPages: number;
}

export async function listProducts(params: ListProductsParams): Promise<ListProductsResponse> {
    const url = new URL(`${API_URL}/products`);

    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.category) url.searchParams.append("category", params.category);
    if (params.minPrice) url.searchParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice) url.searchParams.append("maxPrice", params.maxPrice.toString());
    if (params.sort) url.searchParams.append("sort", params.sort);
    if (params.search) url.searchParams.append("search", params.search);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch products");

    const data = await res.json();
    return data;
}

export async function listCategories(): Promise<string[]> {
    const url = new URL(`${API_URL}/products/categories`);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();
    return data.categories;
}

export async function getProduct(slug: string): Promise<Product> {
    const url = new URL(`${API_URL}/products/${slug}`);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch product");

    const data = await res.json();
    return data.product;
}
