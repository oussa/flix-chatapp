import { NextResponse } from "next/server"

const chatQueue: any[] = []

export async function GET() {
  return NextResponse.json(chatQueue)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newChat = {
    id: Date.now().toString(),
    ...body,
  }
  chatQueue.push(newChat)
  return NextResponse.json({ message: "Added to queue", id: newChat.id })
}
