<!-- /register – Self-service registration page -->
<script>
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';

  let email    = '';
  let password = '';
  let passwordConfirm = '';
  let loading  = false;
  let error    = null;
  let success  = false; // email confirmation sent

  async function handleRegister() {
    error = null;

    // Client-side validation
    if (!email.trim() || !password) {
      error = 'E-Mail und Passwort sind Pflichtfelder.';
      return;
    }
    if (password.length < 8) {
      error = 'Das Passwort muss mindestens 8 Zeichen lang sein.';
      return;
    }
    if (password !== passwordConfirm) {
      error = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    loading = true;
    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email:    email.trim(),
        password: password,
        options: {
          // After confirmation the user lands on /onboarding
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (sbError) throw sbError;

      // Supabase returns a user even if email confirmation is required
      // If identities is empty, the email is already registered
      if (data.user && data.user.identities?.length === 0) {
        error = 'Diese E-Mail-Adresse ist bereits registriert. Bitte anmelden.';
        return;
      }

      success = true;
    } catch (e) {
      error = e.message ?? 'Registrierung fehlgeschlagen.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Registrieren – OSInt Vacation</title>
</svelte:head>

<div class="register-page">
  <div class="register-card">

    <div class="logo">
      <span class="logo-icon">🛰️</span>
      <span class="logo-name">OSInt Vacation</span>
    </div>

    {#if success}
      <!-- ── Confirmation sent ── -->
      <div class="success-box">
        <div class="success-icon">📧</div>
        <h1>Fast geschafft!</h1>
        <p>
          Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
          Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
        </p>
        <p class="hint">Kein E-Mail erhalten? Prüfe deinen Spam-Ordner.</p>
        <a href="/login" class="btn-back">Zur Anmeldung</a>
      </div>

    {:else}
      <!-- ── Registration form ── -->
      <h1>Konto erstellen</h1>
      <p class="subtitle">Kostenlos registrieren – kein Abo, kein Kreditkarte.</p>

      {#if error}
        <div class="error-banner">⚠️ {error}</div>
      {/if}

      <form on:submit|preventDefault={handleRegister}>
        <div class="form-group">
          <label for="email">E-Mail</label>
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

        <div class="form-group">
          <label for="password">Passwort <span class="hint-inline">(mind. 8 Zeichen)</span></label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            autocomplete="new-password"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="password-confirm">Passwort bestätigen</label>
          <input
            id="password-confirm"
            type="password"
            bind:value={passwordConfirm}
            placeholder="••••••••"
            autocomplete="new-password"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" class="btn-submit" disabled={loading}>
          {loading ? '⏳ Wird registriert…' : '🚀 Konto erstellen'}
        </button>
      </form>

      <p class="login-link">
        Bereits ein Konto? <a href="/login">Anmelden</a>
      </p>
    {/if}

  </div>
</div>

<style>
  .register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }
  .register-card {
    background: #1c1c2e;
    border: 1px solid #2a2a3e;
    border-radius: 16px;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 420px;
  }

  .logo {
    display: flex; align-items: center; gap: 0.5rem;
    justify-content: center; margin-bottom: 1.75rem;
  }
  .logo-icon { font-size: 1.6rem; }
  .logo-name { font-size: 1.1rem; font-weight: 700; color: #e0e0f0; }

  h1 { font-size: 1.4rem; font-weight: 700; text-align: center; margin-bottom: 0.4rem; }
  .subtitle { color: #666; font-size: 0.875rem; text-align: center; margin-bottom: 1.75rem; }

  .error-banner {
    background: #2a1a1a; border: 1px solid #5c2a2a; border-radius: 8px;
    padding: 0.75rem 1rem; color: #f87272; font-size: 0.875rem; margin-bottom: 1.25rem;
  }

  .form-group { margin-bottom: 1.1rem; }
  label { display: block; font-size: 0.875rem; color: #aaa; margin-bottom: 0.4rem; }
  .hint-inline { color: #555; font-size: 0.78rem; }

  .btn-submit {
    width: 100%; background: #6366f1; color: #fff; border: none;
    border-radius: 8px; padding: 0.75rem; font-size: 0.975rem; font-weight: 600;
    cursor: pointer; margin-top: 0.5rem; transition: background 0.15s;
  }
  .btn-submit:hover:not(:disabled) { background: #5052d0; }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .login-link { text-align: center; font-size: 0.875rem; color: #666; margin-top: 1.5rem; }
  .login-link a { color: #7c9fd4; }

  /* Success state */
  .success-box { text-align: center; }
  .success-icon { font-size: 3rem; margin-bottom: 1rem; }
  .success-box h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  .success-box p { color: #888; font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.75rem; }
  .hint { color: #555 !important; font-size: 0.82rem !important; }
  .btn-back {
    display: inline-block; margin-top: 1.25rem; background: #2a2a3e;
    color: #bbb; padding: 0.6rem 1.5rem; border-radius: 8px; font-size: 0.875rem;
  }
  .btn-back:hover { background: #343450; color: #ddd; }
</style>
