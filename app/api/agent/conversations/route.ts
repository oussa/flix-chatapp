import { NextResponse } from 'next/server'
import { db } from '@/drizzle/db'
import { conversations, messages } from '@/drizzle/schema'
import { eq, desc, and } from 'drizzle-orm'

// Get all conversations with their messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'open'
    const agentId = searchParams.get('agentId')

    const conditions = [eq(conversations.status, status)]
    if (agentId) {
      conditions.push(eq(conversations.assignedAgentId, parseInt(agentId)))
    }

    const results = await db
      .select()
      .from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.lastMessageAt))

    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      results.map(async (conv) => {
        const msgs = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(messages.createdAt)

        return {
          ...conv,
          messages: msgs,
        }
      })
    )

    return NextResponse.json(conversationsWithMessages)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// Update conversation status or add agent message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, agentId, message, action } = body

    if (action === 'markAsRead') {
      await db
        .update(conversations)
        .set({ isRead: true })
        .where(eq(conversations.id, conversationId))

      return NextResponse.json({ message: 'Conversation marked as read' })
    }

    if (action === 'assign') {
      await db
        .update(conversations)
        .set({
          assignedAgentId: agentId,
          isRead: true
        })
        .where(eq(conversations.id, conversationId))

      return NextResponse.json({ message: 'Conversation assigned' })
    }

    if (action === 'reply') {
      // Add agent message
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId,
          content: message,
          isFromUser: false,
          agentId
        })
        .returning()

      // Update conversation
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(conversations.id, conversationId))

      return NextResponse.json({
        message: 'Reply sent',
        data: newMessage
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

// Close conversation
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { conversationId } = body

    await db
      .update(conversations)
      .set({
        status: 'closed',
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId))

    return NextResponse.json({ message: 'Conversation closed' })
  } catch (error) {
    console.error('Error closing conversation:', error)
    return NextResponse.json(
      { error: 'Failed to close conversation' },
      { status: 500 }
    )
  }
}
