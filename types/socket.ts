import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
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

export interface ServerToClientEvents {
  'message': (message: Message) => void
  'message-error': (error: { error: string }) => void
  'message-sent': (message: Message) => void
  'chat-resolved': (data: { id: number }) => void
  'conversation-updated': (data: {
    id: number
    lastMessageAt: string
    isRead: boolean
  }) => void
  'conversation-resolved': (data: { id: number }) => void
  'new-conversation': (conversation: Conversation) => void
}

export interface ClientToServerEvents {
  'join-conversation': (conversationId: number) => void
  'leave-conversation': (conversationId: number) => void
  'subscribe-agent': () => void
  'send-message': (message: {
    conversationId: number
    content: string
    isFromUser: boolean
    agentId?: number | null
  }) => void
  'resolve-conversation': (conversationId: number) => void
} 