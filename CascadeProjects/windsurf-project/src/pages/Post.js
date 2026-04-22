import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { usePosts } from '../hooks/usePosts';

const POST_TYPES = [
  { key: 'thought', label: 'Post a Musical Thought', icon: '💬', accent: 'var(--vc-whiskey-amber)' },
  { key: 'song', label: 'Add a Song', icon: '🎵', accent: null },
  { key: 'playlist', label: 'Add a Playlist', icon: '🎶', accent: 'var(--vc-velvet-purple)' },
];

var MICRO_PROMPTS = [
  'What song is stuck in your head?',
  'Drop a hot take about an artist.',
  'What are you vibing with right now?',
  'Share a track someone needs to hear.',
];

var THOUGHT_MAX = 240;

function ThoughtForm({ onSubmit, posting, posted }) {
  const [text, setText] = useState('');
  const [showSong, setShowSong] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const textareaRef = useRef(null);

  var autoResize = useCallback(function () {
    var el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 96) + 'px';
  }, []);

  var handleChange = function (e) {
    var val = e.target.value;
    if (val.length <= THOUGHT_MAX) {
      setText(val);
      autoResize();
    }
  };

  var remaining = THOUGHT_MAX - text.length;

  var handleSubmit = function () {
    var payload = { content: text.trim(), postType: 'thought' };
    if (showSong && songTitle.trim() && songArtist.trim()) {
      payload.postType = 'song';
      payload.songTitle = songTitle.trim();
      payload.songArtist = songArtist.trim();
    }
    onSubmit(payload);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className="input"
          rows={4}
          placeholder="What's on your mind? Share a musical thought..."
          value={text}
          onChange={handleChange}
          disabled={posted || posting}
          style={{ width: '100%', resize: 'none', minHeight: 96, overflow: 'hidden' }}
        />
        <span
          className="caption"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 10,
            fontSize: '0.75rem',
            color: remaining <= 20 ? 'var(--danger)' : 'var(--text-muted)',
          }}
        >
          {remaining}/{THOUGHT_MAX}
        </span>
      </div>

      {!showSong && !posted && (
        <button
          type="button"
          className="btn ghost small"
          style={{ padding: '4px 0', marginTop: 6, fontSize: '0.85rem' }}
          onPointerDown={() => setShowSong(true)}
        >
          ＋ Add a song to this thought
        </button>
      )}

      {showSong && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <input className="input" type="text" placeholder="Song title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} disabled={posted || posting} />
          <input className="input" type="text" placeholder="Artist" value={songArtist} onChange={(e) => setSongArtist(e.target.value)} disabled={posted || posting} />
          <button
            type="button"
            className="btn ghost small"
            style={{ padding: '4px 0', fontSize: '0.8rem', alignSelf: 'flex-start' }}
            onPointerDown={() => { setShowSong(false); setSongTitle(''); setSongArtist(''); }}
          >
            ✕ Remove song
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="button"
          className="btn primary"
          onClick={handleSubmit}
          disabled={!text.trim() || posted || posting}
        >
          {posted ? <span className="btn-success-icon">✓ Posted!</span> : posting ? <span className="btn-spinner" /> : 'Post'}
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
      <input className="input" type="text" placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} disabled={posted || posting} style={{ marginTop: 8, width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="button"
          className="btn primary"
          onClick={() => onSubmit({ content: note.trim() || (title.trim() + ' by ' + artist.trim()), postType: 'song', songTitle: title.trim(), songArtist: artist.trim() })}
          disabled={!title.trim() || !artist.trim() || posted || posting}
        >
          {posted ? <span className="btn-success-icon">✓ Posted!</span> : posting ? <span className="btn-spinner" /> : 'Share Song'}
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
          {posted ? <span className="btn-success-icon">✓ Posted!</span> : posting ? <span className="btn-spinner" /> : 'Share Playlist'}
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

  var prompt = useMemo(function () {
    return MICRO_PROMPTS[Math.floor(Math.random() * MICRO_PROMPTS.length)];
  }, []);

  function handleCardTap(e, key) {
    var rect = e.currentTarget.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(0) + '%';
    var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(0) + '%';
    e.currentTarget.style.setProperty('--ripple-x', x);
    e.currentTarget.style.setProperty('--ripple-y', y);
    e.currentTarget.classList.add('ripple');
    setTimeout(function () { setPostType(key); }, 150);
  }

  // Type selector screen (matches wireframe 1)
  if (!postType) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Create Post</h2>
            <p className="subtitle">{prompt}</p>
          </div>
        </header>
        <div className="list">
          {POST_TYPES.map((t) => (
            <div
              key={t.key}
              className="list-item glass post-card"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                borderLeft: t.accent ? ('3px solid ' + t.accent) : 'none',
              }}
              onPointerDown={(e) => handleCardTap(e, t.key)}
            >
              <span
                style={{ fontSize: 22 }}
                className={t.key === 'song' ? 'post-card-icon-pulse' : ''}
              >{t.icon}</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn ghost small" style={{ padding: '6px 8px' }} onPointerDown={() => { setPostType(null); setPosted(false); setError(''); }}>
            ←
          </button>
          <div>
            <h2 style={{ fontSize: '1.1rem' }}>{titles[postType]}</h2>
            <p className="subtitle" style={{ fontSize: '0.75rem' }}>Share what you're vibing with right now.</p>
          </div>
        </div>
      </header>
      <section className="section glass-elevated">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>{(profile.name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <strong style={{ fontSize: '0.9rem' }}>{profile.name}</strong>
            <span className="caption" style={{ marginLeft: 6 }}>@{profile.username}</span>
          </div>
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
