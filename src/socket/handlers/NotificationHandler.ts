import { Server, Socket } from "socket.io";
import { BaseSocketHandler } from "../base/BaseSocketHandler";
import { SOCKET_NAMESPACES } from "../../config/socket.config";

/**
 * Notification Socket Handler
 * Manages real-time notifications for users
 */
export class NotificationHandler extends BaseSocketHandler {
  constructor(io: Server) {
    super(io, SOCKET_NAMESPACES.NOTIFICATIONS);
  }

  protected getNamespaceName(): string {
    return "Notifications";
  }

  protected setupEventListeners(socket: Socket): void {
    // Mark notification as read
    socket.on("notification:read", (data: { notificationId: string }) => {
      this.handleMarkAsRead(socket, data);
    });

    // Mark all notifications as read
    socket.on("notification:readAll", () => {
      this.handleMarkAllAsRead(socket);
    });

    // Delete notification
    socket.on("notification:delete", (data: { notificationId: string }) => {
      this.handleDeleteNotification(socket, data);
    });

    // Get unread count
    socket.on("notification:getUnreadCount", () => {
      this.handleGetUnreadCount(socket);
    });

    // Subscribe to specific notification types
    socket.on("notification:subscribe", (data: { types: string[] }) => {
      this.handleSubscribe(socket, data);
    });

    // Unsubscribe from notification types
    socket.on("notification:unsubscribe", (data: { types: string[] }) => {
      this.handleUnsubscribe(socket, data);
    });
  }

  protected onConnectionSuccess(socket: Socket): void {
    const userId = this.getUserId(socket);
    const userType = this.getUserType(socket);

    socket.emit("notification:connected", {
      message: "Connected to notifications",
      userId,
      userType,
      timestamp: new Date().toISOString(),
    });

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Send any pending notifications count
    this.sendUnreadCount(socket);
  }

  protected onDisconnection(socket: Socket): void {
    const userId = this.getUserId(socket);
    // Leave all rooms
    socket.leave(`user:${userId}`);
    console.log(`🔔 Notification cleanup for user ${userId}`);
  }

  // Event Handlers

  private handleMarkAsRead(socket: Socket, data: { notificationId: string }): void {
    const userId = this.getUserId(socket);
    console.log(`📖 User ${userId} marked notification ${data.notificationId} as read`);

    // TODO: Update notification in database
    // await Notification.findByIdAndUpdate(data.notificationId, { isRead: true });

    socket.emit("notification:readSuccess", {
      notificationId: data.notificationId,
      success: true,
    });

    // Send updated unread count
    this.sendUnreadCount(socket);
  }

  private handleMarkAllAsRead(socket: Socket): void {
    const userId = this.getUserId(socket);
    console.log(`📚 User ${userId} marked all notifications as read`);

    // TODO: Update all notifications in database
    // await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    socket.emit("notification:readAllSuccess", {
      success: true,
    });

    // Send updated unread count (should be 0)
    this.sendUnreadCount(socket);
  }

  private handleDeleteNotification(socket: Socket, data: { notificationId: string }): void {
    const userId = this.getUserId(socket);
    console.log(`🗑️ User ${userId} deleted notification ${data.notificationId}`);

    // TODO: Delete notification from database
    // await Notification.findByIdAndDelete(data.notificationId);

    socket.emit("notification:deleteSuccess", {
      notificationId: data.notificationId,
      success: true,
    });
  }

  private handleGetUnreadCount(socket: Socket): void {
    this.sendUnreadCount(socket);
  }

  private handleSubscribe(socket: Socket, data: { types: string[] }): void {
    const userId = this.getUserId(socket);
    
    // Join rooms for specific notification types
    data.types.forEach((type) => {
      socket.join(`notification:${type}`);
    });

    console.log(`🔔 User ${userId} subscribed to notification types: ${data.types.join(", ")}`);

    socket.emit("notification:subscribeSuccess", {
      types: data.types,
      success: true,
    });
  }

  private handleUnsubscribe(socket: Socket, data: { types: string[] }): void {
    const userId = this.getUserId(socket);
    
    // Leave rooms for specific notification types
    data.types.forEach((type) => {
      socket.leave(`notification:${type}`);
    });

    console.log(`🔕 User ${userId} unsubscribed from notification types: ${data.types.join(", ")}`);

    socket.emit("notification:unsubscribeSuccess", {
      types: data.types,
      success: true,
    });
  }

  // Helper Methods

  private async sendUnreadCount(socket: Socket): Promise<void> {
    const userId = this.getUserId(socket);

    // TODO: Get unread count from database
    // const count = await Notification.countDocuments({ userId, isRead: false });
    const count = 0; // Placeholder

    socket.emit("notification:unreadCount", {
      count,
      timestamp: new Date().toISOString(),
    });
  }

  // Public Methods (to be called from other parts of the application)

  /**
   * Send notification to a specific user
   */
  public sendNotificationToUser(
    userId: string,
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ): boolean {
    return this.emitToUser(userId, "notification:new", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send notification to all users of a specific type
   */
  public sendNotificationToUserType(
    userType: "client" | "developer",
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ): void {
    this.emitToRoom(`userType:${userType}`, "notification:new", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send notification to specific notification type subscribers
   */
  public sendNotificationToType(
    notificationType: string,
    notification: {
      id: string;
      title: string;
      message: string;
      data?: any;
    }
  ): void {
    this.emitToRoom(`notification:${notificationType}`, "notification:new", {
      ...notification,
      type: notificationType,
      timestamp: new Date().toISOString(),
    });
  }
}
