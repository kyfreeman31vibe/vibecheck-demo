import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { usePosts } from '../hooks/usePosts';

const POST_TYPES = [
  { key: 'thought', label: 'Post a Musical Thought', icon: '💬' },
  { key: 'song', label: 'Add a Song', icon: '🎵' },
  { key: 'playlist', label: 'Add a Playlist', icon: '🎶' },
];

function ThoughtForm({ onSubmit, posting, posted }) {
  const [text, setText] = useState('');
  return (
    <>
      <textarea
        className="input"
        rows={4}
        placeholder="What's on your mind? Share a musical thought..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={posted || posting}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="button"
          className="btn primary"
          onClick={() => onSubmit({ content: text.trim(), postType: 'thought' })}
          disabled={!text.trim() || posted || posting}
        >
          {posted ? 'Posted!' : posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </>
  );
}

function SongForm({ onSubmit, posting, posted }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [note, setNote] = useState('');
  return (
    <>
      <input className="input" type="text" placeholder="Song title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={posted || posting} />
      <input className="input" type="text" placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={posted || posting} style={{ marginTop: 8 }} />
      <textarea className="input" rows={2} placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} disabled={posted || posting} style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="button"
          className="btn primary"
          onClick={() => onSubmit({ content: note.trim() || (title.trim() + ' by ' + artist.trim()), postType: 'song', songTitle: title.trim(), songArtist: artist.trim() })}
          disabled={!title.trim() || !artist.trim() || posted || posting}
        >
          {posted ? 'Posted!' : posting ? 'Posting...' : 'Share Song'}
        </button>
      </div>
    </>
  );
}

function PlaylistForm({ onSubmit, posting, posted }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songs, setSongs] = useState([]);

  function addSong() {
    if (!songTitle.trim() || !songArtist.trim()) return;
    setSongs((prev) => [...prev, { title: songTitle.trim(), artist: songArtist.trim() }]);
    setSongTitle('');
    setSongArtist('');
  }

  return (
    <>
      <input className="input" type="text" placeholder="Playlist name" value={name} onChange={(e) => setName(e.target.value)} disabled={posted || posting} />
      <textarea className="input" rows={2} placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} disabled={posted || posting} style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'flex-end' }}>
        <input className="input" style={{ flex: 1 }} type="text" placeholder="Song title" value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSong(); } }}
          disabled={posted || posting}
        />
        <input className="input" style={{ flex: 1 }} type="text" placeholder="Artist" value={songArtist}
          onChange={(e) => setSongArtist(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSong(); } }}
          disabled={posted || posting}
        />
        <button type="button" className="btn small primary" onPointerDown={addSong} disabled={posted || posting}>+</button>
      </div>
      {songs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {songs.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
              <span className="caption">{i + 1}. {s.title} — {s.artist}</span>
              <button type="button" className="btn small ghost" onPointerDown={() => setSongs((prev) => prev.filter((_, idx) => idx !== i))} style={{ padding: '2px 8px', minWidth: 'auto' }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="button"
          className="btn primary"
          onClick={() => onSubmit({ content: note.trim() || name.trim(), postType: 'playlist', playlistName: name.trim(), playlistSongs: songs })}
          disabled={!name.trim() || songs.length === 0 || posted || posting}
        >
          {posted ? 'Posted!' : posting ? 'Posting...' : 'Share Playlist'}
        </button>
      </div>
    </>
  );
}

export function Post() {
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();
  const { createPost } = usePosts();
  const [postType, setPostType] = useState(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setPosting(true);
    setError('');
    const { error: postErr } = await createPost(payload);
    setPosting(false);
    if (postErr) {
      setError(postErr.message || 'Failed to post.');
      return;
    }
    setPosted(true);
    setTimeout(() => navigate('/app/dashboard'), 1200);
  };

  // Type selector screen (matches wireframe 1)
  if (!postType) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Create Post</h2>
            <p className="subtitle">What do you want to share?</p>
          </div>
        </header>
        <div className="list">
          {POST_TYPES.map((t) => (
            <div
              key={t.key}
              className="list-item glass"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              onPointerDown={() => setPostType(t.key)}
            >
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <span className="list-title">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const titles = { thought: 'Musical Thought', song: 'Add a Song', playlist: 'Add a Playlist' };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <button type="button" className="btn ghost small" onPointerDown={() => { setPostType(null); setPosted(false); setError(''); }} style={{ marginBottom: 4 }}>← Back</button>
          <h2>{titles[postType]}</h2>
          <p className="subtitle">Share what you're vibing with right now.</p>
        </div>
      </header>
      <section className="section glass">
        <div style={{ marginBottom: 8 }}>
          <strong>{profile.name}</strong>
          <span className="caption" style={{ marginLeft: 8 }}>@{profile.username}</span>
        </div>
        {postType === 'thought' && <ThoughtForm onSubmit={handleSubmit} posting={posting} posted={posted} />}
        {postType === 'song' && <SongForm onSubmit={handleSubmit} posting={posting} posted={posted} />}
        {postType === 'playlist' && <PlaylistForm onSubmit={handleSubmit} posting={posting} posted={posted} />}
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: '4px 0 0' }}>{error}</p>}
        {posted && <p className="caption" style={{ marginTop: 8 }}>Your post has been shared. Redirecting to Home...</p>}
      </section>
    </div>
  );
}
