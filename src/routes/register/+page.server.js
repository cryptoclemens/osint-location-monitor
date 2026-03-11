// register/+page.server.js – SvelteKit form action for user registration (M9 – Task 9.6)
//
// Moving registration server-side gives us:
//  - Server-side validation before touching Supabase
//  - No Supabase credentials sent from the client
//  - Progressive enhancement (works without JS via native form POST)
//  - Rate limiting applied by hooks.server.js (5 POSTs / minute / IP)
//
// M9 (Task 9.10): Supabase error codes are translated to German user messages here.

import { fail } from '@sveltejs/kit';
import { PUBLIC_SITE_URL } from '$env/static/public';

// ── German error message mapping (Task 9.10) ────────────────────────────────
// Maps common Supabase auth error messages / codes to friendly German strings.
function toGermanAuthError(error) {
  const msg = (error?.message ?? '').toLowerCase();
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Diese E-Mail-Adresse ist bereits registriert. Bitte anmelden.';
  }
  if (msg.includes('password should be at least')) {
    return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
  }
  if (msg.includes('invalid email')) {
    return 'Ungültige E-Mail-Adresse.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Verbindungsfehler. Bitte Internetverbindung prüfen.';
  }
  // Fallback: sanitised raw message
  return error?.message ?? 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
}

export const actions = {
  register: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const email           = String(formData.get('email')           ?? '').trim();
    const password        = String(formData.get('password')        ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    // ── Server-side validation ───────────────────────────────────────
    if (!email || !password) {
      return fail(400, { error: 'E-Mail und Passwort sind Pflichtfelder.', email });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, { error: 'Ungültige E-Mail-Adresse.', email });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.', email });
    }
    if (password !== passwordConfirm) {
      return fail(400, { error: 'Die Passwörter stimmen nicht überein.', email });
    }

    // ── Supabase sign-up ─────────────────────────────────────────────
    // Use the server-side supabase client from locals (no service key – anon is correct here).
    // Build emailRedirectTo from PUBLIC_SITE_URL or the request's own origin as fallback.
    const origin = PUBLIC_SITE_URL || url.origin;
    const { data, error: sbError } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/onboarding`,
      },
    });

    if (sbError) {
      return fail(422, { error: toGermanAuthError(sbError), email });
    }

    // Supabase returns a user even when email confirmation is required.
    // If identities is empty, the email address is already registered.
    if (data.user && data.user.identities?.length === 0) {
      return fail(409, {
        error: 'Diese E-Mail-Adresse ist bereits registriert. Bitte anmelden.',
        email,
      });
    }

    // Success – let the page know so it can show the confirmation message.
    return { success: true, email };
  },
};
