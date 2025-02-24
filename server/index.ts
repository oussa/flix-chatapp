import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import '../environment';
import { saveMessage } from "./messageService";
import { createConversation, resolveConversation } from "./conversationService";
import { AgentEvents, CustomerEvents } from "@/types/events";

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
    console.log(`User connected: ${socket.id}`);
  
    // socket.on("customer:createConversation", async ({ email, firstName, lastName, bookingId }) => {
    //   const conversation = await createConversation(email, firstName, lastName, bookingId);
    //   socket.emit("server:conversationCreated", conversation);
    // });
  
    socket.on(CustomerEvents.JOIN, ({ conversationId }) => {
      socket.join(conversationId);
      activeCustomers.set(socket.id, conversationId);
    });
  
    socket.on(CustomerEvents.MESSAGE, async ({ conversationId, message }) => {
      console.log("customer:message", conversationId, message);
      const savedMessage = await saveMessage(conversationId, message, true);
      io.to(conversationId).emit("server:newMessage", savedMessage);
      io.emit("server:conversationUpdated", { conversationId, latestMessage: message, unread: true });
    });
  
    socket.on(AgentEvents.JOIN, ({ conversationId }) => {
      socket.join(conversationId);
      activeAgents.add(socket.id);
    });
  
    socket.on(AgentEvents.MESSAGE, async ({ conversationId, message }) => {
      console.log("agent:message", conversationId, message);
      const savedMessage = await saveMessage(conversationId, message, false);
      io.to(conversationId).emit("server:newMessage", savedMessage);
      io.emit("server:conversationUpdated", { conversationId, latestMessage: message, unread: false });
    });
  
    socket.on(AgentEvents.RESOLVE_CONVERSATION, async ({ conversationId }) => {
      await resolveConversation(conversationId);
      io.to(conversationId).emit("server:conversationResolved");
      io.socketsLeave(conversationId);
    });
  
    socket.on(CustomerEvents.DISCONNECT, ({ conversationId }) => {
      activeCustomers.delete(socket.id);
    });

    socket.on(AgentEvents.DISCONNECT, ({ conversationId }) => {
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
