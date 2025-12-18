import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwt.util";
import { ApiResponse } from "../utils/apiResponse";
import { Client } from "../models/clients/client.model";
import { Developer } from "../models/developers/dev.model";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        userType: "client" | "developer";
      };
    }
  }
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from cookie or Authorization header
    let token: string | undefined;
    console.log("token :", token);

    // Check cookie first
    console.log("req.cookies :", req.cookies);
    console.log("req.cookies.token :", req.cookies.token);
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("token :", token);
    }

    // Check Authorization header as fallback
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // If no token found
    if (!token) {
      ApiResponse.unauthorized(res, "Authentication required. Please log in.");
      return;
    }

    // Verify token
    const decoded = JwtUtil.verifyToken(token);

    // Verify user still exists in database
    let userExists = false;
    if (decoded.userType === "client") {
      userExists = !!(await Client.findById(decoded.id).select("_id"));
    } else if (decoded.userType === "developer") {
      userExists = !!(await Developer.findById(decoded.id).select("_id"));
    }

    if (!userExists) {
      ApiResponse.unauthorized(res, "User not found. Please log in again.");
      return;
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      ApiResponse.unauthorized(res, "Invalid authentication token.");
      return;
    }
    if (error.name === "TokenExpiredError") {
      ApiResponse.unauthorized(
        res,
        "Authentication token has expired. Please log in again."
      );
      return;
    }
    next(error);
  }
};

/**
 * Middleware to restrict access to clients only
 */
export const authenticateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await authenticate(req, res, () => {
    if (!req.user) {
      ApiResponse.unauthorized(res, "Authentication required.");
      return;
    }

    if (req.user.userType !== "client") {
      ApiResponse.error(
        res,
        "Access denied. This endpoint is for clients only.",
        403
      );
      return;
    }

    next();
  });
};

/**
 * Middleware to restrict access to developers only
 */
export const authenticateDeveloper = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await authenticate(req, res, () => {
    if (!req.user) {
      ApiResponse.unauthorized(res, "Authentication required.");
      return;
    }

    if (req.user.userType !== "developer") {
      ApiResponse.error(
        res,
        "Access denied. This endpoint is for developers only.",
        403
      );
      return;
    }

    next();
  });
};
