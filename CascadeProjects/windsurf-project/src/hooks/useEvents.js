import { useMemo, useState } from 'react';
import { useMatches } from './useMatches';
import { DEMO_USERS } from './useMatches';

export function useEvents(rawEvents) {
  const { matches } = useMatches();
  const [expandedEventIds, setExpandedEventIds] = useState([]);

  const eventsWithMatches = useMemo(() => {
    return (rawEvents || []).map((event) => {
      const matchedAttendees = matches
        .filter((m) => {
          const demoUser = DEMO_USERS.find((u) => u.id === m.id);
          return demoUser?.eventsAttending?.includes(event.id);
        })
        .map((m) => m.user);

      return {
        ...event,
        matchedAttendees,
      };
    });
  }, [rawEvents, matches]);

  const toggleExpand = (eventId) => {
    setExpandedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  return {
    events: eventsWithMatches,
    expandedEventIds,
    toggleExpand,
  };
}
