import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page landing-page">
      <header className="landing-header">
        <div className="logo-wordmark">VibeCheck</div>
        <ThemeToggle />
      </header>
      <main className="landing-main">
        <div className="hero-emoji">🎧</div>
        <div className="hero-card">
          <h1>Meet people who share your soundtrack.</h1>
          <p>
            Connect with your community through your real music taste.
            Discover people and events that match your vibe.
          </p>
          <div className="cta-row">
            <button className="btn primary" onClick={() => navigate('/auth/signup')}>
              Get Started
            </button>
            <button className="btn ghost" onClick={() => navigate('/auth/signin')}>
              Sign In
            </button>
          </div>
        </div>
        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">🎵</div>
            <div className="landing-feature-label">Music-powered matching</div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">👥</div>
            <div className="landing-feature-label">Build your circle</div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">🎤</div>
            <div className="landing-feature-label">Live events</div>
          </div>
        </div>
      </main>
    </div>
  );
}