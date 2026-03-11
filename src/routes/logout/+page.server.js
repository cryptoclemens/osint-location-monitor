// logout/+page.server.js – Handles sign-out and redirects to /login
// Called via a POST form (see logout button in +layout.svelte).
// M8 (Task 8.5): Also clears the onboarding-done cookie cache on sign-out.

import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ locals, cookies }) => {
    await locals.supabase.auth.signOut();
    // Clear the onboarding-done cache cookie so the next session starts fresh.
    // Important for shared-device scenarios (different user, same browser).
    cookies.delete('onb_done', { path: '/' });
    redirect(303, '/login');
  },
};

// If someone GETs /logout directly, just redirect to /login
export const load = async () => {
  redirect(303, '/login');
};
