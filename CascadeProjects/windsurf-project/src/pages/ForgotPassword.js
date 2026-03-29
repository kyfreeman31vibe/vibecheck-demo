import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await resetPassword(email);
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="app-root">
        <div className="app-shell">
          <div className="page" style={{ justifyContent: 'center', minHeight: '60vh' }}>
            <section className="section glass" style={{ textAlign: 'center' }}>
              <h2>Check your email</h2>
              <p style={{ marginTop: 8 }}>
                We sent a password reset link to <strong>{email}</strong>.
                Follow the link to set a new password.
              </p>
              <Link to="/auth/signin" className="btn primary" style={{ marginTop: 16 }}>
                Back to Sign In
              </Link>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="page">
          <header className="page-header">
            <div>
              <h2>Forgot Password</h2>
              <p className="subtitle">Enter your email and we'll send a reset link.</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="section glass" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button type="submit" className="btn primary full-width" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="caption" style={{ textAlign: 'center' }}>
            Remember your password?{' '}
            <Link to="/auth/signin" style={{ color: 'var(--accent)' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
