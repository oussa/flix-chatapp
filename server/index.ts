import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import '../environment';
import { saveMessage } from "./messageService";
import { resolveConversation } from "./conversationService";
import { AgentEvents, CustomerEvents, ServerEvents } from "@/types/events";

const activeCustomers = new Map();
const activeAgents = new Set();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on(CustomerEvents.JOIN, ({ conversationId }) => {
      socket.join(conversationId);
      activeCustomers.set(socket.id, conversationId);
      io.emit(ServerEvents.NEW_CONVERSATION, conversationId);
    });
  
    socket.on(CustomerEvents.MESSAGE, async ({ conversationId, content }) => {
      const savedMessage = await saveMessage({ conversationId, content, isFromUser: true });
      io.to(conversationId).emit(ServerEvents.NEW_MESSAGE, savedMessage);
      io.emit(ServerEvents.CONVERSATION_UPDATED, { conversationId, latestMessage: content, lastMessageAt: savedMessage.createdAt, isRead: false });
    });
  
    socket.on(AgentEvents.JOIN, ({ conversationId }) => {
      socket.join(conversationId);
      activeAgents.add(socket.id);
    });
  
    socket.on(AgentEvents.MESSAGE, async ({ conversationId, content }) => {
      const savedMessage = await saveMessage({ conversationId, content, isFromUser: false });
      io.to(conversationId).emit(ServerEvents.NEW_MESSAGE, savedMessage);
      io.emit(ServerEvents.CONVERSATION_UPDATED, { conversationId, latestMessage: content, lastMessageAt: savedMessage.createdAt, isRead: true });
    });
  
    socket.on(AgentEvents.RESOLVE_CONVERSATION, async (conversationId) => {
      await resolveConversation(conversationId);
      io.to(conversationId).emit(ServerEvents.CONVERSATION_RESOLVED, { conversationId });
      io.socketsLeave(conversationId);
    });
  
    socket.on(CustomerEvents.DISCONNECT, () => {
      activeCustomers.delete(socket.id);
    });

    socket.on(AgentEvents.DISCONNECT, () => {
      activeAgents.delete(socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> SocketIO Server Ready on http://${hostname}:${port}`);
    });
});
