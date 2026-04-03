import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setNotifications(data.map((n) => ({
        id: n.id,
        text: n.title + (n.body ? ` ${n.body}` : ''),
        title: n.title,
        body: n.body,
        type: n.type,
        read: n.read,
        data: n.data,
        createdAt: n.created_at,
        time: formatTimeAgo(n.created_at),
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  const deleteNotification = useCallback(async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').delete().eq('user_id', user.id);
    setNotifications([]);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAllRead, deleteNotification, clearAll, refetch: fetchNotifications };
}

function formatTimeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}
