import { useState, useEffect, useCallback } from 'react';
import { useCurrentUserProfile } from './useCurrentUserProfile';

export function useEvents() {
  const { profile } = useCurrentUserProfile();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [city, setCity] = useState('');

  // Sync city from profile
  useEffect(() => {
    if (profile.city && !city) {
      setCity(profile.city);
    }
  }, [profile.city, city]);

  const fetchEvents = useCallback(async function (searchCity, pageNum) {
    if (!searchCity) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('city', searchCity);
      params.set('page', String(pageNum || 0));
      params.set('size', '20');

      const res = await fetch('/api/events/search?' + params.toString());
      if (!res.ok) {
        const errData = await res.json().catch(function () { return {}; });
        throw new Error(errData.error || 'Failed to fetch events');
      }

      const data = await res.json();
      setEvents(data.events || []);
      setTotalPages(data.page ? data.page.totalPages : 0);
      setPage(data.page ? data.page.number : 0);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when city is set
  useEffect(() => {
    if (city) {
      fetchEvents(city, 0);
    }
  }, [city, fetchEvents]);

  const search = function (newCity) {
    setCity(newCity);
    setPage(0);
  };

  const nextPage = function () {
    if (page < totalPages - 1) {
      fetchEvents(city, page + 1);
    }
  };

  const prevPage = function () {
    if (page > 0) {
      fetchEvents(city, page - 1);
    }
  };

  return { events, loading, error, city, page, totalPages, search, nextPage, prevPage };
}
