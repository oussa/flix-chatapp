// @ts-nocheck
import "./environment";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { db } from "./drizzle/db";
import { messages, conversations } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handler);
  const io = new Server(server, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
  });

  // Make io instance available globally
  global.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    // Debug socket rooms
    const logRooms = () => {
      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} rooms:`, rooms);
    };

    // Subscribe agent to conversations channel
    socket.on("subscribe-agent", () => {
      console.log(`Agent subscribed to conversations channel`);
      socket.join('conversations');
      logRooms();
    });

    // Join specific conversation messages channel
    socket.on("join-conversation", (conversationId) => {
      console.log(`Client ${socket.id} joined messages-${conversationId}`);
      socket.join(`messages-${conversationId}`);
      logRooms();
    });

    // Leave specific conversation messages channel
    socket.on("leave-conversation", (conversationId) => {
      console.log(`Client ${socket.id} left messages-${conversationId}`);
      socket.leave(`messages-${conversationId}`);
      logRooms();
    });

    // Handle new messages
    socket.on("send-message", async (data) => {
      console.log('Received message from socket', socket.id, ':', data);
      const { conversationId, content, isFromUser, agentId = null } = data;

      try {
        // Save message to database
        const [newMessage] = await db
          .insert(messages)
          .values({
            conversationId,
            content,
            isFromUser,
            agentId
          })
          .returning();

        console.log('Saved message to database:', newMessage);

        // Update conversation last message timestamp and read status
        await db
          .update(conversations)
          .set({ 
            lastMessageAt: new Date(),
            updatedAt: new Date(),
            // Only mark as unread if message is from user
            isRead: !isFromUser
          })
          .where(eq(conversations.id, conversationId));

        const messageToSend = {
          ...newMessage,
          conversationId,
        };

        // Emit to the conversation messages channel
        console.log(`Broadcasting to messages-${conversationId}:`, messageToSend);
        io.to(`messages-${conversationId}`).emit('message', messageToSend);

        // If message is from user, notify all agents about the new message
        if (isFromUser) {
          console.log('Broadcasting conversation update to agents');
          io.to('conversations').emit('conversation-updated', {
            id: conversationId,
            lastMessageAt: newMessage.createdAt,
            isRead: false
          });
        }

        // Acknowledge successful message sending
        socket.emit('message-sent', messageToSend);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle conversation resolved
    socket.on("resolve-conversation", async (conversationId) => {
      try {
        await db
          .update(conversations)
          .set({ 
            status: 'closed',
            updatedAt: new Date()
          })
          .where(eq(conversations.id, conversationId));

        // Notify all clients in the conversation messages channel
        io.to(`messages-${conversationId}`).emit('chat-resolved', { id: conversationId });
        
        // Notify all agents about the resolved conversation
        io.to('conversations').emit('conversation-resolved', { id: conversationId });
      } catch (error) {
        console.error('Error resolving conversation:', error);
        socket.emit('resolve-error', { error: 'Failed to resolve conversation' });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}); 