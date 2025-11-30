import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoUser } from '../demo/DemoUserContext';

const steps = [
  'Basics',
  'Genres',
  'Top Artists',
  'Top Songs',
  'Photos',
  'Connections',
  'Review',
];

export function ProfileSetup() {
  const { user, setUser } = useDemoUser();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [intent, setIntent] = useState(user?.intent || 'Friends');
  const [genres, setGenres] = useState(user?.genres?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    setUser({
      name: trimmedName || 'Demo User',
      username: trimmedUsername || 'demo_user',
      intent,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
    });
    navigate('/app/dashboard');
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Profile setup</h2>
          <p className="subtitle">Create your demo profile to preview how VibeCheck will feel.</p>
        </div>
      </header>
      <section className="section glass" style={{ marginBottom: 12 }}>
        <h3>Basics</h3>
        <form className="steps-list" onSubmit={handleSubmit}>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Name</div>
              <input
                className="input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Username</div>
              <input
                className="input"
                placeholder="@handle"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Connection intent</div>
              <select
                className="input"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              >
                <option value="Friends">Friends</option>
                <option value="Dating">Dating</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </label>
          <label className="steps-item" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="steps-title">Top genres</div>
              <input
                className="input"
                placeholder="e.g. Indie, Lo-fi, Alt R&B"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              />
              <div className="steps-caption">Comma-separated; used to personalize your demo profile.</div>
            </div>
          </label>
          <button type="submit" className="btn primary full-width" style={{ marginTop: 12 }}>
            Finish demo setup
          </button>
        </form>
      </section>
      <ol className="steps-list">
        {steps.map((step, idx) => (
          <li key={step} className="steps-item glass">
            <div className="steps-index">{idx + 1}</div>
            <div>
              <div className="steps-title">{step}</div>
              <div className="steps-caption">This step is represented only in UI for this demo.</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
