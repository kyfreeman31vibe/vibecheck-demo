import React from 'react';
import { Link } from 'react-router-dom';
import { DEMO_USERS } from '../hooks/useMatches';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';

const EVENTS = [
  { id: 1, name: 'Golden Gate Sunset Sessions', date: 'Fri, Aug 8', location: 'Marina District · San Francisco', type: 'Concert', attendees: 42 },
  { id: 2, name: 'Lo-Fi Rooftop Listening', date: 'Sat, Aug 16', location: 'SoMa · San Francisco', type: 'Casual', attendees: 28 },
  { id: 3, name: 'Lake Merritt Night Cypher', date: 'Thu, Aug 14', location: 'Lake Merritt · Oakland', type: 'Casual', attendees: 31 },
  { id: 5, name: 'Neon Nights Festival', date: 'Sat, Jul 26', location: 'Downtown · Los Angeles', type: 'Festival', attendees: 128 },
  { id: 6, name: 'Rooftop Lo-Fi Session', date: 'Fri, Aug 2', location: 'Hollywood · Los Angeles', type: 'Casual', attendees: 64 },
  { id: 7, name: 'Midtown R&B Mixer', date: 'Fri, Aug 1', location: 'Midtown · Atlanta', type: 'Casual', attendees: 54 },
  { id: 8, name: 'ATL Hip-Hop Block Party', date: 'Sat, Aug 16', location: 'East Atlanta · Atlanta', type: 'Festival', attendees: 91 },
  { id: 9, name: 'Lakeshore House Music Fest', date: 'Sat, Aug 9', location: 'Lakeshore · Chicago', type: 'Festival', attendees: 110 },
  { id: 11, name: 'Brooklyn Warehouse Rave', date: 'Fri, Aug 8', location: 'Bushwick · Brooklyn', type: 'Concert', attendees: 75 },
  { id: 12, name: 'Central Park Acoustic Set', date: 'Sun, Aug 17', location: 'Central Park · New York', type: 'Casual', attendees: 38 },
  { id: 13, name: 'U Street Groove Night', date: 'Sat, Aug 9', location: 'U Street Corridor · DC', type: 'Concert', attendees: 44 },
];

function getCompatibility(current, other) {
  var sharedArtists = (other.favoriteArtists || []).filter(function (a) {
    return (current.favoriteArtists || []).indexOf(a) !== -1;
  });
  var sharedMoods = (other.moods || []).filter(function (m) {
    return (current.moods || []).indexOf(m) !== -1;
  });
  var score = Math.min(100, sharedArtists.length * 20 + sharedMoods.length * 15 + 40);
  return { score: score, sharedArtists: sharedArtists, sharedMoods: sharedMoods };
}

