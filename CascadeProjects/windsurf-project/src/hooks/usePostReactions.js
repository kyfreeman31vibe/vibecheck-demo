import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function usePostReactions(postId) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReactions = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', postId);

    if (!error && data) {
      setReactions(data);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggleReaction = useCallback(async (reactionType) => {
    if (!user || !postId) return;

    const existing = reactions.find((r) => r.user_id === user.id);

    if (existing && existing.reaction_type === reactionType) {
      // Remove reaction
      await supabase.from('post_reactions').delete().eq('id', existing.id);
      setReactions((prev) => prev.filter((r) => r.id !== existing.id));
    } else if (existing) {
      // Change reaction type
      await supabase.from('post_reactions').update({ reaction_type: reactionType }).eq('id', existing.id);
      setReactions((prev) =>
        prev.map((r) => r.id === existing.id ? { ...r, reaction_type: reactionType } : r)
      );
    } else {
      // Add new reaction
      const { data, error } = await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType })
        .select()
        .single();
      if (!error && data) {
        setReactions((prev) => [...prev, data]);
      }
    }
  }, [user, postId, reactions]);

  const counts = {
    heart: reactions.filter((r) => r.reaction_type === 'heart').length,
    like: reactions.filter((r) => r.reaction_type === 'like').length,
    dislike: reactions.filter((r) => r.reaction_type === 'dislike').length,
  };
  const total = reactions.length;
  const myReaction = user ? reactions.find((r) => r.user_id === user.id)?.reaction_type : null;

  return { reactions, counts, total, myReaction, loading, toggleReaction, refetch: fetchReactions };
}
