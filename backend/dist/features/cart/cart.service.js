import { Cart } from "./cart.model.js";
import { Product } from "../products/product.model.js";
export async function getCart(userId) {
    const cart = await Cart.findOne({ userId }).lean();
    return cart?.items ?? [];
}
const MAX_ADD_RETRIES = 3;
export async function addItem(userId, productId, quantity, _attempt = 0) {
    if (_attempt > MAX_ADD_RETRIES) {
        throw new Error("addItem: exceeded retry limit — possible persistent conflict");
    }
    const incremented = await Cart.findOneAndUpdate({ userId, "items.productId": productId }, { $inc: { "items.$.quantity": quantity } }, { new: true, lean: true });
    if (incremented)
        return incremented.items;
    try {
        const pushed = await Cart.findOneAndUpdate({ userId, "items.productId": { $ne: productId } }, { $push: { items: { productId, quantity } } }, { upsert: true, new: true, lean: true });
        if (!pushed)
            return addItem(userId, productId, quantity, _attempt + 1);
        return pushed.items;
    }
    catch (err) {
        if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
            return addItem(userId, productId, quantity, _attempt + 1);
        }
        throw err;
    }
}
export async function updateItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOneAndUpdate({ userId, "items.productId": productId }, { $set: { "items.$.quantity": quantity } }, { new: true, lean: true });
    return cart?.items ?? [];
}
export async function removeItem(userId, productId) {
    const cart = await Cart.findOneAndUpdate({ userId }, { $pull: { items: { productId } } }, { new: true, lean: true });
    return cart?.items ?? [];
}
export async function mergeGuestCart(userId, guestItems) {
    for (const item of guestItems) {
        await addItem(userId, item.productId, item.quantity);
    }
    return getCart(userId);
}
export async function validateCartItems(items) {
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));
    return items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
            return { productId: item.productId, quantity: item.quantity, valid: false, reason: "Product not found" };
        }
        if (!product.isActive) {
            return { productId: item.productId, quantity: item.quantity, valid: false, reason: "Product is no longer available" };
        }
        if (product.stock < item.quantity) {
            return {
                productId: item.productId,
                quantity: item.quantity,
                valid: false,
                reason: product.stock === 0 ? "Out of stock" : `Only ${product.stock} left in stock`,
            };
        }
        return {
            productId: item.productId,
            quantity: item.quantity,
            valid: true,
            product: {
                name: product.name,
                price: product.price,
                image: product.images?.[0],
                stock: product.stock,
            },
        };
    });
}
//# sourceMappingURL=cart.service.js.map