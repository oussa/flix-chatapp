import "./environment";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { db } from "./drizzle/db";
import { messages, conversations } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import { 
  CustomerEvents, 
  AgentEvents, 
  ServerEvents, 
  type ServerToClientEvents,
  type ClientToServerEvents,
  type MessagePayload,
  type TypingPayload,
  type ServerSocket
} from "./types/events";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handler);
  const io = new Server<ServerToClientEvents, ClientToServerEvents>(server, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
  });

  // Make io instance available globally
  (global as any).io = io;

  io.on("connection", (socket: ServerSocket) => {
    console.log("Client connected", socket.id);

    // Debug socket rooms
    const logRooms = () => {
      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} rooms:`, rooms);
    };

    // Subscribe agent to conversations channel
    socket.on(AgentEvents.JOIN, () => {
      console.log(`Agent subscribed to conversations channel`);
      socket.join('conversations');
      logRooms();
    });

    // Join specific conversation messages channel
    socket.on(CustomerEvents.JOIN, (conversationId: number) => {
      console.log(`Client ${socket.id} joined messages-${conversationId}`);
      socket.join(`messages-${conversationId}`);
      logRooms();
    });

    // Handle new messages from both customer and agent
    socket.on(CustomerEvents.MESSAGE, async (data: MessagePayload) => {
      console.log('Received customer message from socket', socket.id, ':', data);
      const { conversationId, content } = data;
      await handleMessage(socket, { conversationId: Number(conversationId), content, isFromUser: true });
    });

    socket.on(AgentEvents.MESSAGE, async (data: MessagePayload) => {
      console.log('Received agent message from socket', socket.id, ':', data);
      const { conversationId, content, agentId } = data;
      await handleMessage(socket, { conversationId: Number(conversationId), content, isFromUser: false, agentId: Number(agentId) });
    });

    // Handle typing events
    socket.on(CustomerEvents.TYPING, (data: TypingPayload) => {
      io.to(`messages-${data.conversationId}`).emit(ServerEvents.CUSTOMER_TYPING, {
        conversationId: data.conversationId,
        isTyping: true
      });
    });

    // Handle conversation resolved
    socket.on(AgentEvents.RESOLVE_CONVERSATION, async (conversationId: number) => {
      try {
        await db
          .update(conversations)
          .set({ 
            status: 'closed',
            updatedAt: new Date()
          })
          .where(eq(conversations.id, Number(conversationId)));

        // Notify all clients in the conversation messages channel
        io.to(`messages-${conversationId}`).emit(ServerEvents.CONVERSATION_RESOLVED, { id: conversationId });
        
        // Notify all agents about the resolved conversation
        io.to('conversations').emit(ServerEvents.CONVERSATION_RESOLVED, { id: conversationId });
      } catch (error) {
        console.error('Error resolving conversation:', error);
        socket.emit(ServerEvents.ERROR, { error: 'Failed to resolve conversation' });
      }
    });

    socket.on(CustomerEvents.DISCONNECT, () => {
      console.log("Customer disconnected", socket.id);
    });

    socket.on(AgentEvents.DISCONNECT, () => {
      console.log("Agent disconnected", socket.id);
    });
  });

  // Helper function to handle messages
  async function handleMessage(socket: ServerSocket, data: { conversationId: number; content: string; isFromUser: boolean; agentId?: number }) {
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
        id: String(newMessage.id),
        content: newMessage.content,
        conversationId: String(conversationId),
        isFromUser: newMessage.isFromUser,
        createdAt: newMessage.createdAt || new Date()
      };

      // Emit to the conversation messages channel
      console.log(`Broadcasting to messages-${conversationId}:`, messageToSend);
      io.to(`messages-${conversationId}`).emit(ServerEvents.NEW_MESSAGE, messageToSend);

      // If message is from user, notify all agents about the new message
      if (isFromUser) {
        console.log('Broadcasting conversation update to agents');
        io.to('conversations').emit(ServerEvents.CONVERSATION_UPDATED, {
          id: String(conversationId),
          lastMessageAt: messageToSend.createdAt,
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit(ServerEvents.ERROR, { error: 'Failed to send message' });
    }
  }

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}); 