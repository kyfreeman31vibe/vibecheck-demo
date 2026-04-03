import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function useCircles() {
  const { user } = useAuth();
  const [circleIds, setCircleIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCircle = useCallback(async () => {
    if (!user) { setCircleIds([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('circles')
      .select('circle_user_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setCircleIds(data.map((r) => r.circle_user_id));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  const addToCircle = useCallback(async (circleUserId) => {
    if (!user) return { error: { message: 'Not signed in' } };
    if (circleIds.includes(circleUserId)) return { error: null };

    // Demo users (non-UUID IDs) can't be stored in Supabase — track locally only
    if (String(circleUserId).startsWith('demo-')) {
      setCircleIds((prev) => [...prev, circleUserId]);
      return { error: null };
    }

    const { error } = await supabase
      .from('circles')
      .insert({ user_id: user.id, circle_user_id: circleUserId });

    if (!error) {
      setCircleIds((prev) => [...prev, circleUserId]);
    }
    return { error };
  }, [user, circleIds]);

  const removeFromCircle = useCallback(async (circleUserId) => {
    if (!user) return { error: { message: 'Not signed in' } };

    const { error } = await supabase
      .from('circles')
      .delete()
      .eq('user_id', user.id)
      .eq('circle_user_id', circleUserId);

    if (!error) {
      setCircleIds((prev) => prev.filter((id) => id !== circleUserId));
    }
    return { error };
  }, [user]);

  const isInCircle = useCallback((userId) => circleIds.includes(userId), [circleIds]);

  return { circleIds, circleCount: circleIds.length, loading, addToCircle, removeFromCircle, isInCircle, refetch: fetchCircle };
}