function UsersTab({ profile, sentPings, onPing }) {
  var users = DEMO_USERS.map(function (u) {
    var c = getCompatibility(profile, u);
    return Object.assign({}, u, { compatibilityScore: c.score, sharedArtists: c.sharedArtists, sharedMoods: c.sharedMoods });
  }).sort(function (a, b) { return b.compatibilityScore - a.compatibilityScore; });

  return (
    <div className="list">
      {users.map(function (u) {
        var topArtists = (u.favoriteArtists || []).slice(0, 5).join(', ');
        var initials = u.name.charAt(0).toUpperCase();
        var pinged = !!sentPings[u.id];
        return (
          <div key={u.id} className="list-item glass">
            <div className="profile-card-header" style={{ marginBottom: 6 }}>
              <div className="avatar-circle">{initials}</div>
              <div>
                <div className="list-title">{u.name}</div>
                <div className="caption">{u.bio || 'VibeCheck user'}</div>
              </div>
            </div>
            <div className="caption">Top artists: {topArtists}</div>
            <div className="caption" style={{ marginTop: 2 }}>{u.city}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <div className="pill small">{u.compatibilityScore}% compatible</div>
              {u.sharedArtists.length > 0 && (
                <span className="caption">Shared: {u.sharedArtists.join(', ')}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to={'/app/match/' + u.id} className="btn small ghost">View Profile</Link>
              <button type="button" className="btn small primary" onClick={function () { onPing(u.id); }} disabled={pinged}>
                {pinged ? 'Vibe sent' : 'Send Vibe Ping'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventsTab() {
  var expandedId = null;
  var setExpandedId;

  var ref = React.useState(null);
  expandedId = ref[0];
  setExpandedId = ref[1];

  return (
    <div className="list">
      {EVENTS.map(function (event) {
        var isExpanded = expandedId === event.id;
        var matched = DEMO_USERS.filter(function (u) {
          return (u.eventsAttending || []).indexOf(event.id) !== -1;
        });
        return (
          <div key={event.id} className="list-item glass">
            <div className="list-title">{event.name}</div>
            <div className="caption">{event.date} &middot; {event.location}</div>
            <div className="list-title-row" style={{ marginTop: 6 }}>
              <div className="caption">{event.attendees} VibeCheckers going</div>
              <div className="pill small">{event.type}</div>
            </div>
            {matched.length > 0 && (
              <div className="caption" style={{ marginTop: 4 }}>
                {matched.length} VibeCheckers you know are going
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn small ghost"
                onClick={function () { setExpandedId(isExpanded ? null : event.id); }}
              >
                {isExpanded ? 'Hide details' : 'Event details'}
              </button>
            </div>
            {isExpanded && (
              <div className="glass" style={{ marginTop: 10, padding: 12, borderRadius: 8 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>Venue</strong>
                  <div className="caption">{event.location}</div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Date</strong>
                  <div className="caption">{event.date}</div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Type</strong>
                  <div className="caption">{event.type}</div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Ticketmaster</strong>
                  <div className="caption" style={{ fontStyle: 'italic' }}>Ticket link placeholder (demo)</div>
                </div>
                {matched.length > 0 && (
                  <div>
                    <strong>VibeCheckers attending</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                      {matched.map(function (u) {
                        return (
                          <Link key={u.id} to={'/app/match/' + u.id} className="pill small" style={{ textDecoration: 'none' }}>
                            {u.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Discover() {
  var ref = React.useState('events');
  var tab = ref[0];
  var setTab = ref[1];

  var pingRef = React.useState({});
  var sentPings = pingRef[0];
  var setSentPings = pingRef[1];

  var profileHook = useCurrentUserProfile();
  var profile = profileHook.profile;

  function handlePing(id) {
    setSentPings(function (prev) {
      var next = Object.assign({}, prev);
      next[id] = true;
      return next;
    });
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Discover</h2>
          <p className="subtitle">Find people and events that match your vibe.</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, position: 'relative', zIndex: 10 }}>
        <div
          role="button"
          tabIndex={0}
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            cursor: 'pointer',
            fontWeight: tab === 'users' ? 'bold' : 'normal',
            background: tab === 'users' ? 'linear-gradient(135deg, #e37e2f, #9b4f96)' : 'transparent',
            color: '#fff',
            border: tab === 'users' ? 'none' : '1px solid rgba(232,228,222,0.16)',
            fontSize: '0.9rem',
          }}
          onPointerDown={function () { setTab('users'); }}
        >
          Users
        </div>
        <div
          role="button"
          tabIndex={0}
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            cursor: 'pointer',
            fontWeight: tab === 'events' ? 'bold' : 'normal',
            background: tab === 'events' ? 'linear-gradient(135deg, #e37e2f, #9b4f96)' : 'transparent',
            color: '#fff',
            border: tab === 'events' ? 'none' : '1px solid rgba(232,228,222,0.16)',
            fontSize: '0.9rem',
          }}
          onPointerDown={function () { setTab('events'); }}
        >
          Events
        </div>
      </div>

      {tab === 'users' ? (
        <UsersTab profile={profile} sentPings={sentPings} onPing={handlePing} />
      ) : (
        <EventsTab />
      )}
    </div>
  );
}
