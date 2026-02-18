import React from 'react';
import { Link } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';

export function Matches() {
  const { matches, sendVibePing } = useMatches();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Matches</h2>
          <p className="subtitle">People in your city with similar music and mood vibes.</p>
        </div>
      </header>
      <div className="list">
        {matches.map((m) => {
          const topArtists = (m.user.favoriteArtists || []).slice(0, 3).join(', ');
          return (
            <div key={m.id} className="list-item glass">
              <div>
                <div className="list-title">{m.user.name}</div>
                {topArtists && (
                  <div className="caption">Top artists: {topArtists}</div>
                )}
                {m.sharedMoods && m.sharedMoods.length > 0 && (
                  <div className="tag-row" style={{ marginTop: 4 }}>
                    {m.sharedMoods.map((mood) => (
                      <span key={mood} className="tag">
                        {mood}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="list-title-row" style={{ marginTop: 8 }}>
                <div className="pill small">{m.compatibilityScore}% vibe match</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => sendVibePing(m.id)}
                    disabled={m.hasPinged}
                  >
                    {m.hasPinged ? 'Vibe sent' : 'Send Vibe Ping'}
                  </button>
                  <Link to={`/app/match/${m.id}`} className="btn small">
                    View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
