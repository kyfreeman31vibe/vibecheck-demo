import React from 'react';
import { useDemoUser } from '../demo/DemoUserContext';

const fallbackProfile = {
  username: 'demo_user',
  name: 'Demo User',
  bio: 'Lo-fi beats, rooftop shows, and late-night playlists.',
  location: 'Los Angeles, CA',
  connections: ['Friends', 'Music Buddies', 'Dating'],
  genres: ['Indie', 'Lo-fi', 'Alt R&B'],
  topArtists: ['Tame Impala', 'Kaytranada', 'Phoebe Bridgers'],
  topSongs: ['The Less I Know The Better', 'Weight Off', 'Moon Song'],
};

export function Profile() {
  const { user } = useDemoUser();
  const profile = {
    ...fallbackProfile,
    ...(user
      ? {
          name: user.name || fallbackProfile.name,
          username: user.username || fallbackProfile.username,
          genres: user.genres?.length ? user.genres : fallbackProfile.genres,
        }
      : {}),
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>My profile</h2>
          <p className="subtitle">Edit music preferences and details (mock)</p>
        </div>
        <button className="btn ghost">Edit</button>
      </header>
      <section className="section glass profile-header">
        <div className="avatar-circle">DU</div>
        <div>
          <h3>{profile.name}</h3>
          <p className="subtitle">@{profile.username}</p>
          <p className="caption">{profile.location}</p>
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
            <h4>Top artists</h4>
            <ul className="simple-list">
              {profile.topArtists.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Top songs</h4>
            <ul className="simple-list">
              {profile.topSongs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
