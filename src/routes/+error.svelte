<script>
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <div class="error-code">{$page.status}</div>
  <h1>{$page.error?.message || 'Ein Fehler ist aufgetreten'}</h1>
  <a href="/" class="btn-primary" style="display:inline-block;margin-top:1.5rem;padding:0.6rem 1.5rem;background:#4f80c4;color:#fff;border-radius:8px;">
    Zurück zum Dashboard
  </a>
</div>

<style>
  .error-page { text-align: center; padding: 4rem 1rem; }
  .error-code { font-size: 5rem; font-weight: 800; color: #2a2a3e; line-height: 1; }
  h1 { color: #888; margin-top: 0.5rem; font-size: 1.1rem; font-weight: 400; }
</style>
