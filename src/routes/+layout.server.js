// +layout.server.js – Root layout server load
// Runs on every request. Validates the session and enforces route guards.
// Passes user + session down to all child routes via `data`.

import { redirect } from '@sveltejs/kit';

// Routes that are accessible without authentication
const PUBLIC_ROUTES = ['/login'];

export const load = async ({ locals, url }) => {
  const { session, user } = await locals.safeGetSession();

  const isPublic = PUBLIC_ROUTES.some(r => url.pathname === r || url.pathname.startsWith(r + '/'));

  // Redirect unauthenticated users to /login
  if (!user && !isPublic) {
    const redirectTo = url.pathname !== '/' ? `?redirectTo=${encodeURIComponent(url.pathname)}` : '';
    redirect(303, `/login${redirectTo}`);
  }

  // Redirect already-logged-in users away from /login
  if (user && url.pathname === '/login') {
    redirect(303, '/');
  }

  return {
    user: user ?? null,
    session: session ?? null,
  };
};
