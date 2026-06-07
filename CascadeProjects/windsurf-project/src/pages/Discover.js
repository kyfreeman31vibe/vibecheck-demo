import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { useCircles } from '../hooks/useCircles';
import { useEvents } from '../hooks/useEvents';


function circleButtonLabel(status) {
  if (status === 'accepted') return 'In your circle ✓';
  if (status === 'pending') return 'Request sent';
  return 'Add to Circle';
}

function UsersTab({ matches, getRequestStatus, isInCircle, onSendRequest }) {
  var sendingRef = useState({}); var sending = sendingRef[0]; var setSending = sendingRef[1];
  var errorRef = useState({}); var errors = errorRef[0]; var setErrors = errorRef[1];

  async function handleSend(id) {
    setSending(function (p) { var n = Object.assign({}, p); n[id] = true; return n; });
    setErrors(function (p) { var n = Object.assign({}, p); delete n[id]; return n; });
    var result = await onSendRequest(id);
    setSending(function (p) { var n = Object.assign({}, p); delete n[id]; return n; });
    if (result && result.error) {
      var msg = (result.error && result.error.message) || 'Request failed';
      setErrors(function (p) { var n = Object.assign({}, p); n[id] = msg; return n; });
      setTimeout(function () { setErrors(function (p) { var n = Object.assign({}, p); delete n[id]; return n; }); }, 6000);
    }
  }

  return (
    <div className="list">
      {matches.map(function (m) {
        var u = m.user;
        var isDemo = String(m.id).startsWith('demo-');
        var topArtists = (u.favoriteArtists || []).slice(0, 5).join(', ');
        var initials = u.name.charAt(0).toUpperCase();
        var status = getRequestStatus(m.id);
        var done = status === 'accepted' || status === 'pending';
        var isSending = !!sending[m.id];
        var hasError = !!errors[m.id];
        var errorMsg = errors[m.id] || null;
        var disabled = done || isSending;

        var btnLabel = hasError ? 'Tap to retry'
          : isSending ? ''
          : circleButtonLabel(status);

        return (
          <div key={m.id} className="list-item glass glass-interactive">
            <div className="profile-card-header" style={{ marginBottom: 8 }}>
              <div className="avatar-circle">{initials}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="list-title">{u.name}</div>
                  {isDemo && <span style={{ fontSize: '0.625rem', fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>DEMO</span>}
                </div>
                <div className="caption">{u.bio || 'VibeCheck user'}</div>
              </div>
            </div>
            <div className="caption">Top artists: {topArtists}</div>
            <div className="caption" style={{ marginTop: 8 }}>{u.city}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
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
              <button
                type="button"
                className={'btn ' + (hasError ? 'ghost' : done ? 'ghost' : 'primary')}
                style={{
                  flex: 1,
                  opacity: disabled ? 0.6 : 1,
                  color: hasError ? 'var(--danger)' : undefined,
                  borderColor: hasError ? 'var(--danger)' : undefined,
                }}
                disabled={disabled}
                onClick={function () { if (!disabled) handleSend(m.id); }}
              >
                {isSending ? <span className="btn-spinner" /> : btnLabel}
              </button>
              <Link to={'/app/match/' + m.id} className="btn small ghost">View Profile</Link>
            </div>
            {errorMsg && <div className="caption" style={{ color: 'var(--danger)', marginTop: 8 }}>{errorMsg}</div>}
          </div>
        );
      })}
    </div>
  );
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function EventsTab() {
  var { events, loading, error, city, page, totalPages, search, nextPage, prevPage } = useEvents();
  var searchRef = React.useState(city || '');
  var searchVal = searchRef[0];
  var setSearchVal = searchRef[1];
  var expandedRef = React.useState(null);
  var expandedId = expandedRef[0];
  var setExpandedId = expandedRef[1];

  React.useEffect(function () {
    if (city && !searchVal) setSearchVal(city);
  }, [city]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) search(searchVal.trim());
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="City name (e.g. Miami)"
          value={searchVal}
          onChange={function (e) { setSearchVal(e.target.value); }}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn small primary">Search</button>
      </form>

      {loading && <div className="caption" style={{ textAlign: 'center', padding: 24 }}>Loading events...</div>}
      {error && <div className="caption" style={{ textAlign: 'center', padding: 24, color: 'var(--danger)' }}>{error}</div>}
      {!loading && !error && events.length === 0 && city && (
        <div className="caption" style={{ textAlign: 'center', padding: 24 }}>No music events found in {city}. Try another city.</div>
      )}
      {!loading && !city && (
        <div className="caption" style={{ textAlign: 'center', padding: 24 }}>Enter a city above to discover live music events near you.</div>
      )}

      <div className="list">
        {events.map(function (event) {
          var isExpanded = expandedId === event.id;
          var venueStr = event.venue.name + (event.venue.city ? ' · ' + event.venue.city : '') + (event.venue.state ? ', ' + event.venue.state : '');
          return (
            <div key={event.id} className="list-item glass glass-interactive">
              {event.imageUrl && (
                <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 8, height: 120, background: '#1a1a2e' }}>
                  <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="list-title" style={{ flex: 1 }}>{event.name}</div>
                {event.date && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: 8, background: 'rgba(227, 126, 47, 0.15)', color: 'var(--vc-antique-gold)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {formatEventDate(event.date)}
                  </div>
                )}
              </div>
              <div className="caption" style={{ marginTop: 8 }}>{venueStr}</div>
              {event.genre && (
                <div style={{ marginTop: 8 }}>
                  <span className="pill small" style={{ background: 'rgba(155, 79, 150, 0.35)', color: '#d4a0d0' }}>{event.genre}</span>
                </div>
              )}
              {event.attractions && event.attractions.length > 0 && (
                <div className="caption" style={{ marginTop: 8 }}>Lineup: {event.attractions.map(function (a) { return a.name; }).join(', ')}</div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="button" className="btn small ghost" onClick={function () { setExpandedId(isExpanded ? null : event.id); }}>
                  {isExpanded ? 'Hide details' : 'Details'}
                </button>
                {event.url && (
                  <a href={event.url} target="_blank" rel="noopener noreferrer" className="btn small primary" style={{ textDecoration: 'none' }}>Tickets</a>
                )}
              </div>
              {isExpanded && (
                <div className="glass" style={{ marginTop: 8, padding: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Venue</strong>
                    <div className="caption">{event.venue.name}</div>
                    {event.venue.address && <div className="caption">{event.venue.address}</div>}
                  </div>
                  {event.time && (
                    <div style={{ marginBottom: 8 }}>
                      <strong>Time</strong>
                      <div className="caption">{event.time}</div>
                    </div>
                  )}
                  {event.priceRange && (
                    <div style={{ marginBottom: 8 }}>
                      <strong>Price</strong>
                      <div className="caption">${event.priceRange.min} – ${event.priceRange.max} {event.priceRange.currency}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 16 }}>
          <button className="btn small ghost" onClick={prevPage} disabled={page === 0}>Prev</button>
          <span className="caption">Page {page + 1} of {totalPages}</span>
          <button className="btn small ghost" onClick={nextPage} disabled={page >= totalPages - 1}>Next</button>
        </div>
      )}
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

      <div style={{ display: 'flex', gap: 0, marginBottom: 16, position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 999, padding: 4, border: '1px solid var(--border-glass)' }}>
        {['users', 'events'].map(function (t) {
          var isActive = tab === t;
          return (
            <div
              key={t}
              role="button"
              tabIndex={0}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '400',
                background: isActive ? 'linear-gradient(135deg, var(--vc-whiskey-amber), var(--vc-velvet-purple))' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontSize: '0.875rem',
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

      {tab === 'users' && (
        <Link to="/app/spotify-match" className="list-item glass glass-interactive" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🎧</span>
          <div style={{ flex: 1 }}>
            <div className="list-title">Spotify Listening Comparison</div>
            <div className="caption">Optionally connect Spotify to compare listening history with others.</div>
          </div>
          <span style={{ color: 'var(--accent)' }}>→</span>
        </Link>
      )}

      {tab === 'users' ? (
        <UsersTab matches={matches} getRequestStatus={getRequestStatus} isInCircle={isInCircle} onSendRequest={sendRequest} />
      ) : (
        <EventsTab />
      )}
    </div>
  );
}
