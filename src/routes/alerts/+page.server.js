// alerts/+page.server.js – Server-side data loading (M9 – Task 9.5 Pagination)
//
// Loads the first 50 alerts with an exact total count so the client can
// offer a "Mehr laden" button without fetching everything upfront.
// RLS automatically filters results to the authenticated user's data.

export const load = async ({ locals }) => {
  const { data, error, count } = await locals.supabase
    .from('alerts')
    .select('*, locations(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50);

  return {
    alerts:     data        ?? [],
    totalCount: count       ?? 0,
    loadError:  error?.message ?? null,
  };
};
