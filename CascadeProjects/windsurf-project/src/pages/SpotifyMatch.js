import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

function SpotifyConnectCard({ onConnect, connecting }) {
  return (
    <section className="section glass" style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎧</div>
      <h3>Connect your Spotify</h3>
      <p className="caption" style={{ marginBottom: 16 }}>
        Link your Spotify account so we can analyze your listening data and find your most compatible music matches.
      </p>
      <button
        className="btn primary"
        onClick={onConnect}
        disabled={connecting}
        style={{ fontSize: '1rem', padding: '12px 28px' }}
      >
        {connecting ? 'Redirecting...' : 'Connect Spotify'}
      </button>
    </section>
  );
}

function ListeningProfileCard({ profile }) {
  var artists = (profile.top_artists || []).slice(0, 8);
  var tracks = (profile.top_tracks || []).slice(0, 5);
  var synced = profile.last_synced_at
    ? new Date(profile.last_synced_at).toLocaleDateString()
    : 'Never';

  return (
    <section className="section glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3>Your Spotify Data</h3>
        <span className="caption">Synced: {synced}</span>
      </div>
      {profile.display_name && (
        <p style={{ marginBottom: 8 }}>
          Spotify account: <strong>{profile.display_name}</strong>
        </p>
      )}
      {artists.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ marginBottom: 6 }}>Top Artists</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {artists.map(function (a) {
              return (
                <span key={a.id || a.name} className="tag">
                  {a.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {tracks.length > 0 && (
        <div>
          <h4 style={{ marginBottom: 6 }}>Top Tracks</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tracks.map(function (t) {
              return (
                <div key={t.id || t.name} className="caption">
                  🎵 {t.name} — {(t.artists || []).join(', ')}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function MatchResultCard({ match }) {
  var pct = Math.round((match.compatibility_score || 0) * 100);
  return (
    <div className="list-item glass" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>{match.other_name || 'User'}</strong>
        <div className="pill small">{pct}% compatible</div>
      </div>
      {match.match_summary && (
        <p style={{ fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{match.match_summary}</p>
      )}
      {match.shared_artists && match.shared_artists.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <span className="caption">Shared artists: </span>
          <span style={{ fontSize: 13 }}>{match.shared_artists.join(', ')}</span>
        </div>
      )}
      {match.shared_tracks && match.shared_tracks.length > 0 && (
        <div>
          <span className="caption">Shared tracks: </span>
          <span style={{ fontSize: 13 }}>{match.shared_tracks.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

function OtherUserRow({ otherUser, onCompute, computing }) {
  return (
    <div
      className="list-item glass"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <div>
        <strong>{otherUser.display_name || 'Spotify User'}</strong>
        <div className="caption">
          {(otherUser.top_artists || []).slice(0, 3).map(function (a) { return a.name; }).join(', ')}
        </div>
      </div>
      <button
        className="btn small primary"
        onClick={function () { onCompute(otherUser.user_id); }}
        disabled={computing}
      >
        {computing ? '...' : 'Compute Match'}
      </button>
    </div>
  );
}

export function SpotifyMatch() {
  var { user } = useAuth();
  var [listeningProfile, setListeningProfile] = useState(null);
  var [otherProfiles, setOtherProfiles] = useState([]);
  var [matches, setMatches] = useState([]);
  var [loading, setLoading] = useState(true);
  var [connecting, setConnecting] = useState(false);
  var [computingId, setComputingId] = useState(null);
  var [error, setError] = useState('');

  // Check URL params for connection status
  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setError('Spotify connection failed: ' + params.get('error'));
    }
    // Clean up URL params
    if (params.get('connected') || params.get('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch listening profile, other profiles, and existing matches
  var fetchData = useCallback(async function () {
    if (!user) return;
    setLoading(true);

    // Fetch own listening profile
    var { data: myProfile } = await supabase
      .from('listening_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setListeningProfile(myProfile || null);

    if (myProfile) {
      // Fetch other users who have connected Spotify
      var { data: others } = await supabase
        .from('listening_profiles')
        .select('user_id, display_name, top_artists')
        .neq('user_id', user.id);

      setOtherProfiles(others || []);

      // Fetch existing matches involving this user
      var { data: existingA } = await supabase
        .from('matches')
        .select('*')
        .eq('user_a_id', user.id);

      var { data: existingB } = await supabase
        .from('matches')
        .select('*')
        .eq('user_b_id', user.id);

      // Combine and enrich with display names
      var allMatches = [...(existingA || []), ...(existingB || [])];
      var otherMap = {};
      (others || []).forEach(function (o) {
        otherMap[o.user_id] = o.display_name || 'Spotify User';
      });

      var enriched = allMatches.map(function (m) {
        var otherId = m.user_a_id === user.id ? m.user_b_id : m.user_a_id;
        return Object.assign({}, m, { other_name: otherMap[otherId] || 'User' });
      });

      enriched.sort(function (a, b) { return (b.compatibility_score || 0) - (a.compatibility_score || 0); });
      setMatches(enriched);
    }

    setLoading(false);
  }, [user]);

  useEffect(function () {
    fetchData();
  }, [fetchData]);

  // Redirect to Spotify OAuth
  var handleConnect = useCallback(async function () {
    setConnecting(true);
    var { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('You must be signed in to connect Spotify.');
      setConnecting(false);
      return;
    }
    window.location.href = '/api/spotify/auth?token=' + session.access_token;
  }, []);

  // Compute match via Claude AI
  var handleCompute = useCallback(async function (otherUserId) {
    if (!user) return;
    setComputingId(otherUserId);
    setError('');

    try {
      var { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');

      var res = await fetch('/api/match/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_a_id: user.id,
          user_b_id: otherUserId,
          token: session.access_token,
        }),
      });

      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Match computation failed');

      // Refresh data to show new match
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setComputingId(null);
    }
  }, [user, fetchData]);

  if (loading) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h2>AI Music Match</h2>
            <p className="subtitle">Loading...</p>
          </div>
        </header>
      </div>
    );
  }

  // Users who haven't been matched yet
  var matchedIds = {};
  matches.forEach(function (m) {
    matchedIds[m.user_a_id] = true;
    matchedIds[m.user_b_id] = true;
  });
  var unmatchedProfiles = otherProfiles.filter(function (o) {
    return !matchedIds[o.user_id];
  });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>AI Music Match</h2>
          <p className="subtitle">
            Spotify-powered compatibility analysis by Claude AI
          </p>
        </div>
      </header>

      {error && (
        <div
          className="section glass"
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {!listeningProfile ? (
        <SpotifyConnectCard onConnect={handleConnect} connecting={connecting} />
      ) : (
        <>
          <ListeningProfileCard profile={listeningProfile} />

          {/* Existing AI matches */}
          {matches.length > 0 && (
            <section style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 10 }}>Your Matches</h3>
              {matches.map(function (m) {
                return <MatchResultCard key={m.id} match={m} />;
              })}
            </section>
          )}

          {/* Other Spotify users to match with */}
          {unmatchedProfiles.length > 0 && (
            <section style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 10 }}>Discover New Matches</h3>
              <p className="caption" style={{ marginBottom: 10 }}>
                These users have connected Spotify. Click to compute AI compatibility.
              </p>
              {unmatchedProfiles.map(function (o) {
                return (
                  <OtherUserRow
                    key={o.user_id}
                    otherUser={o}
                    onCompute={handleCompute}
                    computing={computingId === o.user_id}
                  />
                );
              })}
            </section>
          )}

          {otherProfiles.length === 0 && (
            <section className="section glass" style={{ textAlign: 'center', marginTop: 16 }}>
              <p className="caption">
                No other users have connected Spotify yet. Share VibeCheck with friends to discover your music compatibility!
              </p>
            </section>
          )}

          {/* Re-sync button */}
          <section style={{ marginTop: 20, textAlign: 'center' }}>
            <button className="btn ghost" onClick={handleConnect}>
              Re-sync Spotify Data
            </button>
          </section>
        </>
      )}
    </div>
  );
}
