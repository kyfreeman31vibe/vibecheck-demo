import { useMemo, useState } from 'react';
import { useCurrentUserProfile } from './useCurrentUserProfile';

// Simple static demo users; later this will come from Supabase
const DEMO_USERS = [
  {
    id: '1',
    name: 'Jordan',
    city: 'Los Angeles, CA',
    favoriteArtists: ['Tame Impala', 'Kaytranada', 'SZA'],
    moods: ['Chill', 'Energetic'],
  },
  {
    id: '2',
    name: 'Alex',
    city: 'Los Angeles, CA',
    favoriteArtists: ['Phoebe Bridgers', 'Frank Ocean'],
    moods: ['Reflective', 'Romantic'],
  },
  {
    id: '3',
    name: 'Riley',
    city: 'San Francisco',
    favoriteArtists: ['Kaytranada', 'Fred again..'],
    moods: ['Social', 'Energetic'],
  },
];

function computeCompatibility(current, other) {
  const sharedArtists = (other.favoriteArtists || []).filter((a) =>
    (current.favoriteArtists || []).includes(a)
  );
  const sharedMoods = (other.moods || []).filter((m) => (current.moods || []).includes(m));

  const score = Math.min(100, sharedArtists.length * 20 + sharedMoods.length * 15 + 40);

  return {
    compatibilityScore: score,
    sharedArtists,
    sharedMoods,
  };
}

export function useMatches() {
  const { profile } = useCurrentUserProfile();
  const [sentPings, setSentPings] = useState({}); // { userId: boolean }

  const matches = useMemo(() => {
    const sameCityUsers = DEMO_USERS.filter((u) => u.city === profile.city);

    return sameCityUsers.map((u) => {
      const { compatibilityScore, sharedArtists, sharedMoods } = computeCompatibility(
        profile,
        u
      );
      return {
        id: u.id,
        user: u,
        compatibilityScore,
        sharedArtists,
        sharedMoods,
        hasPinged: !!sentPings[u.id],
      };
    });
  }, [profile, sentPings]);

  const sendVibePing = (userId) => {
    setSentPings((prev) => ({ ...prev, [userId]: true }));
  };

  return {
    matches,
    sendVibePing,
  };
}
