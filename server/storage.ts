import { 
  users, matches, messages, swipes,
  type User, type InsertUser, 
  type Match, type InsertMatch,
  type Message, type InsertMessage,
  type Swipe, type InsertSwipe
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private messages: Map<number, Message>;
  private swipes: Map<number, Swipe>;
  private currentUserId: number;
  private currentMatchId: number;
  private currentMessageId: number;
  private currentSwipeId: number;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.swipes = new Map();
    this.currentUserId = 1;
    this.currentMatchId = 1;
    this.currentMessageId = 1;
    this.currentSwipeId = 1;

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
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
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
        personalityTraits: insertUser.personalityTraits || []
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
}

export const storage = new DatabaseStorage();
