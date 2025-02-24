/**
 * Socket.io Events Enum
 * This file contains all the Socket.io events used in the chat application
 */

/**
 * Events emitted by the Customer UI to the server
 */
export enum CustomerEvents {
  JOIN = 'customer:join-conversation',
  MESSAGE = 'customer:send-message',
  TYPING = 'customer:typing',
  DISCONNECT = 'customer:leave-conversation',
}

/**
 * Events emitted by the Agent UI to the server
 */
export enum AgentEvents {
  JOIN = 'agent:join-conversation',
  MESSAGE = 'agent:send-message',
  RESOLVE_CONVERSATION = 'agent:resolve-conversation',
  DISCONNECT = 'agent:leave-conversation',
}

/**
 * Events emitted by the Server to the clients (Customer & Agent UIs)
 */
export enum ServerEvents {
  NEW_CONVERSATION = 'server:new-conversation',
  NEW_MESSAGE = 'server:new-message',
  CONVERSATION_UPDATED = 'server:conversation-updated',
  CUSTOMER_TYPING = 'server:customer-typing',
  AGENT_TYPING = 'server:agent-typing',
  CONVERSATION_RESOLVED = 'server:conversation-resolved',
  ERROR = 'server:message-error',
  MESSAGE_SENT = 'server:message-sent',
  CHAT_RESOLVED = 'server:chat-resolved'
}
