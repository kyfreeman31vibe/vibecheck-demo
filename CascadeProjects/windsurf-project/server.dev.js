// Local dev server that emulates Vercel serverless functions.
// Run with: node server.dev.js
// Requires: npm install express dotenv http-proxy-middleware (dev deps)

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Mount serverless functions as Express routes
const spotifyAuth = require('./api/spotify/auth');
const spotifyCallback = require('./api/spotify/callback');
const matchCompute = require('./api/match/compute');
const eventsSearch = require('./api/events/search');

app.get('/api/spotify/auth', function (req, res) {
  return spotifyAuth(req, res);
});

app.get('/api/spotify/callback', function (req, res) {
  return spotifyCallback(req, res);
});

app.post('/api/match/compute', function (req, res) {
  return matchCompute(req, res);
});

app.get('/api/events/search', function (req, res) {
  return eventsSearch(req, res);
});

app.listen(PORT, function () {
  console.log('API dev server running on http://localhost:' + PORT);
  console.log('Spotify Client ID:', process.env.SPOTIFY_CLIENT_ID ? '✓ set' : '✗ MISSING');
  console.log('Spotify Secret:', process.env.SPOTIFY_CLIENT_SECRET ? '✓ set' : '✗ MISSING');
  console.log('Supabase URL:', process.env.SUPABASE_URL ? '✓ set' : '✗ MISSING');
  console.log('Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ set' : '✗ MISSING');
  console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ MISSING');
  console.log('Ticketmaster API Key:', process.env.TICKETMASTER_API_KEY ? '✓ set' : '✗ MISSING');
});
