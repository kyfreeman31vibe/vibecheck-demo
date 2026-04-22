import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export function Messages() {
  const navigate = useNavigate();
  const { conversations, loading, deleteConversation } = useConversations();
  const [menuOpenId, setMenuOpenId] = useState(null);

  const handleOpenThread = (id) => {
    navigate(`/app/chat/${id}`);
  };

  const handleDelete = async (id) => {
    await deleteConversation(id);
    setMenuOpenId(null);
  };

  const handleBlock = async (id) => {
    await deleteConversation(id);
    setMenuOpenId(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Messages</h2>
          <p className="subtitle">All your chats in one place</p>
        </div>
      </header>
      <div className="list">
        {!loading && conversations.length === 0 && (
          <div className="section glass" style={{ textAlign: 'center', padding: '28px 16px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <p style={{ marginBottom: 4 }}>No messages yet</p>
            <p className="caption" style={{ marginBottom: 12 }}>Connect with someone on Discover to start a conversation</p>
            <Link to="/app/discover" className="btn primary" style={{ textDecoration: 'none' }}>Find People</Link>
          </div>
        )}
        {loading && (
          <div className="list" style={{ gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-card skeleton" style={{ animationDelay: (i * 100) + 'ms' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-line" style={{ width: '50%' }} />
                    <div className="skeleton skeleton-line short" style={{ marginBottom: 0 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {conversations.map((c) => {
          var otherName = c.otherUser.name || c.otherUser.username || 'User';
          var initial = otherName.charAt(0).toUpperCase();
          return (
          <div key={c.id} className="list-item glass glass-interactive">
            <div
              style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, cursor: 'pointer' }}
              onClick={() => handleOpenThread(c.id)}
            >
              <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>{initial}</div>
              <div style={{ flex: 1 }}>
                <div className="list-title-row">
                  <span className="list-title">{otherName}</span>
                  <span className="caption">{formatTimeAgo(c.lastMessageAt)}</span>
                </div>
                <div className="caption" style={{ marginTop: 2 }}>@{c.otherUser.username}</div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn ghost small"
                onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
              >
                ···
              </button>
              {menuOpenId === c.id && (
                <div
                  className="glass"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    zIndex: 10,
                    padding: '6px 0',
                    minWidth: 140,
                    borderRadius: 8,
                  }}
                >
                  <button
                    type="button"
                    className="btn ghost small"
                    style={{ width: '100%', textAlign: 'left', borderRadius: 0 }}
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete chat
                  </button>
                  <button
                    type="button"
                    className="btn ghost small"
                    style={{ width: '100%', textAlign: 'left', borderRadius: 0, color: '#ef4444' }}
                    onClick={() => handleBlock(c.id)}
                  >
                    Block / Report
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
