import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number; // Snapshot of the price at the time of checkout
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentIntentId?: string; // For Stripe or other payment processors
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true, min: 0 },
});

const ShippingAddressSchema = new Schema<ShippingAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
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
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
