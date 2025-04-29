import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  preferredPosition: text("preferred_position"),
  skillLevel: text("skill_level"),
  city: text("city"),
  preferences: jsonb("preferences"),
  language: text("language").default("fr"),
  createdAt: timestamp("created_at").defaultNow()
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fieldType: text("field_type").notNull(), // "free" or "paid"
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  playersNeeded: integer("players_needed").notNull(),
  playersTotal: integer("players_total").notNull(),
  location: text("location").notNull(),
  coordinates: text("coordinates"), // format: "lat,lng"
  complexName: text("complex_name"),
  complexUrl: text("complex_url"),
  pricePerPlayer: real("price_per_player"),
  additionalInfo: text("additional_info"),
  isPrivate: boolean("is_private").default(false),
  creatorId: integer("creator_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // "confirmed", "waiting"
  joinedAt: timestamp("joined_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  preferredPosition: true,
  skillLevel: true,
  city: true,
  preferences: true,
  language: true
}).omit({ createdAt: true });

export const insertMatchSchema = createInsertSchema(matches)
  .pick({
    title: true,
    fieldType: true,
    date: true,
    duration: true,
    playersNeeded: true,
    playersTotal: true,
    location: true,
    coordinates: true,
    complexName: true,
    complexUrl: true,
    pricePerPlayer: true,
    additionalInfo: true,
    isPrivate: true,
    creatorId: true
  })
  .omit({ createdAt: true })
  .extend({
    // Allow string input for date that will be converted to Date object
    date: z.string().or(z.date()).transform(val => new Date(val))
  });

export const insertParticipantSchema = createInsertSchema(participants).pick({
  matchId: true,
  userId: true,
  status: true
}).omit({ joinedAt: true });

export const insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  userId: true,
  content: true
}).omit({ createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Extended types for UI
export type MatchWithCreator = Match & { creator: User };
export type MatchWithDetails = MatchWithCreator & { 
  participants: (Participant & { user: User })[], 
  messages: (Message & { user: User })[] 
};
