import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'

export async function middleware(request: NextRequest) {
  const isAgentPage = request.nextUrl.pathname.startsWith('/agent')
  const isLoginPage = request.nextUrl.pathname === '/agent/login'
  const session = request.cookies.get('agent_session')

  if (isAgentPage) {
    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/agent/login', request.url))
    }

    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/agent', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/socket')) {
    const res = NextResponse.next()
    
    // Initialize Socket.IO if not already initialized
    const io = (res as any).socket?.server?.io
    
    if (!io) {
      const io = new ServerIO((res as any).socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
        },
      })
      
      ;(res as any).socket.server.io = io
    }
    
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/agent/:path*',
} 