import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useCurrentUserProfile } from './useCurrentUserProfile';

// Fallback demo users shown alongside any real Supabase profiles
const DEMO_USERS = [
  {
    id: 'demo-1',
    name: 'Jordan',
    city: 'Los Angeles',
    locationPublic: true,
    bio: 'Weekend festivals and deep cuts only.',
    favoriteArtists: ['Tame Impala', 'Kaytranada', 'SZA'],
    genres: ['Psychedelic Rock', 'Electronic', 'R&B', 'Neo-Soul'],
    moods: ['Chill', 'Energetic'],
    eventsAttending: [5, 6],
    recentListening: ['Currents – Tame Impala', 'BUBBA – Kaytranada', 'SOS – SZA'],
    playlists: ['Festival Pregame', 'Deep Cuts Only', 'Sunset Drive'],
    mostListened: ['Let It Happen', 'GLOWED UP', 'Kill Bill'],
    _demoScore: 83,
  },
  {
    id: 'demo-2',
    name: 'Alex',
    city: 'Los Angeles',
    locationPublic: true,
    bio: 'Late-night lo-fi and jazz bars.',
    favoriteArtists: ['Phoebe Bridgers', 'Frank Ocean'],
    genres: ['Indie Folk', 'R&B', 'Lo-Fi'],
    moods: ['Reflective', 'Romantic'],
    eventsAttending: [5],
    recentListening: ['Punisher – Phoebe Bridgers', 'Blonde – Frank Ocean'],
    playlists: ['Late Night Lo-Fi', 'Rainy Day Vibes'],
    mostListened: ['Kyoto', 'Nights', 'Moon Song'],
    _demoScore: 67,
  },
  {
    id: 'demo-3',
    name: 'Riley',
    city: 'San Francisco',
    locationPublic: true,
    bio: 'House music lover, sunset chaser.',
    favoriteArtists: ['Kaytranada', 'Fred again..'],
    genres: ['House', 'Electronic', 'Dance'],
    moods: ['Social', 'Energetic'],
    eventsAttending: [1, 2],
    recentListening: ['99.9% – Kaytranada', 'Actual Life 3 – Fred again..'],
    playlists: ['House Sessions', 'Golden Hour Mix'],
    mostListened: ['GLOWED UP', 'Delilah (pull me out of this)', 'Bleu'],
    _demoScore: 54,
  },
  {
    id: 'demo-4',
    name: 'Sam',
    city: 'San Francisco',
    locationPublic: false,
    bio: 'Indie head. Always at the smaller shows.',
    favoriteArtists: ['Phoebe Bridgers', 'Tame Impala', 'Billie Eilish'],
    genres: ['Indie Rock', 'Alternative', 'Dream Pop'],
    moods: ['Reflective', 'Chill'],
    eventsAttending: [1],
    recentListening: ['Punisher – Phoebe Bridgers', 'Currents – Tame Impala', 'Happier Than Ever – Billie Eilish'],
    playlists: ['Indie Essentials', 'Chill Acoustic', 'Study Mode'],
    mostListened: ['Kyoto', 'The Less I Know the Better', 'Happier Than Ever'],
    _demoScore: 72,
  },
  {
    id: 'demo-5',
    name: 'Taylor',
    city: 'Atlanta',
    locationPublic: true,
    bio: 'R&B is therapy. Also into vinyl collecting.',
    favoriteArtists: ['SZA', 'Frank Ocean', 'Kendrick Lamar'],
    genres: ['R&B', 'Hip-Hop', 'Neo-Soul', 'Jazz'],
    moods: ['Romantic', 'Chill'],
    eventsAttending: [7, 8],
    recentListening: ['SOS – SZA', 'Blonde – Frank Ocean', 'Mr. Morale – Kendrick Lamar'],
    playlists: ['R&B Therapy', 'Vinyl Picks', 'Sunday Morning'],
    mostListened: ['Shirt', 'Self Control', 'United in Grief'],
    _demoScore: 41,
  },
  {
    id: 'demo-6',
    name: 'Morgan',
    city: 'Chicago',
    locationPublic: true,
    bio: 'House music roots. Catch me at the lakefront.',
    favoriteArtists: ['Kaytranada', 'Fred again..', 'Bad Bunny'],
    genres: ['House', 'Reggaeton', 'Electronic'],
    moods: ['Energetic', 'Social'],
    eventsAttending: [9],
    recentListening: ['BUBBA – Kaytranada', 'Actual Life 3 – Fred again..', 'Un Verano Sin Ti – Bad Bunny'],
    playlists: ['Chicago House', 'Lakefront Workout', 'Party Starter'],
    mostListened: ['10%', 'Turn On The Lights again..', 'Tití Me Preguntó'],
    _demoScore: 59,
  },
  {
    id: 'demo-7',
    name: 'Casey',
    city: 'New York',
    locationPublic: false,
    bio: 'Brooklyn loft parties and lo-fi coffee shops.',
    favoriteArtists: ['Frank Ocean', 'Billie Eilish', 'Rosalía'],
    genres: ['Pop', 'R&B', 'Flamenco', 'Lo-Fi'],
    moods: ['Reflective', 'Romantic'],
    eventsAttending: [11, 12],
    recentListening: ['Blonde – Frank Ocean', 'Happier Than Ever – Billie Eilish', 'Motomami – Rosalía'],
    playlists: ['Brooklyn After Dark', 'Lo-Fi Coffee', 'Art Gallery Vibes'],
    mostListened: ['Nights', 'Therefore I Am', 'SAOKO'],
    _demoScore: 46,
  },
];

