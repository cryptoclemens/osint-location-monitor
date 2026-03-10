// login/+page.server.js – Server-side form action for authentication
// Handles sign-in via Supabase email/password. On success, the session
// cookie is set automatically by @supabase/ssr via hooks.server.js.

import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  /**
   * Default form action: sign in with email + password.
   * Uses event.locals.supabase (created in hooks.server.js).
   */
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email    = form.get('email')?.toString().trim() ?? '';
    const password = form.get('password')?.toString() ?? '';
    const redirectTo = url.searchParams.get('redirectTo') ?? '/';

    // Basic validation
    if (!email || !password) {
      return fail(400, { error: 'Bitte E-Mail und Passwort eingeben.' });
    }
    if (!email.includes('@')) {
      return fail(400, { error: 'Ungültige E-Mail-Adresse.' });
    }

    // Attempt sign-in via Supabase Auth
    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Return user-friendly German error messages
      const message =
        error.message.includes('Invalid login credentials')
          ? 'E-Mail oder Passwort ist falsch.'
          : error.message.includes('Email not confirmed')
          ? 'E-Mail-Adresse noch nicht bestätigt. Bitte prüfe dein Postfach.'
          : `Anmeldung fehlgeschlagen: ${error.message}`;

      return fail(401, { error: message });
    }

    // Success – redirect to the originally requested page (or dashboard)
    // The cookie has been set by @supabase/ssr automatically.
    redirect(303, redirectTo.startsWith('/') ? redirectTo : '/');
  },
};
