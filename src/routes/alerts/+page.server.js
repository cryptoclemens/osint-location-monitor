// alerts/+page.server.js – Server-side data loading (M8 – Task 8.3)
//
// Provides the initial alert list via SSR, replacing the onMount fetch.
// The "Aktualisieren" button still triggers a client-side refresh via loadAlerts().
// Limit: 200 – matches the previous onMount call and is sufficient for the
// filter/stats calculations on this page.
// RLS automatically filters results to the authenticated user's data.

export const load = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('alerts')
    .select('*, locations(name)')
    .order('created_at', { ascending: false })
    .limit(200);

  return {
    alerts:    data  ?? [],
    loadError: error?.message ?? null,
  };
};
