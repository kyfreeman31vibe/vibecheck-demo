import { Request, Response } from 'express';
import session from 'express-session';

interface RequestWithSession extends Request {
  session: session.Session & Partial<session.SessionData> & {
    spotifyTokens?: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    };
    spotifyProfile?: any;
  };
}

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/api/auth/spotify/callback`;

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
    items: Array<{
      track: {
        id: string;
        name: string;
        artists: Array<{ name: string }>;
        album: { name: string };
      };
    }>;
  };
}

export class SpotifyService {
  private static getAuthUrl(): string {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-private',
      'user-read-email'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID!,
      scope: scopes,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: 'vibecheck-auth'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  private static async exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  private static async refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    return response.json();
  }

  private static async makeSpotifyRequest(endpoint: string, accessToken: string) {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
    const data = await this.makeSpotifyRequest('/me/playlists?limit=50', accessToken);
    
    // Get detailed playlist information including tracks
    const playlistsWithTracks = await Promise.all(
      data.items.map(async (playlist: any) => {
        const tracks = await this.makeSpotifyRequest(`/playlists/${playlist.id}/tracks?limit=50`, accessToken);
        return {
          ...playlist,
          tracks
        };
      })
    );

    return playlistsWithTracks;
  }

  static async getUserProfile(accessToken: string) {
    return this.makeSpotifyRequest('/me', accessToken);
  }

  // Express route handlers
  static initiateAuth = (req: Request, res: Response) => {
    console.log('=== Spotify Auth Request ===');
    console.log('Client ID configured:', !!SPOTIFY_CLIENT_ID);
    console.log('Client Secret configured:', !!SPOTIFY_CLIENT_SECRET);
    console.log('Redirect URI:', SPOTIFY_REDIRECT_URI);
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Missing Spotify credentials');
      return res.status(500).json({ error: 'Spotify credentials not configured' });
    }
    
    const authUrl = this.getAuthUrl();
    console.log('Generated auth URL:', authUrl);
    console.log('Redirecting to Spotify...');
    
    res.redirect(authUrl);
  };

  static handleCallback = async (req: RequestWithSession, res: Response) => {
    console.log('=== Spotify Callback Received ===');
    console.log('Query params:', req.query);
    
    const { code, state, error } = req.query;

    if (error) {
      console.error('Spotify auth error from callback:', error);
      return res.redirect('/setup?error=spotify_denied');
    }

    if (state !== 'vibecheck-auth') {
      console.error('Invalid state parameter. Expected: vibecheck-auth, Got:', state);
      return res.redirect('/setup?error=invalid_state');
    }

    if (!code) {
      console.error('No authorization code provided');
      return res.redirect('/setup?error=no_code');
    }

    console.log('Valid authorization code received, exchanging for tokens...');

    try {
      const tokens = await this.exchangeCodeForTokens(code as string);
      console.log('Token exchange successful');
      
      const profile = await this.getUserProfile(tokens.access_token);
      console.log('User profile retrieved:', profile.display_name);
      
      // Store tokens in session or database
      req.session.spotifyTokens = tokens;
      req.session.spotifyProfile = profile;
      console.log('Tokens and profile stored in session');

      console.log('Redirecting to profile setup with success...');
      res.redirect('/setup?connected=spotify');
    } catch (error) {
      console.error('Spotify auth error:', error);
      res.redirect('/setup?error=auth_failed');
    }
  };

  static getPlaylists = async (req: RequestWithSession, res: Response) => {
    const tokens = req.session.spotifyTokens;
    
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    try {
      const playlists = await this.getUserPlaylists(tokens.access_token);
      res.json(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      
      // Try refreshing token if it's expired
      try {
        const newTokens = await this.refreshAccessToken(tokens.refresh_token);
        req.session.spotifyTokens = newTokens;
        const playlists = await this.getUserPlaylists(newTokens.access_token);
        res.json(playlists);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        res.status(401).json({ error: 'Spotify authentication expired' });
      }
    }
  };
}