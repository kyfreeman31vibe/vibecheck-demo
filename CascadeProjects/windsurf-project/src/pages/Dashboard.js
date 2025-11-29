import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockStats = [
  { label: 'Matches', value: 8 },
  { label: 'Chats', value: 5 },
  { label: 'Compatibility', value: '87%' },
  { label: 'Vibe Score', value: '92' },
];

const mockFeed = [
  { id: 1, type: 'music', text: 'Alex shared a Spotify playlist: Late Night Lo-Fi' },
  { id: 2, type: 'event', text: 'Sam is going to: Neon Nights Festival' },
  { id: 3, type: 'connection', text: 'You matched with Jordan (Music Buddy)' },
];

export function Dashboard() {
  const navigate = useNavigate();

  const handleStatClick = (label) => {
    if (label === 'Chats') {
      navigate('/app/messages');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">Your music-powered social hub</p>
        </div>
      </header>
      <section className="grid stats-grid">
        {mockStats.map((s) => (
          <button
            key={s.label}
            type="button"
            className="stat-card glass"
            onClick={() => handleStatClick(s.label)}
          >
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </button>
        ))}
      </section>
      <section className="section">
        <div className="section-header">
          <h3>Recent activity</h3>
        </div>
        <div className="list">
          {mockFeed.map((item) => (
            <div key={item.id} className="list-item glass">
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
