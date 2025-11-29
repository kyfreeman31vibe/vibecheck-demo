import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockThreads = [
  { id: 1, name: 'Jordan', last: 'I can send you a playlist.' },
  { id: 2, name: 'Alex', last: 'See you at Neon Nights!' },
  { id: 3, name: 'Riley', last: 'That album is a masterpiece.' },
];

export function Messages() {
  const navigate = useNavigate();

  const handleOpenThread = (id) => {
    navigate(`/app/chat/${id}`);
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
        {mockThreads.map((t) => (
          <button
            key={t.id}
            type="button"
            className="list-item glass"
            onClick={() => handleOpenThread(t.id)}
          >
            <div className="list-title">{t.name}</div>
            <div className="caption">{t.last}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
