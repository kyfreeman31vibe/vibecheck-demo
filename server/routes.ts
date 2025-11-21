import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertSwipeSchema } from "@shared/schema";
import { calculateMusicCompatibility } from "../client/src/lib/music-compatibility";
import { SpotifyService } from "./integrations/spotify";
import { AppleMusicService } from "./integrations/apple-music";
import { EventsService } from "./integrations/events";
import { GeniusService } from "./integrations/genius";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Store user in session for server-side authentication
      req.session.user = user;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session for server-side authentication
      req.session.user = user;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req: any, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { password, ...userWithoutPassword } = req.session.user;
    res.json(userWithoutPassword);
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

  // Get user by username (for shareable profiles)
  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid username" });
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
    console.log('=== Spotify Status Check ===');
    console.log('Session ID:', req.sessionID);
    console.log('Session exists:', !!req.session);
    console.log('Session keys:', req.session ? Object.keys(req.session) : 'no session');
    console.log('Spotify tokens exist:', !!req.session?.spotifyTokens);
    console.log('Full session data:', req.session);
    
    res.json({ connected: !!req.session?.spotifyTokens });
  });

  // Enhanced Spotify API endpoints for music profile building
  app.get("/api/spotify/top-artists", async (req: any, res) => {
    console.log('=== Top Artists Request ===');
    console.log('Session ID:', req.sessionID);
    console.log('Session exists:', !!req.session);
    console.log('Spotify tokens exist:', !!req.session?.spotifyTokens);
    
    const tokens = req.session.spotifyTokens;
    if (!tokens) {
      console.log('No tokens found in session for top artists request');
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const timeRange = req.query.time_range || 'medium_term';
      const limit = parseInt(req.query.limit) || 50;
      const topArtists = await SpotifyService.getUserTopArtists(tokens.access_token, timeRange, limit);
      res.json(topArtists);
    } catch (error) {
      console.error('Error fetching top artists:', error);
      res.status(500).json({ error: 'Failed to fetch top artists' });
    }
  });

  app.get("/api/spotify/top-tracks", async (req: any, res) => {
    const tokens = req.session.spotifyTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const timeRange = req.query.time_range || 'medium_term';
      const limit = parseInt(req.query.limit) || 50;
      const topTracks = await SpotifyService.getUserTopTracks(tokens.access_token, timeRange, limit);
      res.json(topTracks);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
  });

  app.get("/api/spotify/recently-played", async (req: any, res) => {
    const tokens = req.session.spotifyTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const limit = parseInt(req.query.limit) || 50;
      const recentTracks = await SpotifyService.getUserRecentlyPlayed(tokens.access_token, limit);
      res.json(recentTracks);
    } catch (error) {
      console.error('Error fetching recently played:', error);
      res.status(500).json({ error: 'Failed to fetch recently played tracks' });
    }
  });

  app.get("/api/spotify/search", async (req: any, res) => {
    const tokens = req.session.spotifyTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const query = req.query.q;
      const type = req.query.type || 'artist';
      const limit = parseInt(req.query.limit) || 20;
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const searchResults = await SpotifyService.searchSpotify(tokens.access_token, query, type, limit);
      res.json(searchResults);
    } catch (error) {
      console.error('Error searching Spotify:', error);
      res.status(500).json({ error: 'Failed to search Spotify' });
    }
  });

  app.get("/api/spotify/recommendations", async (req: any, res) => {
    const tokens = req.session.spotifyTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const params = {
        seed_artists: req.query.seed_artists ? req.query.seed_artists.split(',') : undefined,
        seed_tracks: req.query.seed_tracks ? req.query.seed_tracks.split(',') : undefined,
        seed_genres: req.query.seed_genres ? req.query.seed_genres.split(',') : undefined,
        limit: parseInt(req.query.limit) || 20,
        market: req.query.market || 'US'
      };

      const recommendations = await SpotifyService.getRecommendations(tokens.access_token, params);
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  });

  app.get("/api/spotify/genres", async (req: any, res) => {
    const tokens = req.session.spotifyTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const genres = await SpotifyService.getAvailableGenres(tokens.access_token);
      res.json(genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
      res.status(500).json({ error: 'Failed to fetch available genres' });
    }
  });

  // Genius API Routes
  app.get("/api/genius/search", GeniusService.handleSearch);
  app.get("/api/genius/trending", GeniusService.handleTrending);
  app.get("/api/genius/songs/:id", GeniusService.handleSongDetails);

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
  
  // Event attendance routes
  app.post("/api/events/:eventId/attend", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { eventId } = req.params;
      const { status = "interested", eventName, eventDate, eventVenue, eventCity } = req.body;

      // Check if user already has attendance record
      const existingAttendance = await storage.getEventAttendances(eventId);
      const userAttendance = existingAttendance.find(a => a.userId === userId);

      if (userAttendance) {
        // Update existing attendance
        const updated = await storage.updateEventAttendance(userId, eventId, status);
        res.json(updated);
      } else {
        // Create new attendance record
        const attendance = await storage.createEventAttendance({
          userId,
          eventId,
          eventName,
          eventDate,
          eventVenue,
          eventCity,
          status,
        });
        res.json(attendance);
      }
    } catch (error) {
      console.error("Error updating event attendance:", error);
      res.status(500).json({ error: "Failed to update event attendance" });
    }
  });

  app.get("/api/events/:eventId/attendees", async (req, res) => {
    try {
      const { eventId } = req.params;
      const attendances = await storage.getEventAttendances(eventId);
      
      // Get user details for each attendance
      const attendeesWithUsers = await Promise.all(
        attendances.map(async (attendance) => {
          const user = await storage.getUser(attendance.userId);
          return {
            ...attendance,
            user: user ? {
              id: user.id,
              name: user.name,
              username: user.username,
              profilePicture: user.profilePicture,
              favoriteGenres: user.favoriteGenres,
              personalityType: user.personalityType,
            } : null
          };
        })
      );

      res.json(attendeesWithUsers);
    } catch (error) {
      console.error("Error fetching event attendees:", error);
      res.status(500).json({ error: "Failed to fetch event attendees" });
    }
  });

  app.delete("/api/events/:eventId/attend", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { eventId } = req.params;
      const success = await storage.deleteEventAttendance(userId, eventId);
      
      if (success) {
        res.json({ message: "Attendance removed" });
      } else {
        res.status(404).json({ error: "Attendance not found" });
      }
    } catch (error) {
      console.error("Error removing event attendance:", error);
      res.status(500).json({ error: "Failed to remove event attendance" });
    }
  });

  // Social connection routes
  app.get("/api/social/connections/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const connections = await storage.getUserSocialConnections(userId);
      
      // Get user details for each connection
      const connectionsWithUsers = await Promise.all(
        connections.map(async (connection: any) => {
          const requester = await storage.getUser(connection.requesterId);
          const receiver = await storage.getUser(connection.receiverId);
          
          return {
            ...connection,
            requester: requester ? {
              id: requester.id,
              name: requester.name,
              username: requester.username,
              profilePicture: requester.profilePicture,
            } : null,
            receiver: receiver ? {
              id: receiver.id,
              name: receiver.name,
              username: receiver.username,
              profilePicture: receiver.profilePicture,
            } : null,
          };
        })
      );

      res.json(connectionsWithUsers);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  app.post("/api/social/connect", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { receiverId, connectionType = "friend" } = req.body;

      const connection = await storage.createSocialConnection({
        requesterId: userId,
        receiverId,
        connectionType,
        status: "pending",
      });

      res.json(connection);
    } catch (error) {
      console.error("Error creating social connection:", error);
      res.status(500).json({ error: "Failed to create social connection" });
    }
  });

  app.put("/api/social/connect/:connectionId", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { connectionId } = req.params;
      const { status } = req.body;

      const updated = await storage.updateSocialConnection(parseInt(connectionId), status);
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Connection not found" });
      }
    } catch (error) {
      console.error("Error updating social connection:", error);
      res.status(500).json({ error: "Failed to update social connection" });
    }
  });

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

  // Spotify routes
  app.post("/api/spotify/sync", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { items } = req.body;
      
      const savedItems = [];
      for (const item of items) {
        const savedItem = await storage.createSpotifyItem({
          userId,
          ...item,
        });
        savedItems.push(savedItem);
      }

      res.json(savedItems);
    } catch (error) {
      console.error("Error syncing Spotify items:", error);
      res.status(500).json({ error: "Failed to sync Spotify items" });
    }
  });

  app.get("/api/spotify/items/:userId", async (req: any, res) => {
    try {
      const { userId } = req.params;
      const items = await storage.getUserSpotifyItems(parseInt(userId));
      res.json(items);
    } catch (error) {
      console.error("Error fetching Spotify items:", error);
      res.status(500).json({ error: "Failed to fetch Spotify items" });
    }
  });

  app.delete("/api/spotify/items/:itemId", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { itemId } = req.params;
      const item = await storage.getSpotifyItem(parseInt(itemId));
      
      if (!item || item.userId !== userId) {
        return res.status(404).json({ error: "Item not found" });
      }

      await storage.deleteSpotifyItem(parseInt(itemId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting Spotify item:", error);
      res.status(500).json({ error: "Failed to delete Spotify item" });
    }
  });

  app.post("/api/spotify/items/:itemId/comments", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { itemId } = req.params;
      const { content } = req.body;

      const comment = await storage.createSpotifyItemComment({
        userId,
        spotifyItemId: parseInt(itemId),
        content,
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/spotify/items/:itemId/comments", async (req: any, res) => {
    try {
      const { itemId } = req.params;
      const comments = await storage.getSpotifyItemComments(parseInt(itemId));
      
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? {
              id: user.id,
              name: user.name,
              username: user.username,
              profilePicture: user.profilePicture,
            } : null,
          };
        })
      );

      res.json(commentsWithUsers);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Feed route - aggregates activity from connections
  app.get("/api/feed", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const allUsers = await storage.getAllUsers();
      const userConnections = await storage.getUserSocialConnections(userId);
      
      // Get IDs of accepted connections
      const connectionIds = userConnections
        .filter((c: any) => c.status === "accepted")
        .map((c: any) => c.requesterId === userId ? c.receiverId : c.requesterId);

      const feedItems: any[] = [];

      // Get Spotify shares from connections
      for (const connId of connectionIds) {
        const items = await storage.getUserSpotifyItems(connId);
        const user = await storage.getUser(connId);
        if (items && user) {
          items.forEach((item: any) => {
            feedItems.push({
              type: "spotify_share",
              user: {
                id: user.id,
                name: user.name,
                username: user.username,
                profilePicture: user.profilePicture,
              },
              item: item,
              timestamp: item.createdAt,
            });
          });
        }
      }

      // Get recent connection acceptances
      const recentConnections = userConnections
        .filter((c: any) => c.status === "accepted")
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);

      for (const conn of recentConnections) {
        const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
        const connUser = await storage.getUser(otherUserId);
        if (connUser) {
          feedItems.push({
            type: "new_connection",
            user: {
              id: connUser.id,
              name: connUser.name,
              username: connUser.username,
              profilePicture: connUser.profilePicture,
            },
            connectionType: conn.connectionType,
            timestamp: conn.updatedAt,
          });
        }
      }

      // Get recent event attendances from connections
      const allEvents: any[] = [];
      for (const connId of connectionIds) {
        const events = await storage.getUserEventAttendances(connId);
        const user = await storage.getUser(connId);
        if (events && user) {
          events.forEach((event: any) => {
            allEvents.push({
              type: "event_attendance",
              user: {
                id: user.id,
                name: user.name,
                username: user.username,
                profilePicture: user.profilePicture,
              },
              event: event,
              timestamp: event.createdAt,
            });
          });
        }
      }

      // Merge and sort by timestamp
      const combined = [...feedItems, ...allEvents].sort((a: any, b: any) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      res.json(combined.slice(0, 50));
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
