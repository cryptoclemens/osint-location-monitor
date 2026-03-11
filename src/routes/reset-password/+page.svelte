<!-- /reset-password – Two-step password reset flow
     Step 1: User enters email → Supabase sends reset link
     Step 2: User clicks link in email → lands here with ?code= or #type=recovery
             → enters new password → saved via supabase.auth.updateUser()
-->
<script>
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  // Use $env/dynamic/public so the build doesn't fail when PUBLIC_SITE_URL is
  // absent at build time. The value is read at runtime in the browser.
  import { env } from '$env/dynamic/public';
  const PUBLIC_SITE_URL = env.PUBLIC_SITE_URL ?? '';

  // ── State ─────────────────────────────────────────────────
  // 'request'  → show email input (initial state)
  // 'sent'     → reset link has been emailed
  // 'update'   → user arrived via magic link – show new password form
  // 'done'     → password successfully changed
  let step    = 'request';
  let email   = '';
  let newPassword        = '';
  let confirmPassword    = '';
  let loading = false;
  let error   = null;

  // Unsubscribe handle for the auth state listener
  let authListener = null;

  // ── On mount: detect recovery session ────────────────────
  onMount(async () => {
    // 1) PKCE flow: Supabase appends ?code= to the redirect URL.
    //    We must exchange it for a real session before showing the new-pw form.
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');

    if (code) {
      loading = true;
      const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
      loading = false;
      if (exchErr) {
        error = 'Der Reset-Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.';
      } else {
        step = 'update';
        // Clean up the ?code= from the URL bar (cosmetic)
        window.history.replaceState({}, '', '/reset-password');
      }
      return;
    }

    // 2) Implicit flow: Supabase embeds the token in the URL hash.
    //    The Supabase client fires PASSWORD_RECOVERY via onAuthStateChange.
    authListener = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        step = 'update';
      }
    });
  });

  // Clean up the auth listener to prevent memory leaks
  onDestroy(() => {
    authListener?.data?.subscription?.unsubscribe();
  });

  // ── Step 1: Request reset email ──────────────────────────
  async function handleRequest() {
    error   = null;
    if (!email.trim()) { error = 'Bitte gib deine E-Mail-Adresse ein.'; return; }

    loading = true;
    try {
      const { error: sbErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // Explicit site URL so Supabase uses the production domain.
        redirectTo: `${PUBLIC_SITE_URL || window.location.origin}/reset-password`,
      });
      if (sbErr) throw sbErr;
      step = 'sent';
    } catch (e) {
      error = e.message ?? 'Anfrage fehlgeschlagen. Bitte versuche es erneut.';
    } finally {
      loading = false;
    }
  }

  // ── Step 2: Save new password ────────────────────────────
  async function handleUpdate() {
    error = null;
    if (!newPassword) { error = 'Bitte gib ein neues Passwort ein.'; return; }
    if (newPassword.length < 8) { error = 'Das Passwort muss mindestens 8 Zeichen lang sein.'; return; }
    if (newPassword !== confirmPassword) { error = 'Die Passwörter stimmen nicht überein.'; return; }

    loading = true;
    try {
      const { error: sbErr } = await supabase.auth.updateUser({ password: newPassword });
      if (sbErr) throw sbErr;
      step = 'done';
      // Redirect to dashboard after 2.5 seconds
      setTimeout(() => goto('/dashboard'), 2500);
    } catch (e) {
      error = e.message ?? 'Passwort konnte nicht gesetzt werden.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Passwort zurücksetzen – OSInt Vacation</title>
</svelte:head>

<div class="reset-page">
  <div class="reset-card">

    <div class="logo">
      <span class="logo-icon">🛰️</span>
      <span class="logo-name">OSInt Vacation</span>
    </div>

    <!-- ── Step: request ── -->
    {#if step === 'request'}
      <h1>Passwort vergessen?</h1>
      <p class="subtitle">Gib deine E-Mail ein – wir senden dir einen Reset-Link.</p>

      {#if error}
        <div class="error-banner">⚠️ {error}</div>
      {/if}

      <form on:submit|preventDefault={handleRequest}>
        <div class="form-group">
          <label for="email">E-Mail-Adresse</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="deine@email.de"
            autocomplete="email"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" class="btn-submit" disabled={loading}>
          {loading ? '⏳ Wird gesendet…' : '📧 Reset-Link senden'}
        </button>
      </form>

      <p class="footer-link"><a href="/login">← Zurück zur Anmeldung</a></p>

    <!-- ── Step: sent ── -->
    {:else if step === 'sent'}
      <div class="info-box">
        <div class="info-icon">📬</div>
        <h1>E-Mail gesendet!</h1>
        <p>
          Wir haben einen Reset-Link an <strong>{email}</strong> geschickt.<br>
          Klicke auf den Link in der E-Mail, um dein Passwort zurückzusetzen.
        </p>
        <p class="hint">Kein E-Mail erhalten? Prüfe deinen Spam-Ordner oder warte kurz.</p>
        <a href="/login" class="btn-back">Zur Anmeldung</a>
      </div>

    <!-- ── Step: update (user clicked magic link) ── -->
    {:else if step === 'update'}
      <h1>Neues Passwort setzen</h1>
      <p class="subtitle">Wähle ein sicheres Passwort mit mindestens 8 Zeichen.</p>

      {#if loading && !newPassword}
        <!-- Initial exchange loading state -->
        <div class="loading-hint">⏳ Session wird verifiziert…</div>
      {:else}
        {#if error}
          <div class="error-banner">⚠️ {error}</div>
        {/if}

        <form on:submit|preventDefault={handleUpdate}>
          <div class="form-group">
            <label for="new-password">Neues Passwort <span class="hint-inline">(mind. 8 Zeichen)</span></label>
            <input
              id="new-password"
              type="password"
              bind:value={newPassword}
              placeholder="••••••••"
              autocomplete="new-password"
              required
              disabled={loading}
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">Passwort bestätigen</label>
            <input
              id="confirm-password"
              type="password"
              bind:value={confirmPassword}
              placeholder="••••••••"
              autocomplete="new-password"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" class="btn-submit" disabled={loading}>
            {loading ? '⏳ Wird gespeichert…' : '🔐 Passwort speichern'}
          </button>
        </form>
      {/if}

    <!-- ── Step: done ── -->
    {:else if step === 'done'}
      <div class="info-box">
        <div class="info-icon">✅</div>
        <h1>Passwort geändert!</h1>
        <p>Dein Passwort wurde erfolgreich zurückgesetzt.<br>Du wirst gleich zum Dashboard weitergeleitet.</p>
        <a href="/dashboard" class="btn-back">Zum Dashboard →</a>
      </div>
    {/if}

  </div>
</div>

<style>
  .reset-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: #0f0f1a;
  }

  .reset-card {
    width: 100%;
    max-width: 420px;
    background: #1c1c2e;
    border: 1px solid #2a2a3e;
    border-radius: 16px;
    padding: 2.5rem 2rem;
  }

  .logo {
    display: flex; align-items: center; gap: 0.5rem;
    justify-content: center; margin-bottom: 1.75rem;
  }
  .logo-icon { font-size: 1.6rem; }
  .logo-name { font-size: 1.1rem; font-weight: 700; color: #e0e0f0; }

  h1 { font-size: 1.4rem; font-weight: 700; text-align: center; margin: 0 0 0.4rem; }
  .subtitle { color: #666; font-size: 0.875rem; text-align: center; margin-bottom: 1.75rem; }

  .error-banner {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.87rem;
    margin-bottom: 1.25rem;
  }

  .form-group { margin-bottom: 1.1rem; }
  label { display: block; font-size: 0.875rem; color: #aaa; margin-bottom: 0.4rem; }
  .hint-inline { color: #555; font-size: 0.78rem; }

  input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    background: #13132a;
    border: 1px solid #2a2a3e;
    border-radius: 8px;
    color: #e0e0f0;
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  input:focus { outline: none; border-color: #6366f1; }
  input:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-submit {
    width: 100%; background: #6366f1; color: #fff; border: none;
    border-radius: 8px; padding: 0.75rem; font-size: 0.975rem; font-weight: 600;
    cursor: pointer; margin-top: 0.5rem; transition: background 0.15s;
  }
  .btn-submit:hover:not(:disabled) { background: #5052d0; }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .footer-link { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; }
  .footer-link a { color: #555; }
  .footer-link a:hover { color: #888; }

  /* Info/Success box */
  .info-box { text-align: center; }
  .info-icon { font-size: 3rem; margin-bottom: 1rem; }
  .info-box h1 { margin-bottom: 0.75rem; }
  .info-box p { color: #888; font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.5rem; }
  .hint { color: #555 !important; font-size: 0.82rem !important; }

  .btn-back {
    display: inline-block; margin-top: 1.25rem;
    background: #2a2a3e; color: #bbb;
    padding: 0.6rem 1.5rem; border-radius: 8px; font-size: 0.875rem;
    transition: background 0.15s;
  }
  .btn-back:hover { background: #343450; color: #ddd; }

  .loading-hint { text-align: center; color: #888; font-size: 0.9rem; padding: 2rem 0; }
</style>
