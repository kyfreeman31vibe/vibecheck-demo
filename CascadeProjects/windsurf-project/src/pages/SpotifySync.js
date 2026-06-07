import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SpotifySync() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // If no error, redirect to the full Spotify Match page
    if (!error) {
      navigate('/app/spotify-match', { replace: true });
    }
  }, [error, navigate]);

  if (error) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Spotify connection failed</h2>
            <p className="subtitle">Something went wrong during authentication.</p>
          </div>
        </header>
        <section className="section glass" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>Error: {decodeURIComponent(error)}</p>
          <button className="btn primary" onClick={() => navigate('/app/spotify-match')}>
            Try again
          </button>
        </section>
      </div>
    );
  }

  return null;
}
