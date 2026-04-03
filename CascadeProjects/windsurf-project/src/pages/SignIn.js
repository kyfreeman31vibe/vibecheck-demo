import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signIn(email, password);
      setLoading(false);

      if (authError) {
        const msg = (authError.message || '').toLowerCase();
        if (msg.includes('invalid login') || msg.includes('invalid email or password') || msg.includes('invalid credentials')) {
          setError('Incorrect email or password. Please try again.');
        } else if (msg.includes('email not confirmed')) {
          setError('Your email is not confirmed yet. Please check your inbox for the confirmation link.');
        } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
          setError('Too many attempts. Please wait a moment and try again.');
        } else if (msg.includes('user not found') || msg.includes('no user')) {
          setError('No account found with this email. Please sign up first.');
        } else {
          setError(authError.message || 'Sign in failed. Please try again.');
        }
        return;
      }

      navigate('/app/dashboard');
    } catch (err) {
      setLoading(false);
      setError('Network error. Please check your connection and try again.');
    }
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="page">
          <header className="page-header">
            <div>
              <h2>Sign In</h2>
              <p className="subtitle">Welcome back to VibeCheck.</p>
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
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={remember}
                  onPointerDown={() => setRemember(!remember)}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setRemember(!remember); }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: '1px solid var(--border-glass)',
                    background: remember ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  {remember ? '✓' : ''}
                </div>
                <span className="caption">Remember me</span>
              </div>
              <Link to="/auth/forgot" className="caption" style={{ color: 'var(--accent)' }}>
                Forgot password?
              </Link>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button type="submit" className="btn primary full-width" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="caption" style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/auth/signup" style={{ color: 'var(--accent)' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
