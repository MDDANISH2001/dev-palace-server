import { Response } from "express";

interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export class ApiResponse {
  /**
   * Send success response
   */
  static success(
    res: Response,
    message: string = "Success",
    data?: any,
    statusCode: number = 200
  ): Response {
    const response: SuccessResponse = {
      success: true,
      message,
      ...(data && { data }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = "An error occurred",
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ErrorResponse = {
      success: false,
      message,
      ...(error && process.env.NODE_ENV === "development" && { error }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message: string = "Validation failed"
  ): Response {
    return this.error(res, message, 400);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = "Unauthorized access"
  ): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = "Resource not found"
  ): Response {
    return this.error(res, message, 404);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = "Resource already exists"
  ): Response {
    return this.error(res, message, 409);
  }
}
