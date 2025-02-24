import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { AgentEvents, CustomerEvents, ServerEvents } from '@/types/events'
import type { Socket as SocketIOClient } from 'socket.io-client';
import type { Socket as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export interface ConversationUpdate {
  id: number
  status?: 'open' | 'closed'
  isRead?: boolean
  assignedAgentId?: number | null
}

export interface ConversationResolved {
  id: number
  message: string
}

export interface ErrorEvent {
  error: string;
}

export interface MessagePayload {
  content: string;
  conversationId: number;
  isFromUser: boolean;
  agentId?: number | null;
}

export interface TypingPayload {
  conversationId: number;
  isTyping: boolean;
}

export interface ConversationUpdatePayload {
  conversationId: number;
  latestMessage: string;
  lastMessageAt: string;
  isRead: boolean;
}

export interface ConversationResolvedPayload {
  conversationId: number;
}

export interface Message {
  id: number
  content: string
  isFromUser: boolean
  agentId: number | null
  createdAt: string
  conversationId: number
}

export interface Conversation {
  id: number
  email: string
  firstName: string
  lastName: string
  bookingId: string | null
  status: 'open' | 'closed'
  isRead: boolean
  assignedAgentId: number | null
  lastMessageAt: string
  messages: Message[]
  latestMessage?: string
}

/**
 * Type definitions for event payloads
 */
export interface ServerToClientEvents {
  [ServerEvents.NEW_CONVERSATION]: (conversationId: number) => void;
  [ServerEvents.NEW_MESSAGE]: (message: Message) => void;
  [ServerEvents.MESSAGE_SENT]: (message: Message) => void;
  [ServerEvents.CONVERSATION_UPDATED]: (data: ConversationUpdatePayload) => void;
  [ServerEvents.CUSTOMER_TYPING]: (data: TypingPayload) => void;
  [ServerEvents.AGENT_TYPING]: (data: TypingPayload) => void;
  [ServerEvents.CONVERSATION_RESOLVED]: (data: ConversationResolvedPayload) => void;
  [ServerEvents.ERROR]: (error: ErrorEvent) => void;
}

export interface ClientToServerEvents {
  [CustomerEvents.JOIN]: (conversationId: number) => void;
  [CustomerEvents.MESSAGE]: (message: MessagePayload) => void;
  [CustomerEvents.TYPING]: (data: TypingPayload) => void;
  [CustomerEvents.DISCONNECT]: (conversationId: number) => void;
  [AgentEvents.JOIN]: () => void;
  [AgentEvents.MESSAGE]: (message: MessagePayload) => void;
  [AgentEvents.RESOLVE_CONVERSATION]: (conversationId: number) => void;
  [AgentEvents.DISCONNECT]: (conversationId: number) => void;
}

// Helper type to extract event names from enums
type CustomerEventNames = `${CustomerEvents}`;
type AgentEventNames = `${AgentEvents}`;
type ServerEventNames = `${ServerEvents}`;

// Combined type for all possible event names
export type EventNames = CustomerEventNames | AgentEventNames | ServerEventNames;

// Socket types with proper event handling
export type ClientSocket = Omit<SocketIOClient<ServerToClientEvents, ClientToServerEvents>, 'emit'> & {
  emit: <E extends EventNames>(event: E, ...args: any[]) => ClientSocket;
};

export type ServerSocket = Omit<SocketIOServer<ClientToServerEvents, ServerToClientEvents>, 'emit'> & {
  emit: <E extends EventNames>(event: E, ...args: any[]) => ServerSocket;
};
