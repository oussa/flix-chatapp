import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  // In a real application, you would update the chat in a database
  // For this example, we'll just return a success message
  return NextResponse.json({ message: "Message sent", chatId: id })
}
