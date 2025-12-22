import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDemoUser } from '../demo/DemoUserContext';

export function Landing() {
  const navigate = useNavigate();
  const { user } = useDemoUser();

  const handleGetStarted = () => {
    if (user) {
      navigate('/app/dashboard');   // returning user -> straight to app
    } else {
      navigate('/app/setup');       // first-time -> profile setup
    }
  };

  return (
    <div className="page landing-page">
      <header className="landing-header">
        <div className="logo-wordmark">VibeCheck</div>
        <ThemeToggle />
      </header>
      <main className="landing-main">
        <div className="hero-card glass">
          <h1>Meet people who share your soundtrack.</h1>
          <p>
            VibeCheck connects you with friends, dating matches, and event buddies
            based on your real music taste.
          </p>
          <div className="cta-row">
            <button className="btn primary" onClick={handleGetStarted}>
              Let’s get started
            </button>
          </div>
          <p className="caption">Spotify, events, and chat are mocked for this demo.</p>
        </div>
      </main>
    </div>
  );
}