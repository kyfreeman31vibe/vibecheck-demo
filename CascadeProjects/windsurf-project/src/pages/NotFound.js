import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Not found</h2>
          <p className="subtitle">This VibeCheck page doesnt exist.</p>
        </div>
      </header>
      <section className="section glass">
        <p>Try going back to the dashboard or landing page.</p>
        <div className="cta-row">
          <Link to="/" className="btn ghost">
            Back to landing
          </Link>
          <Link to="/app/dashboard" className="btn primary">
            Go to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
