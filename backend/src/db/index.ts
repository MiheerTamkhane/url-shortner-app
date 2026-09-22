import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Create backend/.env before starting the server.')
}

const pool = new pg.Pool({ connectionString })

const db = drizzle(pool)

export default db
