<!-- /register – Self-service registration page -->
<!-- M9 (Task 9.6): Converted to SvelteKit server action + use:enhance for
     progressive enhancement. Rate limiting is handled by hooks.server.js. -->
<script>
  import { enhance } from '$app/forms';

  /** @type {import('./$types').ActionData} */
  export let form;

  // Preserve email across form re-renders so users don't have to retype it.
  let email    = form?.email ?? '';
  let loading  = false;

  // form.success is set by the server action on successful sign-up
  $: success = form?.success === true;
  $: error   = form?.error   ?? null;
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
          Wir haben eine Bestätigungs-E-Mail an <strong>{form.email}</strong> gesendet.
          Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
        </p>
        <p class="hint">Kein E-Mail erhalten? Prüfe deinen Spam-Ordner.</p>
        <a href="/login" class="btn-back">Zur Anmeldung</a>
      </div>

    {:else}
      <!-- ── Registration form ── -->
      <h1>Konto erstellen</h1>
      <p class="subtitle">Kostenlos registrieren – kein Abo, keine Kreditkarte.</p>

      {#if error}
        <div class="error-banner">⚠️ {error}</div>
      {/if}

      <!--
        action="?/register" → calls the "register" action in +page.server.js
        use:enhance        → progressive enhancement (spinner + no full reload)
      -->
      <form
        method="POST"
        action="?/register"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
      >
        <div class="form-group">
          <label for="email">E-Mail</label>
          <input
            id="email"
            name="email"
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
            name="password"
            type="password"
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
            name="passwordConfirm"
            type="password"
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

  input[type="email"],
  input[type="password"] {
    width: 100%;
    background: #0e0e1a;
    border: 1px solid #2a2a3e;
    border-radius: 8px;
    padding: 0.65rem 0.9rem;
    color: #e0e0f0;
    font-size: 0.9rem;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  input:focus { outline: none; border-color: #6366f1; }
  input:disabled { opacity: 0.5; }

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
