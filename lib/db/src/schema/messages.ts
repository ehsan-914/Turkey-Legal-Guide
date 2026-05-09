import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const senderRoleEnum = pgEnum("sender_role", ["admin", "client"]);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  senderRole: senderRoleEnum("sender_role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
