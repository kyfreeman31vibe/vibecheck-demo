import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(name, username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setPosts(data.map((p) => ({
        id: p.id,
        userId: p.user_id,
        content: p.content,
        reactions: p.reactions || {},
        createdAt: p.created_at,
        user: p.profiles ? {
          name: p.profiles.name,
          username: p.profiles.username,
          avatar_url: p.profiles.avatar_url,
        } : { name: 'Unknown', username: 'unknown' },
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(async (content) => {
    if (!user) return { error: { message: 'Not signed in' } };

    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content })
      .select('*, profiles(name, username, avatar_url)')
      .single();

    if (!error && data) {
      setPosts((prev) => [{
        id: data.id,
        userId: data.user_id,
        content: data.content,
        reactions: data.reactions || {},
        createdAt: data.created_at,
        user: data.profiles ? {
          name: data.profiles.name,
          username: data.profiles.username,
          avatar_url: data.profiles.avatar_url,
        } : { name: 'Unknown', username: 'unknown' },
      }, ...prev]);
    }

    return { error };
  }, [user]);

  const deletePost = useCallback(async (postId) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
    return { error };
  }, []);

  const reactToPost = useCallback(async (postId, emoji) => {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const updatedReactions = { ...post.reactions };
    const userKey = user.id;

    if (updatedReactions[userKey] === emoji) {
      delete updatedReactions[userKey];
    } else {
      updatedReactions[userKey] = emoji;
    }

    const { error } = await supabase
      .from('posts')
      .update({ reactions: updatedReactions })
      .eq('id', postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, reactions: updatedReactions } : p)
      );
    }
  }, [user, posts]);

  return { posts, loading, createPost, deletePost, reactToPost, refetch: fetchPosts };
}
