// Vercel Serverless Function: AI Profile-Based Matching
// POST /api/match/ai-score
// Body: { token: string, profiles: [{ id, name, city, bio, genres, favoriteArtists, moods, listeningContexts, musicDiscovery, favoriteDecades, concertFrequency }] }
//
// Takes the authenticated user's profile (derived from token) and a batch of
// other user profiles, sends them to Claude for compatibility analysis based
// purely on profile setup answers. Returns ranked scores and match reasons.

const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function profileToText(p) {
  var lines = [];
  if (p.name) lines.push('Name: ' + p.name);
  if (p.city) lines.push('City: ' + p.city);
  if (p.bio) lines.push('Bio: ' + p.bio);
  if (p.genres && p.genres.length) lines.push('Genres: ' + p.genres.join(', '));
  if (p.favoriteArtists && p.favoriteArtists.length) lines.push('Favorite Artists: ' + p.favoriteArtists.join(', '));
  if (p.moods && p.moods.length) lines.push('Listening Style: ' + p.moods.join(', '));
  if (p.listeningContexts && p.listeningContexts.length) lines.push('Listens While: ' + p.listeningContexts.join(', '));
  if (p.musicDiscovery && p.musicDiscovery.length) lines.push('Discovers Music Via: ' + p.musicDiscovery.join(', '));
  if (p.favoriteDecades && p.favoriteDecades.length) lines.push('Favorite Decades: ' + p.favoriteDecades.join(', '));
  if (p.concertFrequency) lines.push('Concert Frequency: ' + p.concertFrequency);
  return lines.join('\n');
}

function buildPrompt(currentUser, otherUsers) {
  var otherBlocks = otherUsers.map(function (u, i) {
    return '--- User ' + (i + 1) + ' (id: ' + u.id + ') ---\n' + profileToText(u);
  }).join('\n\n');

  return (
    'You are the matching algorithm for VibeCheck, a music-based social app. ' +
    'Your job is to analyze how compatible two people are based ONLY on their profile answers.\n\n' +
    'Consider these factors when scoring:\n' +
    '- Shared or complementary music taste (genres, artists, decades)\n' +
    '- Similar listening habits and contexts (when/where they listen)\n' +
    '- Compatible energy and social style (moods, concert frequency)\n' +
    '- How they discover music (shared discovery methods = natural conversation starters)\n' +
    '- Location proximity (same city = can actually meet)\n' +
    '- Overall vibe alignment from their bio\n\n' +
    'Score from 0 to 100. Be honest — not everyone is compatible. ' +
    'A 50 means neutral, 70+ means good potential, 85+ means strong match.\n\n' +
    'Return ONLY a valid JSON array (no markdown fences, no extra text) with one object per user:\n' +
    '[{"user_id": "...", "score": 0-100, "reason": "1-2 sentence explanation of why they match or don\'t"}]\n\n' +
    '=== CURRENT USER ===\n' +
    profileToText(currentUser) + '\n\n' +
    '=== USERS TO SCORE ===\n' +
    otherBlocks
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
      max_tokens: 4096,
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

function parseResponse(text) {
  var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  var parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Expected JSON array');
  return parsed.map(function (item) {
    return {
      user_id: item.user_id || '',
      score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
      reason: typeof item.reason === 'string' ? item.reason : '',
    };
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  var body = req.body || {};
  var token = body.token;
  var currentUserProfile = body.currentUser;
  var otherProfiles = body.profiles;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  if (!currentUserProfile || !otherProfiles || !otherProfiles.length) {
    return res.status(400).json({ error: 'Missing currentUser or profiles' });
  }

  // Verify token
  var supabase = getSupabaseAdmin();
  var authResult = await supabase.auth.getUser(token);
  if (authResult.error || !authResult.data.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Limit batch size to control cost
  var batch = otherProfiles.slice(0, 20);

  try {
    var prompt = buildPrompt(currentUserProfile, batch);
    var claudeText = await callClaude(prompt);
    var scores = parseResponse(claudeText);

    // Cache scores in matches table
    var callerId = authResult.data.user.id;
    var upserts = scores.map(function (s) {
      var sortedA = callerId < s.user_id ? callerId : s.user_id;
      var sortedB = callerId < s.user_id ? s.user_id : callerId;
      return {
        user_a_id: sortedA,
        user_b_id: sortedB,
        compatibility_score: s.score / 100,
        match_summary: s.reason,
        shared_artists: [],
        shared_tracks: [],
        generated_at: new Date().toISOString(),
      };
    });

    if (upserts.length > 0) {
      await supabase.from('matches').upsert(upserts, { onConflict: 'user_a_id,user_b_id' });
    }

    return res.status(200).json({ scores: scores });
  } catch (err) {
    console.error('AI score error:', err);
    return res.status(500).json({ error: 'Failed to compute AI scores: ' + err.message });
  }
};
