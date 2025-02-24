import { Server } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/socket'
import { db } from '@/drizzle/db'
import { conversations, messages } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

const io = new Server({
  path: '/api/socket',
})

io.on('connection', (socket) => {
  console.log('Client connected')

  // Join room for specific conversation
  socket.on('join-conversation', (conversationId: number) => {
    socket.join(`conversation-${conversationId}`)
  })

  // Leave conversation room
  socket.on('leave-conversation', (conversationId: number) => {
    socket.leave(`conversation-${conversationId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default io 