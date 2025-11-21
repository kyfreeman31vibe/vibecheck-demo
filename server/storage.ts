import { 
  users, matches, messages, swipes, eventAttendances, socialConnections, eventComments, spotifyItems, spotifyItemComments,
  type User, type InsertUser, 
  type Match, type InsertMatch,
  type Message, type InsertMessage,
  type Swipe, type InsertSwipe,
  type EventAttendance, type InsertEventAttendance,
  type SocialConnection, type InsertSocialConnection,
  type EventComment, type InsertEventComment,
  type SpotifyItem, type InsertSpotifyItem,
  type SpotifyItemComment, type InsertSpotifyItemComment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, not, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersForDiscovery(userId: number, limit?: number): Promise<User[]>;

  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatch(userId1: number, userId2: number): Promise<Match | undefined>;
  getUserMatches(userId: number): Promise<Match[]>;
  updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMatchMessages(matchId: number): Promise<Message[]>;
  getUserMessages(userId: number): Promise<Message[]>;

  // Swipe operations
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getUserSwipes(userId: number): Promise<Swipe[]>;
  hasUserSwiped(swiperId: number, targetId: number): Promise<boolean>;

  // Event attendance operations
  createEventAttendance(attendance: InsertEventAttendance): Promise<EventAttendance>;
  updateEventAttendance(userId: number, eventId: string, status: string): Promise<EventAttendance | undefined>;
  getEventAttendances(eventId: string): Promise<EventAttendance[]>;
  getUserEventAttendances(userId: number): Promise<EventAttendance[]>;
  deleteEventAttendance(userId: number, eventId: string): Promise<boolean>;

  // Social connection operations
  createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection>;
  updateSocialConnection(id: number, status: string): Promise<SocialConnection | undefined>;
  getUserSocialConnections(userId: number): Promise<SocialConnection[]>;
  getPendingSocialRequests(userId: number): Promise<SocialConnection[]>;

  // Event comment operations
  createEventComment(comment: InsertEventComment): Promise<EventComment>;
  getEventComments(eventId: string): Promise<EventComment[]>;

  // Spotify item operations
  createSpotifyItem(item: InsertSpotifyItem): Promise<SpotifyItem>;
  getUserSpotifyItems(userId: number): Promise<SpotifyItem[]>;
  getSpotifyItem(id: number): Promise<SpotifyItem | undefined>;
  updateSpotifyItem(id: number, updates: Partial<InsertSpotifyItem>): Promise<SpotifyItem | undefined>;
  deleteSpotifyItem(id: number): Promise<boolean>;
  
  // Spotify item comment operations
  createSpotifyItemComment(comment: InsertSpotifyItemComment): Promise<SpotifyItemComment>;
  getSpotifyItemComments(spotifyItemId: number): Promise<SpotifyItemComment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private messages: Map<number, Message>;
  private swipes: Map<number, Swipe>;
  private eventAttendances: Map<number, EventAttendance>;
  private socialConnections: Map<number, SocialConnection>;
  private eventComments: Map<number, EventComment>;
  private currentUserId: number;
  private currentMatchId: number;
  private currentMessageId: number;
  private currentSwipeId: number;
  private currentAttendanceId: number;
  private currentConnectionId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.swipes = new Map();
    this.eventAttendances = new Map();
    this.socialConnections = new Map();
    this.eventComments = new Map();
    this.currentUserId = 1;
    this.currentMatchId = 1;
    this.currentMessageId = 1;
    this.currentSwipeId = 1;
    this.currentAttendanceId = 1;
    this.currentConnectionId = 1;
    this.currentCommentId = 1;

    // Initialize with some demo users
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoUsers: InsertUser[] = [
      {
        username: "emma_music",
        password: "password123",
        name: "Emma",
        age: 25,
        bio: "Music lover, concert goer, vinyl collector",
        location: "2 miles away",
        favoriteGenres: ["Rock", "Pop", "Indie"],
        favoriteArtists: ["The Beatles", "Taylor Swift", "Arctic Monkeys"],
        favoriteSongs: ["Bohemian Rhapsody", "Hey Jude", "Love Story"]
      },
      {
        username: "alex_beats",
        password: "password123",
        name: "Alex",
        age: 28,
        bio: "DJ, producer, festival enthusiast",
        location: "3 miles away",
        favoriteGenres: ["Electronic", "House", "Rock"],
        favoriteArtists: ["Daft Punk", "The Beatles", "Deadmau5"],
        favoriteSongs: ["One More Time", "Come As You Are", "Bohemian Rhapsody"]
      },
      {
        username: "sarah_melody",
        password: "password123",
        name: "Sarah",
        age: 24,
        bio: "Singer-songwriter, guitar player",
        location: "1 mile away",
        favoriteGenres: ["Indie", "Folk", "Pop"],
        favoriteArtists: ["Bon Iver", "Taylor Swift", "Phoebe Bridgers"],
        favoriteSongs: ["Holocene", "Cardigan", "Motion Sickness"]
      }
    ];

    demoUsers.forEach(user => {
      const id = this.currentUserId++;
      const newUser: User = { 
        ...user, 
        id,
        profilePicture: null,
        profilePhotos: [],
        bio: user.bio || null,
        personalityType: user.personalityType || null,
        favoriteGenres: user.favoriteGenres || [],
        favoriteArtists: user.favoriteArtists || [],
        favoriteSongs: user.favoriteSongs || [],
        topDefiningTracks: user.topDefiningTracks || [],
        personalityTraits: user.personalityTraits || [],
        location: user.location || null,
        email: null,
        address: null,
        birthday: null,
        phone: null,
        notificationSettings: null,
        privacySettings: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionPlan: "free",
        subscriptionStatus: "inactive",
        connectionInterests: [],
        createdAt: new Date()
      };
      this.users.set(id, newUser);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      profilePicture: null,
      profilePhotos: insertUser.profilePhotos || [],
      bio: insertUser.bio || null,
      personalityType: insertUser.personalityType || null,
      favoriteGenres: insertUser.favoriteGenres || [],
      favoriteArtists: insertUser.favoriteArtists || [],
      favoriteSongs: insertUser.favoriteSongs || [],
      topDefiningTracks: insertUser.topDefiningTracks || [],
      personalityTraits: insertUser.personalityTraits || [],
      location: insertUser.location || null,
      email: insertUser.email || null,
      address: insertUser.address || null,
      birthday: insertUser.birthday || null,
      phone: insertUser.phone || null,
      notificationSettings: insertUser.notificationSettings || null,
      privacySettings: insertUser.privacySettings || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      subscriptionPlan: insertUser.subscriptionPlan || "free",
      subscriptionStatus: insertUser.subscriptionStatus || "inactive",
      connectionInterests: insertUser.connectionInterests || [],
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersForDiscovery(userId: number, limit = 10): Promise<User[]> {
    const swipedUserIds = new Set();
    
    // Get all users this person has already swiped on
    for (const swipe of this.swipes.values()) {
      if (swipe.swiperId === userId) {
        swipedUserIds.add(swipe.targetId);
      }
    }

    return Array.from(this.users.values())
      .filter(user => user.id !== userId && !swipedUserIds.has(user.id))
      .slice(0, limit);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const newMatch: Match = { 
      ...match, 
      id,
      createdAt: new Date()
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async getMatch(userId1: number, userId2: number): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(match => 
      (match.userId1 === userId1 && match.userId2 === userId2) ||
      (match.userId1 === userId2 && match.userId2 === userId1)
    );
  }

  async getUserMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => 
      (match.userId1 === userId || match.userId2 === userId) && match.matched
    );
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;

    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = { 
      ...message, 
      id,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMatchMessages(matchId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.matchId === matchId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    // Get all matches for the user first
    const userMatches = await this.getUserMatches(userId);
    const matchIds = userMatches.map(m => m.id);
    
    return Array.from(this.messages.values())
      .filter(message => matchIds.includes(message.matchId))
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const id = this.currentSwipeId++;
    const newSwipe: Swipe = { 
      ...swipe, 
      id,
      createdAt: new Date()
    };
    this.swipes.set(id, newSwipe);
    return newSwipe;
  }

  async getUserSwipes(userId: number): Promise<Swipe[]> {
    return Array.from(this.swipes.values()).filter(swipe => swipe.swiperId === userId);
  }

  async hasUserSwiped(swiperId: number, targetId: number): Promise<boolean> {
    return Array.from(this.swipes.values()).some(swipe => 
      swipe.swiperId === swiperId && swipe.targetId === targetId
    );
  }

  // Event attendance operations
  async createEventAttendance(attendance: InsertEventAttendance): Promise<EventAttendance> {
    const id = this.currentAttendanceId++;
    const newAttendance: EventAttendance = { 
      ...attendance, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.eventAttendances.set(id, newAttendance);
    return newAttendance;
  }

  async updateEventAttendance(userId: number, eventId: string, status: string): Promise<EventAttendance | undefined> {
    const attendance = Array.from(this.eventAttendances.values()).find(a => 
      a.userId === userId && a.eventId === eventId
    );
    if (!attendance) return undefined;

    const updatedAttendance = { ...attendance, status, updatedAt: new Date() };
    this.eventAttendances.set(attendance.id, updatedAttendance);
    return updatedAttendance;
  }

  async getEventAttendances(eventId: string): Promise<EventAttendance[]> {
    return Array.from(this.eventAttendances.values()).filter(a => a.eventId === eventId);
  }

  async getUserEventAttendances(userId: number): Promise<EventAttendance[]> {
    return Array.from(this.eventAttendances.values()).filter(a => a.userId === userId);
  }

  async deleteEventAttendance(userId: number, eventId: string): Promise<boolean> {
    const attendance = Array.from(this.eventAttendances.values()).find(a => 
      a.userId === userId && a.eventId === eventId
    );
    if (!attendance) return false;

    this.eventAttendances.delete(attendance.id);
    return true;
  }

  // Social connection operations
  async createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection> {
    const id = this.currentConnectionId++;
    const newConnection: SocialConnection = { 
      ...connection, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.socialConnections.set(id, newConnection);
    return newConnection;
  }

  async updateSocialConnection(id: number, status: string): Promise<SocialConnection | undefined> {
    const connection = this.socialConnections.get(id);
    if (!connection) return undefined;

    const updatedConnection = { ...connection, status, updatedAt: new Date() };
    this.socialConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  async getUserSocialConnections(userId: number): Promise<SocialConnection[]> {
    return Array.from(this.socialConnections.values()).filter(c => 
      (c.requesterId === userId || c.receiverId === userId) && c.status === 'accepted'
    );
  }

  async getPendingSocialRequests(userId: number): Promise<SocialConnection[]> {
    return Array.from(this.socialConnections.values()).filter(c => 
      c.receiverId === userId && c.status === 'pending'
    );
  }

  // Event comment operations
  async createEventComment(comment: InsertEventComment): Promise<EventComment> {
    const id = this.currentCommentId++;
    const newComment: EventComment = { 
      ...comment, 
      id,
      createdAt: new Date()
    };
    this.eventComments.set(id, newComment);
    return newComment;
  }

  async getEventComments(eventId: string): Promise<EventComment[]> {
    return Array.from(this.eventComments.values())
      .filter(c => c.eventId === eventId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Event attendance operations
  async createEventAttendance(attendance: InsertEventAttendance): Promise<EventAttendance> {
    const [newAttendance] = await db
      .insert(eventAttendances)
      .values(attendance)
      .returning();
    return newAttendance;
  }

  async updateEventAttendance(userId: number, eventId: string, status: string): Promise<EventAttendance | undefined> {
    const [attendance] = await db
      .update(eventAttendances)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(eventAttendances.userId, userId), eq(eventAttendances.eventId, eventId)))
      .returning();
    return attendance || undefined;
  }

  async getEventAttendances(eventId: string): Promise<EventAttendance[]> {
    return await db
      .select()
      .from(eventAttendances)
      .where(eq(eventAttendances.eventId, eventId));
  }

  async getUserEventAttendances(userId: number): Promise<EventAttendance[]> {
    return await db
      .select()
      .from(eventAttendances)
      .where(eq(eventAttendances.userId, userId));
  }

  async deleteEventAttendance(userId: number, eventId: string): Promise<boolean> {
    const result = await db
      .delete(eventAttendances)
      .where(and(eq(eventAttendances.userId, userId), eq(eventAttendances.eventId, eventId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Social connection operations
  async createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection> {
    const [newConnection] = await db
      .insert(socialConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async updateSocialConnection(id: number, status: string): Promise<SocialConnection | undefined> {
    const [connection] = await db
      .update(socialConnections)
      .set({ status, updatedAt: new Date() })
      .where(eq(socialConnections.id, id))
      .returning();
    return connection || undefined;
  }

  async getUserSocialConnections(userId: number): Promise<SocialConnection[]> {
    return await db
      .select()
      .from(socialConnections)
      .where(
        and(
          or(eq(socialConnections.requesterId, userId), eq(socialConnections.receiverId, userId)),
          eq(socialConnections.status, 'accepted')
        )
      );
  }

  async getPendingSocialRequests(userId: number): Promise<SocialConnection[]> {
    return await db
      .select()
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.receiverId, userId),
          eq(socialConnections.status, 'pending')
        )
      );
  }

  // Event comment operations
  async createEventComment(comment: InsertEventComment): Promise<EventComment> {
    const [newComment] = await db
      .insert(eventComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getEventComments(eventId: string): Promise<EventComment[]> {
    return await db
      .select()
      .from(eventComments)
      .where(eq(eventComments.eventId, eventId))
      .orderBy(eventComments.createdAt);
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        profilePhotos: insertUser.profilePhotos || [],
        bio: insertUser.bio || null,
        personalityType: insertUser.personalityType || null,
        favoriteGenres: insertUser.favoriteGenres || [],
        favoriteArtists: insertUser.favoriteArtists || [],
        favoriteSongs: insertUser.favoriteSongs || [],
        topDefiningTracks: insertUser.topDefiningTracks || [],
        personalityTraits: insertUser.personalityTraits || [],
        connectionInterests: insertUser.connectionInterests || []
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const cleanUpdates: any = { ...updates };
    
    // Ensure privacy settings have proper typing if provided
    if (cleanUpdates.privacySettings) {
      cleanUpdates.privacySettings = {
        profileVisibility: cleanUpdates.privacySettings.profileVisibility || "everyone",
        ageVisibility: cleanUpdates.privacySettings.ageVisibility ?? true,
        locationVisibility: cleanUpdates.privacySettings.locationVisibility ?? true,
        lastSeenVisibility: cleanUpdates.privacySettings.lastSeenVisibility ?? true,
        readReceipts: cleanUpdates.privacySettings.readReceipts ?? true,
        onlineStatus: cleanUpdates.privacySettings.onlineStatus ?? true,
        discoverable: cleanUpdates.privacySettings.discoverable ?? true,
        showDistance: cleanUpdates.privacySettings.showDistance ?? true,
        allowMessages: cleanUpdates.privacySettings.allowMessages || "everyone"
      };
    }
    
    const [user] = await db
      .update(users)
      .set(cleanUpdates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersForDiscovery(userId: number, limit = 10): Promise<User[]> {
    // Get all users this person has already swiped on
    const swipedUsers = await db
      .select({ targetId: swipes.targetId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));
    
    const swipedUserIds = swipedUsers.map(s => s.targetId);
    
    // Get users excluding current user and already swiped users
    if (swipedUserIds.length > 0) {
      return await db
        .select()
        .from(users)
        .where(
          and(
            not(eq(users.id, userId)),
            not(inArray(users.id, swipedUserIds))
          )
        )
        .limit(limit);
    } else {
      return await db
        .select()
        .from(users)
        .where(not(eq(users.id, userId)))
        .limit(limit);
    }
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values(match)
      .returning();
    return newMatch;
  }

  async getMatch(userId1: number, userId2: number): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.userId1, userId1), eq(matches.userId2, userId2)),
          and(eq(matches.userId1, userId2), eq(matches.userId2, userId1))
        )
      );
    return match || undefined;
  }

  async getUserMatches(userId: number): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.userId1, userId), eq(matches.userId2, userId)),
          eq(matches.matched, true)
        )
      );
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return match || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMatchMessages(matchId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    // Get all matches for the user first
    const userMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.userId1, userId), eq(matches.userId2, userId)),
          eq(matches.matched, true)
        )
      );
    
    if (userMatches.length === 0) return [];
    
    const matchIds = userMatches.map(m => m.id);
    
    return await db
      .select()
      .from(messages)
      .where(inArray(messages.matchId, matchIds))
      .orderBy(messages.createdAt);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const [newSwipe] = await db
      .insert(swipes)
      .values(swipe)
      .returning();
    return newSwipe;
  }

  async getUserSwipes(userId: number): Promise<Swipe[]> {
    return await db
      .select()
      .from(swipes)
      .where(eq(swipes.swiperId, userId));
  }

  async hasUserSwiped(swiperId: number, targetId: number): Promise<boolean> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(and(eq(swipes.swiperId, swiperId), eq(swipes.targetId, targetId)));
    return !!swipe;
  }

  async createSpotifyItem(item: InsertSpotifyItem): Promise<SpotifyItem> {
    const [newItem] = await db
      .insert(spotifyItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getUserSpotifyItems(userId: number): Promise<SpotifyItem[]> {
    return await db
      .select()
      .from(spotifyItems)
      .where(and(eq(spotifyItems.userId, userId), eq(spotifyItems.isVisible, true)))
      .orderBy(spotifyItems.displayOrder);
  }

  async getSpotifyItem(id: number): Promise<SpotifyItem | undefined> {
    const [item] = await db
      .select()
      .from(spotifyItems)
      .where(eq(spotifyItems.id, id));
    return item || undefined;
  }

  async updateSpotifyItem(id: number, updates: Partial<InsertSpotifyItem>): Promise<SpotifyItem | undefined> {
    const [item] = await db
      .update(spotifyItems)
      .set(updates)
      .where(eq(spotifyItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteSpotifyItem(id: number): Promise<boolean> {
    const result = await db
      .delete(spotifyItems)
      .where(eq(spotifyItems.id, id));
    return true;
  }

  async createSpotifyItemComment(comment: InsertSpotifyItemComment): Promise<SpotifyItemComment> {
    const [newComment] = await db
      .insert(spotifyItemComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getSpotifyItemComments(spotifyItemId: number): Promise<SpotifyItemComment[]> {
    return await db
      .select()
      .from(spotifyItemComments)
      .where(eq(spotifyItemComments.spotifyItemId, spotifyItemId))
      .orderBy(spotifyItemComments.createdAt);
  }
}

export const storage = new DatabaseStorage();
