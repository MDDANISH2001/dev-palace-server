import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { socketConfig } from "../config/socket.config";
import { NotificationHandler } from "./handlers/NotificationHandler";
import { MessagingHandler } from "./handlers/MessagingHandler";

/**
 * Socket Manager
 * Centralized Socket.IO management with multiple namespaces
 */
export class SocketManager {
  private static instance: SocketManager;
  private io: SocketServer;
  private notificationHandler!: NotificationHandler;
  private messagingHandler!: MessagingHandler;

  private constructor(httpServer: HTTPServer) {
    // Initialize Socket.IO server
    this.io = new SocketServer(httpServer, socketConfig);
    
    // Initialize namespace handlers
    this.initializeHandlers();

    console.log("🚀 Socket.IO Server initialized with namespaces");
  }

  /**
   * Get singleton instance
   */
  public static initialize(httpServer: HTTPServer): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager(httpServer);
    }
    return SocketManager.instance;
  }

  /**
   * Get existing instance
   */
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      throw new Error("SocketManager not initialized. Call initialize() first.");
    }
    return SocketManager.instance;
  }

  /**
   * Initialize all namespace handlers
   */
  private initializeHandlers(): void {
    this.notificationHandler = new NotificationHandler(this.io);
    this.messagingHandler = new MessagingHandler(this.io);
  }

  /**
   * Get Socket.IO server instance
   */
  public getIO(): SocketServer {
    return this.io;
  }

  /**
   * Get notification handler
   */
  public getNotificationHandler(): NotificationHandler {
    return this.notificationHandler;
  }

  /**
   * Get messaging handler
   */
  public getMessagingHandler(): MessagingHandler {
    return this.messagingHandler;
  }

  /**
   * Get total connected clients across all namespaces
   */
  public getConnectedClientsCount(): { total: number; notifications: number; messaging: number } {
    const notificationsCount = this.notificationHandler.getConnectedUsersCount();
    const messagingCount = this.messagingHandler.getConnectedUsersCount();

    return {
      total: notificationsCount + messagingCount,
      notifications: notificationsCount,
      messaging: messagingCount,
    };
  }

  /**
   * Close all socket connections
   */
  public close(): void {
    this.io.close();
    console.log("🔌 Socket.IO Server closed");
  }
}
