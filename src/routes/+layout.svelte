<script>
  import { page } from '$app/stores';
  import { goto, invalidateAll } from '$app/navigation';
  import { supabase } from '$lib/supabase.js';

  export let data;

  $: user = data.user;

  async function handleLogout() {
    await supabase.auth.signOut();
    await invalidateAll();
    goto('/login');
  }
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#1a1a2e" />
</svelte:head>

<div class="app">
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <span class="logo-icon">🛰️</span>
        <span class="logo-text">OSInt Monitor</span>
      </a>

      {#if user}
        <nav>
          <a href="/"          class:active={$page.url.pathname === '/'}>Dashboard</a>
          <a href="/locations" class:active={$page.url.pathname.startsWith('/locations')}>Orte</a>
          <a href="/alerts"    class:active={$page.url.pathname.startsWith('/alerts')}>Alerts</a>
          <a href="/settings"  class:active={$page.url.pathname.startsWith('/settings')}>Einstellungen</a>
        </nav>

        <div class="user-area">
          <span class="user-email" title={user.email}>{user.email}</span>
          <button class="btn-logout" on:click={handleLogout} title="Abmelden">
            Logout
          </button>
        </div>
      {/if}
    </div>
  </header>

  <main>
    <slot />
  </main>

  {#if user}
    <footer>
      <p>OSInt Location Monitor v0.5.0 &mdash;
        <a href="https://github.com/cryptoclemens/osint-location-monitor" target="_blank">GitHub</a>
      </p>
    </footer>
  {/if}
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f0f1a;
    color: #e0e0f0;
    min-height: 100vh;
    font-size: 15px;
    line-height: 1.6;
  }

  /* CSS custom properties used by child components */
  :global(:root) {
    --bg:       #0f0f1a;
    --card-bg:  #1c1c2e;
    --border:   #2a2a3e;
    --text:     #e0e0f0;
    --text-dim: #888;
    --accent:   #6366f1;
  }

  :global(a) { color: #7c9fd4; text-decoration: none; }
  :global(a:hover) { color: #a8c4e8; }

  :global(button) {
    cursor: pointer;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  :global(button:hover) { opacity: 0.85; }
  :global(button:disabled) { opacity: 0.4; cursor: not-allowed; }

  :global(.btn-primary)   { background: #6366f1; color: #fff; }
  :global(.btn-danger)    { background: #c44f4f; color: #fff; }
  :global(.btn-secondary) { background: #2a2a3e; color: #bbb; border: 1px solid #3a3a55; }

  :global(input, select, textarea) {
    background: #1c1c2e;
    border: 1px solid #2a2a3e;
    border-radius: 8px;
    color: #e0e0f0;
    padding: 0.55rem 0.85rem;
    font-size: 0.9rem;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
  }
  :global(input:focus, select:focus, textarea:focus) { border-color: #6366f1; }

  :global(.card) {
    background: #1c1c2e;
    border: 1px solid #2a2a3e;
    border-radius: 12px;
    padding: 1.25rem;
  }

  :global(.badge) {
    display: inline-block;
    padding: 0.15rem 0.6rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  :global(.badge-critical) { background: #5c1a1a; color: #f87272; }
  :global(.badge-high)     { background: #4a2e0a; color: #f0a04a; }
  :global(.badge-medium)   { background: #2a3a1a; color: #7fc97f; }
  :global(.badge-low)      { background: #1a2a3a; color: #7fc0f0; }

  /* Layout */
  .app { display: flex; flex-direction: column; min-height: 100vh; }

  header {
    background: #13132a;
    border-bottom: 1px solid #2a2a40;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    gap: 1rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #e0e0f0;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .logo-icon { font-size: 1.3rem; }

  nav { display: flex; gap: 0.25rem; flex: 1; }
  nav a {
    color: #888;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  nav a:hover  { background: #2a2a3e; color: #ccc; }
  nav a.active { background: #2a2a3e; color: #e0e0f0; font-weight: 600; }

  /* User area (email + logout) */
  .user-area {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .user-email {
    font-size: 0.78rem;
    color: #666;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-logout {
    background: transparent;
    border: 1px solid #3a3a55;
    color: #888;
    padding: 0.3rem 0.65rem;
    font-size: 0.78rem;
    border-radius: 6px;
    transition: border-color 0.15s, color 0.15s;
  }
  .btn-logout:hover { border-color: #c44f4f; color: #f87272; opacity: 1; }

  main { flex: 1; max-width: 960px; width: 100%; margin: 0 auto; padding: 1.5rem 1rem; }

  footer {
    text-align: center;
    padding: 1rem;
    color: #444;
    font-size: 0.8rem;
    border-top: 1px solid #1e1e30;
  }

  /* Mobile */
  @media (max-width: 640px) {
    .logo-text  { display: none; }
    .user-email { display: none; }
    nav a { padding: 0.35rem 0.5rem; font-size: 0.8rem; }
  }

  @media (max-width: 420px) {
    nav a { font-size: 0.72rem; padding: 0.3rem 0.4rem; }
  }
</style>
