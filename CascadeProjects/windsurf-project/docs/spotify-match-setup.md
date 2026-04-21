# Spotify + AI Match Setup Guide

## Overview

Two new features added as isolated API routes + a new `/app/spotify-match` page:

1. **Spotify OAuth** — Connects a user's Spotify account and pulls their top artists, top tracks, and recently played via the Spotify Web API.
2. **Claude AI Matching** — Compares two users' Spotify listening data using the Anthropic Claude API and returns a compatibility score, shared artists/tracks, and a natural-language match summary.

## Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables) **and** to `.env.local` for local development:

### Spotify (from https://developer.spotify.com/dashboard)

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/api/spotify/callback
```

For local development, set `SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback`.

> **Note:** In your Spotify Developer Dashboard, add both your production and localhost redirect URIs under your app's "Redirect URIs" setting.

### Supabase (server-side)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is found in Supabase Dashboard → Settings → API → `service_role` (secret). This key bypasses RLS and is used only by the serverless functions — never expose it to the client.

The existing client-side env vars (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`) remain unchanged.

### Anthropic (from https://console.anthropic.com)

```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Database Schema

The following tables must exist in Supabase (already defined in `supabase/schema.sql` sections 10-11):

- **`listening_profiles`** — stores per-user Spotify data (top artists, tracks, recently played)
- **`matches`** — stores AI-computed compatibility results between two users

Run the schema SQL in Supabase Dashboard → SQL Editor if you haven't already.

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/spotify/auth?token=JWT` | GET | Redirects to Spotify OAuth. Pass user's Supabase JWT as `token`. |
| `/api/spotify/callback` | GET | Handles Spotify OAuth callback. Exchanges code, fetches data, stores in DB. |
| `/api/match/compute` | POST | Computes AI match. Body: `{ user_a_id, user_b_id, token }` |

## Frontend

- **`/app/spotify-match`** — New page for Spotify connection + AI match results.
- Existing pages and components are **not modified**.

## User Flow

1. User navigates to `/app/spotify-match`
2. Clicks "Connect Spotify" → redirected to Spotify OAuth → back to the app
3. Their top artists, tracks, and recently played are stored in `listening_profiles`
4. They see other users who have also connected Spotify
5. Click "Compute Match" next to any user → Claude AI analyzes both profiles
6. Compatibility score, shared artists/tracks, and an AI summary are displayed
