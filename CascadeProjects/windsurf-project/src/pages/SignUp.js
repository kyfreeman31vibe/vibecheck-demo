import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !username.trim()) {
      setError('Name and username are required.');
      return;
    }
    if (!passwordValid) {
      setError('Password must be 8+ characters with an uppercase letter and a number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms & Conditions.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email, password, {
      name: name.trim(),
      username: username.trim(),
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Account created — redirect to app (email confirmation disabled)
    navigate('/app/setup');
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="page">
          <header className="page-header">
            <div>
              <h2>Create Account</h2>
              <p className="subtitle">Join VibeCheck and find your people.</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="section glass" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
              placeholder="Password (8+ chars, uppercase, number)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                role="checkbox"
                tabIndex={0}
                aria-checked={agreed}
                onPointerDown={() => setAgreed(!agreed)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setAgreed(!agreed); }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: '1px solid var(--border-glass)',
                  background: agreed ? 'var(--accent)' : 'transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                }}
              >
                {agreed ? '✓' : ''}
              </div>
              <span className="caption">
                I agree to the <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
              </span>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button type="submit" className="btn primary full-width" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="caption" style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/auth/signin" style={{ color: 'var(--accent)' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
