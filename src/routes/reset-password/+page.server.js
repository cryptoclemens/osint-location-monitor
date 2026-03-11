// reset-password/+page.server.js – Server Action für Schritt 1 des Passwort-Resets
//
// Schritt 1 (E-Mail anfordern): läuft jetzt server-seitig via SvelteKit Form Action.
//   → Kein client-side Supabase-Call mehr für den E-Mail-Versand.
//   → Rate Limiting greift bereits in hooks.server.js (5 Req. / Min. / IP).
//
// Schritt 2 (neues Passwort setzen): bleibt client-seitig, da der Browser
//   den Auth-Token aus dem Magic Link verwalten muss (PKCE-Code-Exchange).

import { fail } from '@sveltejs/kit';

/**
 * Maps Supabase auth error messages to German user-facing strings.
 * @param {string|undefined} message - Raw Supabase error message
 * @returns {string}
 */
function toGermanAuthError(message) {
  if (!message) return 'Ein unbekannter Fehler ist aufgetreten.';
  const m = message.toLowerCase();

  if (m.includes('rate limit') || m.includes('too many') || m.includes('email rate limit')) {
    return 'Zu viele Versuche. Bitte warte einige Minuten und versuche es erneut.';
  }
  if (m.includes('user not found') || m.includes('invalid login credentials')) {
    return 'Diese E-Mail-Adresse ist nicht registriert.';
  }
  if (m.includes('email not confirmed')) {
    return 'Diese E-Mail-Adresse wurde noch nicht bestätigt.';
  }
  if (m.includes('invalid email')) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Verbindungsfehler. Bitte prüfe deine Internetverbindung.';
  }

  // Fallback: raw message (English) – better than nothing
  return message;
}

export const actions = {
  /**
   * Sends a password-reset email via Supabase Auth.
   * Returns { sent: true, email } on success, or fail(4xx, { error }) on failure.
   */
  sendResetEmail: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const email    = formData.get('email')?.toString().trim() ?? '';

    if (!email) {
      return fail(422, { error: 'Bitte gib deine E-Mail-Adresse ein.' });
    }

    // Basic format validation (Supabase also validates, but gives a nicer error here)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(422, { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
    }

    // Build the redirect URL (works in dev and production without env var)
    const redirectTo = `${url.origin}/reset-password`;

    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      console.error('[reset-password/sendResetEmail] Supabase error:', error.message);
      return fail(400, { error: toGermanAuthError(error.message) });
    }

    // Note: Supabase returns success even for unknown emails (security: no user enumeration).
    return { sent: true, email };
  },
};