export { DEMO_USERS };

function computeCompatibility(current, other) {
  // --- Core profile matching ---
  const sharedArtists = (other.favoriteArtists || []).filter((a) =>
    (current.favoriteArtists || []).includes(a)
  );
  const sharedMoods = (other.moods || []).filter((m) => (current.moods || []).includes(m));
  const sharedGenres = (other.genres || []).filter((g) => (current.genres || []).includes(g));
  const cityMatch = current.city && other.city && current.city.toLowerCase() === other.city.toLowerCase() ? 1 : 0;

  // --- Extended profile matching (new dimensions) ---
  const sharedContexts = (other.listeningContexts || []).filter((c) => (current.listeningContexts || []).includes(c));
  const sharedDiscovery = (other.musicDiscovery || []).filter((d) => (current.musicDiscovery || []).includes(d));
  const sharedDecades = (other.favoriteDecades || []).filter((d) => (current.favoriteDecades || []).includes(d));
  const concertMatch = current.concertFrequency && other.concertFrequency && current.concertFrequency === other.concertFrequency ? 1 : 0;

  // If the current user has no profile data, use the demo seed score if available
  const hasProfileData = (current.favoriteArtists || []).length > 0 || (current.moods || []).length > 0 || (current.genres || []).length > 0;
  if (!hasProfileData && other._demoScore) {
    return { compatibilityScore: other._demoScore, sharedArtists: [], sharedMoods: [] };
  }

  // --- Weighted scoring (100-point scale) ---
  // Artists: 15pts each (max 3 counted = 45)
  // Genres: 6pts each (max 5 counted = 30)
  // Moods: 8pts each (max 3 counted = 24)
  // Listening contexts: 4pts each (max 4 = 16)
  // Discovery methods: 4pts each (max 3 = 12)
  // Decades: 5pts each (max 3 = 15)
  // Concert frequency: 8pts if same
  // City: 5pts if same
  // Base: 10pts (everyone starts with some compatibility)

  let score = 10; // base
  score += Math.min(45, sharedArtists.length * 15);
  score += Math.min(30, sharedGenres.length * 6);
  score += Math.min(24, sharedMoods.length * 8);
  score += Math.min(16, sharedContexts.length * 4);
  score += Math.min(12, sharedDiscovery.length * 4);
  score += Math.min(15, sharedDecades.length * 5);
  score += concertMatch * 8;
  score += cityMatch * 5;

  const finalScore = Math.min(100, Math.max(0, score));

  return { compatibilityScore: finalScore, sharedArtists, sharedMoods };
}

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
    eventsAttending: [],
    recentListening: [],
    playlists: [],
    mostListened: [],
  };
}

export function useMatches() {
  const { user } = useAuth();
  const { profile } = useCurrentUserProfile();
  const [realUsers, setRealUsers] = useState([]);

  // Fetch real profiles from Supabase
  useEffect(() => {
    if (!user) return;
    let ignore = false;

    supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .then(({ data }) => {
        if (!ignore && data) {
          setRealUsers(data.map(profileRowToUser));
        }
      });

    return () => { ignore = true; };
  }, [user]);

  // Combine real users with demo users, deduplicating by name
  const allUsers = useMemo(() => {
    const realNames = new Set(realUsers.map((u) => u.name.toLowerCase()));
    const filteredDemo = DEMO_USERS.filter((u) => !realNames.has(u.name.toLowerCase()));
    return [...realUsers, ...filteredDemo];
  }, [realUsers]);

  const matches = useMemo(() => {
    return allUsers
      .filter((u) => u.id !== profile.id)
      .map((u) => {
        const { compatibilityScore, sharedArtists, sharedMoods } = computeCompatibility(profile, u);
        return {
          id: u.id,
          user: u,
          compatibilityScore,
          sharedArtists,
          sharedMoods,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [allUsers, profile]);

  return { matches };
}
