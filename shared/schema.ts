import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  location: text("location"),
  favoriteGenres: text("favorite_genres").array(),
  favoriteArtists: text("favorite_artists").array(),
  favoriteSongs: text("favorite_songs").array(),
  topDefiningTracks: text("top_defining_tracks").array(),
  personalityType: text("personality_type"),
  personalityTraits: text("personality_traits").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").notNull(),
  userId2: integer("user_id_2").notNull(),
  compatibilityScore: integer("compatibility_score").notNull(),
  matched: boolean("matched").default(false),
  userId1Liked: boolean("user_id_1_liked").default(false),
  userId2Liked: boolean("user_id_2_liked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // "text", "song_share"
  metadata: jsonb("metadata"), // For storing song info, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperId: integer("swiper_id").notNull(),
  targetId: integer("target_id").notNull(),
  direction: text("direction").notNull(), // "left", "right", "super"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
