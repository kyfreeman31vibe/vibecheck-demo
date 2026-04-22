import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { useNotifications } from '../hooks/useNotifications';
import { useCircles } from '../hooks/useCircles';

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
  const { incomingRequests, acceptRequest, rejectRequest } = useCircles();
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
        <section className="section glass-elevated" style={{ marginBottom: 12 }}>
          <div className="list-title-row" style={{ marginBottom: 10 }}>
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="btn ghost small"
                style={{ fontSize: '0.75rem' }}
                onClick={clearAll}
              >
                Clear All
              </button>
            )}
          </div>
          {incomingRequests.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Circle Requests</div>
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>👥</span>
                    <div style={{ fontSize: 13 }}><strong>{req.sender?.name || 'Someone'}</strong> wants to join your circle</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <div
                      role="button"
                      tabIndex={0}
                      className="btn small primary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onPointerDown={() => acceptRequest(req.id, req.senderId)}
                    >
                      Accept
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      className="btn small ghost"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onPointerDown={() => rejectRequest(req.id)}
                    >
                      Decline
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {notifications.length === 0 && incomingRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔔</div>
              <p className="caption">You're all caught up!</p>
            </div>
          )}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{n.type === 'circle_accepted' ? '✅' : n.type === 'circle_request' ? '👥' : '💬'}</span>
                  <div>
                    <div style={{ fontSize: 13 }}>{n.text}</div>
                    <div className="caption" style={{ fontSize: '0.7rem' }}>{n.time}</div>
                  </div>
                </div>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                  onClick={() => deleteNotification(n.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          className="input"
          style={{ paddingLeft: 38, width: '100%' }}
          placeholder="Search activity feed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredPosts.length === 0 && (
        <div className="section glass" style={{ textAlign: 'center', padding: '28px 16px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
          <p style={{ marginBottom: 4 }}>Your feed is quiet</p>
          <p className="caption" style={{ marginBottom: 12 }}>Share a Musical Thought to get things started</p>
          <Link to="/app/post" className="btn primary" style={{ textDecoration: 'none' }}>Create Post</Link>
        </div>
      )}

      {/* Activity feed grouped by time — matching wireframe */}
      {(() => {
        const todayPosts = filteredPosts.filter((p) => isToday(p.createdAt));
        const weekPosts = filteredPosts.filter((p) => !isToday(p.createdAt) && isThisWeek(p.createdAt));
        const olderPosts = filteredPosts.filter((p) => !isToday(p.createdAt) && !isThisWeek(p.createdAt));

        var cardIndex = 0;

        function renderGroup(label, items) {
          if (items.length === 0) return null;
          return (
            <div key={label} style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{label}</h3>
              <div className="list">
                {items.map((item) => {
                  var idx = cardIndex++;

                  const label = postActivityLabel(item);
                  const detail = postDetailText(item);
                  const isLong = item.postType === 'thought' && item.content && item.content.length > 120;
                  const preview = isLong ? item.content.slice(0, 120) + '...' : detail;

                  var userName = item.user?.name || 'Someone';
                  var initial = userName.charAt(0).toUpperCase();

                  return (
                    <div key={item.id} className="list-item glass glass-interactive feed-card-animate" style={{ animationDelay: (idx * 60) + 'ms' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>{initial}</div>
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
                              style={{ fontSize: '0.8rem', marginLeft: 'auto', color: 'var(--accent)', textDecoration: 'none' }}
                            >
                              View more →
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
