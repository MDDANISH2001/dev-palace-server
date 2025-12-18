import { Server, Socket } from "socket.io";
import { BaseSocketHandler } from "../base/BaseSocketHandler";
import { SOCKET_NAMESPACES } from "../../config/socket.config";

/**
 * Messaging Socket Handler
 * Manages real-time chat/messaging functionality
 */
export class MessagingHandler extends BaseSocketHandler {
  private typingUsers: Map<string, Set<string>>; // conversationId -> Set of userId

  constructor(io: Server) {
    super(io, SOCKET_NAMESPACES.MESSAGING);
    this.typingUsers = new Map();
  }

  protected getNamespaceName(): string {
    return "Messaging";
  }

  protected setupEventListeners(socket: Socket): void {
    // Join a conversation/chat room
    socket.on("message:joinConversation", (data: { conversationId: string }) => {
      this.handleJoinConversation(socket, data);
    });

    // Leave a conversation
    socket.on("message:leaveConversation", (data: { conversationId: string }) => {
      this.handleLeaveConversation(socket, data);
    });

    // Send a message
    socket.on("message:send", (data: { conversationId: string; message: string; attachments?: any[] }) => {
      this.handleSendMessage(socket, data);
    });

    // Typing indicator start
    socket.on("message:typing", (data: { conversationId: string }) => {
      this.handleTypingStart(socket, data);
    });

    // Typing indicator stop
    socket.on("message:stopTyping", (data: { conversationId: string }) => {
      this.handleTypingStop(socket, data);
    });

    // Mark message as read
    socket.on("message:markAsRead", (data: { conversationId: string; messageId: string }) => {
      this.handleMarkAsRead(socket, data);
    });

    // Delete message
    socket.on("message:delete", (data: { conversationId: string; messageId: string }) => {
      this.handleDeleteMessage(socket, data);
    });

    // Edit message
    socket.on("message:edit", (data: { conversationId: string; messageId: string; newMessage: string }) => {
      this.handleEditMessage(socket, data);
    });

    // React to message
    socket.on("message:react", (data: { conversationId: string; messageId: string; reaction: string }) => {
      this.handleReaction(socket, data);
    });

    // Get conversation messages
    socket.on("message:getMessages", (data: { conversationId: string; page?: number; limit?: number }) => {
      this.handleGetMessages(socket, data);
    });
  }

  protected onConnectionSuccess(socket: Socket): void {
    const userId = this.getUserId(socket);
    const userType = this.getUserType(socket);

    socket.emit("message:connected", {
      message: "Connected to messaging",
      userId,
      userType,
      timestamp: new Date().toISOString(),
    });

    // Join user-specific room for direct messages
    socket.join(`user:${userId}`);

    // Update user online status
    this.updateUserStatus(userId, "online");
  }

  protected onDisconnection(socket: Socket): void {
    const userId = this.getUserId(socket);

    // Update user offline status
    this.updateUserStatus(userId, "offline");

    // Remove from all typing indicators
    this.typingUsers.forEach((users, conversationId) => {
      if (users.has(userId)) {
        users.delete(userId);
        this.emitToRoom(`conversation:${conversationId}`, "message:userStoppedTyping", {
          userId,
          conversationId,
        });
      }
    });

    console.log(`💬 Messaging cleanup for user ${userId}`);
  }

  // Event Handlers

