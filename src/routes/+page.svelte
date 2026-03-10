<script>
  import { onMount } from 'svelte';
  import { getLocations, getAlerts } from '$lib/supabase.js';

  let locations = [];
  let recentAlerts = [];
  let loading = true;
  let error = null;

  const CATEGORY_ICONS = {
    unwetter: '🌩️', hochwasser: '🌊', feuer: '🔥', unruhen: '⚠️', erdbeben: '🏔️'
  };

  onMount(async () => {
    try {
      [locations, recentAlerts] = await Promise.all([
        getLocations(),
        getAlerts(10),
      ]);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'gerade eben';
    if (m < 60) return `vor ${m} Min.`;
    const h = Math.floor(m / 60);
    if (h < 24) return `vor ${h} Std.`;
    return `vor ${Math.floor(h / 24)} Tagen`;
  }
</script>

<svelte:head><title>Dashboard – OSInt Monitor</title></svelte:head>

<div class="page-header">
  <div>
    <h1>Dashboard</h1>
    <p class="subtitle">Übersicht deiner überwachten Orte</p>
  </div>
  <a href="/locations" class="btn-primary" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.55rem 1.1rem;background:#4f80c4;color:#fff;border-radius:8px;font-weight:500;">
    + Ort hinzufügen
  </a>
</div>

{#if loading}
  <div class="empty-state"><div class="icon">⏳</div><p>Lade Daten…</p></div>
{:else if error}
  <div class="error-box">⚠️ Fehler beim Laden: {error}</div>
{:else}

<!-- Stats row -->
<div class="stats-row">
  <div class="stat card">
    <div class="stat-value">{locations.filter(l => l.is_active !== false).length}</div>
    <div class="stat-label">Aktive Orte</div>
  </div>
  <div class="stat card">
    <div class="stat-value">{recentAlerts.filter(a => {
      const d = new Date(a.created_at);
      return Date.now() - d.getTime() < 86400000;
    }).length}</div>
    <div class="stat-label">Alerts heute</div>
  </div>
  <div class="stat card">
    <div class="stat-value">{recentAlerts.filter(a => a.category === 'unwetter').length > 0 ? '⚠️' : '✅'}</div>
    <div class="stat-label">Wetter-Status</div>
  </div>
</div>

<!-- Locations -->
{#if locations.length === 0}
  <div class="empty-state">
    <div class="icon">📍</div>
    <p>Noch keine Orte hinterlegt.</p>
    <a href="/locations" style="display:inline-block;margin-top:1rem;padding:0.5rem 1.25rem;background:#4f80c4;color:#fff;border-radius:8px;">
      Ersten Ort hinzufügen
    </a>
  </div>
{:else}
  <h2 class="section-title">Deine Orte</h2>
  <div class="location-grid">
    {#each locations as loc}
      {@const activeCategories = (loc.location_categories || []).filter(c => c.is_active)}
      <div class="card location-card">
        <div class="loc-header">
          <div class="loc-name">📍 {loc.name}</div>
          <a href="/locations" class="loc-edit">✏️</a>
        </div>
        <div class="loc-address">{loc.address}</div>
        <div class="loc-categories">
          {#each activeCategories as cat}
            <span class="category-chip">{CATEGORY_ICONS[cat.category] || ''} {cat.category}</span>
          {/each}
          {#if activeCategories.length === 0}
            <span style="color:#555;font-size:0.8rem">Keine Kategorien aktiv</span>
          {/if}
        </div>
        {#if loc.latitude && loc.longitude}
          <div class="loc-coords">🌐 {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}</div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<!-- Recent Alerts -->
{#if recentAlerts.length > 0}
  <h2 class="section-title" style="margin-top:2rem">Letzte Alerts</h2>
  <div class="alerts-list">
    {#each recentAlerts as alert}
      <div class="card alert-item">
        <div class="alert-header">
          <span class="alert-icon">{CATEGORY_ICONS[alert.category] || '🔔'}</span>
          <span class="alert-title">{alert.title}</span>
          <span class="badge badge-{alert.severity}">{alert.severity}</span>
        </div>
        <div class="alert-meta">
          {#if alert.locations?.name}<span>📍 {alert.locations.name}</span>{/if}
          <span>🕐 {timeAgo(alert.created_at)}</span>
          {#if alert.telegram_sent}<span>✅ Telegram</span>{/if}
        </div>
      </div>
    {/each}
    <a href="/alerts" style="display:block;text-align:center;padding:0.75rem;color:#7c9fd4;font-size:0.875rem">
      Alle Alerts anzeigen →
    </a>
  </div>
{/if}

{/if}

<style>
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; }
  h1 { font-size: 1.6rem; font-weight: 700; }
  .subtitle { color: #666; font-size: 0.875rem; margin-top: 0.2rem; }
  .section-title { font-size: 1rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }

  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
  .stat { text-align: center; }
  .stat-value { font-size: 2rem; font-weight: 700; color: #a8c4e8; }
  .stat-label { font-size: 0.8rem; color: #666; margin-top: 0.25rem; }

  .location-grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .location-card { display: flex; flex-direction: column; gap: 0.5rem; }
  .loc-header { display: flex; justify-content: space-between; align-items: center; }
  .loc-name { font-weight: 600; font-size: 0.95rem; }
  .loc-edit { font-size: 0.85rem; opacity: 0.5; }
  .loc-edit:hover { opacity: 1; }
  .loc-address { color: #777; font-size: 0.8rem; }
  .loc-coords { color: #555; font-size: 0.75rem; }
  .loc-categories { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem; }
  .category-chip { background: #2a2a3e; color: #aaa; padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.75rem; }

  .alerts-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .alert-item { padding: 0.9rem 1.1rem; }
  .alert-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap; }
  .alert-icon { font-size: 1.1rem; }
  .alert-title { flex: 1; font-size: 0.875rem; font-weight: 500; }
  .alert-meta { display: flex; gap: 0.75rem; font-size: 0.775rem; color: #666; flex-wrap: wrap; }

  .error-box { background: #2a1a1a; border: 1px solid #5c2a2a; border-radius: 8px; padding: 1rem; color: #f87272; }

  @media (max-width: 480px) {
    .stats-row { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
    .stat-value { font-size: 1.5rem; }
    .page-header { flex-direction: column; }
  }
</style>
