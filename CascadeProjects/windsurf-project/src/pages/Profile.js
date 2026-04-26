import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

      <section className="section glass-elevated profile-header">
        <div className="avatar-ring">
          <div className="avatar-circle">{initials}</div>
        </div>
        <div style={{ flex: 1 }}>
          <h3>{profile.name}</h3>
          <p className="subtitle">@{profile.username}</p>
          <p className="caption">{profile.city}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ textAlign: 'center', padding: '6px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontWeight: 'bold', fontSize: 17 }}>{circleCount}</div>
              <div className="caption" style={{ fontSize: '0.7rem' }}>Circle</div>
            </div>
            <div style={{ textAlign: 'center', padding: '6px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontWeight: 'bold', fontSize: 17 }}>{myPlaylists.length}</div>
              <div className="caption" style={{ fontSize: '0.7rem' }}>Playlists</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section glass">
        {/* About */}
        <h3>About</h3>
        {profile.bio ? <p>{profile.bio}</p> : <p className="caption">No bio yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/setup')}>Edit profile</span> to add one.</p>}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '14px 0' }} />

        {/* Top Genres */}
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

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '14px 0' }} />

        {/* Top Artists */}
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
        <h3>Listening Titles</h3>
        {profile.moods.length > 0 ? (
          <div className="tag-row">
            {profile.moods.map((mood) => (
              <span key={mood} className="btn small primary" style={{ pointerEvents: 'none' }}>{mood}</span>
            ))}
          </div>
        ) : (
          <p className="caption">No titles selected. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/setup')}>Edit profile</span> to pick yours.</p>
        )}
      </section>

      <section className="section glass">
        <h3>My Circle</h3>
        {circleMembers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {circleMembers.map((m) => (
              <Link key={m.id} to={'/app/match/' + m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', borderRadius: 8, padding: '6px 4px', margin: '-6px -4px', cursor: 'pointer' }} className="glass-interactive">
                <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                  {(m.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{m.name}</div>
                  <div className="caption">@{m.username}{m.city ? ' · ' + m.city : ''}</div>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>›</span>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <p style={{ marginBottom: 4 }}>Your Circle is empty</p>
            <p className="caption" style={{ marginBottom: 12 }}>Find your people on Discover</p>
            <Link to="/app/discover" className="btn primary" style={{ textDecoration: 'none' }}>Discover Users</Link>
          </div>
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
          <p className="caption">No playlists yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/post?type=playlist')}>Create one</span> to share with the community.</p>
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
