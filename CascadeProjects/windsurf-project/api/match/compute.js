// Vercel Serverless Function: Claude AI Match Computation
// POST /api/match/compute
// Body: { user_a_id: string, user_b_id: string, token: string }
//
// Fetches both users' listening_profiles from Supabase, sends their data to
// Claude for compatibility analysis, and stores the result in the matches table.

const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function buildPrompt(profileA, profileB) {
  var artistsA = (profileA.top_artists || []).map(function (a) { return a.name; });
  var artistsB = (profileB.top_artists || []).map(function (a) { return a.name; });
  var tracksA = (profileA.top_tracks || []).map(function (t) { return t.name + ' by ' + (t.artists || []).join(', '); });
  var tracksB = (profileB.top_tracks || []).map(function (t) { return t.name + ' by ' + (t.artists || []).join(', '); });
  var genresA = [];
  var genresB = [];
  (profileA.top_artists || []).forEach(function (a) { (a.genres || []).forEach(function (g) { if (genresA.indexOf(g) === -1) genresA.push(g); }); });
  (profileB.top_artists || []).forEach(function (a) { (a.genres || []).forEach(function (g) { if (genresB.indexOf(g) === -1) genresB.push(g); }); });

  return (
    'You are a music compatibility analyst for a social matching app called VibeCheck.\n\n' +
    'Analyze the listening data of two users and return a JSON object with:\n' +
    '- "compatibility_score": a float between 0.0 and 1.0\n' +
    '- "shared_artists": an array of artist names both users listen to\n' +
    '- "shared_tracks": an array of track names both users listen to\n' +
    '- "match_summary": a 2-3 sentence friendly summary of their music compatibility\n\n' +
    'Return ONLY valid JSON, no markdown fences, no extra text.\n\n' +
    '--- User A ---\n' +
    'Display Name: ' + (profileA.display_name || 'Unknown') + '\n' +
    'Top Artists: ' + artistsA.slice(0, 25).join(', ') + '\n' +
    'Top Tracks: ' + tracksA.slice(0, 25).join('; ') + '\n' +
    'Genres: ' + genresA.slice(0, 20).join(', ') + '\n\n' +
    '--- User B ---\n' +
    'Display Name: ' + (profileB.display_name || 'Unknown') + '\n' +
    'Top Artists: ' + artistsB.slice(0, 25).join(', ') + '\n' +
    'Top Tracks: ' + tracksB.slice(0, 25).join('; ') + '\n' +
    'Genres: ' + genresB.slice(0, 20).join(', ')
  );
}

async function callClaude(prompt) {
  var res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    var errBody = await res.text();
    throw new Error('Anthropic API error: ' + res.status + ' ' + errBody);
  }

  var data = await res.json();
  var text = data.content && data.content[0] && data.content[0].text;
  if (!text) throw new Error('Empty response from Claude');
  return text;
}

function parseClaudeResponse(text) {
  // Strip markdown fences if present
  var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  var parsed = JSON.parse(cleaned);

  return {
    compatibility_score: Math.max(0, Math.min(1, parseFloat(parsed.compatibility_score) || 0)),
    shared_artists: Array.isArray(parsed.shared_artists) ? parsed.shared_artists : [],
    shared_tracks: Array.isArray(parsed.shared_tracks) ? parsed.shared_tracks : [],
    match_summary: typeof parsed.match_summary === 'string' ? parsed.match_summary : '',
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body || {};
  var userAId = body.user_a_id;
  var userBId = body.user_b_id;
  var token = body.token;

  if (!userAId || !userBId) {
    return res.status(400).json({ error: 'Missing user_a_id or user_b_id' });
  }
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  var supabase = getSupabaseAdmin();

  // Verify the caller is one of the two users
  var authResult = await supabase.auth.getUser(token);
  if (authResult.error || !authResult.data.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  var callerId = authResult.data.user.id;
  if (callerId !== userAId && callerId !== userBId) {
    return res.status(403).json({ error: 'You can only compute matches involving yourself' });
  }

  // Fetch both listening profiles
  var profileAResult = await supabase
    .from('listening_profiles')
    .select('*')
    .eq('user_id', userAId)
    .single();

  var profileBResult = await supabase
    .from('listening_profiles')
    .select('*')
    .eq('user_id', userBId)
    .single();

  if (profileAResult.error || !profileAResult.data) {
    return res.status(404).json({ error: 'User A has not connected Spotify yet' });
  }
  if (profileBResult.error || !profileBResult.data) {
    return res.status(404).json({ error: 'User B has not connected Spotify yet' });
  }

  // Build prompt and call Claude
  try {
    var prompt = buildPrompt(profileAResult.data, profileBResult.data);
    var claudeText = await callClaude(prompt);
    var result = parseClaudeResponse(claudeText);

    // Ensure consistent ordering: lower UUID = user_a
    var sortedA = userAId < userBId ? userAId : userBId;
    var sortedB = userAId < userBId ? userBId : userAId;

    // Upsert into matches table
    var upsertResult = await supabase.from('matches').upsert(
      {
        user_a_id: sortedA,
        user_b_id: sortedB,
        compatibility_score: result.compatibility_score,
        shared_artists: result.shared_artists,
        shared_tracks: result.shared_tracks,
        match_summary: result.match_summary,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_a_id,user_b_id' }
    );

    if (upsertResult.error) {
      console.error('Match upsert error:', upsertResult.error);
    }

    return res.status(200).json({
      compatibility_score: result.compatibility_score,
      shared_artists: result.shared_artists,
      shared_tracks: result.shared_tracks,
      match_summary: result.match_summary,
      user_a_id: sortedA,
      user_b_id: sortedB,
    });
  } catch (err) {
    console.error('Match compute error:', err);
    return res.status(500).json({ error: 'Failed to compute match: ' + err.message });
  }
};
