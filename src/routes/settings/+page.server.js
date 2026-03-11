// settings/+page.server.js – Server-side data loading for the settings page
//
// Loads the current user's profile (telegram_chat_id) server-side via
// locals.supabase, consistent with dashboard/locations/alerts (M8 pattern).
//
// Fixes the "Lade Einstellungen…" hang: the previous onMount-based client-side
// query had session-timing issues with the browser Supabase client and lacked
// a proper eq('id', user.id) filter.

export const load = async ({ locals }) => {
  const { user } = await locals.safeGetSession();

  if (!user) {
    // +layout.server.js already redirects unauthenticated users – this is a
    // safe fallback in case the layout guard is bypassed somehow.
    return { profile: null };
  }

  const { data: profile, error } = await locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // PGRST116 = no row found → profile not yet created, that is fine.
  if (error && error.code !== 'PGRST116') {
    console.error('[settings/load] profile fetch error:', error.message);
  }

  return {
    profile: profile ?? null,
  };
};
