// +layout.server.js – Root layout server load
// Runs on every request. Validates the session and enforces route guards.
// Also checks if the authenticated user has completed onboarding.
// Passes user, session, and onboarding_done down to all child routes via `data`.
//
// M8 (Task 8.5): onboarding_done is cached in a 24-hour HTTP-only cookie
// ('onb_done') to avoid a DB round-trip on every page load. The cookie is
// only set once onboarding_done = true is confirmed via DB. On sign-out the
// cookie is cleared in logout/+page.server.js.

import { redirect } from '@sveltejs/kit';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password'];

// Cookie name for the onboarding-done cache (short name → minimal header size)
const ONB_COOKIE = 'onb_done';

export const load = async ({ locals, url, cookies }) => {
  const { session, user } = await locals.safeGetSession();

  const isPublic = PUBLIC_ROUTES.some(
    r => url.pathname === r || url.pathname.startsWith(r + '/')
  );

  // Redirect unauthenticated users to /login (except public routes)
  if (!user && !isPublic) {
    const redirectTo = `?redirectTo=${encodeURIComponent(url.pathname)}`;
    redirect(303, `/login${redirectTo}`);
  }

  // Redirect logged-in users away from /login and /register → /dashboard
  if (user && (url.pathname === '/login' || url.pathname === '/register')) {
    redirect(303, '/dashboard');
  }

  // Redirect logged-in users away from landing page → /dashboard
  if (user && url.pathname === '/') {
    redirect(303, '/dashboard');
  }

  // ── Onboarding check ─────────────────────────────────────────────────────
  // For authenticated users NOT already on /onboarding (or public/api routes),
  // check if they've completed onboarding. If not, redirect them there.
  //
  // Cookie-cache strategy (M8 Task 8.5):
  //   1. If 'onb_done=1' cookie is present → skip DB query (onboarding done)
  //   2. If cookie is absent → query DB once; if done, set cookie for 24h
  //   3. Cookie is cleared on sign-out (logout/+page.server.js)
  let onboardingDone = true; // Default: assume done (safe fallback)

  if (user && !isPublic && url.pathname !== '/onboarding' && !url.pathname.startsWith('/api/')) {

    if (cookies.get(ONB_COOKIE) === '1') {
      // Fast path: cookie present → no DB query needed
      onboardingDone = true;
    } else {
      // Slow path: cookie absent → check DB
      const { data: profile } = await locals.supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', user.id)
        .single();

      onboardingDone = profile?.onboarding_done ?? false;

      if (onboardingDone) {
        // Cache result: set HTTP-only cookie valid for 24 hours.
        // httpOnly → not readable by client-side JS (security).
        // sameSite: 'lax' → CSRF protection without breaking normal navigation.
        cookies.set(ONB_COOKIE, '1', {
          path:     '/',
          maxAge:   86_400, // 24 hours in seconds
          httpOnly: true,
          sameSite: 'lax',
          secure:   process.env.NODE_ENV === 'production',
        });
      }
    }

    if (!onboardingDone) {
      redirect(303, '/onboarding');
    }
  }

  return {
    user:          user          ?? null,
    session:       session       ?? null,
    onboardingDone,
  };
};
