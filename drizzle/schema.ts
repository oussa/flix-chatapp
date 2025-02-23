import { pgTable, serial, text, timestamp, boolean, integer, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  bookingId: text('booking_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  status: text('status').notNull().default('open'), // open, closed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id),
  content: text('content').notNull(),
  isFromUser: boolean('is_from_user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(), // Should be hashed
  createdAt: timestamp('created_at').defaultNow(),
});

export const faqArticles = pgTable('faq_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const helpTopics = pgTable('help_topics', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(), // Store icon name from lucide-react
  link: varchar('link', { length: 255 }).notNull(),
  sortOrder: serial('sort_order').notNull(), // To maintain custom ordering
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
}); 