import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as cartAPI from "./cartApi";
import type { CartItem } from "./cartApi";

const GUEST_CART_KEY = "guest_cart";

function isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
}

function readGuestCart(): CartItem[] {
    try {
        return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function writeGuestCart(items: CartItem[]): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}
export interface CartContextValue {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    mergeGuestCartOnLogin: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (isAuthenticated()) {
                    setItems(await cartAPI.getCart());
                } else {
                    setItems(readGuestCart());
                }
            } catch {
                setError("Could not load cart");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const addItem = useCallback(async (productId: string, quantity = 1) => {
        setError(null);
        try {
            if (isAuthenticated()) {
                setItems(await cartAPI.addItem(productId, quantity));
            } else {
                const current = readGuestCart();
                const existing = current.find((i) => i.productId === productId);
                const next = existing
                    ? current.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
                    : [...current, { productId, quantity }];
                writeGuestCart(next);
                setItems(next);
            }
        } catch {
            setError("Could not add item");
        }
    }, []);

    const updateQuantity = useCallback(async (productId: string, quantity: number) => {
        setError(null);
        try {
            if (isAuthenticated()) {
                setItems(await cartAPI.updateItemQuantity(productId, quantity));
            } else {
                const next = readGuestCart().map((i) => (i.productId === productId ? { ...i, quantity } : i));
                writeGuestCart(next);
                setItems(next);
            }
        } catch {
            setError("Could not update quantity");
        }
    }, []);

    const removeItem = useCallback(async (productId: string) => {
        setError(null);
        try {
            if (isAuthenticated()) {
                setItems(await cartAPI.removeItem(productId));
            } else {
                const next = readGuestCart().filter((i) => i.productId !== productId);
                writeGuestCart(next);
                setItems(next);
            }
        } catch {
            setError("Could not remove item");
        }
    }, []);

    // Call this once, right after a successful login.
    const mergeGuestCartOnLogin = useCallback(async () => {
        const guestItems = readGuestCart();
        if (guestItems.length === 0) return;
        const merged = await cartAPI.mergeGuestCart(guestItems);
        localStorage.removeItem(GUEST_CART_KEY);
        setItems(merged);
    }, []);

    const clearCart = useCallback(async () => {
        setError(null);
        try {
            if (isAuthenticated()) {
                await Promise.all(items.map((i) => cartAPI.removeItem(i.productId)));
                setItems([]);
            } else {
                writeGuestCart([]);
                setItems([]);
            }
        } catch {
            setError("Could not clear cart");
        }
    }, [items]);

    return (
        <CartContext.Provider value={{ items, loading, error, addItem, updateQuantity, removeItem, mergeGuestCartOnLogin, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}