import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { consultationsTable } from "./consultations";
import { usersTable } from "./users";

export const caseStatusEnum = pgEnum("case_status", [
  "active",
  "pending_documents",
  "in_review",
  "approved",
  "completed",
  "rejected",
]);

export const casePriorityEnum = pgEnum("case_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  serviceType: text("service_type").notNull(),
  status: caseStatusEnum("status").notNull().default("active"),
  priority: casePriorityEnum("priority").notNull().default("normal"),
  notes: text("notes"),
  progressPercent: integer("progress_percent").notNull().default(0),
  consultationId: integer("consultation_id").references(() => consultationsTable.id, { onDelete: "set null" }),
  clientId: integer("client_id").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({
  id: true,
  status: true,
  progressPercent: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
