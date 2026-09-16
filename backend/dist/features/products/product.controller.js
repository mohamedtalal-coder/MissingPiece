import { listProductsQuerySchema, createProductSchema, updateProductSchema, } from "./product.validation.js";
import * as productService from "./product.service.js";
export async function listProductsHandler(req, res, next) {
    try {
        const query = listProductsQuerySchema.parse(req.query);
        const result = await productService.listProducts(query);
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
export async function listCategoriesHandler(req, res, next) {
    try {
        const categories = await productService.listCategories();
        res.json({ success: true, categories });
    }
    catch (err) {
        next(err);
    }
}
export async function listAllProductsAdminHandler(req, res, next) {
    try {
        const query = listProductsQuerySchema.parse(req.query);
        const result = await productService.listProducts({ ...query, includeInactive: true });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
export async function getProductHandler(req, res, next) {
    try {
        const product = await productService.getProductBySlug(req.params["slug"] ?? "");
        if (!product) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, product });
    }
    catch (err) {
        next(err);
    }
}
export async function createProductHandler(req, res, next) {
    try {
        const input = createProductSchema.parse(req.body);
        const product = await productService.createProduct(input);
        res.status(201).json({ success: true, product });
    }
    catch (err) {
        next(err);
    }
}
export async function updateProductHandler(req, res, next) {
    try {
        const input = updateProductSchema.parse(req.body);
        const product = await productService.updateProduct(req.params["id"], input);
        if (!product) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, product });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteProductHandler(req, res, next) {
    try {
        const product = await productService.softDeleteProduct(req.params["id"]);
        if (!product) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, product });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=product.controller.js.map