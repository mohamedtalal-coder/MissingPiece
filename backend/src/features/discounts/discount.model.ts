import mongoose, { Schema, Document } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  maxUses?: number;
  usesCount: number;
  applicableProducts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    maxUses: { type: Number, min: 1 },
    usesCount: { type: Number, default: 0 },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
  },
  { timestamps: true }
);

export const Discount = mongoose.model<IDiscount>("Discount", DiscountSchema);
