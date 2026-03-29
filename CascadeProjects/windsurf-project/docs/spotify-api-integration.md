# Spotify API Integration for Profile Auto-Population

## What You Need

1. **Spotify Developer App** — create one at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. **OAuth 2.0 (Authorization Code Flow with PKCE)** — recommended flow for client-side apps. Gives you an access token scoped to the logged-in user's Spotify data.

## Key Scopes to Request

| Scope | What it gives you |
|-------|-------------------|
| `user-read-private` | Display name, profile photo, country |
| `user-top-read` | **Top artists** and **top tracks** (favorite artists + most listened songs) |
| `user-read-recently-played` | Recent listening history |
| `playlist-read-private` | User's playlists |
| `user-library-read` | Saved tracks/albums |

## What You Can Auto-Populate

- **Name** → `GET /me` → `display_name`
- **Profile photo** → `GET /me` → `images[0].url`
- **Top 5 artists** → `GET /me/top/artists?limit=5&time_range=medium_term`
- **Most listened songs** → `GET /me/top/tracks?limit=10&time_range=medium_term`
- **Recent listening** → `GET /me/player/recently-played?limit=20`
- **Playlists** → `GET /me/playlists?limit=20`
- **Genres / mood tags** → derived from top artists' `genres[]` arrays, then mapped to your mood tag vocabulary

## Recommended Architecture

1. **Connect Spotify button** on ProfileSetup or Onboarding
2. **PKCE OAuth flow** — redirect to Spotify, get auth code, exchange for token (all client-side, no server secret needed)
3. **Fetch profile data** with the token, then pre-fill the form fields
4. **Store the Spotify `refresh_token`** in Supabase (encrypted) so you can periodically refresh their listening data
5. **Let users override** — auto-fill but let them edit before saving

## Flow Summary

```
User clicks "Connect Spotify"
  → Redirect to Spotify /authorize (with PKCE)
  → User approves
  → Redirect back with auth code
  → Exchange code for access_token + refresh_token
  → GET /me, /me/top/artists, /me/top/tracks, /me/player/recently-played, /me/playlists
  → Pre-fill ProfileSetup form
  → User reviews & saves → Supabase
```

## Important Notes

- **Rate limits** — Spotify allows ~30 requests/sec per app, which is plenty
- **Token refresh** — access tokens expire in 1 hour; store the `refresh_token` in Supabase to get new ones
- **Mood tag mapping** — Spotify doesn't have "moods" directly, but you can map artist genres (e.g., `chill`, `sad`, `party`) to your mood tags (`Chill`, `Melancholy`, `Hype`)
- **No server secret needed** with PKCE flow — perfect for a React SPA
