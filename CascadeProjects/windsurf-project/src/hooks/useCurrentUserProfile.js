import { useMemo } from 'react';
import { useDemoUser } from '../demo/DemoUserContext';

const fallbackProfile = {
  id: 'demo-user',
  username: 'demo_user',
  name: 'Demo User',
  bio: 'Lo-fi beats, rooftop shows, and late-night playlists.',
  city: 'Los Angeles, CA',
  favoriteArtists: ['Tame Impala', 'Kaytranada', 'Phoebe Bridgers'],
  moods: ['Chill', 'Reflective'],
  intent: 'Friends',
  genres: ['Indie', 'Lo-fi', 'Alt R&B'],
};

export function useCurrentUserProfile() {
  const { user, setUser } = useDemoUser();

  const profile = useMemo(() => {
    if (!user) {
      return fallbackProfile;
    }
    return {
      ...fallbackProfile,
      ...user,
      username: user.username || fallbackProfile.username,
      name: user.name || fallbackProfile.name,
      city: user.city || fallbackProfile.city,
      bio: user.bio || fallbackProfile.bio,
      favoriteArtists:
        Array.isArray(user.favoriteArtists) && user.favoriteArtists.length
          ? user.favoriteArtists
          : fallbackProfile.favoriteArtists,
      moods:
        Array.isArray(user.moods) && user.moods.length ? user.moods : fallbackProfile.moods,
      genres:
        Array.isArray(user.genres) && user.genres.length ? user.genres : fallbackProfile.genres,
    };
  }, [user]);

  const saveProfile = (updates) => {
    const next = { ...(user || {}), ...updates };
    setUser(next);
  };

  return {
    profile,
    saveProfile,
    loading: false,
    error: null,
  };
}
