import { Server, Namespace, Socket } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socketAuth.middleware";

/**
 * Abstract base class for Socket.IO namespace handlers
 * Promotes DRY code by providing common functionality
 */
export abstract class BaseSocketHandler {
  protected namespace: Namespace;
  protected connectedUsers: Map<string, Socket>;

  constructor(io: Server, namespacePath: string) {
    this.namespace = io.of(namespacePath);
    this.connectedUsers = new Map();
    this.initialize();
  }

  /**
   * Initialize the namespace with middleware and connection handler
   */
  private initialize(): void {
    // Apply authentication middleware (can be overridden)
    this.namespace.use(this.getAuthMiddleware());

    // Handle connections
    this.namespace.on("connection", (socket: Socket) => {
      this.handleConnection(socket);
    });

    console.log(`✅ ${this.getNamespaceName()} namespace initialized`);
  }

  /**
   * Get authentication middleware - can be overridden by child classes
   */
  protected getAuthMiddleware(): (socket: Socket, next: (err?: Error) => void) => void {
    return socketAuthMiddleware;
  }

  /**
   * Get the namespace instance (public accessor)
   */
  public getNamespace(): Namespace {
    return this.namespace;
  }

  /**
   * Get count of connected users
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Handle new socket connection
   */
  protected handleConnection(socket: Socket): void {
    const userId = this.getUserId(socket);
    
    console.log(`👤 User ${userId} connected to ${this.getNamespaceName()}`);
    
    // Store socket reference
    if (userId) {
      this.connectedUsers.set(userId, socket);
    }

    // Setup event listeners
    this.setupEventListeners(socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      this.handleDisconnection(socket);
    });

    // Notify user of successful connection
    this.onConnectionSuccess(socket);
  }

  /**
   * Handle socket disconnection
   */
  protected handleDisconnection(socket: Socket): void {
    const userId = this.getUserId(socket);
    
    console.log(`👋 User ${userId} disconnected from ${this.getNamespaceName()}`);
    
    // Remove socket reference
    if (userId) {
      this.connectedUsers.delete(userId);
    }

    // Custom cleanup
    this.onDisconnection(socket);
  }

  /**
   * Get user ID from socket
   */
  protected getUserId(socket: Socket): string {
    return socket.data.userId || socket.id;
  }

  /**
   * Get user type from socket
   */
  protected getUserType(socket: Socket): "client" | "developer" | undefined {
    return socket.data.userType;
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get socket for a specific user
   */
  public getUserSocket(userId: string): Socket | undefined {
    return this.connectedUsers.get(userId);
  }

  /**
   * Emit event to specific user
   */
  public emitToUser(userId: string, event: string, data: any): boolean {
    const socket = this.getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Emit event to all connected users in this namespace
   */
  public emitToAll(event: string, data: any): void {
    this.namespace.emit(event, data);
  }

  /**
   * Emit event to a room
   */
  public emitToRoom(room: string, event: string, data: any): void {
    this.namespace.to(room).emit(event, data);
  }

  // Abstract methods to be implemented by child classes

  /**
   * Setup event listeners for the socket
   */
  protected abstract setupEventListeners(socket: Socket): void;

  /**
   * Get the namespace name (for logging)
   */
  protected abstract getNamespaceName(): string;

  /**
   * Called when connection is successful
   */
  protected abstract onConnectionSuccess(socket: Socket): void;

  /**
   * Called when socket disconnects (for cleanup)
   */
  protected abstract onDisconnection(socket: Socket): void;
}
