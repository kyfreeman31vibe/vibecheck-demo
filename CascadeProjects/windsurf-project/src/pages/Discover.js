import React from 'react';
import { Link } from 'react-router-dom';
import { useMatches, DEMO_USERS } from '../hooks/useMatches';
import { useCircles } from '../hooks/useCircles';

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

function circleButtonLabel(status) {
  if (status === 'accepted') return 'In your circle ✓';
  if (status === 'pending') return 'Request sent';
  return 'Add to Circle';
}

function UsersTab({ matches, getRequestStatus, isInCircle, onSendRequest }) {
  return (
    <div className="list">
      {matches.map(function (m) {
        var u = m.user;
        var isDemo = String(m.id).startsWith('demo-');
        var topArtists = (u.favoriteArtists || []).slice(0, 5).join(', ');
        var initials = u.name.charAt(0).toUpperCase();
        var status = getRequestStatus(m.id);
        var done = status === 'accepted' || status === 'pending';
        return (
          <div key={m.id} className="list-item glass glass-interactive">
            <div className="profile-card-header" style={{ marginBottom: 6 }}>
              <div className="avatar-circle">{initials}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="list-title">{u.name}</div>
                  {isDemo && <span style={{ fontSize: 10, fontWeight: 'bold', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: 4 }}>DEMO</span>}
                </div>
                <div className="caption">{u.bio || 'VibeCheck user'}</div>
              </div>
            </div>
            <div className="caption">Top artists: {topArtists}</div>
            <div className="caption" style={{ marginTop: 2 }}>{u.city}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <div className="pill small" style={{
                background: m.compatibilityScore >= 80
                  ? 'rgba(76, 175, 80, 0.25)'
                  : m.compatibilityScore >= 60
                    ? 'rgba(227, 126, 47, 0.25)'
                    : 'rgba(255, 255, 255, 0.08)',
                color: m.compatibilityScore >= 80
                  ? '#81c784'
                  : m.compatibilityScore >= 60
                    ? 'var(--vc-whiskey-amber)'
                    : 'var(--text-muted)',
              }}>{m.compatibilityScore}% compatible</div>
              {m.sharedArtists.length > 0 && (
                <span className="caption">Shared: {m.sharedArtists.join(', ')}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, position: 'relative', zIndex: 10 }}>
              <div
                role="button"
                tabIndex={0}
                className={'btn ' + (done ? 'ghost' : 'primary')}
                style={{ flex: 1, opacity: done ? 0.6 : 1, pointerEvents: done ? 'none' : 'auto' }}
                onPointerDown={function () { if (!done) onSendRequest(m.id); }}
              >
                {circleButtonLabel(status)}
              </div>
              <Link to={'/app/match/' + m.id} className="btn small ghost">View Profile</Link>
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
          <div key={event.id} className="list-item glass glass-interactive">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="list-title" style={{ flex: 1 }}>{event.name}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(227, 126, 47, 0.15)', color: 'var(--vc-antique-gold)', whiteSpace: 'nowrap', marginLeft: 8 }}>{event.date}</div>
            </div>
            <div className="caption">{event.location}</div>
            <div className="list-title-row" style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', marginRight: 2 }}>
                  {['A', 'K', 'J'].map(function (init, i) {
                    return (
                      <div key={i} className="avatar-circle" style={{
                        width: 22, height: 22, fontSize: 9,
                        marginLeft: i === 0 ? 0 : -8,
                        border: '2px solid var(--vc-charcoal-night)',
                        zIndex: 3 - i,
                        position: 'relative',
                      }}>{init}</div>
                    );
                  })}
                </div>
                <div className="caption">{event.attendees} VibeCheckers going</div>
              </div>
              <div className="pill small" style={{
                background: event.type === 'Concert'
                  ? 'linear-gradient(135deg, var(--vc-whiskey-amber), var(--vc-antique-gold))'
                  : event.type === 'Casual'
                    ? 'rgba(155, 79, 150, 0.35)'
                    : 'rgba(227, 126, 47, 0.2)',
                color: event.type === 'Concert'
                  ? '#fff'
                  : event.type === 'Casual'
                    ? '#d4a0d0'
                    : 'var(--vc-whiskey-amber)',
              }}>{event.type}</div>
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
  var ref = React.useState('users');
  var tab = ref[0];
  var setTab = ref[1];

  var { matches } = useMatches();
  var { getRequestStatus, isInCircle, sendRequest } = useCircles();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Discover</h2>
          <p className="subtitle">Find people and events that match your vibe.</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 0, marginBottom: 12, position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 999, padding: 3, border: '1px solid var(--border-glass)' }}>
        {['users', 'events'].map(function (t) {
          var isActive = tab === t;
          return (
            <div
              key={t}
              role="button"
              tabIndex={0}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '400',
                background: isActive ? 'linear-gradient(135deg, var(--vc-whiskey-amber), var(--vc-velvet-purple))' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                letterSpacing: '0.02em',
              }}
              onPointerDown={function () { setTab(t); }}
            >
              {t === 'users' ? 'Users' : 'Events'}
            </div>
          );
        })}
      </div>

      {tab === 'users' ? (
        <UsersTab matches={matches} getRequestStatus={getRequestStatus} isInCircle={isInCircle} onSendRequest={sendRequest} />
      ) : (
        <EventsTab />
      )}
    </div>
  );
}
