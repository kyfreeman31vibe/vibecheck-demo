import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCompetitionDetail } from '../hooks/useCompetitions';

function SubmitEntryForm({ onSubmit }) {
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songs, setSongs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function addSong() {
    if (!songTitle.trim() || !songArtist.trim()) return;
    setSongs((prev) => [...prev, { title: songTitle.trim(), artist: songArtist.trim() }]);
    setSongTitle('');
    setSongArtist('');
  }

  function removeSong(idx) {
    setSongs((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!playlistName.trim()) {
      setError('Playlist name is required.');
      return;
    }
    if (songs.length === 0) {
      setError('Add at least one song.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: submitError } = await onSubmit({
      playlistName: playlistName.trim(),
      description: description.trim(),
      songs,
    });
    setSubmitting(false);
    if (submitError) {
      setError(submitError.message || 'Failed to submit entry.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="section glass" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ margin: 0 }}>Submit Your Playlist</h3>
      <input
        className="input"
        type="text"
        placeholder="Playlist name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
      />
      <input
        className="input"
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <input
            className="input"
            type="text"
            placeholder="Song title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSong(); } }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <input
            className="input"
            type="text"
            placeholder="Artist"
            value={songArtist}
            onChange={(e) => setSongArtist(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSong(); } }}
          />
        </div>
        <button type="button" className="btn small primary" onPointerDown={addSong}>+</button>
      </div>

      {songs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {songs.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
              <span className="caption">{i + 1}. {s.title} — {s.artist}</span>
              <button type="button" className="btn small ghost" onPointerDown={() => removeSong(i)} style={{ padding: '2px 8px', minWidth: 'auto' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

      <button type="submit" className="btn primary" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Entry'}
      </button>
    </form>
  );
}

function EntryCard({ entry, hasVoted, onToggleVote, rank }) {
  const profile = entry.profiles || {};
  const songs = entry.songs || [];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="list-item glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {rank <= 3 && (
              <span style={{ fontSize: 20 }}>
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </span>
            )}
            <div className="list-title">{entry.playlist_name}</div>
          </div>
          <div className="caption">by {profile.name || profile.username || 'Unknown'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className={hasVoted ? 'btn small primary' : 'btn small ghost'}
            onPointerDown={onToggleVote}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {hasVoted ? '🔥' : '🤍'} {entry.vote_count || 0}
          </button>
        </div>
      </div>

      {entry.description && (
        <div className="caption" style={{ marginTop: 4 }}>{entry.description}</div>
      )}

      {songs.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <button type="button" className="btn small ghost" onPointerDown={() => setExpanded(!expanded)} style={{ padding: '2px 8px' }}>
            {expanded ? 'Hide tracks' : `View ${songs.length} tracks`}
          </button>
          {expanded && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {songs.map((s, i) => (
                <div key={i} className="caption" style={{ padding: '2px 0' }}>
                  {i + 1}. {s.title} — {s.artist}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CompetitionDetail() {
  const { id } = useParams();
  const {
    competition,
    entries,
    myVotes,
    loading,
    submitEntry,
    toggleVote,
    hasSubmitted,
  } = useCompetitionDetail(id);

  if (loading) {
    return (
      <div className="page">
        <p className="caption">Loading competition...</p>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Competition not found</h2>
          </div>
        </header>
        <Link to="/app/discover" className="btn ghost">Back to Discover</Link>
      </div>
    );
  }

  const statusLabel = {
    active: '🟢 Accepting entries',
    voting: '🗳️ Voting open',
    ended: '🏆 Ended',
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/app/discover" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Discover
          </Link>
          <h2 style={{ marginTop: 4 }}>{competition.title}</h2>
          <p className="subtitle">{competition.description}</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div className="pill small">{competition.theme}</div>
        <div className="pill small">{statusLabel[competition.status] || competition.status}</div>
        <div className="pill small">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</div>
      </div>

      {competition.status === 'active' && !hasSubmitted && (
        <SubmitEntryForm onSubmit={submitEntry} />
      )}

      {competition.status === 'active' && hasSubmitted && (
        <div className="section glass" style={{ textAlign: 'center', padding: 16 }}>
          <p className="caption">✅ You've submitted your entry!</p>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>
          {competition.status === 'ended' ? 'Final Rankings' : 'Entries'}
        </h3>
        {entries.length === 0 ? (
          <div className="section glass" style={{ textAlign: 'center', padding: 16 }}>
            <p className="caption">No entries yet. Be the first to submit!</p>
          </div>
        ) : (
          <div className="list">
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                rank={idx + 1}
                hasVoted={myVotes.has(entry.id)}
                onToggleVote={() => toggleVote(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
