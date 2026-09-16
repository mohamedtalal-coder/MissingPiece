import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import { validateCartItems, type ValidatedCartItem } from "./cartApi";

export default function CartPage() {
    const { items, loading: cartLoading, updateQuantity, removeItem, clearCart } = useCart();
    const [validated, setValidated] = useState<ValidatedCartItem[]>([]);
    const [validating, setValidating] = useState(true);

    useEffect(() => {
        if (items.length === 0) {
            setValidated([]);
            setValidating(false);
            return;
        }
        setValidating(true);
        validateCartItems(items).then(setValidated).finally(() => setValidating(false));
    }, [items]);

    const loading = cartLoading || validating;
    const validItems = validated.filter((i) => i.valid && i.product);
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = validItems.reduce((sum, i) => sum + i.product!.price * i.quantity, 0);

    function handleDecrease(productId: string, quantity: number) {
        if (quantity <= 1) {
            removeItem(productId);
        } else {
            updateQuantity(productId, quantity - 1);
        }
    }

    if (loading) {
        return <div className="min-h-[70vh] flex items-center justify-center text-on-surface-variant">Loading your cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-md bg-surface px-md font-body">
                <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-on-surface-variant/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                </div>
                <h1 className="font-headline text-3xl text-on-surface">Your cart is empty</h1>
                <p className="mt-sm w-full text-on-surface-variant text-base max-w-[400px] text-center leading-relaxed">
                    Looks like you haven't added anything yet. Start exploring our collection!
                </p>
                <Link to="/" className="mt-sm inline-flex items-center gap-xs rounded-xl bg-primary px-lg py-sm text-on-primary font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-[.97]">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface font-body">
            <div className="mx-auto max-w-6xl px-md py-xl">
                <div className="mb-lg flex items-center justify-between">
                    <h1 className="font-headline text-3xl text-on-surface">
                        Your Cart
                        <span className="ml-sm text-lg font-body text-on-surface-variant font-normal">
                            ({totalItems} {totalItems === 1 ? "item" : "items"})
                        </span>
                    </h1>
                    <button onClick={clearCart} className="rounded-lg px-md py-xs text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error">
                        Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
                    <ul className="flex flex-col gap-sm lg:col-span-8">
                        {validated.map((item) => (
                            <li key={item.productId} className="group flex items-center gap-md rounded-2xl bg-surface-container-lowest p-md shadow-sm transition-shadow hover:shadow-md">
                                {item.product?.image ? (
                                    <img src={item.product.image} alt={item.product.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                                ) : (
                                    <div className="h-24 w-24 shrink-0 rounded-xl bg-surface-container flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="flex flex-1 flex-col gap-xs min-w-0">
                                    <h3 className="truncate text-base font-semibold text-on-surface">
                                        {item.product?.name ?? "Unavailable item"}
                                    </h3>
                                    {item.valid ? (
                                        <p className="text-sm text-on-surface-variant">${item.product!.price.toFixed(2)} each</p>
                                    ) : (
                                        <p className="text-sm text-error">{item.reason}</p>
                                    )}
                                </div>

                                {item.valid && item.product && (
                                    <>
                                        <div className="flex items-center gap-xs">
                                            <button onClick={() => handleDecrease(item.productId, item.quantity)} aria-label="Decrease quantity" className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-on-surface transition-colors hover:bg-outline-variant">
                                                −
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-on-surface">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                disabled={item.quantity >= item.product.stock}
                                                aria-label="Increase quantity"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-on-surface transition-colors hover:bg-outline-variant disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="w-24 text-right text-base font-bold text-primary shrink-0">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </>
                                )}

                                <button
                                    onClick={() => removeItem(item.productId)}
                                    aria-label="Remove item"
                                    className="ml-xs flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant opacity-0 transition-all group-hover:opacity-100 hover:bg-error/10 hover:text-error"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-xl rounded-2xl bg-surface-container-low p-lg flex flex-col gap-md shadow-sm">
                            <h2 className="font-headline text-xl text-on-surface">Order Summary</h2>
                            <div className="flex flex-col gap-xs text-sm">
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="text-on-surface font-medium">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Shipping</span>
                                    <span className="text-secondary font-medium">Free</span>
                                </div>
                            </div>
                            <div className="border-t border-outline-variant pt-md flex justify-between items-baseline">
                                <span className="text-base font-semibold text-on-surface">Total</span>
                                <span className="font-headline text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                            </div>
                            <Link
                                to="/checkout"
                                aria-disabled={validItems.length !== validated.length}
                                className={`mt-xs w-full rounded-xl py-sm text-center font-semibold shadow-md transition-all duration-200 ${validItems.length !== validated.length
                                    ? "bg-surface-container-high text-on-surface-variant pointer-events-none"
                                    : "bg-primary text-on-primary hover:shadow-lg hover:brightness-110 active:scale-[.98]"
                                    }`}
                            >
                                Proceed to Checkout
                            </Link>
                            <Link to="/" className="text-center text-sm text-on-surface-variant underline decoration-outline-variant underline-offset-2 transition-colors hover:text-primary hover:decoration-primary">
                                Continue Shopping
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}