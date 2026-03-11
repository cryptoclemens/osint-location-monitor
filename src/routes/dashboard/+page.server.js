// dashboard/+page.server.js – Server-side data loading (M8 – Task 8.1)
//
// Replaces the client-side onMount fetching with SSR parallel Supabase queries.
// Data is embedded in the initial HTML response, eliminating the loading delay.
// RLS automatically filters results to the authenticated user's data.

export const load = async ({ locals }) => {
  // Run location + alert queries in parallel to minimise round-trip latency
  const [locResult, alertResult] = await Promise.all([
    locals.supabase
      .from('locations')
      .select('*, location_categories(category, is_active)')
      .order('created_at', { ascending: false }),
    locals.supabase
      .from('alerts')
      .select('*, locations(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // Silently degrade on error – the page component shows an error state
  const loadError =
    locResult.error?.message ?? alertResult.error?.message ?? null;

  return {
    locations: locResult.data  ?? [],
    alerts:    alertResult.data ?? [],
    loadError,
  };
};
