import React from 'react';

const mockEvents = [
  {
    id: 1,
    name: 'Neon Nights Festival',
    date: 'Sat, Jul 26',
    location: 'Downtown LA',
    status: 'Going',
  },
  {
    id: 2,
    name: 'Rooftop Lo-Fi Session',
    date: 'Fri, Aug 2',
    location: 'Hollywood',
    status: 'Interested',
  },
  {
    id: 3,
    name: 'Indie Under the Stars',
    date: 'Sun, Aug 10',
    location: 'Santa Monica',
    status: 'Maybe',
  },
];

export function Events() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Events</h2>
          <p className="subtitle">Music events around you (mocked)</p>
        </div>
      </header>
      <div className="list">
        {mockEvents.map((event) => (
          <div key={event.id} className="list-item glass">
            <div className="list-title">{event.name}</div>
            <div className="caption">
              {event.date} · {event.location}
            </div>
            <div className="pill small align-right">{event.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
