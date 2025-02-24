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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, content } = body

    // Add message to database
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        content,
        isFromUser: true,
        agentId: null
      })
      .returning()

    // Update conversation last message timestamp
    await db
      .update(conversations)
      .set({ 
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        isRead: false // Mark as unread for agents
      })
      .where(eq(conversations.id, conversationId))

    // Get conversation details to check if assigned to an agent
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))

    // Emit new message to conversation room
    global.io?.to(`conversation-${conversationId}`).emit('new-message', {
      ...newMessage,
      conversationId,
    })

    // If conversation is assigned to an agent, also emit to their room
    if (conversation.assignedAgentId) {
      global.io?.to(`agent-${conversation.assignedAgentId}`).emit('new-message', {
        ...newMessage,
        conversationId,
      })
    } else {
      // If not assigned, emit to all agents
      global.io?.to('agents').emit('new-message', {
        ...newMessage,
        conversationId,
      })
    }

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
} 