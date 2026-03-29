import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          <div className="list-item glass">
            <p className="caption">No messages yet. Send a Vibe Ping to start chatting!</p>
          </div>
        )}
        {loading && (
          <div className="list-item glass">
            <p className="caption">Loading conversations...</p>
          </div>
        )}
        {conversations.map((c) => (
          <div key={c.id} className="list-item glass">
            <div
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => handleOpenThread(c.id)}
            >
              <div className="list-title-row">
                <span className="list-title">{c.otherUser.name}</span>
                <span className="caption">{formatTimeAgo(c.lastMessageAt)}</span>
              </div>
              <div className="caption" style={{ marginTop: 2 }}>@{c.otherUser.username}</div>
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
        ))}
      </div>
    </div>
  );
}
