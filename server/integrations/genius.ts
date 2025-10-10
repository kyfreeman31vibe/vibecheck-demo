import type { Request, Response } from "express";

const GENIUS_API_TOKEN = process.env.GENIUS_API_TOKEN;
const GENIUS_API_BASE = "https://api.genius.com";

// Debug: Check if token is loaded
if (!GENIUS_API_TOKEN) {
  console.warn('⚠️ GENIUS_API_TOKEN is not set in environment variables');
} else {
  console.log('✅ GENIUS_API_TOKEN loaded (length:', GENIUS_API_TOKEN.length, ')');
}

interface GeniusSong {
  id: number;
  title: string;
  artist_names: string;
  song_art_image_url: string;
  url: string;
  pageviews?: number;
  release_date_for_display?: string;
}

export class GeniusService {
  // Search for trending songs
  static async searchSongs(query: string, limit: number = 10): Promise<any[]> {
    try {
      // Use access_token query parameter as an alternative to Bearer header
      const response = await fetch(
        `${GENIUS_API_BASE}/search?q=${encodeURIComponent(query)}&access_token=${GENIUS_API_TOKEN}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Genius API error response:', response.status, errorText);
        throw new Error(`Genius API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.hits.slice(0, limit).map((hit: any) => ({
        id: hit.result.id,
        title: hit.result.title,
        artist: hit.result.primary_artist.name,
        imageUrl: hit.result.song_art_image_url,
        url: hit.result.url,
        artistImageUrl: hit.result.primary_artist.image_url,
      }));
    } catch (error) {
      console.error("Error searching Genius:", error);
      return [];
    }
  }

  // Get song details
  static async getSong(songId: number): Promise<any> {
    try {
      const response = await fetch(`${GENIUS_API_BASE}/songs/${songId}`, {
        headers: {
          Authorization: `Bearer ${GENIUS_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Genius API error: ${response.statusText}`);
      }

      const data = await response.json();
      const song = data.response.song;

      return {
        id: song.id,
        title: song.title,
        artist: song.primary_artist.name,
        imageUrl: song.song_art_image_url,
        url: song.url,
        releaseDate: song.release_date_for_display,
        pageviews: song.stats?.pageviews,
        description: song.description?.plain,
      };
    } catch (error) {
      console.error("Error fetching song from Genius:", error);
      return null;
    }
  }

  // Get artist's popular songs
  static async getArtistSongs(artistId: number, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${GENIUS_API_BASE}/artists/${artistId}/songs?sort=popularity&per_page=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${GENIUS_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Genius API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.songs.map((song: any) => ({
        id: song.id,
        title: song.title,
        artist: song.primary_artist.name,
        imageUrl: song.song_art_image_url,
        url: song.url,
      }));
    } catch (error) {
      console.error("Error fetching artist songs from Genius:", error);
      return [];
    }
  }

  // Get trending/popular songs based on current hits
  static async getTrendingSongs(): Promise<any[]> {
    try {
      // Search for popular current artists/songs
      const trendingQueries = [
        "Lady Gaga",
        "Kendrick Lamar",
        "Bad Bunny",
        "Sabrina Carpenter",
        "Chappell Roan",
      ];

      const allSongs: any[] = [];

      for (const query of trendingQueries) {
        const songs = await this.searchSongs(query, 2);
        allSongs.push(...songs);
      }

      // Remove duplicates and return unique songs
      const uniqueSongs = allSongs.filter(
        (song, index, self) =>
          index === self.findIndex((s) => s.id === song.id)
      );

      return uniqueSongs.slice(0, 10);
    } catch (error) {
      console.error("Error fetching trending songs:", error);
      return [];
    }
  }

  // Express route handlers
  static async handleSearch(req: Request, res: Response) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const songs = await GeniusService.searchSongs(q, Number(limit));
      res.json({ songs });
    } catch (error) {
      console.error("Genius search error:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  }

  static async handleTrending(req: Request, res: Response) {
    try {
      const songs = await GeniusService.getTrendingSongs();
      res.json({ trending: songs });
    } catch (error) {
      console.error("Genius trending error:", error);
      res.status(500).json({ error: "Failed to fetch trending songs" });
    }
  }

  static async handleSongDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const song = await GeniusService.getSong(Number(id));
      
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      res.json({ song });
    } catch (error) {
      console.error("Genius song details error:", error);
      res.status(500).json({ error: "Failed to fetch song details" });
    }
  }
}
