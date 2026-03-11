// locations/+page.server.js – Server-side data loading (M8 – Task 8.2)
//
// Provides the initial location list via SSR so the page renders without
// a client-side loading spinner. Mutations (create/update/delete) remain
// client-side via $lib/supabase.js and trigger a client-side refresh afterwards.
// RLS automatically filters results to the authenticated user's data.

export const load = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('locations')
    .select('*, location_categories(category, is_active)')
    .order('created_at', { ascending: false });

  return {
    locations: data     ?? [],
    loadError: error?.message ?? null,
  };
};
