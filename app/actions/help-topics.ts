'use server'

import { db } from '@/drizzle/db'
import { helpTopics } from '@/drizzle/schema'
import { desc, asc } from 'drizzle-orm'
import * as icons from 'lucide-react'

export type HelpTopic = {
  id: number
  title: string
  icon: keyof typeof icons
  link: string
}

export async function getHelpTopics(): Promise<HelpTopic[]> {
  const topics = await db.select().from(helpTopics).orderBy(asc(helpTopics.sortOrder))
  
  return topics.map(topic => ({
    id: topic.id,
    title: topic.title,
    icon: topic.icon as keyof typeof icons,
    link: topic.link
  }))
} 