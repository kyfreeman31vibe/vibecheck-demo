// Vercel Serverless Function: Spotify OAuth Callback
// GET /api/spotify/callback?code=<auth_code>&state=<supabase_jwt>
//
// Exchanges the authorization code for tokens, fetches the user's Spotify data
// (top artists, top tracks, recently played), and stores it in listening_profiles.

const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function exchangeCodeForTokens(code) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
  });
  return res.json();
}

async function spotifyGet(url, accessToken) {
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  if (!res.ok) return null;
  return res.json();
}

module.exports = async function handler(req, res) {
  const { code, state, error: spotifyError } = req.query;

  if (spotifyError) {
    return res.redirect('/app/spotify?error=' + encodeURIComponent(spotifyError));
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  // 1. Exchange auth code for access + refresh tokens
  const tokens = await exchangeCodeForTokens(code);
  if (tokens.error) {
    return res.redirect('/app/spotify?error=' + encodeURIComponent(tokens.error_description || tokens.error));
  }

  const accessToken = tokens.access_token;

  // 2. Verify the Supabase user from the JWT passed in state
  const supabase = getSupabaseAdmin();
  const { data: { user }, error: authError } = await supabase.auth.getUser(state);

  if (authError || !user) {
    return res.redirect('/app/spotify?error=invalid_session');
  }

  // 3. Fetch Spotify data in parallel
  const [profile, topArtists, topTracks, recentlyPlayed] = await Promise.all([
    spotifyGet('https://api.spotify.com/v1/me', accessToken),
    spotifyGet('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term', accessToken),
    spotifyGet('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term', accessToken),
    spotifyGet('https://api.spotify.com/v1/me/player/recently-played?limit=50', accessToken),
  ]);

  // 4. Shape the data for storage
  const artistItems = (topArtists?.items || []).map(function (a) {
    return { id: a.id, name: a.name, genres: a.genres, popularity: a.popularity, image: (a.images && a.images[0] && a.images[0].url) || null };
  });

  const trackItems = (topTracks?.items || []).map(function (t) {
    return { id: t.id, name: t.name, artists: t.artists.map(function (a) { return a.name; }), album: t.album.name, image: (t.album.images && t.album.images[0] && t.album.images[0].url) || null };
  });

  const recentItems = (recentlyPlayed?.items || []).map(function (item) {
    var t = item.track;
    return { id: t.id, name: t.name, artists: t.artists.map(function (a) { return a.name; }), played_at: item.played_at };
  });

  // 5. Upsert into listening_profiles
  var { error: upsertError } = await supabase
    .from('listening_profiles')
    .upsert(
      {
        user_id: user.id,
        spotify_id: profile?.id || null,
        display_name: profile?.display_name || null,
        top_artists: artistItems,
        top_tracks: trackItems,
        recently_played: recentItems,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (upsertError) {
    console.error('Upsert error:', upsertError);
    return res.redirect('/app/spotify?error=sync_failed');
  }

  // 6. Redirect back to the app
  res.redirect('/app/spotify-match?connected=true');
};
