import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialThreads = [
  { id: 1, name: 'Jordan', last: 'I can send you a playlist.', time: '2m ago' },
  { id: 2, name: 'Alex', last: 'See you at Neon Nights!', time: '1h ago' },
  { id: 3, name: 'Riley', last: 'That album is a masterpiece.', time: '3h ago' },
  { id: 4, name: 'Sam', last: 'Added you to my circle!', time: '6h ago' },
];

export function Messages() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState(initialThreads);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const handleOpenThread = (id) => {
    navigate(`/app/chat/${id}`);
  };

  const handleDelete = (id) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setMenuOpenId(null);
  };

  const handleBlock = (id) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
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
        {threads.length === 0 && (
          <div className="list-item glass">
            <p className="caption">No messages yet. Send a Vibe Ping to start chatting!</p>
          </div>
        )}
        {threads.map((t) => (
          <div key={t.id} className="list-item glass">
            <div
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => handleOpenThread(t.id)}
            >
              <div className="list-title-row">
                <span className="list-title">{t.name}</span>
                <span className="caption">{t.time}</span>
              </div>
              <div className="caption" style={{ marginTop: 2 }}>{t.last}</div>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn ghost small"
                onClick={() => setMenuOpenId(menuOpenId === t.id ? null : t.id)}
              >
                ···
              </button>
              {menuOpenId === t.id && (
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
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete chat
                  </button>
                  <button
                    type="button"
                    className="btn ghost small"
                    style={{ width: '100%', textAlign: 'left', borderRadius: 0, color: '#ef4444' }}
                    onClick={() => handleBlock(t.id)}
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
