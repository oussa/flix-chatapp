import { pgTable, serial, text, timestamp, boolean, integer, varchar } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  bookingId: text('booking_id'),
  status: text('status').notNull().default('open'), // open, closed
  isRead: boolean('is_read').notNull().default(false),
  assignedAgentId: integer('assigned_agent_id').references(() => agents.id),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id),
  content: text('content').notNull(),
  isFromUser: boolean('is_from_user').notNull(),
  agentId: integer('agent_id').references(() => agents.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(), // Should be hashed
  createdAt: timestamp('created_at').defaultNow(),
});

export const helpTopics = pgTable('help_topics', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(), // Store icon name from lucide-react
  slug: varchar('slug', { length: 100 }).notNull().unique(), // URL-friendly identifier
  sortOrder: serial('sort_order').notNull(), // To maintain custom ordering
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const helpContent = pgTable('help_content', {
  id: serial('id').primaryKey(),
  topicId: integer('topic_id').references(() => helpTopics.id).notNull(),
  content: text('content').notNull(), // HTML content
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
