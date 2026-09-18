import type { Request, Response, NextFunction } from "express";
import type { AppError } from "../../shared/middleware/errorHandler.js";
import {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
} from "./product.validation.js";
import * as productService from "./product.service.js";
import { uploadImage } from "../../shared/utils/cloudinary.js";

export async function listProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listProductsQuerySchema.parse(req.query);
    const result = await productService.listProducts(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function listCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await productService.listCategories();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function listAllProductsAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listProductsQuerySchema.parse(req.query);
    const result = await productService.listProducts({ ...query, includeInactive: true });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductBySlug((req.params["slug"] as string) ?? "");
    if (!product) {
      const err: AppError = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    const images = await Promise.all(
      files.map((file) => uploadImage(file.buffer))
    );

    const input = createProductSchema.parse({
      ...req.body,
      images,
    });

    const product = await productService.createProduct(input);

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}
export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    const images = files.length > 0
      ? await Promise.all(files.map((file) => uploadImage(file.buffer)))
      : undefined;

    const input = updateProductSchema.parse({
      ...req.body,
      ...(images ? { images } : {}),
    });

    const product = await productService.updateProduct(
      req.params["id"] as string,
      input
    );

    if (!product) {
      const err: AppError = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.softDeleteProduct(req.params["id"] as string);
    if (!product) {
      const err: AppError = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}
