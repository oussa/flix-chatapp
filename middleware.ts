import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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

  return NextResponse.next()
}

export const config = {
  matcher: '/agent/:path*',
} 