import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { authenticate } from '../middlewares/auth.middleware';
import config from './env';
import { pubClient, subClient } from './redis';
import { TJwtPayload } from '../types/jsonwebtoken.type';

export let io: IOServer;

// Initialize Socket.io server
export const initializeSocket = async (
  server: http.Server,
): Promise<IOServer> => {
  try {
    // Extract socket path from URL pathname
    const url = new URL(config.url || 'http://localhost:5000');
    const path =
      url.pathname === '/' || !url.pathname ? '/socket.io' : url.pathname;

    // Create Socket.io server
    io = new IOServer(server, {
      cors: {
        origin: [
          config.url,
          config.adminpanel_url,
          config.website_url,
          ...config.cors_origins,
        ]?.filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: path,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Setup Redis adapter if available
    await setupRedisAdapter();

    // Setup authentication middleware
    setupAuthMiddleware();

    // Setup connection handlers
    setupConnectionHandlers();

    console.log(`🔌 Socket.io initialized - PID: ${process.pid}`);
    return io;
  } catch (error) {
    console.error('❌ Socket.io initialization failed:', error);
    throw error;
  }
};

// Setup Redis adapter for clustering
const setupRedisAdapter = async (): Promise<void> => {
  try {
    if (!config.redis_enabled) {
      console.log('🔕 Redis disabled by configuration');
      return;
    }

    // isReady, not isOpen: a client still reconnecting would reject the adapter's commands.
    if (pubClient.isReady && subClient.isReady) {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.io Redis adapter enabled (clustering support)');
    } else {
      console.log(
        'ℹ️ Socket.io running in single-instance mode (Redis unavailable)',
      );
    }
  } catch (error) {
    console.warn(
      '⚠️ Redis adapter setup failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log('ℹ️ Socket.io running in single-instance mode');
  }
};

// Setup authentication middleware: the handshake token (auth.token or Authorization
// header) is verified like an HTTP request; invalid tokens are rejected, no token = anonymous.
const setupAuthMiddleware = (): void => {
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers.authorization;
    if (!token) return next();

    try {
      const { decoded, user } = await authenticate(token);
      socket.data.user = { ...decoded, role: user.role };
      next();
    } catch (_error) {
      next(new Error('Authentication failed'));
    }
  });
};

// Setup connection event handlers
const setupConnectionHandlers = (): void => {
  io.on('connection', (socket: Socket) => {
    handleConnection(socket);
  });
};

// Handle individual socket connections
const handleConnection = (socket: Socket): void => {
  const user = socket.data.user as TJwtPayload | undefined;

  // Join user-specific rooms if authenticated
  if (user?._id) {
    const userRoom = `user:${user._id}`;
    socket.join(userRoom);

    if (user.role) {
      socket.join(`role:${user.role}`);
    }

    console.log(
      `✅ User joined rooms - Socket: ${socket.id}, User: ${user._id}, Role: ${user.role || 'none'}`,
    );
  }

  // Handle custom events
  setupSocketEvents(socket);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error: ${socket.id}`, error);
  });
};

// Rooms a socket may join: only its own user and role rooms.
const canJoin = (socket: Socket, roomId: string): boolean => {
  const user = socket.data.user as TJwtPayload | undefined;
  return (
    !!user?._id &&
    (roomId === `user:${user._id}` || roomId === `role:${user.role}`)
  );
};

// Setup custom socket event handlers
const setupSocketEvents = (socket: Socket): void => {
  socket.on('join-room', (roomId: string) => {
    if (typeof roomId === 'string' && canJoin(socket, roomId)) {
      socket.join(roomId);
      socket.emit('room-joined', roomId);
    }
  });

  socket.on('leave-room', (roomId: string) => {
    if (typeof roomId === 'string') {
      socket.leave(roomId);
      socket.emit('room-left', roomId);
    }
  });

  // Only to rooms this socket is in, so nobody can push messages into other users' rooms.
  socket.on('room-message', (data: { roomId: string; message: string }) => {
    if (data?.roomId && data.message && socket.rooms.has(data.roomId)) {
      socket.to(data.roomId).emit('room-message', {
        from: socket.id,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
};

// Utility functions for emitting events

// Emit to specific user
export const emitToUser = (
  userId: string,
  event: string,
  data: unknown,
): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to users with specific role
export const emitToRole = (
  role: string,
  event: string,
  data: unknown,
): void => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

// Emit to custom room
export const emitToRoom = (
  roomId: string,
  event: string,
  data: unknown,
): void => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

// Broadcast to all connected clients
export const broadcast = (event: string, data: unknown): void => {
  if (io) {
    io.emit(event, data);
  }
};

// Get Socket.io instance (throws if not initialized)
export const getIO = (): IOServer => {
  if (!io) {
    throw new Error(
      'Socket.io not initialized. Call initializeSocket() first.',
    );
  }
  return io;
};

// Get connection count
export const getConnectionCount = async (): Promise<number> => {
  if (!io) return 0;

  try {
    const sockets = await io.fetchSockets();
    return sockets.length;
  } catch (error) {
    console.warn('⚠️ Failed to get connection count:', error);
    return 0;
  }
};

// Close all connections gracefully
export const closeConnections = async (): Promise<void> => {
  if (io) {
    console.log('🔌 Closing all socket connections...');

    try {
      const sockets = await io.fetchSockets();
      console.log(`📊 Closing ${sockets.length} active connections`);

      // Emit shutdown notice to all clients
      io.emit('server-shutdown', { message: 'Server is shutting down' });

      // Close server
      io.close();
      console.log('✅ Socket.io server closed');
    } catch (error) {
      console.warn('⚠️ Error closing socket connections:', error);
    }
  }
};
