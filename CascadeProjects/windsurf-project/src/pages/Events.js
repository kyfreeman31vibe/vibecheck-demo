import React, { useState } from 'react';

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
    {
      id: 1,
      name: 'Golden Gate Sunset Sessions',
      date: 'Fri, Aug 8',
      location: 'Marina District · San Francisco',
      status: 'Going',
      attendees: 42,
    },
    {
      id: 2,
      name: 'Lo-Fi Rooftop Listening',
      date: 'Sat, Aug 16',
      location: 'SoMa · San Francisco',
      status: 'Interested',
      attendees: 28,
    },
  ],
  Oakland: [
    {
      id: 3,
      name: 'Lake Merritt Night Cypher',
      date: 'Thu, Aug 14',
      location: 'Lake Merritt · Oakland',
      status: 'Going',
      attendees: 31,
    },
    {
      id: 4,
      name: 'Uptown Neo-Soul Showcase',
      date: 'Sat, Aug 23',
      location: 'Uptown · Oakland',
      status: 'Maybe',
      attendees: 19,
    },
  ],
  'Los Angeles': [
    {
      id: 5,
      name: 'Neon Nights Festival',
      date: 'Sat, Jul 26',
      location: 'Downtown · Los Angeles',
      status: 'Going',
      attendees: 128,
    },
    {
      id: 6,
      name: 'Rooftop Lo-Fi Session',
      date: 'Fri, Aug 2',
      location: 'Hollywood · Los Angeles',
      status: 'Interested',
      attendees: 64,
    },
  ],
  Atlanta: [
    {
      id: 7,
      name: 'Midtown R&B Mixer',
      date: 'Fri, Aug 1',
      location: 'Midtown · Atlanta',
      status: 'Going',
      attendees: 54,
    },
    {
      id: 8,
      name: 'East Atlanta Indie Night',
      date: 'Sat, Aug 9',
      location: 'East Atlanta Village · Atlanta',
      status: 'Interested',
      attendees: 33,
    },
  ],
  Chicago: [
    {
      id: 9,
      name: 'River North House Party',
      date: 'Sat, Aug 2',
      location: 'River North · Chicago',
      status: 'Going',
      attendees: 47,
    },
    {
      id: 10,
      name: 'Summer on the Lakefront',
      date: 'Sun, Aug 17',
      location: 'Lakefront · Chicago',
      status: 'Maybe',
      attendees: 21,
    },
  ],
  'New York': [
    {
      id: 11,
      name: 'Brooklyn Loft Listening Party',
      date: 'Fri, Aug 15',
      location: 'Williamsburg · Brooklyn',
      status: 'Going',
      attendees: 112,
    },
    {
      id: 12,
      name: 'Harlem Jazz After Dark',
      date: 'Thu, Aug 21',
      location: 'Harlem · Manhattan',
      status: 'Interested',
      attendees: 39,
    },
  ],
  'Washington DC': [
    {
      id: 13,
      name: 'U Street Groove Night',
      date: 'Sat, Aug 9',
      location: 'U Street Corridor · DC',
      status: 'Going',
      attendees: 44,
    },
    {
      id: 14,
      name: 'Jazz in the Park',
      date: 'Sun, Aug 24',
      location: 'Shaw · DC',
      status: 'Interested',
      attendees: 27,
    },
  ],
};

export function Events() {
  const [city, setCity] = useState('San Francisco');
  const events = mockEventsByCity[city] || [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Events</h2>
          <p className="subtitle">Explore how events would feel in different cities (demo only).</p>
        </div>
      </header>

      <section className="section glass" style={{ marginBottom: 12 }}>
        <div className="list-title-row" style={{ marginBottom: 8 }}>
          <div>
            <div className="steps-title">Your city</div>
            <div className="steps-caption">Switch cities to see different demo lineups.</div>
          </div>
          <select
            className="input"
            style={{ maxWidth: 180 }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="list">
        {events.map((event) => (
          <div key={event.id} className="list-item glass">
            <div className="list-title">{event.name}</div>
            <div className="caption">
              {event.date} · {event.location}
            </div>
            <div className="list-title-row" style={{ marginTop: 8 }}>
              <div className="caption">{event.attendees} VibeCheckers going</div>
              <div className="pill small">{event.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
