import { NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { messages, conversations } from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"
import { Server as ServerIO } from 'socket.io'

declare global {
  var io: ServerIO;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Get conversation to verify it exists and is not resolved
    const conversation = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, parseInt(conversationId)),
        eq(conversations.status, 'open')
      ))
      .limit(1);

    if (!conversation.length) {
      return NextResponse.json(
        { error: "Conversation not found or resolved" },
        { status: 404 }
      );
    }

    // Get all messages for the conversation
    const messageHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, parseInt(conversationId)))
      .orderBy(messages.createdAt);

    return NextResponse.json({ messages: messageHistory });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
