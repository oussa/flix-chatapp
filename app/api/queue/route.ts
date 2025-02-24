import { NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { conversations, messages } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { Server as ServerIO } from 'socket.io'

declare global {
  var io: ServerIO;
}

export async function GET() {
  const activeConversations = await db
    .select()
    .from(conversations)
    .where(eq(conversations.status, 'open'))
    .leftJoin(messages, eq(messages.conversationId, conversations.id))

  return NextResponse.json(activeConversations)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userInfo, messages: chatMessages } = body

    // Create conversation with user info
    const [conversation] = await db.insert(conversations)
      .values({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        bookingId: userInfo.bookingId || null,
        status: 'open'
      })
      .returning()

    // Store messages
    const messagesToInsert = chatMessages.map((msg: any) => ({
      conversationId: conversation.id,
      content: msg.text,
      isFromUser: msg.isUser,
      createdAt: new Date(msg.timestamp)
    }))

    const savedMessages = await db.insert(messages)
      .values(messagesToInsert)
      .returning()

    // Emit new conversation to all agents
    global.io?.to('agents').emit('new-conversation', {
      ...conversation,
      messages: savedMessages
    });

    return NextResponse.json({
      message: "Added to queue",
      conversationId: conversation.id
    })
  } catch (error) {
    console.error("Error adding to queue:", error)
    return NextResponse.json(
      { error: "Failed to add to queue" },
      { status: 500 }
    )
  }
}
