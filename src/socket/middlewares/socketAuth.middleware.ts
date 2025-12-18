import { Socket } from "socket.io";
import { JwtUtil } from "../../utils/jwt.util";

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token from cookies or handshake auth
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
  try {
    // Try to get token from handshake auth (for cases where cookies aren't available)
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify token
    const decoded = JwtUtil.verifyToken(token);

    // Attach user data to socket
    socket.data.userId = decoded.id;
    socket.data.email = decoded.email;
    socket.data.userType = decoded.userType;

    // TODO: Optionally fetch user details from database
    // const user = await User.findById(decoded.id);
    // socket.data.userName = user.name;

    console.log(`✅ Socket authenticated: User ${decoded.id} (${decoded.userType})`);

    next();
  } catch (error: any) {
    console.error("❌ Socket authentication failed:", error.message);
    next(new Error("Authentication error: Invalid or expired token"));
  }
};

/**
 * Optional middleware to allow both authenticated and guest connections
 * Useful for public namespaces
 */
export const socketOptionalAuthMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];

    if (token) {
      try {
        const decoded = JwtUtil.verifyToken(token);
        socket.data.userId = decoded.id;
        socket.data.email = decoded.email;
        socket.data.userType = decoded.userType;
        socket.data.isAuthenticated = true;
      } catch (error) {
        // Token invalid, continue as guest
        socket.data.isAuthenticated = false;
        socket.data.userId = `guest_${socket.id}`;
      }
    } else {
      // No token, continue as guest
      socket.data.isAuthenticated = false;
      socket.data.userId = `guest_${socket.id}`;
    }

    next();
  } catch (error: any) {
    console.error("Socket middleware error:", error.message);
    next(new Error("Middleware error"));
  }
};
