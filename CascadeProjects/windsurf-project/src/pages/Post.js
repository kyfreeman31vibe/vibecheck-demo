import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

export function Post() {
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();
  const [text, setText] = useState('');
  const [posted, setPosted] = useState(false);

  const handlePost = () => {
    if (!text.trim()) return;
    setPosted(true);
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 1500);
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
          disabled={posted}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            type="button"
            className="btn primary"
            onClick={handlePost}
            disabled={!text.trim() || posted}
          >
            {posted ? 'Posted!' : 'Post'}
          </button>
        </div>
        {posted && (
          <p className="caption" style={{ marginTop: 8 }}>
            Your musical thought has been shared (demo). Redirecting to Home...
          </p>
        )}
      </section>
    </div>
  );
}
