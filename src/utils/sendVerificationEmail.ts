import { JwtUtil } from "./jwt.util";
import { EmailUtil } from "./email.util";

interface UserData {
  id: string;
  email: string;
  name: string;
  userType: "client" | "developer";
  duration?: string;
  isVerified: boolean;
}

/**
 * DRY helper function to send verification email to newly registered users
 * Used by both client and developer registration
 */
export async function sendVerificationEmail(userData: UserData): Promise<void> {
  // Generate verification token that expires in 24 hours
  const verificationToken = JwtUtil.generateVerificationToken(
    {
      id: userData.id,
      email: userData.email,
      userType: userData.userType,
      isVerified: userData.isVerified,
    },
    userData?.duration || "24h"
  );

  // Send verification email
  await EmailUtil.sendVerificationEmail(
    userData.email,
    userData.name,
    verificationToken
  );
}
