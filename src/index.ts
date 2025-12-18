import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { authConnection } from "./db/db";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import { SocketManager } from "./socket/SocketManager";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;
const server = createServer(app);

// Initialize Socket.IO
const socketManager = SocketManager.initialize(server);

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from any origin
      callback(null, origin || "*");
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

// Socket.IO status endpoint
app.get("/socket-status", (req, res) => {
  const stats = socketManager.getConnectedClientsCount();
  res.status(200).json({
    success: true,
    data: {
      ...stats,
      namespaces: ["/notifications", "/messaging"],
    },
  });
});

// API Routes
app.use("/dev-palace", apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

server.listen(PORT, async () => {
  console.log(`HTTP Server running on PORT ${PORT}`);
  await authConnection();
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  socketManager.close();
  server.close(() => {
    console.log("HTTP server closed");
  });
});
