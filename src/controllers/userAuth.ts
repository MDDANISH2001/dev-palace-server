import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Client } from "../models/clients/client.model";
import { Developer } from "../models/developers/dev.model";
import { registerSchema, loginSchema } from "../utils/validation.schemas";
import { ApiResponse } from "../utils/apiResponse";
import { JwtUtil } from "../utils/jwt.util";
import { asyncHandler } from "../middlewares/errorHandler";
import { generateRootKey, generateUserKeys } from "../utils/generateKeys";
import encryptMessage from "../utils/encryptMessage";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";

export const userAuth = {
  /**
   * Client Registration
   */
  clientRegister: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Check if client already exists
      const existingClient = await Client.findOne({
        email: validatedData.email,
      });
      if (existingClient) {
        ApiResponse.conflict(res, "Email already registered");
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const userKeyPair = await generateUserKeys();

      const userRootKey = await generateRootKey();

      const publicKeyString = Array.from(userKeyPair.publicKey, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const privateKeyString = Array.from(userKeyPair.privateKey, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");

      const credential =
        process.env.CREDENTIALS?.slice(0, 6) +
        validatedData.email +
        process.env.CREDENTIALS?.slice(10);

      const slicedCredential1 = credential.slice(0, 32);
      const slicedCredential2 = credential.slice(5, 37);

      const encryptedPrivateKey = encryptMessage(
        privateKeyString,
        slicedCredential1
      );
      const encryptedRootKey = encryptMessage(userRootKey, slicedCredential2);

      // Create new client
      const client = await Client.create({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        keys: {
          publicKey: publicKeyString,
          privateKey: encryptedPrivateKey,
          rootKey: encryptedRootKey,
        },
      });

      // Generate JWT token
      const token = JwtUtil.generateToken({
        id: client._id.toString(),
        email: client.email,
        userType: "client",
      });

      // Set token as HTTP-only cookie
      JwtUtil.setTokenCookie(res, token);

      // Send verification email (non-blocking)
      sendVerificationEmail({
        id: client._id.toString(),
        email: client.email,
        name: client.name,
        userType: "client",
      }).catch((error) => {
        console.error("Failed to send verification email:", error);
        // Don't fail registration if email fails
      });

      // Send success response
      ApiResponse.success(
        res,
        "Registration successful",
        {
          user: {
            id: client._id,
            name: client.name,
            email: client.email,
            userType: "client",
            isVerified: client.isVerified,
          },
        },
        201
      );
    }
  ),

  /**
   * Client Login
   */
  clientLogin: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Find client by email
      const client = await Client.findOne({ email: validatedData.email });
      if (!client) {
        ApiResponse.unauthorized(res, "Invalid email or password");
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        client.password
      );
      if (!isPasswordValid) {
        ApiResponse.unauthorized(res, "Invalid email or password");
        return;
      }

      // Generate JWT token
      const token = JwtUtil.generateToken({
        id: client._id.toString(),
        email: client.email,
        userType: "client",
      });

      // Set token as HTTP-only cookie
      JwtUtil.setTokenCookie(res, token);

      // Send success response
      ApiResponse.success(res, "Login successful", {
        user: {
          id: client._id,
          name: client.name,
          email: client.email,
          userType: "client",
        },
      });
    }
  ),

  /**
   * Developer Registration
   */
  devRegister: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Check if developer already exists
      const existingDev = await Developer.findOne({
        email: validatedData.email,
      });
      if (existingDev) {
        ApiResponse.conflict(res, "Email already registered");
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const userKeyPair = await generateUserKeys();

      const userRootKey = await generateRootKey();

      const publicKeyString = Array.from(userKeyPair.publicKey, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const privateKeyString = Array.from(userKeyPair.privateKey, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");

      const credential =
        process.env.CREDENTIALS?.slice(0, 6) +
        validatedData.email +
        process.env.CREDENTIALS?.slice(10);

      const slicedCredential1 = credential.slice(0, 32);
      const slicedCredential2 = credential.slice(5, 37);

      const encryptedPrivateKey = encryptMessage(
        privateKeyString,
        slicedCredential1
      );
      const encryptedRootKey = encryptMessage(userRootKey, slicedCredential2);

      // Create new developer
      const developer = await Developer.create({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        keys: {
          publicKey: publicKeyString,
          privateKey: encryptedPrivateKey,
          rootKey: encryptedRootKey,
        },
      });

      // Generate JWT token
      const token = JwtUtil.generateToken({
        id: developer._id.toString(),
        email: developer.email,
        userType: "developer",
      });

      // Set token as HTTP-only cookie
      JwtUtil.setTokenCookie(res, token);

      // Send verification email (non-blocking)
      sendVerificationEmail({
        id: developer._id.toString(),
        email: developer.email,
        name: developer.name,
        userType: "developer",
      }).catch((error) => {
        console.error("Failed to send verification email:", error);
        // Don't fail registration if email fails
      });

      // Send success response
      ApiResponse.success(
        res,
        "Registration successful",
        {
          user: {
            id: developer._id,
            name: developer.name,
            email: developer.email,
            userType: "developer",
            isVerified: developer.isVerified,
          },
        },
        201
      );
    }
  ),

  /**
   * Developer Login
   */
  devLogin: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Find developer by email
    const developer = await Developer.findOne({ email: validatedData.email });
    if (!developer) {
      ApiResponse.unauthorized(res, "Invalid email or password");
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      developer.password
    );
    if (!isPasswordValid) {
      ApiResponse.unauthorized(res, "Invalid email or password");
      return;
    }

    // Generate JWT token
    const token = JwtUtil.generateToken({
      id: developer._id.toString(),
      email: developer.email,
      userType: "developer",
    });

    // Set token as HTTP-only cookie
    JwtUtil.setTokenCookie(res, token);

    // Send success response
    ApiResponse.success(res, "Login successful", {
      user: {
        id: developer._id,
        name: developer.name,
        email: developer.email,
        userType: "developer",
      },
    });
  }),

  /**
   * Verify User Authentication
   * Checks if user is logged in by verifying the HTTP-only cookie token
   */
  verifyAuth: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Get token from cookie
      const token = req.cookies.token;

      if (!token) {
        ApiResponse.unauthorized(res, "Not authenticated");
        return;
      }

      try {
        // Verify token
        const decoded = JwtUtil.verifyToken(token);

        // Find user based on userType
        let user;
        if (decoded.userType === "client") {
          user = await Client.findById(decoded.id).select("-password");
        } else if (decoded.userType === "developer") {
          user = await Developer.findById(decoded.id).select("-password");
        }

        if (!user) {
          ApiResponse.unauthorized(res, "User not found");
          return;
        }

        // Send success response with user data
        ApiResponse.success(res, "Authenticated", {
          isAuthenticated: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            userType: decoded.userType,
          },
        });
      } catch (error) {
        // Token verification failed
        ApiResponse.unauthorized(res, "Invalid or expired token");
        return;
      }
    }
  ),

  /**
   * Logout User
   * Clears the HTTP-only cookie token
   */
  logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Clear the token cookie
    JwtUtil.clearTokenCookie(res);

    // Send success response
    ApiResponse.success(res, "Logout successful", {
      isAuthenticated: false,
    });
  }),

  /**
   * Verify Email
   * Verifies user's email using the token from query parameters
   */
  verifyEmail: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Get token from query parameters
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        ApiResponse.validationError(res, "Verification token is required");
        return;
      }

      try {
        // Verify and decode the token
        const decoded = JwtUtil.verifyVerificationToken(token);

        // Find user based on userType and update isVerified
        let user;
        if (decoded.userType === "client") {
          user = await Client.findById(decoded.id);
          if (!user) {
            ApiResponse.notFound(res, "Client not found");
            return;
          }

          // Check if already verified
          if (user.isVerified) {
            ApiResponse.success(res, "Email already verified", {
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: "client",
                isVerified: true,
              },
            });
            return;
          }

          // Update isVerified to true
          user.isVerified = true;
          await user.save();
        } else if (decoded.userType === "developer") {
          user = await Developer.findById(decoded.id);
          if (!user) {
            ApiResponse.notFound(res, "Developer not found");
            return;
          }

          // Check if already verified
          if (user.isVerified) {
            ApiResponse.success(res, "Email already verified", {
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: "developer",
                isVerified: true,
              },
            });
            return;
          }

          // Update isVerified to true
          user.isVerified = true;
          await user.save();
        } else {
          ApiResponse.unauthorized(res, "Invalid user type");
          return;
        }

        // Send success response
        ApiResponse.success(res, "Email verified successfully", {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            userType: decoded.userType,
            isVerified: true,
          },
        });
      } catch (error) {
        // Token verification failed or expired
        ApiResponse.unauthorized(res, "Invalid or expired verification token");
        return;
      }
    }
  ),
};
