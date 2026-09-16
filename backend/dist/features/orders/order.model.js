import mongoose, { Schema, Document } from "mongoose";
const OrderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
});
const ShippingAddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
});
const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Auth is strictly required
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    paymentIntentId: { type: String },
}, { timestamps: true });
export const Order = mongoose.model("Order", OrderSchema);
//# sourceMappingURL=order.model.js.map