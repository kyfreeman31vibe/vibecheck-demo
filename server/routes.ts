import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertSwipeSchema } from "@shared/schema";
import { calculateMusicCompatibility } from "../client/src/lib/music-compatibility";
import { SpotifyService } from "./integrations/spotify";
import { AppleMusicService } from "./integrations/apple-music";
import { EventsService } from "./integrations/events";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user ID" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  // Settings routes
  app.put("/api/users/:id/notifications", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notificationSettings = req.body;
      
      const updatedUser = await storage.updateUser(id, { notificationSettings });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, notificationSettings: updatedUser.notificationSettings });
    } catch (error) {
      res.status(400).json({ message: "Failed to update notification settings" });
    }
  });

  app.put("/api/users/:id/privacy", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const privacySettings = req.body;
      
      const updatedUser = await storage.updateUser(id, { privacySettings });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, privacySettings: updatedUser.privacySettings });
    } catch (error) {
      res.status(400).json({ message: "Failed to update privacy settings" });
    }
  });

  // Discovery routes
  app.get("/api/discover/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const users = await storage.getUsersForDiscovery(userId, 10);
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate compatibility scores and add them to user data
      const usersWithCompatibility = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        const compatibilityScore = calculateMusicCompatibility(currentUser, user);
        
        return {
          ...userWithoutPassword,
          compatibilityScore,
          sharedGenres: currentUser.favoriteGenres?.filter(genre => 
            user.favoriteGenres?.includes(genre)
          ) || [],
          sharedArtists: currentUser.favoriteArtists?.filter(artist => 
            user.favoriteArtists?.includes(artist)
          ) || []
        };
      });

      res.json(usersWithCompatibility);
    } catch (error) {
      res.status(400).json({ message: "Discovery failed" });
    }
  });

  // Swipe routes
  app.post("/api/swipe", async (req, res) => {
    try {
      const swipeData = insertSwipeSchema.parse(req.body);
      const swipe = await storage.createSwipe(swipeData);
      
      // Check if both users liked each other (for right swipes only)
      if (swipeData.direction === "right") {
        const otherUserSwipe = await storage.hasUserSwiped(swipeData.targetId, swipeData.swiperId);
        const otherSwipes = await storage.getUserSwipes(swipeData.targetId);
        const otherLikedBack = otherSwipes.some(s => 
          s.targetId === swipeData.swiperId && s.direction === "right"
        );

        if (otherLikedBack) {
          // Create a match
          const currentUser = await storage.getUser(swipeData.swiperId);
          const targetUser = await storage.getUser(swipeData.targetId);
          
          if (currentUser && targetUser) {
            const compatibilityScore = calculateMusicCompatibility(currentUser, targetUser);
            
            const match = await storage.createMatch({
              userId1: swipeData.swiperId,
              userId2: swipeData.targetId,
              compatibilityScore,
              matched: true,
              userId1Liked: true,
              userId2Liked: true
            });

            return res.json({ ...swipe, matched: true, matchId: match.id });
          }
        }
      }

      res.json({ ...swipe, matched: false });
    } catch (error) {
      res.status(400).json({ message: "Swipe failed" });
    }
  });

  // Match routes
  app.get("/api/matches/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const matches = await storage.getUserMatches(userId);
      
      // Get user details for each match
      const matchesWithDetails = await Promise.all(
        matches.map(async (match) => {
          const partnerId = match.userId1 === userId ? match.userId2 : match.userId1;
          const partner = await storage.getUser(partnerId);
          const messages = await storage.getMatchMessages(match.id);
          const lastMessage = messages[messages.length - 1];
          
          if (partner) {
            const { password, ...partnerWithoutPassword } = partner;
            return {
              ...match,
              partner: partnerWithoutPassword,
              lastMessage,
              unreadCount: 0 // Simplified for now
            };
          }
          return null;
        })
      );

      res.json(matchesWithDetails.filter(Boolean));
    } catch (error) {
      res.status(400).json({ message: "Failed to get matches" });
    }
  });

  // Message routes
  app.get("/api/messages/:matchId", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const messages = await storage.getMatchMessages(matchId);
      res.json(messages);
    } catch (error) {
      res.status(400).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Music Integration Routes
  
  // Spotify Routes
  app.get("/api/auth/spotify", SpotifyService.initiateAuth);
  app.get("/api/auth/spotify/callback", SpotifyService.handleCallback);
  app.get("/api/spotify/playlists", SpotifyService.getPlaylists);
  app.get("/api/spotify/status", (req: any, res) => {
    res.json({ connected: !!req.session?.spotifyTokens });
  });

  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req: any, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = req.session.user.id;
      
      // Get user's matches
      const matches = await storage.getUserMatches(userId);
      const totalMatches = matches.filter(m => m.matched).length;
      
      // Get user's messages for active chats
      const messages = await storage.getUserMessages(userId);
      const activeChats = new Set(messages.map((m: any) => m.matchId)).size;
      
      // Calculate average compatibility score
      const compatibilityScores = matches.map(m => m.compatibilityScore);
      const avgCompatibility = compatibilityScores.length > 0 
        ? Math.round(compatibilityScores.reduce((a, b) => a + b, 0) / compatibilityScores.length)
        : 0;
      
      // Calculate vibe score (based on matches and activity)
      const vibeScore = Math.min(100, (totalMatches * 10) + (activeChats * 5) + avgCompatibility);
      
      res.json({
        totalMatches,
        activeChats,
        compatibilityScore: avgCompatibility,
        vibeScore
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/recent-matches", async (req: any, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = req.session.user.id;
      const matches = await storage.getUserMatches(userId);
      
      // Get recent matches (last 5, matched only)
      const recentMatches = matches
        .filter(m => m.matched)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5);
      
      // Get user details for each match
      const matchesWithDetails = await Promise.all(
        recentMatches.map(async (match) => {
          const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
          const otherUser = await storage.getUserById(otherUserId);
          return {
            name: otherUser?.name || "Unknown",
            compatibilityScore: match.compatibilityScore,
            createdAt: match.createdAt
          };
        })
      );
      
      res.json(matchesWithDetails);
    } catch (error) {
      console.error("Error fetching recent matches:", error);
      res.status(500).json({ error: "Failed to fetch recent matches" });
    }
  });
  

  
  // Apple Music Routes
  app.get("/api/apple-music/developer-token", AppleMusicService.getDeveloperToken);
  app.get("/api/apple-music/playlists", AppleMusicService.getPlaylists);
  app.get("/api/apple-music/search", AppleMusicService.searchMusic);
  
  // Events Routes
  app.get("/api/events", EventsService.getEvents);

  // Logout route - clears session and returns success
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: "Logged out successfully" });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
