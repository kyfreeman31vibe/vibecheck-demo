import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { useCircles } from '../hooks/useCircles';
import { useAuth } from '../auth/AuthContext';
import { usePosts } from '../hooks/usePosts';

export function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useCurrentUserProfile();
  const { circleCount, circleMembers } = useCircles();
  const { posts } = usePosts();

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  // Filter the current user's playlist posts
  const myPlaylists = posts.filter((p) => p.userId === profile.id && p.postType === 'playlist');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>My profile</h2>
          <p className="subtitle">Your VibeCheck profile.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={() => navigate('/app/setup')}>
            Edit profile
          </button>
          <button className="btn ghost" style={{ color: '#ef4444' }} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <section className="section glass profile-header">
        <div className="avatar-circle">{initials}</div>
        <div style={{ flex: 1 }}>
          <h3>{profile.name}</h3>
          <p className="subtitle">@{profile.username}</p>
          <p className="caption">{profile.city}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{circleCount}</div>
              <div className="caption">Circle</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{myPlaylists.length}</div>
              <div className="caption">Playlists</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section glass">
        <h3>About</h3>
        {profile.bio ? <p>{profile.bio}</p> : <p className="caption">No bio yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/setup')}>Edit profile</span> to add one.</p>}
      </section>

      <section className="section glass">
        <h3>Top Genres</h3>
        {profile.genres.length > 0 ? (
          <div className="tag-row">
            {profile.genres.map((g) => (
              <span key={g} className="tag">{g}</span>
            ))}
          </div>
        ) : (
          <p className="caption">No genres selected. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/setup')}>Edit profile</span> to add your favorites.</p>
        )}
      </section>

      <section className="section glass">
        <h3>Top Artists</h3>
        {profile.favoriteArtists.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.favoriteArtists.map((a, i) => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 'bold', fontSize: 14, opacity: 0.5, width: 20, textAlign: 'right' }}>{i + 1}</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="caption">No artists selected. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/setup')}>Edit profile</span> to add your top 5.</p>
        )}
      </section>

      <section className="section glass">
        <h3>Mood Tags</h3>
        {profile.moods.length > 0 ? (
          <div className="tag-row">
            {profile.moods.map((mood) => (
              <span key={mood} className="tag">{mood}</span>
            ))}
          </div>
        ) : (
          <p className="caption">No moods selected. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/setup')}>Edit profile</span> to set your vibe.</p>
        )}
      </section>

      <section className="section glass">
        <h3>My Circle</h3>
        {circleMembers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {circleMembers.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                  {(m.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{m.name}</div>
                  <div className="caption">@{m.username}{m.city ? ' · ' + m.city : ''}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="caption">Your circle is empty. Go to <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/discover')}>Discover</span> to add people.</p>
        )}
      </section>

      <section className="section glass">
        <h3>My Playlists</h3>
        {myPlaylists.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myPlaylists.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{p.playlistName}</div>
                  <div className="caption">{(p.playlistSongs || []).length} songs</div>
                </div>
                <button className="btn small ghost" onClick={() => navigate('/app/post/' + p.id)}>View</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="caption">No playlists yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/post')}>Create one</span> to share with the community.</p>
        )}
      </section>

      <section className="section glass">
        <div className="list-title-row">
          <div>
            <h3>Discover</h3>
            <p className="caption">Find people and events that match your vibe.</p>
          </div>
          <button className="btn primary" onClick={() => navigate('/app/discover')}>
            Explore
          </button>
        </div>
      </section>
    </div>
  );
}
