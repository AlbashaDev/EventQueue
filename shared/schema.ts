import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Queue item schema
export const queueItems = pgTable("queue_items", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  status: text("status").notNull().default("waiting"), // waiting, serving, completed
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
});

export const insertQueueItemSchema = createInsertSchema(queueItems).pick({
  number: true,
  status: true,
});

export type InsertQueueItem = z.infer<typeof insertQueueItemSchema>;
export type QueueItem = typeof queueItems.$inferSelect;

// Queue settings schema
export const queueSettings = pgTable("queue_settings", {
  id: serial("id").primaryKey(),
  currentNumber: integer("current_number").notNull().default(0),
  lastNumber: integer("last_number").notNull().default(0),
  resetDate: timestamp("reset_date").notNull().defaultNow(),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  visualAlertsEnabled: boolean("visual_alerts_enabled").notNull().default(true),
});

export const insertQueueSettingsSchema = createInsertSchema(queueSettings).omit({
  id: true,
});

export type InsertQueueSettings = z.infer<typeof insertQueueSettingsSchema>;
export type QueueSettings = typeof queueSettings.$inferSelect;

// Queue status for response
export const queueStatusSchema = z.object({
  currentNumber: z.number(),
  nextNumbers: z.array(z.number()),
  waitingCount: z.number(),
  queueItems: z.array(z.object({
    number: z.number(),
    status: z.string(),
    issuedAt: z.string(),
  })),
  lastCalledAt: z.string().optional(),
});

export type QueueStatus = z.infer<typeof queueStatusSchema>;
