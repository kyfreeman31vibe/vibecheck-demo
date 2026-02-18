// Temporary stub for the MVP demo: we are not yet using a live Supabase backend.
// This avoids bundling the @supabase/supabase-js dependency until we are ready.

export const supabase = {
  // Placeholder methods to avoid runtime errors if imported.
  from() {
    throw new Error('Supabase client is not configured for this demo build.');
  },
  auth: {
    async getSession() {
      // Mimic Supabase v2 shape: { data: { session }, error }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange(callback) {
      // Immediately invoke callback once with null session, then return
      // an unsubscribe handle matching Supabase's expected shape.
      try {
        callback('INITIAL_SESSION', null);
      } catch (e) {
        // swallow errors in demo stub
      }
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
        error: null,
      };
    },
    async signInWithOtp() {
      // Pretend the request succeeded.
      return { data: {}, error: null };
    },
    async signOut() {
      return { error: null };
    },
  },
};
