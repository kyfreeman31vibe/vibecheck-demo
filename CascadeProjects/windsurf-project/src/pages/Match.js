import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';

const EMOJIS = ['🔥', '💫', '🎧', '💜'];

export function Match() {
  const { id } = useParams();
  const { matches, sendVibePing } = useMatches();
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const match = matches.find((m) => String(m.id) === String(id));

  if (!match) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Match not found</h2>
            <p className="subtitle">This demo match isn&apos;t available.</p>
          </div>
        </header>
      </div>
    );
  }

  const topArtists = (match.user.favoriteArtists || []).slice(0, 3);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>{match.user.name}</h2>
          <p className="subtitle">{match.compatibilityScore}% vibe match in your city</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn ghost"
            onClick={() => sendVibePing(match.id)}
            disabled={match.hasPinged}
          >
            {match.hasPinged ? 'Vibe sent' : 'Send Vibe Ping'}
          </button>
          <Link to={`/app/chat/${id}`} className="btn primary">
            Open chat
          </Link>
        </div>
      </header>
      <section className="section glass">
        <h3>Music compatibility</h3>
        {topArtists.length > 0 && (
          <p>
            Top artists: <strong>{topArtists.join(', ')}</strong>
          </p>
        )}
        {match.sharedArtists && match.sharedArtists.length > 0 && (
          <p>
            Shared artists: <strong>{match.sharedArtists.join(', ')}</strong>
          </p>
        )}
        {match.sharedMoods && match.sharedMoods.length > 0 && (
          <p>
            Shared moods:{' '}
            <strong>{match.sharedMoods.join(', ')}</strong>
          </p>
        )}
        <p>Compatibility score: {match.compatibilityScore}% (demo only).</p>
      </section>
      <section className="section glass">
        <h3>React to their vibe</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`btn ghost small ${selectedEmoji === emoji ? 'active' : ''}`}
              onClick={() => setSelectedEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
        {selectedEmoji && (
          <p className="caption">You reacted with {selectedEmoji} (demo only).</p>
        )}
      </section>
    </div>
  );
}
