import { useMemo, useState } from 'react';
import { useCurrentUserProfile } from './useCurrentUserProfile';
import { useMatches } from './useMatches';
import { Events as EventsData } from '../pages/Events';

// This hook will later be refactored to consume raw data rather than importing from a page.
// For now, we’ll keep it minimal and only manage inline expansion state.

export function useEvents(events) {
  const { profile } = useCurrentUserProfile();
  const { matches } = useMatches();
  const [expandedEventIds, setExpandedEventIds] = useState([]);

  const eventsWithMatches = useMemo(() => {
    return (events || []).map((event) => {
      const matchedAttendees = matches
        .filter((m) => m.user.city === profile.city)
        .filter((m) => {
          // For now, assume first two events in the city have some of the matches attending.
          // Later this will be explicit data from backend.
          if (event.id % 2 === 0) {
            return parseInt(m.id, 10) % 2 === 0;
          }
          return parseInt(m.id, 10) % 2 === 1;
        })
        .map((m) => m.user);

      return {
        ...event,
        matchedAttendees,
      };
    });
  }, [events, matches, profile.city]);

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
