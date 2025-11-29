import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockFeed = [
  {
    id: 1,
    type: 'spotify',
    user: 'Jordan',
    text: 'shared a playlist: Sunset Drives',
    meta: '35 tracks · Chillwave, Indie, Lo-fi',
  },
  {
    id: 2,
    type: 'event',
    user: 'Alex',
    text: 'is going to Neon Nights Festival',
    meta: 'This Saturday · Downtown LA',
  },
  {
    id: 3,
    type: 'connection',
    user: 'You',
    text: 'matched with Riley (Music Buddy)',
    meta: 'Compatibility 90%',
  },
];

export function Feed() {
  const navigate = useNavigate();
  const [commentsByItem, setCommentsByItem] = useState({});
  const [drafts, setDrafts] = useState({});

  const handleChange = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddComment = (id) => {
    const text = (drafts[id] || '').trim();
    if (!text) return;

    setCommentsByItem((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), text],
    }));
    setDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  const handleOpenChatFromFeed = (id) => {
    navigate(`/app/chat/${id}`);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Feed</h2>
          <p className="subtitle">Activity from your connections</p>
        </div>
      </header>
      <div className="list">
        {mockFeed.map((item) => {
          const comments = commentsByItem[item.id] || [];
          const draft = drafts[item.id] || '';
          return (
            <div key={item.id} className="list-item glass">
              <button
                type="button"
                className="list-title-row"
                onClick={() => handleOpenChatFromFeed(item.id)}
                style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', width: '100%' }}
              >
                <span className="list-user">{item.user}</span>
                <span className="pill small">{item.type}</span>
              </button>
              <div className="list-text">{item.text}</div>
              <div className="caption">{item.meta}</div>

              <div className="chat-input-row" style={{ marginTop: 10 }}>
                <input
                  className="input"
                  placeholder="Add a comment (demo only)"
                  value={draft}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                />
                <button className="btn primary" onClick={() => handleAddComment(item.id)}>
                  Comment
                </button>
              </div>

              {comments.length > 0 && (
                <ul className="simple-list" style={{ marginTop: 8 }}>
                  {comments.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
