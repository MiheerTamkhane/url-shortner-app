import { pgTable , uuid, varchar, text, timestamp} from "drizzle-orm/pg-core"
import { time } from "node:console"

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar('first_name', {length: 55}).notNull(),
  lastName: varchar('last_name', {length: 55}),

  email: varchar('email', {length: 255}).notNull().unique(),

  password: text().notNull(),
  salt: text().notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
})