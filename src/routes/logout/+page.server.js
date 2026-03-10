// logout/+page.server.js – Handles sign-out and redirects to /login
// Called via a POST form (see logout button in +layout.svelte).

import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    redirect(303, '/login');
  },
};

// If someone GETs /logout directly, just redirect to /login
export const load = async () => {
  redirect(303, '/login');
};
