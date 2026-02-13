import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export function Auth() {
  const { signInWithEmail, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'sent' | 'error' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const { error } = await signInWithEmail(email);
      if (error) {
        console.error(error);
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Sign in</h2>
          <p className="subtitle">Use a magic link sent to your email.</p>
        </div>
      </header>
      <section className="section glass">
        {user && (
          <p className="caption" style={{ marginBottom: 12 }}>
            You are already signed in as {user.email}.
          </p>
        )}
        <form onSubmit={handleSubmit} className="steps-list">
          <label
            className="steps-item"
            style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}
          >
            <div style={{ flex: 1 }}>
              <div className="steps-title">Email</div>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>
          <button className="btn primary full-width" type="submit" disabled={loading}>
            Send magic link
          </button>
        </form>
        {status === 'sent' && (
          <p className="caption" style={{ marginTop: 12 }}>
            Check your email for a link to sign in.
          </p>
        )}
        {status === 'error' && (
          <p className="caption" style={{ marginTop: 12, color: '#ff4b81' }}>
            Something went wrong sending the link. Please try again.
          </p>
        )}
      </section>
    </div>
  );
}