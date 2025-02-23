'use server'

import { cookies } from 'next/headers'
import { db } from '@/drizzle/db'
import { agents } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { compare } from 'bcrypt'

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const agent = await db.select().from(agents).where(eq(agents.email, email)).limit(1)
    
    if (!agent.length) {
      return false
    }

    const isValid = await compare(password, agent[0].password)
    
    if (isValid) {
      // Set session cookie
      cookies().set('agent_session', agent[0].id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
      return true
    }

    return false
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

export async function logout() {
  cookies().delete('agent_session')
}

export async function getSession() {
  const session = cookies().get('agent_session')
  return session?.value
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
} 