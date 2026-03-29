import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { usePosts } from '../hooks/usePosts';

export function Post() {
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();
  const { createPost } = usePosts();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState('');

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    setError('');

    const { error: postErr } = await createPost(text.trim());
    setPosting(false);

    if (postErr) {
      setError(postErr.message || 'Failed to post.');
      return;
    }

    setPosted(true);
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 1200);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Musical Thought</h2>
          <p className="subtitle">Share what you're vibing with right now.</p>
        </div>
      </header>
      <section className="section glass">
        <div style={{ marginBottom: 8 }}>
          <strong>{profile.name}</strong>
          <span className="caption" style={{ marginLeft: 8 }}>@{profile.username}</span>
        </div>
        <textarea
          className="input"
          rows={4}
          placeholder="What's on your playlist? Share a musical thought..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={posted || posting}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: '4px 0 0' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            type="button"
            className="btn primary"
            onClick={handlePost}
            disabled={!text.trim() || posted || posting}
          >
            {posted ? 'Posted!' : posting ? 'Posting...' : 'Post'}
          </button>
        </div>
        {posted && (
          <p className="caption" style={{ marginTop: 8 }}>
            Your musical thought has been shared. Redirecting to Home...
          </p>
        )}
      </section>
    </div>
  );
}
