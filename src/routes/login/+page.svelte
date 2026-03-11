<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let form; // Populated by the +page.server.js action on failure

  let loading = false;

  // Progressive enhancement: show spinner while submitting
  function handleSubmit() {
    loading = true;
    return async ({ update }) => {
      await update();
      loading = false;
    };
  }

  // Read redirectTo from URL (e.g. ?redirectTo=/locations)
  $: redirectTo = $page.url.searchParams.get('redirectTo') ?? '/';
</script>

<svelte:head>
  <title>Login – OSInt Vacation</title>
</svelte:head>

<div class="login-page">
  <div class="login-card">
    <!-- Logo -->
    <div class="logo">
      <span class="logo-icon">🛰️</span>
      <span class="logo-name">OSInt Vacation</span>
    </div>

    <h1>Anmelden</h1>
    <p class="subtitle">Melde dich mit deinem Supabase-Konto an.</p>

    <!-- Error from server action -->
    {#if form?.error}
      <div class="error-banner">
        ⚠️ {form.error}
      </div>
    {/if}

    <!-- Login form (uses SvelteKit form actions + progressive enhancement) -->
    <form method="POST" action="?redirectTo={encodeURIComponent(redirectTo)}" use:enhance={handleSubmit}>
      <div class="form-group">
        <label for="email">E-Mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="deine@email.de"
          autocomplete="email"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="password">Passwort</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          required
          disabled={loading}
        />
      </div>

      <button type="submit" class="btn-submit" disabled={loading}>
        {#if loading}
          <span class="spinner-inline"></span> Anmelden…
        {:else}
          🔐 Anmelden
        {/if}
      </button>
    </form>

    <div class="login-footer">
      <a href="/reset-password" class="link-muted">Passwort vergessen?</a>
      <p class="register-cta">
        Noch kein Konto? <a href="/register">Jetzt registrieren</a>
      </p>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: #0f0f1a;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    background: #1c1c2e;
    border: 1px solid #2a2a3e;
    border-radius: 16px;
    padding: 2.5rem 2rem;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .logo-icon { font-size: 2rem; }

  .logo-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: #e0e0f0;
    letter-spacing: -0.02em;
  }

  h1 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #e0e0f0;
    text-align: center;
    margin-bottom: 0.4rem;
  }

  .subtitle {
    text-align: center;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 1.5rem;
  }

  /* Error Banner */
  .error-banner {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.87rem;
    margin-bottom: 1.25rem;
  }

  /* Form */
  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.8rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
    margin-bottom: 0.4rem;
  }

  .form-group input {
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

  .form-group input:focus {
    outline: none;
    border-color: #6366f1;
  }

  .form-group input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-submit {
    width: 100%;
    padding: 0.75rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: opacity 0.15s;
  }

  .btn-submit:hover:not(:disabled) { opacity: 0.88; }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Inline spinner for loading state */
  .spinner-inline {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .hint {
    margin-top: 1.5rem;
    font-size: 0.78rem;
    color: #555;
    text-align: center;
    line-height: 1.5;
  }

  .hint strong { color: #888; }

  .login-footer { margin-top: 1.5rem; text-align: center; }
  .link-muted { font-size: 0.82rem; color: #555; display: block; margin-bottom: 0.75rem; }
  .link-muted:hover { color: #888; }
  .register-cta { font-size: 0.875rem; color: #666; }
  .register-cta a { color: #7c9fd4; }
</style>
