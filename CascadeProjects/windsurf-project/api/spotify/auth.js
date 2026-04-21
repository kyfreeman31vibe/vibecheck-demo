// Vercel Serverless Function: Spotify OAuth Authorization Redirect
// GET /api/spotify/auth?token=<supabase_jwt>
//
// Redirects the user to Spotify's authorization page.
// The Supabase JWT is passed via `state` so we can identify the user on callback.

module.exports = function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing token parameter. Pass your Supabase access token.' });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: 'user-read-recently-played user-top-read user-read-private',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: token,
    show_dialog: 'true',
  });

  res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
};
