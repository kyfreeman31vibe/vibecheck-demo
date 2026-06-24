import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useCurrentUserProfile } from './useCurrentUserProfile';

// Demo users are kept for when there are no real users yet
const DEMO_USERS = [
  {
    id: 'demo-1',
    name: 'Jordan',
    city: 'Los Angeles',
    locationPublic: true,
    bio: 'Weekend festivals and deep cuts only.',
    favoriteArtists: ['Tame Impala', 'Kaytranada', 'SZA'],
    genres: ['Electronic', 'R&B'],
    moods: ['Festival Goer', 'Genre Explorer'],
    listeningContexts: ['Working out', 'Road trips'],
    musicDiscovery: ['Live shows & festivals', 'Friends sharing songs'],
    favoriteDecades: ['2010s', '2020s'],
    concertFrequency: 'monthly',
  },
  {
    id: 'demo-2',
    name: 'Alex',
    city: 'Los Angeles',
    locationPublic: true,
    bio: 'Late-night lo-fi and jazz bars.',
    favoriteArtists: ['Phoebe Bridgers', 'Frank Ocean'],
    genres: ['Indie', 'R&B', 'Lo-Fi'],
    moods: ['Deep Listener', 'Late Night Listener'],
    listeningContexts: ['Falling asleep', 'Late nights'],
    musicDiscovery: ['Playlists by others', 'Algorithm recommendations'],
    favoriteDecades: ['2010s', '2020s'],
    concertFrequency: 'few_per_year',
  },
  {
    id: 'demo-3',
    name: 'Riley',
    city: 'San Francisco',
    locationPublic: true,
    bio: 'House music lover, sunset chaser.',
    favoriteArtists: ['Kaytranada', 'Fred again..'],
    genres: ['House', 'Electronic', 'Dance'],
    moods: ['Vibe Setter', 'Aux Cord DJ'],
    listeningContexts: ['Working out', 'Getting ready'],
    musicDiscovery: ['Live shows & festivals', 'Social media / TikTok'],
    favoriteDecades: ['2020s'],
    concertFrequency: 'monthly',
  },
];

export { DEMO_USERS };

function profileRowToUser(row) {
  return {
    id: row.id,
    name: row.name || '',
    city: row.city || '',
    locationPublic: row.location_public !== false,
    bio: row.bio || '',
    favoriteArtists: row.favorite_artists || [],
    moods: row.moods || [],
    genres: row.genres || [],
    listeningContexts: row.listening_contexts || [],
    musicDiscovery: row.music_discovery || [],
    favoriteDecades: row.favorite_decades || [],
    concertFrequency: row.concert_frequency || '',
  };
}

export function useMatches() {
  const { user, session } = useAuth();
  const { profile } = useCurrentUserProfile();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  // Fetch profiles + cached AI scores, then compute if needed
  const fetchAndScore = useCallback(async () => {
    if (!user || !profile.id) return;
    setLoading(true);

    try {
      // 1. Fetch all other user profiles
      const { data: rows } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      const realUsers = (rows || []).map(profileRowToUser);

      // Combine with demo users (deduplicate by name)
      const realNames = new Set(realUsers.map((u) => u.name.toLowerCase()));
      const filteredDemo = DEMO_USERS.filter((u) => !realNames.has(u.name.toLowerCase()));
      const allUsers = [...realUsers, ...filteredDemo];

      // 2. Check for cached AI scores in matches table
      const { data: cachedA } = await supabase
        .from('matches')
        .select('*')
        .eq('user_a_id', user.id);

      const { data: cachedB } = await supabase
        .from('matches')
        .select('*')
        .eq('user_b_id', user.id);

      const cached = [...(cachedA || []), ...(cachedB || [])];
      const scoreMap = {};
      cached.forEach((m) => {
        const otherId = m.user_a_id === user.id ? m.user_b_id : m.user_a_id;
        scoreMap[otherId] = {
          score: Math.round((m.compatibility_score || 0) * 100),
          reason: m.match_summary || '',
        };
      });

      // 3. Build matches list with cached scores
      const matchList = allUsers
        .filter((u) => u.id !== profile.id)
        .map((u) => {
          const cached = scoreMap[u.id];
          return {
            id: u.id,
            user: u,
            compatibilityScore: cached ? cached.score : null,
            matchReason: cached ? cached.reason : '',
            sharedArtists: (u.favoriteArtists || []).filter((a) => (profile.favoriteArtists || []).includes(a)),
            sharedMoods: (u.moods || []).filter((m) => (profile.moods || []).includes(m)),
          };
        });

      // Sort: scored first (descending), then unscored
      matchList.sort((a, b) => {
        if (a.compatibilityScore !== null && b.compatibilityScore !== null) return b.compatibilityScore - a.compatibilityScore;
        if (a.compatibilityScore !== null) return -1;
        if (b.compatibilityScore !== null) return 1;
        return 0;
      });

      setMatches(matchList);

      // 4. If there are unscored real users, trigger AI scoring in background
      const unscored = matchList.filter((m) => m.compatibilityScore === null && !String(m.id).startsWith('demo-'));
      if (unscored.length > 0 && session?.access_token) {
        setScoring(true);
        requestAIScores(profile, unscored.map((m) => m.user), session.access_token)
          .then((scores) => {
            if (scores && scores.length > 0) {
              setMatches((prev) => {
                const updated = prev.map((m) => {
                  const aiScore = scores.find((s) => s.user_id === m.id);
                  if (aiScore) {
                    return { ...m, compatibilityScore: aiScore.score, matchReason: aiScore.reason };
                  }
                  return m;
                });
                updated.sort((a, b) => {
                  if (a.compatibilityScore !== null && b.compatibilityScore !== null) return b.compatibilityScore - a.compatibilityScore;
                  if (a.compatibilityScore !== null) return -1;
                  if (b.compatibilityScore !== null) return 1;
                  return 0;
                });
                return updated;
              });
            }
          })
          .catch((err) => { console.error('AI scoring failed:', err); })
          .finally(() => { setScoring(false); });
      }
    } catch (err) {
      console.error('useMatches error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile, session]);

  useEffect(() => {
    fetchAndScore();
  }, [fetchAndScore]);

  return { matches, loading, scoring, refresh: fetchAndScore };
}

// Call the AI scoring endpoint
async function requestAIScores(currentUser, otherUsers, token) {
  const payload = {
    token: token,
    currentUser: {
      id: currentUser.id,
      name: currentUser.name,
      city: currentUser.city,
      bio: currentUser.bio,
      genres: currentUser.genres,
      favoriteArtists: currentUser.favoriteArtists,
      moods: currentUser.moods,
      listeningContexts: currentUser.listeningContexts,
      musicDiscovery: currentUser.musicDiscovery,
      favoriteDecades: currentUser.favoriteDecades,
      concertFrequency: currentUser.concertFrequency,
    },
    profiles: otherUsers.map((u) => ({
      id: u.id,
      name: u.name,
      city: u.city,
      bio: u.bio,
      genres: u.genres,
      favoriteArtists: u.favoriteArtists,
      moods: u.moods,
      listeningContexts: u.listeningContexts,
      musicDiscovery: u.musicDiscovery,
      favoriteDecades: u.favoriteDecades,
      concertFrequency: u.concertFrequency,
    })),
  };

  const res = await fetch('/api/match/ai-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI scoring request failed');
  }

  const data = await res.json();
  return data.scores || [];
}
