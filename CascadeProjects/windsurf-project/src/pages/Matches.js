import React from 'react';
import { Link } from 'react-router-dom';

const mockMatches = [
  { id: 1, name: 'Jordan', type: 'Dating Match', compatibility: '92%' },
  { id: 2, name: 'Alex', type: 'Music Buddy', compatibility: '88%' },
  { id: 3, name: 'Riley', type: 'Event Buddy', compatibility: '81%' },
];

export function Matches() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Matches</h2>
          <p className="subtitle">Romantic & music-based matches</p>
        </div>
      </header>
      <div className="list">
        {mockMatches.map((m) => (
          <Link key={m.id} to={`/app/match/${m.id}`} className="list-item glass">
            <div>
              <div className="list-title">{m.name}</div>
              <div className="caption">{m.type}</div>
            </div>
            <div className="pill small">{m.compatibility}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
