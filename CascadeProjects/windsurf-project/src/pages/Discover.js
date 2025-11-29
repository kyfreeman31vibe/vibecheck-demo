import React from 'react';

const mockProfiles = [
  {
    id: 1,
    name: 'Jordan',
    age: 27,
    location: 'Los Angeles',
    tags: ['Indie', 'House', 'Festivals'],
    blurb: 'Weekend festivals and deep cuts only.',
  },
  {
    id: 2,
    name: 'Alex',
    age: 25,
    location: 'Seattle',
    tags: ['Lo-fi', 'Jazz', 'Vinyl'],
    blurb: 'Late-night lo-fi and jazz bars.',
  },
];

export function Discover() {
  const [index] = React.useState(0);
  const profile = mockProfiles[index];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Connect</h2>
          <p className="subtitle">Swipe through music-powered matches (mocked)</p>
        </div>
      </header>
      <section className="section">
        <div className="profile-card glass">
          <div className="profile-card-header">
            <div className="avatar-circle">{profile.name[0]}</div>
            <div>
              <h3>
                {profile.name}, {profile.age}
              </h3>
              <p className="caption">{profile.location}</p>
            </div>
          </div>
          <p className="profile-card-blurb">{profile.blurb}</p>
          <div className="tag-row">
            {profile.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="swipe-actions">
          <button className="btn ghost">Pass</button>
          <button className="btn primary">Like</button>
          <button className="btn ghost">Super</button>
        </div>
      </section>
    </div>
  );
}
