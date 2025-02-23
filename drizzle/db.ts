import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create the database instance
export const db = drizzle(connectionString)
