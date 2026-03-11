import { useMemo, useState } from 'react';
import { useCurrentUserProfile } from './useCurrentUserProfile';

// Simple static demo users; later this will come from Supabase
const DEMO_USERS = [
  {
    id: '1',
    name: 'Jordan',
    city: 'Los Angeles',
    bio: 'Weekend festivals and deep cuts only.',
    favoriteArtists: ['Tame Impala', 'Kaytranada', 'SZA'],
    moods: ['Chill', 'Energetic'],
    eventsAttending: [5, 6],
  },
  {
    id: '2',
    name: 'Alex',
    city: 'Los Angeles',
    bio: 'Late-night lo-fi and jazz bars.',
    favoriteArtists: ['Phoebe Bridgers', 'Frank Ocean'],
    moods: ['Reflective', 'Romantic'],
    eventsAttending: [5],
  },
  {
    id: '3',
    name: 'Riley',
    city: 'San Francisco',
    bio: 'House music lover, sunset chaser.',
    favoriteArtists: ['Kaytranada', 'Fred again..'],
    moods: ['Social', 'Energetic'],
    eventsAttending: [1, 2],
  },
  {
    id: '4',
    name: 'Sam',
    city: 'San Francisco',
    bio: 'Indie head. Always at the smaller shows.',
    favoriteArtists: ['Phoebe Bridgers', 'Tame Impala', 'Billie Eilish'],
    moods: ['Reflective', 'Chill'],
    eventsAttending: [1],
  },
  {
    id: '5',
    name: 'Taylor',
    city: 'Atlanta',
    bio: 'R&B is therapy. Also into vinyl collecting.',
    favoriteArtists: ['SZA', 'Frank Ocean', 'Kendrick Lamar'],
    moods: ['Romantic', 'Chill'],
    eventsAttending: [7, 8],
  },
  {
    id: '6',
    name: 'Morgan',
    city: 'Chicago',
    bio: 'House music roots. Catch me at the lakefront.',
    favoriteArtists: ['Kaytranada', 'Fred again..', 'Bad Bunny'],
    moods: ['Energetic', 'Social'],
    eventsAttending: [9],
  },
  {
    id: '7',
    name: 'Casey',
    city: 'New York',
    bio: 'Brooklyn loft parties and lo-fi coffee shops.',
    favoriteArtists: ['Frank Ocean', 'Billie Eilish', 'Rosalía'],
    moods: ['Reflective', 'Romantic'],
    eventsAttending: [11, 12],
  },
];

export { DEMO_USERS };

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
