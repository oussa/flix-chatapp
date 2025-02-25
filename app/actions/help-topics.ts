'use server'

import { db } from '@/drizzle/db'
import { helpTopics, helpContent } from '@/drizzle/schema'
import { asc, eq } from 'drizzle-orm'
import * as icons from 'lucide-react'

export type HelpTopic = {
  id: number
  title: string
  icon: keyof typeof icons
  slug: string
}

export type HelpTopicWithContent = HelpTopic & {
  content: string
}

export async function getHelpTopics(): Promise<HelpTopic[]> {
  const topics = await db.select().from(helpTopics).orderBy(asc(helpTopics.sortOrder))

  return topics.map(topic => ({
    id: topic.id,
    title: topic.title,
    icon: topic.icon as keyof typeof icons,
    slug: topic.slug
  }))
}

export async function getHelpTopicBySlug(slug: string): Promise<HelpTopicWithContent | null> {
  // Get the topic
  const topic = await db.select().from(helpTopics).where(eq(helpTopics.slug, slug)).limit(1)
  
  if (!topic.length) {
    // If topic not found, try to get the default topic
    const defaultTopic = await db.select().from(helpTopics).where(eq(helpTopics.slug, 'default')).limit(1)
    if (!defaultTopic.length) {
      return null
    }
    
    // Get content for default topic
    const defaultContent = await db.select().from(helpContent).where(eq(helpContent.topicId, defaultTopic[0].id)).limit(1)
    if (!defaultContent.length) {
      return null
    }
    
    return {
      id: defaultTopic[0].id,
      title: defaultTopic[0].title,
      icon: defaultTopic[0].icon as keyof typeof icons,
      slug: defaultTopic[0].slug,
      content: defaultContent[0].content
    }
  }
  
  // Get content for the topic
  const content = await db.select().from(helpContent).where(eq(helpContent.topicId, topic[0].id)).limit(1)
  
  if (!content.length) {
    return null
  }
  
  return {
    id: topic[0].id,
    title: topic[0].title,
    icon: topic[0].icon as keyof typeof icons,
    slug: topic[0].slug,
    content: content[0].content
  }
}
