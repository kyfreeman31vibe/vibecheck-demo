import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { useNotifications } from '../hooks/useNotifications';

const POST_TYPE_ICONS = {
  thought: '�',
  song: '�',
  playlist: '🎶',
};

function formatTimeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(dateStr) {
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  return (now - d) < 7 * 86400 * 1000;
}

function postActivityLabel(item) {
  var name = item.user?.name || 'Someone';
  if (item.postType === 'song') return name + ' added a song';
  if (item.postType === 'playlist') return name + ' added a playlist';
  return name + ' added a Musical Thought';
}

function postDetailText(item) {
  if (item.postType === 'song' && item.songTitle) return item.songTitle + (item.songArtist ? ' by ' + item.songArtist : '');
  if (item.postType === 'playlist' && item.playlistName) return item.playlistName;
  return item.content;
}

export function Dashboard() {
  const { posts } = usePosts();
  const { notifications, unreadCount, markAllRead, deleteNotification, clearAll } = useNotifications();
  const [search, setSearch] = useState('');
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

      {/* Activity feed grouped by time — matching wireframe */}
      {(() => {
        const todayPosts = filteredPosts.filter((p) => isToday(p.createdAt));
        const weekPosts = filteredPosts.filter((p) => !isToday(p.createdAt) && isThisWeek(p.createdAt));
        const olderPosts = filteredPosts.filter((p) => !isToday(p.createdAt) && !isThisWeek(p.createdAt));

        function renderGroup(label, items) {
          if (items.length === 0) return null;
          return (
            <div key={label} style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{label}</h3>
              <div className="list">
                {items.map((item) => {
                  const icon = POST_TYPE_ICONS[item.postType] || '💬';
                  const label = postActivityLabel(item);
                  const detail = postDetailText(item);
                  const isLong = item.postType === 'thought' && item.content && item.content.length > 120;
                  const preview = isLong ? item.content.slice(0, 120) + '...' : detail;

                  return (
                    <div key={item.id} className="list-item glass">
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14 }}>
                            {label}
                            {(item.postType === 'song' || item.postType === 'playlist') && (
                              <Link to={'/app/post/' + item.id} style={{ color: 'var(--accent)', marginLeft: 4, textDecoration: 'underline' }}>
                                {detail}
                              </Link>
                            )}
                          </div>
                          {item.postType === 'thought' && (
                            <div className="caption" style={{ marginTop: 2 }}>{preview}</div>
                          )}
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                            <span className="caption">{formatTimeAgo(item.createdAt)}</span>
                            {(item.reactionCount > 0 || item.commentCount > 0) && (
                              <span className="caption">
                                {item.reactionCount > 0 && item.reactionCount + ' reaction' + (item.reactionCount !== 1 ? 's' : '')}
                                {item.reactionCount > 0 && item.commentCount > 0 && ', '}
                                {item.commentCount > 0 && item.commentCount + ' comment' + (item.commentCount !== 1 ? 's' : '')}
                              </span>
                            )}
                            <Link
                              to={'/app/post/' + item.id}
                              className="btn ghost small"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', marginLeft: 'auto' }}
                            >
                              VIEW MORE
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <>
            {renderGroup('Today', todayPosts)}
            {renderGroup('This Week', weekPosts)}
            {renderGroup('Earlier', olderPosts)}
          </>
        );
      })()}
    </div>
  );
}
