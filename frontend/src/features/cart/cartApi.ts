import client from "../../api/client";

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface ValidatedCartItem {
    productId: string;
    quantity: number;
    valid: boolean;
    reason?: string;
    product?: {
        name: string;
        price: number;
        image: string | undefined;
        stock: number;
    };
}

interface CartItemsResponse {
    success: true;
    items: CartItem[];
}

interface ValidateResponse {
    success: true;
    items: ValidatedCartItem[];
}

export async function getCart(): Promise<CartItem[]> {
    const { data } = await client.get<CartItemsResponse>("/cart");
    return data.items;
}

export async function addItem(productId: string, quantity = 1): Promise<CartItem[]> {
    const { data } = await client.post<CartItemsResponse>("/cart/items", { productId, quantity });
    return data.items;
}

export async function updateItemQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    const { data } = await client.patch<CartItemsResponse>(`/cart/items/${productId}`, { quantity });
    return data.items;
}

export async function removeItem(productId: string): Promise<CartItem[]> {
    const { data } = await client.delete<CartItemsResponse>(`/cart/items/${productId}`);
    return data.items;
}

export async function mergeGuestCart(items: CartItem[]): Promise<CartItem[]> {
    const { data } = await client.post<CartItemsResponse>("/cart/merge", { items });
    return data.items;
}

export async function validateCartItems(items: CartItem[]): Promise<ValidatedCartItem[]> {
    const { data } = await client.post<ValidateResponse>("/cart/validate", { items });
    return data.items;
}