import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  preferredPosition: text("preferred_position"),
  skillLevel: text("skill_level"),
  city: text("city"),
  preferences: text("preferences"), // JSON string
  language: text("language").default("fr"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  fieldType: text("field_type").notNull(), // "free" or "paid"
  date: integer("date", { mode: 'timestamp' }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  playersNeeded: integer("players_needed").notNull(),
  playersTotal: integer("players_total").notNull(),
  location: text("location").notNull(),
  coordinates: text("coordinates"), // format: "lat,lng"
  complexName: text("complex_name"),
  complexUrl: text("complex_url"),
  pricePerPlayer: real("price_per_player"),
  additionalInfo: text("additional_info"),
  isPrivate: integer("is_private", { mode: 'boolean' }).default(false),
  creatorId: integer("creator_id").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // "confirmed", "waiting"
  joinedAt: integer("joined_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").default("message"), // "message", "system"
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "match_update", "new_message", etc.
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  relatedMatchId: integer("related_match_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertMatchSchema = createInsertSchema(matches);
export const insertParticipantSchema = createInsertSchema(participants);
export const insertMessageSchema = createInsertSchema(messages);
export const insertNotificationSchema = createInsertSchema(notifications);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
