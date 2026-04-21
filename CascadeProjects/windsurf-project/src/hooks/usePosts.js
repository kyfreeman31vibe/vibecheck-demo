import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

function mapPost(p) {
  return {
    id: p.id,
    userId: p.user_id,
    content: p.content,
    postType: p.post_type || 'thought',
    songTitle: p.song_title,
    songArtist: p.song_artist,
    playlistName: p.playlist_name,
    playlistSongs: p.playlist_songs || [],
    reactions: p.reactions || {},
    reactionCount: p.reaction_count || 0,
    commentCount: p.comment_count || 0,
    createdAt: p.created_at,
    user: p.profiles ? {
      name: (p.profiles.name && p.profiles.name !== 'New User') ? p.profiles.name : (p.profiles.username || 'Someone'),
      username: p.profiles.username,
      avatar_url: p.profiles.avatar_url,
    } : { name: 'Someone', username: 'unknown' },
  };
}

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
      // Fetch reaction + comment counts in parallel
      const enriched = await Promise.all(
        data.map(async (p) => {
          const [{ count: rc }, { count: cc }] = await Promise.all([
            supabase.from('post_reactions').select('*', { count: 'exact', head: true }).eq('post_id', p.id),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', p.id),
          ]);
          return { ...p, reaction_count: rc || 0, comment_count: cc || 0 };
        })
      );
      setPosts(enriched.map(mapPost));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(async ({ content, postType, songTitle, songArtist, playlistName, playlistSongs }) => {
    if (!user) return { error: { message: 'Not signed in' } };

    const row = {
      user_id: user.id,
      content: content || '',
      post_type: postType || 'thought',
    };
    if (postType === 'song') {
      row.song_title = songTitle || '';
      row.song_artist = songArtist || '';
    }
    if (postType === 'playlist') {
      row.playlist_name = playlistName || '';
      row.playlist_songs = playlistSongs || [];
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(row)
      .select('*, profiles(name, username, avatar_url)')
      .single();

    if (!error && data) {
      setPosts((prev) => [mapPost({ ...data, reaction_count: 0, comment_count: 0 }), ...prev]);
    }

    return { data, error };
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
