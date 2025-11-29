import React from 'react';

export function Integrations() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Integrations</h2>
          <p className="subtitle">Third-party connections (mock)</p>
        </div>
      </header>
      <section className="section glass">
        <ul className="simple-list">
          <li>Spotify (mocked)</li>
          <li>Ticketmaster (mocked)</li>
          <li>Stripe (mocked)</li>
        </ul>
      </section>
    </div>
  );
}
