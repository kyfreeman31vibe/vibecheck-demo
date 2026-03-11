import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

const initialNotifications = [
  { id: 1, text: 'Jordan sent you a Vibe Ping!', time: '1m ago', read: false },
  { id: 2, text: 'Alex added a new playlist: Late Night Lo-Fi', time: '30m ago', read: false },
  { id: 3, text: 'Riley reacted 🔥 to your Musical Thought', time: '2h ago', read: false },
  { id: 4, text: 'You matched with Sam — 75% compatible!', time: '5h ago', read: true },
  { id: 5, text: 'Taylor is going to Midtown R&B Mixer', time: '1d ago', read: true },
];

const REACTION_EMOJIS = ['🔥', '💫', '🎧', '💜'];

const mockFeed = [
  {
    id: 1,
    user: 'Jordan',
    type: 'interest',
    text: 'is interested in Neon Nights Festival',
    time: '2 hrs ago',
  },
  {
    id: 2,
    user: 'Alex',
    type: 'playlist',
    text: 'added a new playlist: Late Night Lo-Fi',
    time: '4 hrs ago',
  },
  {
    id: 3,
    user: 'Riley',
    type: 'thought',
    text: 'Frank Ocean\'s Blonde is still unmatched. Every track feels like a memory you haven\'t lived yet.',
    time: '6 hrs ago',
  },
  {
    id: 4,
    user: 'Sam',
    type: 'thought',
    text: 'Nothing hits like Tame Impala on a late night drive.',
    time: '8 hrs ago',
  },
  {
    id: 5,
    user: 'Taylor',
    type: 'playlist',
    text: 'added a new playlist: R&B Therapy Sessions',
    time: '12 hrs ago',
  },
];

export function Dashboard() {
  const { profile } = useCurrentUserProfile();
  const [search, setSearch] = useState('');
  const [reactions, setReactions] = useState({});
  const [commentsByItem, setCommentsByItem] = useState({});
  const [drafts, setDrafts] = useState({});
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotifs = () => {
    setShowNotifs((prev) => !prev);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredFeed = search.trim()
    ? mockFeed.filter(
        (item) =>
          item.user.toLowerCase().includes(search.toLowerCase()) ||
          item.text.toLowerCase().includes(search.toLowerCase())
      )
    : mockFeed;

  const handleReact = (itemId, emoji) => {
    setReactions((prev) => ({ ...prev, [itemId]: emoji }));
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
                onClick={handleClearAll}
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
                  onClick={() => handleDeleteNotif(n.id)}
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

      <div className="list">
        {filteredFeed.map((item) => {
          const comments = commentsByItem[item.id] || [];
          const draft = drafts[item.id] || '';
          const myReaction = reactions[item.id];
          return (
            <div key={item.id} className="list-item glass">
              <div className="list-title-row">
                <span className="list-title">{item.user}</span>
                <span className="pill small">{item.type}</span>
              </div>
              <div style={{ marginTop: 4 }}>{item.text}</div>
              <div className="caption" style={{ marginTop: 4 }}>{item.time}</div>

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

              {item.type === 'thought' && (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
