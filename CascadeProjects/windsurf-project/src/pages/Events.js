import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { useEvents } from '../hooks/useEvents';

const cities = [
  'San Francisco',
  'Oakland',
  'Los Angeles',
  'Atlanta',
  'Chicago',
  'New York',
  'Washington DC',
];

const mockEventsByCity = {
  'San Francisco': [
    { id: 1, name: 'Golden Gate Sunset Sessions', date: 'Fri, Aug 8', location: 'Marina District · San Francisco', type: 'Concert', attendees: 42 },
    { id: 2, name: 'Lo-Fi Rooftop Listening', date: 'Sat, Aug 16', location: 'SoMa · San Francisco', type: 'Casual', attendees: 28 },
  ],
  Oakland: [
    { id: 3, name: 'Lake Merritt Night Cypher', date: 'Thu, Aug 14', location: 'Lake Merritt · Oakland', type: 'Casual', attendees: 31 },
    { id: 4, name: 'Uptown Neo-Soul Showcase', date: 'Sat, Aug 23', location: 'Uptown · Oakland', type: 'Concert', attendees: 19 },
  ],
  'Los Angeles': [
    { id: 5, name: 'Neon Nights Festival', date: 'Sat, Jul 26', location: 'Downtown · Los Angeles', type: 'Festival', attendees: 128 },
    { id: 6, name: 'Rooftop Lo-Fi Session', date: 'Fri, Aug 2', location: 'Hollywood · Los Angeles', type: 'Casual', attendees: 64 },
  ],
  Atlanta: [
    { id: 7, name: 'Midtown R&B Mixer', date: 'Fri, Aug 1', location: 'Midtown · Atlanta', type: 'Casual', attendees: 54 },
    { id: 8, name: 'East Atlanta Indie Night', date: 'Sat, Aug 9', location: 'East Atlanta Village · Atlanta', type: 'Concert', attendees: 33 },
  ],
  Chicago: [
    { id: 9, name: 'River North House Party', date: 'Sat, Aug 2', location: 'River North · Chicago', type: 'Casual', attendees: 47 },
    { id: 10, name: 'Summer on the Lakefront', date: 'Sun, Aug 17', location: 'Lakefront · Chicago', type: 'Festival', attendees: 21 },
  ],
  'New York': [
    { id: 11, name: 'Brooklyn Loft Listening Party', date: 'Fri, Aug 15', location: 'Williamsburg · Brooklyn', type: 'Casual', attendees: 112 },
    { id: 12, name: 'Harlem Jazz After Dark', date: 'Thu, Aug 21', location: 'Harlem · Manhattan', type: 'Concert', attendees: 39 },
  ],
  'Washington DC': [
    { id: 13, name: 'U Street Groove Night', date: 'Sat, Aug 9', location: 'U Street Corridor · DC', type: 'Concert', attendees: 44 },
    { id: 14, name: 'Jazz in the Park', date: 'Sun, Aug 24', location: 'Shaw · DC', type: 'Casual', attendees: 27 },
  ],
};

export { mockEventsByCity };

const EVENT_TYPES = ['All', 'Concert', 'Festival', 'Casual'];

export function Events() {
  const { profile } = useCurrentUserProfile();
  const [city, setCity] = useState(profile.city || 'San Francisco');
  const [typeFilter, setTypeFilter] = useState('All');
  const rawEvents = mockEventsByCity[city] || [];
  const { events, expandedEventIds, toggleExpand } = useEvents(rawEvents);

  const filtered = typeFilter === 'All'
    ? events
    : events.filter((e) => e.type === typeFilter);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Events</h2>
          <p className="subtitle">Local music events and who's going.</p>
        </div>
      </header>

      <section className="section glass" style={{ marginBottom: 12 }}>
        <div className="list-title-row" style={{ marginBottom: 8 }}>
          <div>
            <div className="steps-title">Your city</div>
            <div className="steps-caption">Switch cities to see different lineups.</div>
          </div>
          <select
            className="input"
            style={{ maxWidth: 180 }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={typeFilter === t ? 'btn small primary' : 'btn small ghost'}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <div className="list">
        {filtered.map((event) => {
          const isExpanded = expandedEventIds.includes(event.id);
          const matchCount = event.matchedAttendees?.length || 0;
          return (
            <div key={event.id} className="list-item glass">
              <div className="list-title">{event.name}</div>
              <div className="caption">
                {event.date} · {event.location}
              </div>
              <div className="list-title-row" style={{ marginTop: 8 }}>
                <div className="caption">{event.attendees} VibeCheckers going</div>
                <div className="pill small">{event.type}</div>
              </div>
              {matchCount > 0 && (
                <button
                  type="button"
                  className="btn ghost small"
                  style={{ marginTop: 6 }}
                  onClick={() => toggleExpand(event.id)}
                >
                  {isExpanded ? 'Hide' : 'Show'} {matchCount} of your matches going
                </button>
              )}
              {isExpanded && event.matchedAttendees && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {event.matchedAttendees.map((u) => (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
