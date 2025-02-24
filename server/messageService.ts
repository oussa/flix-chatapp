import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { messages } from "../drizzle/schema";

export const saveMessage = async (
  conversationId: number,
  content: string,
  isFromUser: boolean,
  agentId?: number
) => {
  const [newMessage] = await db
    .insert(messages)
    .values({ conversationId, content, isFromUser, agentId })
    .returning();

  return newMessage;
};

export const getMessagesByConversation = async (conversationId: number) => {
  return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
};
