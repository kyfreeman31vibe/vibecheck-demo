import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const APPLE_MUSIC_TEAM_ID = process.env.APPLE_MUSIC_TEAM_ID;
const APPLE_MUSIC_KEY_ID = process.env.APPLE_MUSIC_KEY_ID;
const APPLE_MUSIC_PRIVATE_KEY = process.env.APPLE_MUSIC_PRIVATE_KEY;

interface AppleMusicPlaylist {
  id: string;
  type: 'playlists';
  attributes: {
    name: string;
    description?: { standard: string };
    artwork?: { url: string };
    trackCount: number;
  };
  relationships: {
    tracks: {
      data: Array<{
        id: string;
        type: 'songs';
      }>;
    };
  };
}

interface AppleMusicTrack {
  id: string;
  type: 'songs';
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    genreNames: string[];
    artwork?: { url: string };
  };
}

export class AppleMusicService {
  private static generateDeveloperToken(): string {
    if (!APPLE_MUSIC_TEAM_ID || !APPLE_MUSIC_KEY_ID || !APPLE_MUSIC_PRIVATE_KEY) {
      throw new Error('Apple Music credentials not configured');
    }

    const payload = {
      iss: APPLE_MUSIC_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60), // 180 days
      aud: 'https://appleid.apple.com'
    };

    const header = {
      kid: APPLE_MUSIC_KEY_ID,
      alg: 'ES256'
    };

    return jwt.sign(payload, APPLE_MUSIC_PRIVATE_KEY, {
      algorithm: 'ES256',
      header
    });
  }

  private static async makeAppleMusicRequest(endpoint: string, userToken?: string) {
    const developerToken = this.generateDeveloperToken();
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${developerToken}`,
      'Content-Type': 'application/json'
    };

    if (userToken) {
      headers['Music-User-Token'] = userToken;
    }

    const response = await fetch(`https://api.music.apple.com/v1${endpoint}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getUserPlaylists(userToken: string): Promise<AppleMusicPlaylist[]> {
    try {
      const data = await this.makeAppleMusicRequest('/me/library/playlists?limit=100', userToken);
      
      // Get detailed track information for each playlist
      const playlistsWithTracks = await Promise.all(
        data.data.map(async (playlist: AppleMusicPlaylist) => {
          try {
            const tracks = await this.makeAppleMusicRequest(
              `/me/library/playlists/${playlist.id}/tracks?limit=100`,
              userToken
            );
            return {
              ...playlist,
              relationships: {
                ...playlist.relationships,
                tracks
              }
            };
          } catch (error) {
            console.error(`Error fetching tracks for playlist ${playlist.id}:`, error);
            return playlist;
          }
        })
      );

      return playlistsWithTracks;
    } catch (error) {
      console.error('Error fetching Apple Music playlists:', error);
      throw error;
    }
  }

  static async searchCatalog(query: string, types: string[] = ['songs', 'artists', 'albums']) {
    const params = new URLSearchParams({
      term: query,
      types: types.join(','),
      limit: '25'
    });

    return this.makeAppleMusicRequest(`/catalog/us/search?${params.toString()}`);
  }

  static async getRecommendations(userToken: string) {
    return this.makeAppleMusicRequest('/me/recommendations', userToken);
  }

  // Express route handlers
  static getDeveloperToken = (req: Request, res: Response) => {
    try {
      const token = this.generateDeveloperToken();
      res.json({ developerToken: token });
    } catch (error) {
      console.error('Error generating Apple Music developer token:', error);
      res.status(500).json({ error: 'Failed to generate developer token' });
    }
  };

  static getPlaylists = async (req: Request, res: Response) => {
    const userToken = req.headers['music-user-token'] as string;
    
    if (!userToken) {
      return res.status(401).json({ error: 'Apple Music user token required' });
    }

    try {
      const playlists = await this.getUserPlaylists(userToken);
      res.json(playlists);
    } catch (error) {
      console.error('Error fetching Apple Music playlists:', error);
      res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  };

  static searchMusic = async (req: Request, res: Response) => {
    const { q, types } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    try {
      const searchTypes = types ? (types as string).split(',') : ['songs', 'artists', 'albums'];
      const results = await this.searchCatalog(q as string, searchTypes);
      res.json(results);
    } catch (error) {
      console.error('Error searching Apple Music:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  };
}