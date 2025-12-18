import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../utils/apiResponse";

/**
 * Global error handling middleware
 * Catches all errors and sends generic messages to client
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    ApiResponse.validationError(res, "Invalid input data");
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    ApiResponse.conflict(res, "This email is already registered");
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    ApiResponse.unauthorized(res, "Invalid authentication token");
    return;
  }

  if (err.name === "TokenExpiredError") {
    ApiResponse.unauthorized(res, "Authentication token has expired");
    return;
  }

  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    ApiResponse.validationError(res, "Invalid data provided");
    return;
  }

  // Handle mongoose cast errors
  if (err.name === "CastError") {
    ApiResponse.error(res, "Invalid data format", 400);
    return;
  }

  // Default error response with generic message
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? "An unexpected error occurred. Please try again later." 
    : err.message || "Something went wrong";

  ApiResponse.error(res, message, statusCode, err.stack);
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
