import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function useComments(postId) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:user_id(name, username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data.map((c) => ({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        parentId: c.parent_id,
        content: c.content,
        createdAt: c.created_at,
        user: c.profiles ? {
          name: c.profiles.name,
          username: c.profiles.username,
          avatar_url: c.profiles.avatar_url,
        } : { name: 'Unknown', username: 'unknown' },
      })));
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(async (content, parentId = null) => {
    if (!user || !postId) return { error: { message: 'Not signed in' } };

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        parent_id: parentId,
        content,
      })
      .select('*, profiles:user_id(name, username, avatar_url)')
      .single();

    if (!error && data) {
      const mapped = {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        parentId: data.parent_id,
        content: data.content,
        createdAt: data.created_at,
        user: data.profiles ? {
          name: data.profiles.name,
          username: data.profiles.username,
          avatar_url: data.profiles.avatar_url,
        } : { name: 'Unknown', username: 'unknown' },
      };
      setComments((prev) => [...prev, mapped]);
    }

    return { data, error };
  }, [user, postId]);

  const deleteComment = useCallback(async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
    return { error };
  }, []);

  // Build threaded structure: top-level + replies grouped by parentId
  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = {};
  comments.forEach((c) => {
    if (c.parentId) {
      if (!repliesByParent[c.parentId]) repliesByParent[c.parentId] = [];
      repliesByParent[c.parentId].push(c);
    }
  });

  return {
    comments,
    topLevel,
    repliesByParent,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}
