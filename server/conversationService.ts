import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { conversations } from "../drizzle/schema";

export const createConversation = async (
  email: string,
  firstName: string,
  lastName: string,
  bookingId?: string
) => {
  const [conversation] = await db
    .insert(conversations)
    .values({ email, firstName, lastName, bookingId, status: "open" })
    .returning();

  return conversation;
};

export const getConversationById = async (conversationId: number) => {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  return conversation;
};

export const resolveConversation = async (conversationId: number) => {
  await db
    .update(conversations)
    .set({ status: "closed" })
    .where(eq(conversations.id, conversationId));
};
