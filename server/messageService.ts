import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { conversations, messages } from "../drizzle/schema";
import type { Message } from "@/types/socket";

interface SaveMessageParams {
  conversationId: number;
  content: string;
  isFromUser: boolean;
  agentId?: number | null;
}

export const saveMessage = async ({
  conversationId,
  content,
  isFromUser,
  agentId = null
}: SaveMessageParams): Promise<Message> => {
  // Validate required fields
  if (!conversationId || !content) {
    throw new Error('Missing required fields: conversationId and content are required');
  }

  // Validate content is not empty after trimming
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Message content cannot be empty');
  }

  try {
    const now = new Date();
    const [dbMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        content: trimmedContent,
        isFromUser,
        agentId,
        createdAt: now
      })
      .returning();

    if (!dbMessage || !dbMessage.id || !dbMessage.conversationId) {
      throw new Error('Failed to create message: Invalid database response');
    }

    // Convert to Message type with proper date format
    const message: Message = {
      id: dbMessage.id,
      conversationId: dbMessage.conversationId,
      content: dbMessage.content,
      isFromUser: dbMessage.isFromUser,
      agentId: dbMessage.agentId,
      createdAt: now.toISOString()
    };

    await db.update(conversations).set({ lastMessageAt: now, isRead: !isFromUser }).where(eq(conversations.id, conversationId));

    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
};

export const getMessagesByConversation = async (conversationId: number) => {
  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }

  const dbMessages = await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  
  // Convert dates to ISO strings
  return dbMessages.map(msg => ({
    ...msg,
    createdAt: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString()
  }));
};
