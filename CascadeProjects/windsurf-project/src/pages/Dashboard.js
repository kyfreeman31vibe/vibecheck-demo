import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { usePosts } from '../hooks/usePosts';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../auth/AuthContext';

const REACTION_EMOJIS = ['🔥', '💫', '🎧', '💜'];

function formatTimeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export function Dashboard() {
  const { user } = useAuth();
  const { profile } = useCurrentUserProfile();
  const { posts, reactToPost } = usePosts();
  const { notifications, unreadCount, markAllRead, deleteNotification, clearAll } = useNotifications();
  const [search, setSearch] = useState('');
  const [commentsByItem, setCommentsByItem] = useState({});
  const [drafts, setDrafts] = useState({});
  const [showNotifs, setShowNotifs] = useState(false);

  const handleOpenNotifs = () => {
    setShowNotifs((prev) => !prev);
    if (!showNotifs) markAllRead();
  };

  const filteredPosts = search.trim()
    ? posts.filter(
        (item) =>
          (item.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
          item.content.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  const handleReact = (postId, emoji) => {
    reactToPost(postId, emoji);
  };

  const handleAddComment = (itemId) => {
    const text = (drafts[itemId] || '').trim();
    if (!text) return;
    setCommentsByItem((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { user: profile.name, text }],
    }));
    setDrafts((prev) => ({ ...prev, [itemId]: '' }));
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Home</h2>
          <p className="subtitle">Your music-powered social hub</p>
        </div>
        <button
          type="button"
          className="btn ghost"
          style={{ position: 'relative' }}
          onClick={handleOpenNotifs}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {showNotifs && (
        <section className="section glass" style={{ marginBottom: 12 }}>
          <div className="list-title-row" style={{ marginBottom: 8 }}>
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="btn ghost small"
                onClick={clearAll}
              >
                Clear All
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p className="caption">No notifications.</p>
          )}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="list-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
                }}
              >
                <div>
                  <div style={{ fontSize: 14 }}>{n.text}</div>
                  <div className="caption">{n.time}</div>
                </div>
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => deleteNotification(n.id)}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section glass" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Search activity feed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {filteredPosts.length === 0 && (
        <div className="section glass">
          <p className="caption">No posts yet. Share a Musical Thought to get the feed started!</p>
        </div>
      )}

      <div className="list">
        {filteredPosts.map((item) => {
          const comments = commentsByItem[item.id] || [];
          const draft = drafts[item.id] || '';
          const myReaction = user ? (item.reactions || {})[user.id] : null;
          return (
            <div key={item.id} className="list-item glass">
              <div className="list-title-row">
                <span className="list-title">{item.user?.name || 'Unknown'}</span>
                <span className="caption">@{item.user?.username || 'unknown'}</span>
              </div>
              <div style={{ marginTop: 4 }}>{item.content}</div>
              <div className="caption" style={{ marginTop: 4 }}>{formatTimeAgo(item.createdAt)}</div>

              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`btn ghost small ${myReaction === emoji ? 'active' : ''}`}
                    onClick={() => handleReact(item.id, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
                {myReaction && (
                  <span className="caption" style={{ alignSelf: 'center' }}>
                    You reacted {myReaction}
                  </span>
                )}
              </div>

              <div style={{ marginTop: 8 }}>
                <div className="chat-input-row">
                  <input
                    className="input"
                    placeholder="Add a comment..."
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(item.id);
                      }
                    }}
                  />
                  <button
                    className="btn primary small"
                    onClick={() => handleAddComment(item.id)}
                  >
                    Reply
                  </button>
                </div>
                {comments.length > 0 && (
                  <ul className="simple-list" style={{ marginTop: 6 }}>
                    {comments.map((c, idx) => (
                      <li key={idx}>
                        <strong>{c.user}</strong>: {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
