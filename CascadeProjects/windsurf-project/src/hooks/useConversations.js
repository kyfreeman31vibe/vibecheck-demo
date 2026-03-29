import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, last_message_at, created_at,
        user_a_profile:profiles!conversations_user_a_fkey(id, name, username, avatar_url),
        user_b_profile:profiles!conversations_user_b_fkey(id, name, username, avatar_url)
      `)
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      setConversations(data.map((c) => {
        const other = c.user_a_profile?.id === user.id ? c.user_b_profile : c.user_a_profile;
        return {
          id: c.id,
          otherUser: other || { name: 'Unknown', username: 'unknown' },
          lastMessageAt: c.last_message_at,
        };
      }));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const deleteConversation = useCallback(async (convId) => {
    const { error } = await supabase.from('conversations').delete().eq('id', convId);
    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
    }
    return { error };
  }, []);

  const getOrCreateConversation = useCallback(async (otherUserId) => {
    if (!user) return { data: null, error: { message: 'Not signed in' } };

    const ids = [user.id, otherUserId].sort();

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_a', ids[0])
      .eq('user_b', ids[1])
      .maybeSingle();

    if (existing) return { data: existing, error: null };

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_a: ids[0], user_b: ids[1] })
      .select('id')
      .single();

    if (!error) fetchConversations();
    return { data, error };
  }, [user, fetchConversations]);

  return { conversations, loading, deleteConversation, getOrCreateConversation, refetch: fetchConversations };
}
