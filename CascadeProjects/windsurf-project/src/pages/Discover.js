import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_USERS } from '../hooks/useMatches';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
function computeScore(current, other) {
  const sharedArtists = (other.favoriteArtists || []).filter((a) =>
    (current.favoriteArtists || []).includes(a)
  );
  const sharedMoods = (other.moods || []).filter((m) =>
    (current.moods || []).includes(m)
  );
  return {
    score: Math.min(100, sharedArtists.length * 20 + sharedMoods.length * 15 + 40),
    sharedArtists,
    sharedMoods,
  };
}

const DISCOVER_EVENTS = [
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

export function Discover() {
  const { profile } = useCurrentUserProfile();
  const [tab, setTab] = useState('users');
  const [sentPings, setSentPings] = useState({});
  const [expandedEventId, setExpandedEventId] = useState(null);

  const allUsers = useMemo(() => {
    return DEMO_USERS.map((u) => {
      const { score, sharedArtists, sharedMoods } = computeScore(profile, u);
      return { ...u, compatibilityScore: score, sharedArtists, sharedMoods };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [profile]);

  const handlePing = (id) => {
    setSentPings((prev) => ({ ...prev, [id]: true }));
  };

  const eventsWithAttendees = useMemo(() => {
    return DISCOVER_EVENTS.map((event) => {
      const matched = DEMO_USERS.filter((u) =>
        u.eventsAttending?.includes(event.id)
      );
      return { ...event, matchedUsers: matched };
    });
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Discover</h2>
          <p className="subtitle">Find people and events that match your vibe.</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          className={tab === 'users' ? 'btn primary' : 'btn ghost'}
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button
          type="button"
          className={tab === 'events' ? 'btn primary' : 'btn ghost'}
          onClick={() => setTab('events')}
        >
          Events
        </button>
      </div>

      {tab === 'users' && (
        <div className="list">
          {allUsers.map((u) => {
            const topArtists = (u.favoriteArtists || []).slice(0, 5).join(', ');
            const initials = u.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0].toUpperCase())
              .join('');
            const pinged = !!sentPings[u.id];
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
                    <span className="caption">
                      Shared: {u.sharedArtists.join(', ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Link to={`/app/match/${u.id}`} className="btn small ghost">
                    View Profile
                  </Link>
                  <button
                    type="button"
                    className="btn small primary"
                    onClick={() => handlePing(u.id)}
                    disabled={pinged}
                  >
                    {pinged ? 'Vibe sent' : 'Send Vibe Ping'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'events' && (
        <div className="list">
          {eventsWithAttendees.map((event) => {
            const isExpanded = expandedEventId === event.id;
            return (
              <div key={event.id} className="list-item glass">
                <div className="list-title">{event.name}</div>
                <div className="caption">{event.date} · {event.location}</div>
                <div className="list-title-row" style={{ marginTop: 6 }}>
                  <div className="caption">{event.attendees} VibeCheckers going</div>
                  <div className="pill small">{event.type}</div>
                </div>

                {event.matchedUsers.length > 0 && (
                  <div className="caption" style={{ marginTop: 4 }}>
                    {event.matchedUsers.length} VibeCheckers you know are going
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn small ghost"
                    onClick={() =>
                      setExpandedEventId(isExpanded ? null : event.id)
                    }
                  >
                    {isExpanded ? 'Hide details' : 'Event details'}
                  </button>
                  <Link to="/app/events" className="btn small primary">
                    View all events
                  </Link>
                </div>

                {isExpanded && (
                  <div
                    className="glass"
                    style={{
                      marginTop: 10,
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ marginBottom: 6 }}>
                      <strong>Venue info</strong>
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
                      <div className="caption" style={{ fontStyle: 'italic' }}>
                        Ticket link placeholder (demo only)
                      </div>
                    </div>

                    {event.matchedUsers.length > 0 && (
                      <div>
                        <strong>VibeCheckers attending</strong>
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginTop: 6,
                          }}
                        >
                          {event.matchedUsers.map((u) => (
                            <Link
                              key={u.id}
                              to={`/app/match/${u.id}`}
                              className="pill small"
                              style={{ textDecoration: 'none' }}
                            >
                              {u.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
