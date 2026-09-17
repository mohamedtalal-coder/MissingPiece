import mongoose, { type ClientSession } from "mongoose";
import { Discount, type IDiscount } from "./discount.model.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import { createDiscountSchema } from "./discount.validation.js";
import { Product } from "../products/product.model.js";

export interface CreateDiscountInput {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  validFrom: Date;
  validTo: Date;
  maxUses?: number | undefined;
  applicableProducts?: string[] | undefined;
}

export async function createDiscount(input: CreateDiscountInput) {
  if (input.applicableProducts && input.applicableProducts.length > 0) {
    const count = await Product.countDocuments({ _id: { $in: input.applicableProducts } });
    if (count !== input.applicableProducts.length) {
      const err: AppError = new Error("One or more applicable products do not exist");
      err.statusCode = 400;
      throw err;
    }
  }

  // Input code should be uppercased per model schema, but we ensure it here too
  const discount = new Discount({
    ...input,
    code: input.code.toUpperCase(),
  });
  return discount.save();
}

export async function updateDiscount(id: string, input: Partial<CreateDiscountInput>) {
  const existingDiscount = await Discount.findById(id);
  if (!existingDiscount) {
    const err: AppError = new Error("Discount not found");
    err.statusCode = 404;
    throw err;
  }

  const mergedData = {
    code: existingDiscount.code,
    type: existingDiscount.type,
    value: existingDiscount.value,
    validFrom: existingDiscount.validFrom,
    validTo: existingDiscount.validTo,
    maxUses: existingDiscount.maxUses,
    applicableProducts: existingDiscount.applicableProducts,
    ...input
  };

  if (mergedData.code) {
    mergedData.code = mergedData.code.toUpperCase();
  }

  if (mergedData.applicableProducts && mergedData.applicableProducts.length > 0) {
    const count = await Product.countDocuments({ _id: { $in: mergedData.applicableProducts } });
    if (count !== mergedData.applicableProducts.length) {
      const err: AppError = new Error("One or more applicable products do not exist");
      err.statusCode = 400;
      throw err;
    }
  }

  const parseResult = createDiscountSchema.safeParse(mergedData);
  if (!parseResult.success) {
    const err: AppError = new Error(parseResult.error.issues[0]?.message || "Validation Error");
    err.statusCode = 400;
    throw err;
  }

  const discount = await Discount.findByIdAndUpdate(id, mergedData, {
    new: true,
    runValidators: true,
  });

  return discount;
}

export async function softDeleteDiscount(id: string) {
  const discount = await Discount.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!discount) {
    const err: AppError = new Error("Discount not found");
    err.statusCode = 404;
    throw err;
  }
  return discount;
}

export interface ListDiscountsParams {
  page: number;
  limit: number;
}

export async function listDiscounts(params: ListDiscountsParams) {
  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    Discount.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
    Discount.countDocuments(),
  ]);

  return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}

export interface CalcItem {
  product: string | mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export function calculateDiscount(discount: IDiscount, items: CalcItem[]): { discountAmount: number; applied: boolean } {
  let applicableSubtotal = 0;
  let totalSubtotal = 0;

  const hasSpecificProducts = discount.applicableProducts && discount.applicableProducts.length > 0;
  const applicableProductIds = new Set(
    (discount.applicableProducts || []).map(id => id.toString())
  );

  for (const item of items) {
    const itemTotal = item.priceAtPurchase * item.quantity;
    totalSubtotal += itemTotal;

    if (!hasSpecificProducts || applicableProductIds.has(item.product.toString())) {
      applicableSubtotal += itemTotal;
    }
  }

  if (applicableSubtotal <= 0) {
    return { discountAmount: 0, applied: false };
  }

  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = applicableSubtotal * (discount.value / 100);
  } else if (discount.type === "fixed") {
    discountAmount = Math.min(discount.value, applicableSubtotal);
  }

  discountAmount = Math.min(discountAmount, totalSubtotal); // Never exceed overall total
  discountAmount = Math.max(0, discountAmount); // Never negative

  return { discountAmount, applied: discountAmount > 0 };
}

export async function findValidDiscountByCode(code: string, session?: ClientSession) {
  const now = new Date();
  
  let query = Discount.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
  });

  if (session) {
    query = query.session(session);
  }

  const discount = await query;
  
  if (!discount) return null;
  
  if (discount.maxUses !== undefined && discount.usesCount >= discount.maxUses) {
    return null;
  }
  
  return discount;
}

export async function incrementDiscountUsage(discountId: string, session: ClientSession) {
  const discount = await Discount.findOneAndUpdate(
    { 
      _id: discountId, 
      $or: [
        { maxUses: { $exists: false } }, 
        { $expr: { $lt: ["$usesCount", "$maxUses"] } }
      ] 
    },
    { $inc: { usesCount: 1 } },
    { session, new: true }
  );

  if (!discount) {
    const err: AppError = new Error("Discount usage limit reached");
    err.statusCode = 409;
    throw err;
  }

  return discount;
}
