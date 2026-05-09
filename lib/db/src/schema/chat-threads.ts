import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatThreadStatusEnum = pgEnum("chat_thread_status", ["open", "closed"]);

export const chatThreadsTable = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  status: chatThreadStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: serial("thread_id").notNull(),
  senderRole: text("sender_role").notNull().default("client"),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatThreadSchema = createInsertSchema(chatThreadsTable).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertChatThread = z.infer<typeof insertChatThreadSchema>;
export type ChatThread = typeof chatThreadsTable.$inferSelect;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
