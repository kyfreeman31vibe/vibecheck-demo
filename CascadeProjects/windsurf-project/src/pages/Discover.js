import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMatches, DEMO_USERS } from '../hooks/useMatches';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { useEvents } from '../hooks/useEvents';
import { mockEventsByCity } from './Events';

export function Discover() {
  const { profile } = useCurrentUserProfile();
  const { matches, sendVibePing } = useMatches();
  const [tab, setTab] = useState('users');

  const city = profile.city || 'San Francisco';
  const rawEvents = mockEventsByCity[city] || [];
  const { events } = useEvents(rawEvents);

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
          {matches.length === 0 && (
            <div className="list-item glass">
              <p className="caption">No matches found in your city. Try updating your city in profile setup.</p>
            </div>
          )}
          {matches.map((m) => {
            const topArtists = (m.user.favoriteArtists || []).slice(0, 5).join(', ');
            const initials = m.user.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0].toUpperCase())
              .join('');
            return (
              <div key={m.id} className="list-item glass">
                <div className="profile-card-header" style={{ marginBottom: 6 }}>
                  <div className="avatar-circle">{initials}</div>
                  <div>
                    <div className="list-title">{m.user.name}</div>
                    <div className="caption">{m.user.bio || 'VibeCheck user'}</div>
                  </div>
                </div>
                {topArtists && (
                  <div className="caption">Top artists: {topArtists}</div>
                )}
                <div className="pill small" style={{ marginTop: 4 }}>
                  {m.compatibilityScore}% compatible
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Link to={`/app/match/${m.id}`} className="btn small ghost">
                    View Profile
                  </Link>
                  <button
                    type="button"
                    className="btn small primary"
                    onClick={() => sendVibePing(m.id)}
                    disabled={m.hasPinged}
                  >
                    {m.hasPinged ? 'Vibe sent' : 'Send Vibe Ping'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'events' && (
        <div className="list">
          {events.length === 0 && (
            <div className="list-item glass">
              <p className="caption">No events found for {city}.</p>
            </div>
          )}
          {events.map((event) => {
            const matchCount = event.matchedAttendees?.length || 0;
            return (
              <div key={event.id} className="list-item glass">
                <div className="list-title">{event.name}</div>
                <div className="caption">{event.date} · {event.location}</div>
                <div className="list-title-row" style={{ marginTop: 6 }}>
                  <div className="caption">{event.attendees} VibeCheckers going</div>
                  {matchCount > 0 && (
                    <div className="pill small">{matchCount} of your matches</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
