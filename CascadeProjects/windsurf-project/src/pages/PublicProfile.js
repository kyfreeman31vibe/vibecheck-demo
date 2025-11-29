import React from 'react';
import { useParams } from 'react-router-dom';

export function PublicProfile() {
  const { username } = useParams();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>@{username}</h2>
          <p className="subtitle">Public profile (read-only demo)</p>
        </div>
      </header>
      <section className="section glass">
        <h3>Spotify music section</h3>
        <p className="caption">
          In production this would show playlists, top artists/songs, and comments.
        </p>
      </section>
    </div>
  );
}
