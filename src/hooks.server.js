// hooks.server.js – SvelteKit server middleware
// Runs before every request. Attaches a Supabase server client and a
// safe session-getter to event.locals so load functions can use them.

import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle = async ({ event, resolve }) => {
  // Create a server-side Supabase client with cookie access
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
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
    }
  );

  /**
   * safeGetSession() validates the JWT server-side via getUser().
   * Never trust getSession() alone – it reads the cookie without
   * verifying the JWT against Supabase, which could be spoofed.
   */
  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) return { session: null, user: null };

    // Verify JWT by calling getUser() (hits Supabase Auth API)
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error) return { session: null, user: null };

    return { session: { ...session, user }, user };
  };

  return resolve(event, {
    // Pass Supabase-specific response headers through to the client
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};
