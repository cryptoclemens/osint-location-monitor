// hooks.server.js – SvelteKit server middleware
// Runs before every request. Attaches a Supabase server client and a
// safe session-getter to event.locals so load functions can use them.
// M9 (Task 9.1): Also enforces IP-based rate limiting on sensitive POST routes.

import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { checkRateLimit } from '$lib/rateLimit.js';

// Routes subject to rate limiting (POST only) → { max requests, window in ms }
const RATE_LIMITED_ROUTES = {
  '/register':          { max: 5,  windowMs: 60_000 }, // 5 sign-ups / minute / IP
  '/reset-password':    { max: 5,  windowMs: 60_000 }, // 5 resets / minute / IP
  '/api/test-telegram': { max: 10, windowMs: 60_000 }, // 10 telegram tests / minute / IP
};

export const handle = async ({ event, resolve }) => {
  // ── Rate limiting (M9 Task 9.1) ────────────────────────────────────
  // Only applied to POST requests – GET/navigation requests pass through freely.
  if (event.request.method === 'POST') {
    const routeConfig = RATE_LIMITED_ROUTES[event.url.pathname];
    if (routeConfig) {
      const ip = event.getClientAddress();
      const { allowed, retryAfter } = checkRateLimit(ip, event.url.pathname, routeConfig);
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: `Zu viele Anfragen. Bitte ${retryAfter} Sekunden warten.` }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfter),
            },
          }
        );
      }
    }
  }

  // ── Supabase server client ─────────────────────────────────────────
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
