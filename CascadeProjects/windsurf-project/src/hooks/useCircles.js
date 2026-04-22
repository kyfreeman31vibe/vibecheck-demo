import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useCurrentUserProfile } from './useCurrentUserProfile';

export function useCircles() {
  const { user } = useAuth();
  const { profile } = useCurrentUserProfile();
  const [circleMembers, setCircleMembers] = useState([]);
  const [sentRequests, setSentRequests] = useState({});   // { recipientId: 'pending'|'accepted'|'rejected' }
  const [incomingRequests, setIncomingRequests] = useState([]); // [{ id, sender profile, status }]
  const [loading, setLoading] = useState(true);

  // Fetch all requests involving this user
  const fetchRequests = useCallback(async () => {
    if (!user) {
      setCircleMembers([]); setSentRequests({}); setIncomingRequests([]); setLoading(false);
      return;
    }
    setLoading(true);

    // Requests I sent
    const { data: sent } = await supabase
      .from('circle_requests')
      .select('id, receiver_id, status, receiver:receiver_id(id, name, username, avatar_url, city)')
      .eq('sender_id', user.id);

    // Requests I received
    const { data: received } = await supabase
      .from('circle_requests')
      .select('id, sender_id, status, sender:sender_id(id, name, username, avatar_url, city)')
      .eq('receiver_id', user.id);

    // Build sentRequests map
    const sentMap = {};
    const acceptedFromSent = [];
    (sent || []).forEach((r) => {
      sentMap[r.receiver_id] = r.status;
      if (r.status === 'accepted' && r.receiver) acceptedFromSent.push(r.receiver);
    });
    setSentRequests(sentMap);

    // Build incoming requests list + accepted members from received
    const acceptedFromReceived = [];
    const pending = [];
    (received || []).forEach((r) => {
      // Also track received-accepted in sentMap so isInCircle works both ways
      if (r.status === 'accepted') {
        sentMap[r.sender_id] = 'accepted';
        if (r.sender) acceptedFromReceived.push(r.sender);
      }
      if (r.status === 'pending') {
        pending.push({ id: r.id, senderId: r.sender_id, sender: r.sender, status: r.status });
      }
    });
    setSentRequests({ ...sentMap });
    setIncomingRequests(pending);

    // Circle members = accepted from both directions, deduplicated
    const memberMap = {};
    [...acceptedFromSent, ...acceptedFromReceived].forEach((m) => { memberMap[m.id] = m; });
    setCircleMembers(Object.values(memberMap));

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Send a circle request
  const sendRequest = useCallback(async (receiverId) => {
    if (!user) return { error: { message: 'Not signed in' } };
    if (sentRequests[receiverId]) return { error: null }; // already sent or connected

    // Optimistic update — show "Request sent" immediately
    setSentRequests((prev) => ({ ...prev, [receiverId]: 'pending' }));

    // Demo users — track locally only
    if (String(receiverId).startsWith('demo-')) {
      return { error: null };
    }

    const { error } = await supabase
      .from('circle_requests')
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (error) {
      console.error('Circle request failed:', error.message, error);
      // Roll back optimistic update
      setSentRequests((prev) => {
        const next = { ...prev };
        delete next[receiverId];
        return next;
      });
    } else {
      // Notify the receiver
      const senderName = profile.name || 'Someone';
      await supabase.from('notifications').insert({
        user_id: receiverId,
        type: 'circle_request',
        title: `${senderName} wants to add you to their circle`,
        body: 'Accept or decline this request from your notifications.',
        data: { sender_id: user.id },
      });
    }
    return { error };
  }, [user, sentRequests, profile]);

  // Accept a circle request
  const acceptRequest = useCallback(async (requestId, senderId) => {
    if (!user) return;

    await supabase
      .from('circle_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // Notify the original sender
    const accepterName = profile.name || 'Someone';
    await supabase.from('notifications').insert({
      user_id: senderId,
      type: 'circle_accepted',
      title: `${accepterName} accepted your circle request!`,
      body: 'You are now in each other\'s circle.',
      data: { accepter_id: user.id },
    });

    fetchRequests();
  }, [user, profile, fetchRequests]);

  // Reject a circle request
  const rejectRequest = useCallback(async (requestId) => {
    if (!user) return;

    await supabase
      .from('circle_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, [user]);

  // Check request status for a user
  const getRequestStatus = useCallback((userId) => sentRequests[userId] || null, [sentRequests]);

  const isInCircle = useCallback((userId) => sentRequests[userId] === 'accepted', [sentRequests]);

  return {
    circleMembers,
    circleCount: circleMembers.length,
    incomingRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    getRequestStatus,
    isInCircle,
    refetch: fetchRequests,
  };
}
