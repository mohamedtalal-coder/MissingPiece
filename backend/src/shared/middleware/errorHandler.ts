import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

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
  // Zod validation errors -> 400, with field-level detail
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // Malformed Mongo ObjectId (e.g. bad :id param) -> 400, not 500
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  // Mongoose duplicate key (e.g. duplicate email on register) -> 409
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate value",
      details: (err as any).keyValue,
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  console.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.statusCode ? err.message : "Internal Server Error",
  });
}