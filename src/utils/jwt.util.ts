import jwt from "jsonwebtoken";
import { Response, CookieOptions } from "express";
import { config } from "../config/env.config";

interface TokenPayload {
  id: string;
  email: string;
  userType: "client" | "developer";
}

interface VerificationTokenPayload {
  id: string;
  email: string;
  userType: "client" | "developer";
}

export class JwtUtil {
  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  /**
   * Get cookie options for JWT token
   */
  static getCookieOptions(): CookieOptions {
    return {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: config.nodeEnv === "production", // Only send over HTTPS in production
      sameSite: "lax", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/", // Cookie available for all routes
    };
  }

  /**
   * Set JWT token as HTTP-only cookie in response
   */
  static setTokenCookie(res: Response, token: string): void {
    res.cookie("token", token, this.getCookieOptions());
  }

  /**
   * Clear JWT token cookie
   */
  static clearTokenCookie(res: Response): void {
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  /**
   * Decode JWT token without verification
   */
  static decodeToken(token: string): TokenPayload | null {
    const decoded = jwt.decode(token);
    return decoded as TokenPayload | null;
  }

  /**
   * Generate email verification token (expires in 24 hours)
   */
  static generateVerificationToken(payload: VerificationTokenPayload): string {
    return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
      expiresIn: "24h",
    });
  }

  /**
   * Verify email verification token
   */
  static verifyVerificationToken(token: string): VerificationTokenPayload {
    return jwt.verify(token, config.jwt.secret) as VerificationTokenPayload;
  }
}
