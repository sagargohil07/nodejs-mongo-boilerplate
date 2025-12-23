import { Server, Socket } from 'socket.io';

interface Message {
  username: string;
  message: string;
  timestamp: Date;
}

// Store active users
const activeUsers = new Map<string, string>();

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Handle user joining
    socket.on('join', (username: string) => {
      activeUsers.set(socket.id, username);
      console.log(`👤 ${username} joined the chat`);

      // Notify all users
      io.emit('user_joined', {
        username,
        timestamp: new Date(),
        activeUsers: activeUsers.size
      });

      // Send active users list to the new user
      socket.emit('active_users', {
        count: activeUsers.size,
        users: Array.from(activeUsers.values())
      });
    });

    // Handle incoming messages
    socket.on('message', (data: { username: string; message: string }) => {
      const messageData: Message = {
        username: data.username,
        message: data.message,
        timestamp: new Date()
      };

      console.log(`💬 Message from ${data.username}: ${data.message}`);

      // Broadcast message to all users
      io.emit('message', messageData);
    });

    // Handle typing indicator
    socket.on('typing', (data: { username: string; isTyping: boolean }) => {
      socket.broadcast.emit('user_typing', data);
    });

    // Handle private messages
    socket.on('private_message', (data: { to: string; message: string; from: string }) => {
      // Find recipient socket
      const recipientSocketId = Array.from(activeUsers.entries())
        .find(([_, username]) => username === data.to)?.[0];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('private_message', {
          from: data.from,
          message: data.message,
          timestamp: new Date()
        });

        // Send confirmation to sender
        socket.emit('message_sent', {
          to: data.to,
          status: 'delivered'
        });
      } else {
        socket.emit('message_sent', {
          to: data.to,
          status: 'user_not_found'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const username = activeUsers.get(socket.id);
      activeUsers.delete(socket.id);

      console.log(`❌ User disconnected: ${socket.id}`);

      if (username) {
        io.emit('user_left', {
          username,
          timestamp: new Date(),
          activeUsers: activeUsers.size
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO handlers initialized');
};