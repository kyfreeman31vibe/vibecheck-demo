# Building a Local Artist Awareness Page

## Concept

A page where users discover **artists performing in their city** — blending local event data with artist profiles and music previews. Think "Discover → Artists near you."

## Data Sources

| Source | What it provides | Cost |
|--------|-----------------|------|
| **Ticketmaster Discovery API** | Events by city, artist names, venue, dates, genre | Free (rate-limited) |
| **Songkick API** | Concerts by metro area, artist touring schedules | Free tier available |
| **Bandsintown API** | Artist events, RSVP counts, "tracked" artists | Free for apps |
| **Spotify Web API** | Artist photos, genres, top tracks, popularity score, preview URLs | Free with auth |
| **SeatGeek API** | Events with performer details, venue info, deal scores | Free tier |

## Recommended Approach

**Primary: Ticketmaster or Bandsintown** for local events → **Spotify** for artist enrichment.

## Page Structure

```
Local Artists in [User's City]
├── Filter bar: genre, date range, distance radius
├── Artist Cards (scrollable list)
│   ├── Artist photo (Spotify)
│   ├── Name + genres
│   ├── Popularity score / monthly listeners
│   ├── 30-sec track preview (Spotify preview_url)
│   ├── Upcoming shows (date, venue, ticket link)
│   ├── # VibeCheckers attending
│   └── "Follow" / "Interested" button
├── Map view toggle (optional)
│   └── Pins at venues with artist info popover
└── "Artists your matches are seeing" section
    └── Cross-reference match data with event attendees
```

## Data Flow

```
1. User opens Local Artists page
2. Get user's city from profile (Supabase)
3. Fetch events by city → Ticketmaster/Bandsintown API
   GET https://app.ticketmaster.com/discovery/v2/events.json
     ?city={city}&classificationName=music&size=50&apikey={KEY}
4. Extract unique artist names from events
5. For each artist → Spotify Search API
   GET https://api.spotify.com/v1/search?q={artist_name}&type=artist&limit=1
6. Enrich with: photo, genres, popularity, top track preview
7. Merge event data + Spotify data → render artist cards
8. Cache results in Supabase (refresh daily) to avoid rate limits
```

## API Keys Needed

- **Ticketmaster** — sign up at [developer.ticketmaster.com](https://developer.ticketmaster.com), get a free API key (5000 calls/day)
- **Spotify** — you already need this for profile auto-population; use the same Client Credentials flow (no user login needed for search/artist data)
- **Bandsintown** (alternative) — register at [artists.bandsintown.com](https://artists.bandsintown.com) for an app ID

## VibeCheck-Specific Features

- **"VibeCheckers going"** — cross-reference event attendees (from your DB) with event IDs
- **"Artists your matches like"** — highlight artists that overlap with the user's matches' `favoriteArtists`
- **Mood-based filtering** — map Spotify artist genres to your mood tags, let users filter by mood
- **"Add to favorites"** — save artists to user profile, improve compatibility matching

## Caching Strategy

Don't hit APIs on every page load:

1. **Daily cron** (Supabase Edge Function or Vercel cron) fetches events for active cities
2. Store in a `local_events` Supabase table with artist enrichment
3. Page reads from Supabase, not directly from APIs
4. Keeps you well within free-tier rate limits

## Cost

All of the above can run on **free tiers** — Ticketmaster (5K/day), Spotify (unlimited with client credentials), Supabase (free tier), Vercel (free tier).
