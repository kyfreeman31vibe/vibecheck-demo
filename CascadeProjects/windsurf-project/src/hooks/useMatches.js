import { useMemo, useState } from 'react';
import { useCurrentUserProfile } from './useCurrentUserProfile';

// Simple static demo users; later this will come from Supabase
const DEMO_USERS = [
  {
    id: '1',
    name: 'Jordan',
    city: 'Los Angeles',
    locationPublic: true,
    bio: 'Weekend festivals and deep cuts only.',
    favoriteArtists: ['Tame Impala', 'Kaytranada', 'SZA'],
    moods: ['Chill', 'Energetic'],
    eventsAttending: [5, 6],
    recentListening: ['Currents – Tame Impala', 'BUBBA – Kaytranada', 'SOS – SZA'],
    playlists: ['Festival Pregame', 'Deep Cuts Only', 'Sunset Drive'],
    mostListened: ['Let It Happen', 'GLOWED UP', 'Kill Bill'],
  },
  {
    id: '2',
    name: 'Alex',
    city: 'Los Angeles',
    locationPublic: true,
    bio: 'Late-night lo-fi and jazz bars.',
    favoriteArtists: ['Phoebe Bridgers', 'Frank Ocean'],
    moods: ['Reflective', 'Romantic'],
    eventsAttending: [5],
    recentListening: ['Punisher – Phoebe Bridgers', 'Blonde – Frank Ocean'],
    playlists: ['Late Night Lo-Fi', 'Rainy Day Vibes'],
    mostListened: ['Kyoto', 'Nights', 'Moon Song'],
  },
  {
    id: '3',
    name: 'Riley',
    city: 'San Francisco',
    locationPublic: true,
    bio: 'House music lover, sunset chaser.',
    favoriteArtists: ['Kaytranada', 'Fred again..'],
    moods: ['Social', 'Energetic'],
    eventsAttending: [1, 2],
    recentListening: ['99.9% – Kaytranada', 'Actual Life 3 – Fred again..'],
    playlists: ['House Sessions', 'Golden Hour Mix'],
    mostListened: ['GLOWED UP', 'Delilah (pull me out of this)', 'Bleu'],
  },
  {
    id: '4',
    name: 'Sam',
    city: 'San Francisco',
    locationPublic: false,
    bio: 'Indie head. Always at the smaller shows.',
    favoriteArtists: ['Phoebe Bridgers', 'Tame Impala', 'Billie Eilish'],
    moods: ['Reflective', 'Chill'],
    eventsAttending: [1],
    recentListening: ['Punisher – Phoebe Bridgers', 'Currents – Tame Impala', 'Happier Than Ever – Billie Eilish'],
    playlists: ['Indie Essentials', 'Chill Acoustic', 'Study Mode'],
    mostListened: ['Kyoto', 'The Less I Know the Better', 'Happier Than Ever'],
  },
  {
    id: '5',
    name: 'Taylor',
    city: 'Atlanta',
    locationPublic: true,
    bio: 'R&B is therapy. Also into vinyl collecting.',
    favoriteArtists: ['SZA', 'Frank Ocean', 'Kendrick Lamar'],
    moods: ['Romantic', 'Chill'],
    eventsAttending: [7, 8],
    recentListening: ['SOS – SZA', 'Blonde – Frank Ocean', 'Mr. Morale – Kendrick Lamar'],
    playlists: ['R&B Therapy', 'Vinyl Picks', 'Sunday Morning'],
    mostListened: ['Shirt', 'Self Control', 'United in Grief'],
  },
  {
    id: '6',
    name: 'Morgan',
    city: 'Chicago',
    locationPublic: true,
    bio: 'House music roots. Catch me at the lakefront.',
    favoriteArtists: ['Kaytranada', 'Fred again..', 'Bad Bunny'],
    moods: ['Energetic', 'Social'],
    eventsAttending: [9],
    recentListening: ['BUBBA – Kaytranada', 'Actual Life 3 – Fred again..', 'Un Verano Sin Ti – Bad Bunny'],
    playlists: ['Chicago House', 'Lakefront Workout', 'Party Starter'],
    mostListened: ['10%', 'Turn On The Lights again..', 'Tití Me Preguntó'],
  },
  {
    id: '7',
    name: 'Casey',
    city: 'New York',
    locationPublic: false,
    bio: 'Brooklyn loft parties and lo-fi coffee shops.',
    favoriteArtists: ['Frank Ocean', 'Billie Eilish', 'Rosalía'],
    moods: ['Reflective', 'Romantic'],
    eventsAttending: [11, 12],
    recentListening: ['Blonde – Frank Ocean', 'Happier Than Ever – Billie Eilish', 'Motomami – Rosalía'],
    playlists: ['Brooklyn After Dark', 'Lo-Fi Coffee', 'Art Gallery Vibes'],
    mostListened: ['Nights', 'Therefore I Am', 'SAOKO'],
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
