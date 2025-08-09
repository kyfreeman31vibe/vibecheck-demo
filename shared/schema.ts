import { pgTable, text, serial, integer, boolean, timestamp, jsonb, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  profilePicture: text("profile_picture"),
  profilePhotos: text("profile_photos").array(),
  bio: text("bio"),
  location: text("location"),
  favoriteGenres: text("favorite_genres").array(),
  favoriteArtists: text("favorite_artists").array(),
  favoriteSongs: text("favorite_songs").array(),
  topDefiningTracks: text("top_defining_tracks").array(),
  personalityType: text("personality_type"),
  personalityTraits: text("personality_traits").array(),
  createdAt: timestamp("created_at").defaultNow(),
  // Account settings
  email: text("email"),
  address: text("address"),
  birthday: text("birthday"),
  phone: text("phone"),
  // Notification settings
  notificationSettings: json("notification_settings").$type<{
    newMatches: boolean;
    messages: boolean;
    likes: boolean;
    events: boolean;
    marketing: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  }>(),
  // Privacy settings
  privacySettings: json("privacy_settings").$type<{
    profileVisibility: "everyone" | "matches-only" | "hidden";
    ageVisibility: boolean;
    locationVisibility: boolean;
    lastSeenVisibility: boolean;
    readReceipts: boolean;
    onlineStatus: boolean;
    discoverable: boolean;
    showDistance: boolean;
    allowMessages: "everyone" | "matches" | "verified";
  }>(),
  // Billing settings (for Stripe integration)
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlan: text("subscription_plan").default("free"),
  subscriptionStatus: text("subscription_status").default("inactive"),
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

// Event attendance tracking for social networking
export const eventAttendances = pgTable("event_attendances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: text("event_id").notNull(), // Ticketmaster event ID
  eventName: text("event_name").notNull(),
  eventDate: text("event_date").notNull(),
  eventVenue: text("event_venue").notNull(),
  eventCity: text("event_city").notNull(),
  status: text("status").notNull().default("interested"), // "interested", "going", "maybe"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social connections for general networking (non-dating)
export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "declined", "blocked"
  connectionType: text("connection_type").notNull().default("friend"), // "friend", "music_buddy", "event_buddy"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event comments and interactions
export const eventComments = pgTable("event_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: text("event_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"), // For replies
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

export const insertEventAttendanceSchema = createInsertSchema(eventAttendances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventCommentSchema = createInsertSchema(eventComments).omit({
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
export type EventAttendance = typeof eventAttendances.$inferSelect;
export type InsertEventAttendance = z.infer<typeof insertEventAttendanceSchema>;
export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type EventComment = typeof eventComments.$inferSelect;
export type InsertEventComment = z.infer<typeof insertEventCommentSchema>;
