import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export function useCompetitions() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('competitions')
      .select('*, profiles:created_by(name, username)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // For each competition, fetch entry count
      const enriched = await Promise.all(
        data.map(async (comp) => {
          const { count } = await supabase
            .from('competition_entries')
            .select('*', { count: 'exact', head: true })
            .eq('competition_id', comp.id);
          return { ...comp, entry_count: count || 0 };
        })
      );
      setCompetitions(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const createCompetition = useCallback(
    async ({ title, description, theme }) => {
      if (!user) return { error: { message: 'Not signed in' } };
      const { data, error } = await supabase
        .from('competitions')
        .insert({ title, description, theme, created_by: user.id, status: 'active' })
        .select()
        .single();
      if (!error && data) {
        setCompetitions((prev) => [{ ...data, entry_count: 0, profiles: { name: '', username: '' } }, ...prev]);
      }
      return { data, error };
    },
    [user]
  );

  return { competitions, loading, createCompetition, refresh: fetchCompetitions };
}

export function useCompetitionDetail(competitionId) {
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [entries, setEntries] = useState([]);
  const [myVotes, setMyVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!competitionId) return;
    setLoading(true);

    // Fetch competition
    const { data: comp } = await supabase
      .from('competitions')
      .select('*, profiles:created_by(name, username)')
      .eq('id', competitionId)
      .single();
    if (comp) setCompetition(comp);

    // Fetch entries with submitter info
    const { data: entryData } = await supabase
      .from('competition_entries')
      .select('*, profiles:user_id(name, username)')
      .eq('competition_id', competitionId)
      .order('vote_count', { ascending: false });
    if (entryData) setEntries(entryData);

    // Fetch current user's votes for this competition's entries
    if (user && entryData) {
      const entryIds = entryData.map((e) => e.id);
      if (entryIds.length > 0) {
        const { data: voteData } = await supabase
          .from('competition_votes')
          .select('entry_id')
          .eq('user_id', user.id)
          .in('entry_id', entryIds);
        if (voteData) {
          setMyVotes(new Set(voteData.map((v) => v.entry_id)));
        }
      }
    }

    setLoading(false);
  }, [competitionId, user]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const submitEntry = useCallback(
    async ({ playlistName, description, songs }) => {
      if (!user) return { error: { message: 'Not signed in' } };
      const { data, error } = await supabase
        .from('competition_entries')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          playlist_name: playlistName,
          description,
          songs,
        })
        .select('*, profiles:user_id(name, username)')
        .single();
      if (!error && data) {
        setEntries((prev) => [...prev, data]);
      }
      return { data, error };
    },
    [competitionId, user]
  );

  const toggleVote = useCallback(
    async (entryId) => {
      if (!user) return;
      const hasVoted = myVotes.has(entryId);

      if (hasVoted) {
        // Remove vote
        await supabase
          .from('competition_votes')
          .delete()
          .eq('entry_id', entryId)
          .eq('user_id', user.id);

        // Decrement vote count
        const entry = entries.find((e) => e.id === entryId);
        if (entry) {
          await supabase
            .from('competition_entries')
            .update({ vote_count: Math.max(0, (entry.vote_count || 0) - 1) })
            .eq('id', entryId);
        }

        setMyVotes((prev) => {
          const next = new Set(prev);
          next.delete(entryId);
          return next;
        });
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId ? { ...e, vote_count: Math.max(0, (e.vote_count || 0) - 1) } : e
          )
        );
      } else {
        // Cast vote
        await supabase
          .from('competition_votes')
          .insert({ entry_id: entryId, user_id: user.id });

        // Increment vote count
        const entry = entries.find((e) => e.id === entryId);
        if (entry) {
          await supabase
            .from('competition_entries')
            .update({ vote_count: (entry.vote_count || 0) + 1 })
            .eq('id', entryId);
        }

        setMyVotes((prev) => new Set(prev).add(entryId));
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId ? { ...e, vote_count: (e.vote_count || 0) + 1 } : e
          )
        );
      }
    },
    [user, myVotes, entries]
  );

  const hasSubmitted = user ? entries.some((e) => e.user_id === user.id) : false;

  return {
    competition,
    entries,
    myVotes,
    loading,
    submitEntry,
    toggleVote,
    hasSubmitted,
    refresh: fetchDetail,
  };
}
