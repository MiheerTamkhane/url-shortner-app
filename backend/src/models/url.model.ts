import { pgTable, uuid, varchar,text ,timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user.model";

export const urlsTable =  pgTable("urls", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id").references(() => usersTable.id).notNull(),

  targetURL: text("target_url").notNull(),
  shortCode: varchar("short_code", { length: 55 }).notNull().unique(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});
