import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockConnections = [
  { id: 1, name: 'Taylor', type: 'Friend', status: 'Connected' },
  { id: 2, name: 'Morgan', type: 'Music Buddy', status: 'Request pending' },
  { id: 3, name: 'Jamie', type: 'Event Buddy', status: 'Connected' },
];

export function Connections() {
  const navigate = useNavigate();

  const handleOpenChat = (id) => {
    navigate(`/app/chat/${id}`);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Connections</h2>
          <p className="subtitle">Friends, music buddies, and event buddies</p>
        </div>
      </header>
      <div className="list">
        {mockConnections.map((c) => (
          <button
            key={c.id}
            type="button"
            className="list-item glass"
            onClick={() => handleOpenChat(c.id)}
          >
            <div>
              <div className="list-title">{c.name}</div>
              <div className="caption">{c.type}</div>
            </div>
            <div className="pill small">Chat</div>
          </button>
        ))}
      </div>
    </div>
  );
}
