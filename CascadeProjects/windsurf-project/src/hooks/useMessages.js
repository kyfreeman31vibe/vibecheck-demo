import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function useMessages(conversationId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(name, username)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        content: m.content,
        createdAt: m.created_at,
        from: m.sender_id === user?.id ? 'me' : 'them',
        senderName: m.profiles?.name || 'Unknown',
      })));
    }
    setLoading(false);
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(async (content) => {
    if (!user || !conversationId) return { error: { message: 'Missing context' } };

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select('*, profiles(name, username)')
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, {
        id: data.id,
        senderId: data.sender_id,
        content: data.content,
        createdAt: data.created_at,
        from: 'me',
        senderName: data.profiles?.name || 'You',
      }]);

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return { error };
  }, [user, conversationId]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
