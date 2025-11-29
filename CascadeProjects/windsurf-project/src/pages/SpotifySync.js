import React from 'react';

export function SpotifySync() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Spotify sync</h2>
          <p className="subtitle">OAuth & playlists are mocked here</p>
        </div>
      </header>
      <section className="section glass">
        <p>
          In production this would connect to your Spotify account, import your top artists,
          tracks, and playlists, and keep them in sync.
        </p>
        <button className="btn primary">Mock connect Spotify</button>
      </section>
    </div>
  );
}
