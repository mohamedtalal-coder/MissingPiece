import type { Request, Response, NextFunction } from "express";
import * as discountService from "./discount.service.js";
import { createDiscountSchema, updateDiscountSchema, validateCodeSchema } from "./discount.validation.js";
import { paginationSchema } from "../orders/order.validation.js";
import { Product } from "../products/product.model.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";

export async function createDiscount(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createDiscountSchema.parse(req.body);
    const discount = await discountService.createDiscount(input);
    res.status(201).json({ success: true, discount });
  } catch (error) {
    next(error);
  }
}

export async function listDiscounts(req: Request, res: Response, next: NextFunction) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await discountService.listDiscounts(params);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function updateDiscount(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateDiscountSchema.parse(req.body);
    const discount = await discountService.updateDiscount(req.params["id"] as string, input as Parameters<typeof discountService.updateDiscount>[1]);
    res.status(200).json({ success: true, discount });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteDiscount(req: Request, res: Response, next: NextFunction) {
  try {
    await discountService.softDeleteDiscount(req.params["id"] as string);
    res.status(200).json({ success: true, message: "Discount deleted" });
  } catch (error) {
    next(error);
  }
}

export async function validateDiscount(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, items } = validateCodeSchema.parse(req.body);
    
    const discount = await discountService.findValidDiscountByCode(code);
    if (!discount) {
      const err: AppError = new Error("Invalid or expired code");
      err.statusCode = 400;
      throw err;
    }

    const productIds = items.map((i: { product: string }) => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map(p => [p._id.toString(), p.price]));

    const calcItems = items.map((i: { product: string; quantity: number }) => {
      const price = productMap.get(i.product);
      if (price === undefined) {
        const err: AppError = new Error(`Product with ID ${i.product} not found`);
        err.statusCode = 404;
        throw err;
      }
      return {
        product: i.product,
        quantity: i.quantity,
        priceAtPurchase: price,
      };
    });

    const result = discountService.calculateDiscount(discount, calcItems);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
