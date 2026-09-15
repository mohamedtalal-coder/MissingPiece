import type { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}