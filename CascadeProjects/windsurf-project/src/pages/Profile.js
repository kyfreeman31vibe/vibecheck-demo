import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

export function Profile() {
  const navigate = useNavigate();
  const { profile } = useCurrentUserProfile();

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>My profile</h2>
          <p className="subtitle">Your current VibeCheck demo profile.</p>
        </div>
        <button className="btn ghost" onClick={() => navigate('/app/setup')}>
          Edit profile
        </button>
      </header>
      <section className="section glass profile-header">
        <div className="avatar-circle">{initials}</div>
        <div>
          <h3>{profile.name}</h3>
          <p className="subtitle">@{profile.username}</p>
          <p className="caption">{profile.city}</p>
        </div>
      </section>
      <section className="section glass">
        <h3>About</h3>
        <p>{profile.bio}</p>
      </section>
      <section className="section glass">
        <h3>Music</h3>
        <div className="tag-row">
          {profile.genres.map((g) => (
            <span key={g} className="tag">
              {g}
            </span>
          ))}
        </div>
        <div className="two-column">
          <div>
            <h4>Favorite artists</h4>
            <ul className="simple-list">
              {profile.favoriteArtists.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Mood tags</h4>
            <div className="tag-row">
              {profile.moods.map((mood) => (
                <span key={mood} className="tag">
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section glass">
        <div className="list-title-row">
          <div>
            <h3>Next step</h3>
            <p className="caption">See who you vibe with based on music and mood.</p>
          </div>
          <button className="btn primary" onClick={() => navigate('/app/matches')}>
            View matches
          </button>
        </div>
      </section>
    </div>
  );
}
