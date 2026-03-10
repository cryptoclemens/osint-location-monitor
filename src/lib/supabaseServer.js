// supabaseServer.js – Server-side Supabase client factory
// Used in hooks.server.js and +page.server.js files.
// Never exposed to the browser.

import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Creates a server-side Supabase client that reads/writes cookies
 * via the SvelteKit RequestEvent's cookie API.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
export function createSupabaseServerClient(event) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return event.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      },
    },
  });
}