  private handleJoinConversation(socket: Socket, data: { conversationId: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId } = data;

    // Join the conversation room
    socket.join(`conversation:${conversationId}`);

    console.log(`💬 User ${userId} joined conversation ${conversationId}`);

    socket.emit("message:joinedConversation", {
      conversationId,
      success: true,
    });

    // Notify others in the conversation
    socket.to(`conversation:${conversationId}`).emit("message:userJoined", {
      userId,
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleLeaveConversation(socket: Socket, data: { conversationId: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId } = data;

    // Leave the conversation room
    socket.leave(`conversation:${conversationId}`);

    console.log(`👋 User ${userId} left conversation ${conversationId}`);

    socket.emit("message:leftConversation", {
      conversationId,
      success: true,
    });

    // Notify others in the conversation
    socket.to(`conversation:${conversationId}`).emit("message:userLeft", {
      userId,
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleSendMessage(socket: Socket, data: { conversationId: string; message: string; attachments?: any[] }): void {
    const userId = this.getUserId(socket);
    const userName = socket.data.userName || "Unknown User";
    const { conversationId, message, attachments } = data;

    console.log(`📨 User ${userId} sent message to conversation ${conversationId}`);

    // TODO: Save message to database
    // const savedMessage = await Message.create({ conversationId, senderId: userId, message, attachments });

    const messageData = {
      messageId: `msg_${Date.now()}`, // TODO: Replace with actual DB ID
      conversationId,
      senderId: userId,
      senderName: userName,
      message,
      attachments: attachments || [],
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Emit to all users in the conversation
    this.emitToRoom(`conversation:${conversationId}`, "message:new", messageData);

    // Confirm to sender
    socket.emit("message:sendSuccess", {
      tempId: data.message, // If using temp IDs in frontend
      messageId: messageData.messageId,
      success: true,
    });
  }

  private handleTypingStart(socket: Socket, data: { conversationId: string }): void {
    const userId = this.getUserId(socket);
    const userName = socket.data.userName || "Unknown User";
    const { conversationId } = data;

    // Add user to typing set
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId)!.add(userId);

    // Notify others in the conversation
    socket.to(`conversation:${conversationId}`).emit("message:userTyping", {
      userId,
      userName,
      conversationId,
    });
  }

  private handleTypingStop(socket: Socket, data: { conversationId: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId } = data;

    // Remove user from typing set
    const typingSet = this.typingUsers.get(conversationId);
    if (typingSet) {
      typingSet.delete(userId);
    }

    // Notify others in the conversation
    socket.to(`conversation:${conversationId}`).emit("message:userStoppedTyping", {
      userId,
      conversationId,
    });
  }

  private handleMarkAsRead(socket: Socket, data: { conversationId: string; messageId: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId, messageId } = data;

    console.log(`👁️ User ${userId} read message ${messageId}`);

    // TODO: Update message in database
    // await Message.findByIdAndUpdate(messageId, { isRead: true, readAt: new Date() });

    // Notify sender that message was read
    this.emitToRoom(`conversation:${conversationId}`, "message:read", {
      messageId,
      conversationId,
      readBy: userId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleDeleteMessage(socket: Socket, data: { conversationId: string; messageId: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId, messageId } = data;

    console.log(`🗑️ User ${userId} deleted message ${messageId}`);

    // TODO: Delete or soft-delete message in database
    // await Message.findByIdAndUpdate(messageId, { isDeleted: true });

    // Notify all users in the conversation
    this.emitToRoom(`conversation:${conversationId}`, "message:deleted", {
      messageId,
      conversationId,
      deletedBy: userId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleEditMessage(socket: Socket, data: { conversationId: string; messageId: string; newMessage: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId, messageId, newMessage } = data;

    console.log(`✏️ User ${userId} edited message ${messageId}`);

    // TODO: Update message in database
    // await Message.findByIdAndUpdate(messageId, { message: newMessage, isEdited: true });

    // Notify all users in the conversation
    this.emitToRoom(`conversation:${conversationId}`, "message:edited", {
      messageId,
      conversationId,
      newMessage,
      editedBy: userId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleReaction(socket: Socket, data: { conversationId: string; messageId: string; reaction: string }): void {
    const userId = this.getUserId(socket);
    const { conversationId, messageId, reaction } = data;

    console.log(`👍 User ${userId} reacted to message ${messageId} with ${reaction}`);

    // TODO: Save reaction in database
    // await MessageReaction.create({ messageId, userId, reaction });

    // Notify all users in the conversation
    this.emitToRoom(`conversation:${conversationId}`, "message:reaction", {
      messageId,
      conversationId,
      userId,
      reaction,
      timestamp: new Date().toISOString(),
    });
  }

  private handleGetMessages(socket: Socket, data: { conversationId: string; page?: number; limit?: number }): void {
    const userId = this.getUserId(socket);
    const { conversationId, page = 1, limit = 50 } = data;

    console.log(`📖 User ${userId} requested messages for conversation ${conversationId}`);

    // TODO: Fetch messages from database with pagination
    // const messages = await Message.find({ conversationId })
    //   .sort({ createdAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(limit);

    socket.emit("message:messagesList", {
      conversationId,
      messages: [], // TODO: Replace with actual messages
      page,
      hasMore: false,
    });
  }

  // Helper Methods

  private updateUserStatus(userId: string, status: "online" | "offline"): void {
    // Broadcast user status to all connected users
    this.emitToAll("message:userStatusChanged", {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });

    // TODO: Update user status in database
    // await User.findByIdAndUpdate(userId, { onlineStatus: status, lastSeen: new Date() });
  }

  // Public Methods (to be called from other parts of the application)

  /**
   * Send direct message to a specific user
   */
  public sendDirectMessageToUser(
    userId: string,
    message: {
      messageId: string;
      senderId: string;
      senderName: string;
      message: string;
      conversationId: string;
    }
  ): boolean {
    return this.emitToUser(userId, "message:direct", {
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify user about new conversation
   */
  public notifyNewConversation(userId: string, conversationData: any): boolean {
    return this.emitToUser(userId, "message:newConversation", {
      ...conversationData,
      timestamp: new Date().toISOString(),
    });
  }
}
