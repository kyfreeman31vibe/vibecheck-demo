import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DEMO_USERS } from '../hooks/useMatches';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

const EMOJIS = ['🔥', '💫', '🎧', '💜'];

function computeCompat(current, other) {
  const sharedArtists = (other.favoriteArtists || []).filter((a) =>
    (current.favoriteArtists || []).includes(a)
  );
  const sharedMoods = (other.moods || []).filter((m) =>
    (current.moods || []).includes(m)
  );
  return {
    score: Math.min(100, sharedArtists.length * 20 + sharedMoods.length * 15 + 40),
    sharedArtists,
    sharedMoods,
  };
}

export function Match() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [inCircle, setInCircle] = useState(false);
  const [pinged, setPinged] = useState(false);

  const user = DEMO_USERS.find((u) => String(u.id) === String(id));

  const compat = useMemo(() => {
    if (!user) return { score: 0, sharedArtists: [], sharedMoods: [] };
    return computeCompat(profile, user);
  }, [profile, user]);

  if (!user) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Profile not found</h2>
            <p className="subtitle">This user doesn&apos;t exist in the demo.</p>
          </div>
        </header>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => navigate(-1)}
            style={{ marginBottom: 4 }}
          >
            ← Back
          </button>
          <h2>{user.name}</h2>
          <p className="subtitle">{compat.score}% compatible</p>
        </div>
      </header>

      {/* Profile header */}
      <section className="section glass profile-header">
        <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: 24 }}>
          {initials}
        </div>
        <div>
          <h3>{user.name}</h3>
          <p className="caption">
            {user.locationPublic ? user.city : 'Location hidden'}
          </p>
          <p style={{ marginTop: 4 }}>{user.bio}</p>
        </div>
      </section>

      {/* Actions */}
      <section className="section glass">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={inCircle ? 'btn ghost' : 'btn primary'}
            onClick={() => setInCircle(!inCircle)}
          >
            {inCircle ? 'In your circle ✓' : 'Add to circle'}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setPinged(true)}
            disabled={pinged}
          >
            {pinged ? 'Vibe sent ✓' : 'Send Vibe Ping'}
          </button>
          <Link to={`/app/chat/${id}`} className="btn primary">
            Message user
          </Link>
        </div>
      </section>

      {/* Shared music highlights */}
      <section className="section glass">
        <h3>Music Highlights</h3>
        <div className="pill small" style={{ marginBottom: 8 }}>
          {compat.score}% compatibility
        </div>
        <div>
          <h4>Top 5 Artists</h4>
          <div className="tag-row" style={{ marginTop: 4 }}>
            {(user.favoriteArtists || []).slice(0, 5).map((a) => (
              <span key={a} className="tag">{a}</span>
            ))}
          </div>
        </div>
        {compat.sharedArtists.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h4>Shared Artists</h4>
            <div className="tag-row" style={{ marginTop: 4 }}>
              {compat.sharedArtists.map((a) => (
                <span key={a} className="tag" style={{ fontWeight: 'bold' }}>{a}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Mood alignment */}
      <section className="section glass">
        <h3>Mood Alignment</h3>
        <div className="tag-row">
          {(user.moods || []).map((mood) => {
            const isShared = compat.sharedMoods.includes(mood);
            return (
              <span
                key={mood}
                className="tag"
                style={isShared ? { fontWeight: 'bold', border: '1px solid var(--accent)' } : {}}
              >
                {mood} {isShared ? '✓' : ''}
              </span>
            );
          })}
        </div>
        {compat.sharedMoods.length > 0 && (
          <p className="caption" style={{ marginTop: 6 }}>
            You share {compat.sharedMoods.length} mood{compat.sharedMoods.length > 1 ? 's' : ''} in common.
          </p>
        )}
      </section>

      {/* Recent listening history */}
      <section className="section glass">
        <h3>Recent Listening</h3>
        <ul className="simple-list">
          {(user.recentListening || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Playlists */}
      <section className="section glass">
        <h3>Playlists</h3>
        <div className="tag-row">
          {(user.playlists || []).map((pl) => (
            <span key={pl} className="tag">{pl}</span>
          ))}
        </div>
      </section>

      {/* Most listened songs */}
      <section className="section glass">
        <h3>Most Listened Songs</h3>
        <ul className="simple-list">
          {(user.mostListened || []).map((song, idx) => (
            <li key={song}>{idx + 1}. {song}</li>
          ))}
        </ul>
      </section>

      {/* React to their vibe */}
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
