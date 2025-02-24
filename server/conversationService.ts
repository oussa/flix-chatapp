import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { conversations } from "../drizzle/schema";

export const resolveConversation = async (conversationId: number) => {
  await db
    .update(conversations)
    .set({ status: "closed" })
    .where(eq(conversations.id, conversationId));
};
