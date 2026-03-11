// +layout.server.js – Root layout server load
// Runs on every request. Validates the session and enforces route guards.
// Also checks if the authenticated user has completed onboarding.
// Passes user, session, and onboarding_done down to all child routes via `data`.

import { redirect } from '@sveltejs/kit';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password'];

export const load = async ({ locals, url }) => {
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
  let onboardingDone = true; // Default: assume done (safe fallback)

  if (user && !isPublic && url.pathname !== '/onboarding' && !url.pathname.startsWith('/api/')) {
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .single();

    onboardingDone = profile?.onboarding_done ?? false;

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
