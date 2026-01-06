import { Request, Response } from "express";
import { JwtUtil } from "../../../utils/jwt.util";
import { Client } from "../../../models/clients/client.model";
import { Developer } from "../../../models/developers/dev.model";

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token and role are required",
      });
    }
    const verifyToken = JwtUtil.verifyVerificationToken(token as string);
    if (!verifyToken) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }
    const role = verifyToken.userType;

    let updatedUser;
    if (role === "client") {
      updatedUser = await Client.findByIdAndUpdate(
        verifyToken.id,
        { isVerified: true },
        { new: true }
      );
    } else if (role === "developer") {
      updatedUser = await Developer.findByIdAndUpdate(
        verifyToken.id,
        { isVerified: true },
        { new: true }
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user role" });
    }

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate JWT token
    const newToken = JwtUtil.generateToken({
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      userType: role,
      isVerified: true,
    });

    // Set token as HTTP-only cookie
    JwtUtil.setTokenCookie(res, newToken);

    await updatedUser.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
