import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

const emptyProfile = {
  id: '',
  username: '',
  name: '',
  bio: '',
  city: '',
  favoriteArtists: [],
  moods: [],
  intent: 'Friends',
  genres: [],
  avatar_url: null,
  location_public: true,
};

function rowToProfile(row) {
  if (!row) return emptyProfile;
  return {
    id: row.id,
    username: row.username || '',
    name: row.name || '',
    bio: row.bio || '',
    city: row.city || '',
    favoriteArtists: row.favorite_artists || [],
    moods: row.moods || [],
    intent: row.intent || 'Friends',
    genres: row.genres || [],
    avatar_url: row.avatar_url || null,
    location_public: row.location_public !== false,
  };
}

export function useCurrentUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setProfile(emptyProfile);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error: fetchErr }) => {
        if (ignore) return;
        if (fetchErr) {
          setError(fetchErr.message);
        } else {
          setProfile(rowToProfile(data));
        }
        setLoading(false);
      });

    return () => { ignore = true; };
  }, [user]);

  const saveProfile = useCallback(async (updates) => {
    if (!user) return;

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.intent !== undefined) payload.intent = updates.intent;
    if (updates.genres !== undefined) payload.genres = updates.genres;
    if (updates.favoriteArtists !== undefined) payload.favorite_artists = updates.favoriteArtists;
    if (updates.moods !== undefined) payload.moods = updates.moods;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
    if (updates.location_public !== undefined) payload.location_public = updates.location_public;
    payload.updated_at = new Date().toISOString();

    const { data, error: updateErr } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select()
      .single();

    if (updateErr) {
      setError(updateErr.message);
      return { error: updateErr };
    }

    setProfile(rowToProfile(data));
    return { error: null };
  }, [user]);

  return { profile, saveProfile, loading, error };
}
