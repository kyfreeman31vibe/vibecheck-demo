import React from 'react';
import { useParams, Link } from 'react-router-dom';

export function Match() {
  const { id } = useParams();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Match #{id}</h2>
          <p className="subtitle">Match detail (mock)</p>
        </div>
        <Link to={`/app/chat/${id}`} className="btn primary">
          Open chat
        </Link>
      </header>
      <section className="section glass">
        <h3>Music compatibility</h3>
        <p>Shared genres: Indie, Alt R&B, Lo-fi.</p>
        <p>Compatibility score: 89% (demo only).</p>
      </section>
    </div>
  );
}
