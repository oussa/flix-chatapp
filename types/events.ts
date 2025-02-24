/**
 * Socket.io Events Enum
 * This file contains all the Socket.io events used in the chat application
 */

/**
 * Events emitted by the Customer UI to the server
 */
export enum CustomerEvents {
  JOIN = 'join-conversation',
  MESSAGE = 'send-message',
  TYPING = 'customer:typing',
  DISCONNECT = 'leave-conversation',
}

/**
 * Events emitted by the Agent UI to the server
 */
export enum AgentEvents {
  JOIN = 'subscribe-agent',
  MESSAGE = 'send-message',
  RESOLVE_CONVERSATION = 'resolve-conversation',
  DISCONNECT = 'leave-conversation',
}

/**
 * Events emitted by the Server to the clients (Customer & Agent UIs)
 */
export enum ServerEvents {
  NEW_CONVERSATION = 'new-conversation',
  NEW_MESSAGE = 'message',
  CONVERSATION_UPDATED = 'conversation-updated',
  CUSTOMER_TYPING = 'customer:typing',
  AGENT_TYPING = 'agent:typing',
  CONVERSATION_RESOLVED = 'conversation-resolved',
  ERROR = 'message-error',
  MESSAGE_SENT = 'message-sent',
  CHAT_RESOLVED = 'chat-resolved'
}
