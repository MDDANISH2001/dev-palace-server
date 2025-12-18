import { ServerOptions } from "socket.io";

export const socketConfig: Partial<ServerOptions> = {
  cors: {
    origin: (origin, callback) => {
      // Allow requests from any origin for development
      callback(null, origin || "*");
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  // Connection settings
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  // Allow reconnection
  transports: ["websocket", "polling"],
  // Adapter options
  allowEIO3: true,
};

// Namespace paths
export const SOCKET_NAMESPACES = {
  NOTIFICATIONS: "/notifications",
  MESSAGING: "/messaging",
} as const;
