<script>
  // M8 (Tasks 8.3 + 8.6): Data is loaded server-side via +page.server.js.
  // M9 (Task 9.5): Pagination – initial 50 alerts + "Mehr laden" button.
  import { getAlerts, loadMoreAlerts } from '$lib/supabase.js';

  /** @type {import('./$types').PageData} */
  export let data;

  // ── State ──────────────────────────────────────────────────────────
  // loading starts false – initial data comes from SSR
  let alerts     = data.alerts;
  let totalCount = data.totalCount ?? alerts.length;
  let loading    = false;
  let loadingMore = false;
  let error      = data.loadError ?? null;

  // True when there are more alerts in the database than currently loaded
  $: hasMore = alerts.length < totalCount;

  // Filters
  let filterCategory = 'all';
  let filterSeverity = 'all';
  let filterDays = '7';

  // Category + Severity definitions
  const CATEGORIES = [
    { key: 'all',        label: 'Alle Kategorien', icon: '📋' },
    { key: 'unwetter',   label: 'Unwetter',         icon: '⛈️' },
    { key: 'hochwasser', label: 'Hochwasser',        icon: '🌊' },
    { key: 'feuer',      label: 'Feuer',             icon: '🔥' },
    { key: 'unruhen',    label: 'Unruhen',           icon: '⚠️' },
    { key: 'erdbeben',   label: 'Erdbeben',          icon: '🌍' },
  ];

  const SEVERITIES = [
    { key: 'all',      label: 'Alle Schweregrade', color: '' },
    { key: 'critical', label: 'Kritisch',           color: '#ef4444' },
    { key: 'warning',  label: 'Warnung',            color: '#f59e0b' },
    { key: 'info',     label: 'Info',               color: '#6366f1' },
  ];

  const DAY_OPTIONS = [
    { value: '1',   label: 'Letzte 24h' },
    { value: '7',   label: 'Letzte 7 Tage' },
    { value: '30',  label: 'Letzte 30 Tage' },
    { value: '90',  label: 'Letzte 90 Tage' },
  ];

  // loadAlerts() – called by the "Aktualisieren" button for manual refresh.
  // Resets to first 50 to stay consistent with SSR initial state.
  async function loadAlerts() {
    loading = true;
    error = null;
    try {
      // getAlerts(50) uses the cached query; force fresh by using loadMoreAlerts at offset 0
      const fresh = await loadMoreAlerts(0, 50);
      alerts = fresh;
      // Refetch totalCount separately so hasMore stays accurate after a refresh
      // (We re-use the SSR count as a baseline; a full refresh will reconcile on next SSR)
      if (fresh.length < 50) totalCount = fresh.length;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  // loadMore() – appends the next batch of alerts when the user clicks "Mehr laden"
  async function loadMore() {
    loadingMore = true;
    error = null;
    try {
      const batch = await loadMoreAlerts(alerts.length, 50);
      alerts = [...alerts, ...batch];
    } catch (e) {
      error = e.message;
    } finally {
      loadingMore = false;
    }
  }

  // ── Computed: filtered alerts ──────────────────────────────────────
  $: filteredAlerts = alerts.filter(a => {
    // Category filter
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    // Severity filter
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    // Days filter
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(filterDays));
    if (new Date(a.created_at) < cutoff) return false;
    return true;
  });

  // ── Helpers ────────────────────────────────────────────────────────
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Gerade eben';
    if (mins < 60) return `vor ${mins} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    if (days < 30) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    return new Date(dateStr).toLocaleDateString('de-DE');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function getCategoryIcon(cat) {
    return CATEGORIES.find(c => c.key === cat)?.icon || '📋';
  }

  function getSeverityColor(sev) {
    return SEVERITIES.find(s => s.key === sev)?.color || '#6366f1';
  }

  function getSeverityLabel(sev) {
    const map = { critical: 'Kritisch', warning: 'Warnung', info: 'Info' };
    return map[sev] || sev;
  }

  function resetFilters() {
    filterCategory = 'all';
    filterSeverity = 'all';
    filterDays = '7';
  }

  $: hasActiveFilters = filterCategory !== 'all' || filterSeverity !== 'all' || filterDays !== '7';

  // Stats
  $: statsToday = alerts.filter(a => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 1);
    return new Date(a.created_at) >= cutoff;
  }).length;
  $: statsCritical = alerts.filter(a => a.severity === 'critical').length;
  $: statsTelegram = alerts.filter(a => a.telegram_sent).length;
</script>

<div class="page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Alert-Historie</h1>
      <p class="subtitle">Alle gesendeten Benachrichtigungen im Überblick</p>
    </div>
    <button class="btn btn-secondary" on:click={loadAlerts} title="Aktualisieren">
      🔄 Aktualisieren
    </button>
  </div>

  <!-- Error -->
  {#if error}
    <div class="alert-banner error">⚠️ {error}</div>
  {/if}

  <!-- Stats row -->
  {#if !loading}
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{totalCount}</div>
        <div class="stat-label">Alerts gesamt</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{statsToday}</div>
        <div class="stat-label">Letzte 24h</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-value">{statsCritical}</div>
        <div class="stat-label">Kritisch</div>
      </div>
      <div class="stat-card sent">
        <div class="stat-value">{statsTelegram}</div>
        <div class="stat-label">via Telegram</div>
      </div>
    </div>
  {/if}

  <!-- Filters -->
  <div class="filters-bar">
    <div class="filter-group">
      <label for="filter-days">Zeitraum</label>
      <select id="filter-days" bind:value={filterDays}>
        {#each DAY_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label for="filter-cat">Kategorie</label>
      <select id="filter-cat" bind:value={filterCategory}>
        {#each CATEGORIES as cat}
          <option value={cat.key}>{cat.icon} {cat.label}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label for="filter-sev">Schweregrad</label>
      <select id="filter-sev" bind:value={filterSeverity}>
        {#each SEVERITIES as sev}
          <option value={sev.key}>{sev.label}</option>
        {/each}
      </select>
    </div>

    {#if hasActiveFilters}
      <button class="btn btn-ghost btn-sm reset-btn" on:click={resetFilters}>
        ✕ Filter zurücksetzen
      </button>
    {/if}
  </div>

  <!-- Result count -->
  {#if !loading && alerts.length > 0}
    <p class="result-count">
      {filteredAlerts.length} von {totalCount} Alerts
      {#if hasActiveFilters}(gefiltert){/if}
      {#if alerts.length < totalCount} – {alerts.length} geladen{/if}
    </p>
  {/if}

  <!-- Loading -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Lade Alert-Historie…</p>
    </div>

  <!-- Empty (no alerts at all) -->
  {:else if alerts.length === 0}
    <div class="empty-state">
      <div class="empty-icon">✅</div>
      <h2>Noch keine Alerts</h2>
      <p>Sobald der Monitor einen Alarm auslöst, erscheint er hier.</p>
    </div>

  <!-- Empty (filter result) -->
  {:else if filteredAlerts.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2>Keine Treffer</h2>
      <p>Keine Alerts für die gewählten Filter.</p>
      <button class="btn btn-secondary" on:click={resetFilters}>Filter zurücksetzen</button>
    </div>

  <!-- Alert list -->
  {:else}
    <div class="alerts-list">
      {#each filteredAlerts as alert (alert.id)}
        <div class="alert-card">
          <!-- Left: severity bar -->
          <div class="severity-bar" style="background: {getSeverityColor(alert.severity)}"></div>

          <!-- Content -->
          <div class="alert-content">
            <div class="alert-header">
              <div class="alert-title-row">
                <span class="category-icon">{getCategoryIcon(alert.category)}</span>
                <span class="alert-title">{alert.title}</span>
                <span
                  class="severity-badge"
                  style="background: {getSeverityColor(alert.severity)}22; color: {getSeverityColor(alert.severity)}; border-color: {getSeverityColor(alert.severity)}44"
                >
                  {getSeverityLabel(alert.severity)}
                </span>
                {#if alert.telegram_sent}
                  <span class="telegram-badge" title="Via Telegram gesendet">📲</span>
                {/if}
              </div>

              <div class="alert-meta">
                {#if alert.locations?.name}
                  <span class="meta-item">📍 {alert.locations.name}</span>
                {/if}
                <span class="meta-item" title={formatDate(alert.created_at)}>
                  🕐 {timeAgo(alert.created_at)}
                </span>
              </div>
            </div>

            {#if alert.message}
              <div class="alert-message">{alert.message}</div>
            {/if}

            {#if alert.source_url}
              <div class="alert-footer">
                <a href={alert.source_url} target="_blank" rel="noopener noreferrer" class="source-link">
                  🔗 Quelle →
                </a>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- "Mehr laden" pagination button (M9 – Task 9.5) -->
    {#if hasMore && !hasActiveFilters}
      <div class="load-more-row">
        <button
          class="btn btn-secondary"
          on:click={loadMore}
          disabled={loadingMore}
        >
          {#if loadingMore}
            <span class="spinner-inline"></span> Lade…
          {:else}
            ⬇ Mehr laden ({totalCount - alerts.length} weitere)
          {/if}
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* ── Page ────────────────────────────────────────────────── */
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .page-header h1 { margin: 0 0 0.25rem; font-size: 1.75rem; color: var(--text); }
  .subtitle { margin: 0; color: var(--text-dim); font-size: 0.9rem; }

  /* ── Stats Row ───────────────────────────────────────────── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 480px) {
    .stats-row { grid-template-columns: repeat(4, 1fr); }
  }

  .stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
  }

  .stat-card.critical { border-color: rgba(239,68,68,0.3); }
  .stat-card.sent { border-color: rgba(99,102,241,0.3); }

  .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text); }
  .stat-label { font-size: 0.78rem; color: var(--text-dim); margin-top: 0.2rem; }

  /* ── Filters ─────────────────────────────────────────────── */
  .filters-bar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: flex-end;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .filter-group { display: flex; flex-direction: column; gap: 0.3rem; }

  .filter-group label {
    font-size: 0.75rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
  }

  select {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.85rem;
    cursor: pointer;
  }

  select:focus { outline: none; border-color: var(--accent); }

  .reset-btn { align-self: flex-end; }

  .result-count { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 0.75rem; }

  /* ── Loading / Empty ─────────────────────────────────────── */
  .loading-state, .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-dim);
  }

  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-state h2 { color: var(--text); margin-bottom: 0.5rem; }
  .empty-state p { margin-bottom: 1.5rem; }

  /* ── Alert List ──────────────────────────────────────────── */
  .alerts-list { display: flex; flex-direction: column; gap: 0.75rem; }

  .alert-card {
    display: flex;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.15s;
  }

  .alert-card:hover { border-color: rgba(99,102,241,0.4); }

  .severity-bar { width: 4px; flex-shrink: 0; }

  .alert-content { flex: 1; padding: 1rem 1.25rem; }

  .alert-header { margin-bottom: 0.5rem; }

  .alert-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.35rem;
  }

  .category-icon { font-size: 1.1rem; }

  .alert-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
    flex: 1;
    min-width: 0;
  }

  .severity-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .telegram-badge {
    font-size: 0.85rem;
    opacity: 0.8;
    title: 'Gesendet';
  }

  .alert-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .meta-item { font-size: 0.78rem; color: var(--text-dim); }

  .alert-message {
    font-size: 0.85rem;
    color: var(--text-dim);
    line-height: 1.5;
    white-space: pre-wrap;
    background: var(--bg);
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
    margin-top: 0.5rem;
    font-family: monospace;
    max-height: 120px;
    overflow-y: auto;
    border: 1px solid var(--border);
  }

  .alert-footer { margin-top: 0.5rem; }

  .source-link {
    font-size: 0.78rem;
    color: var(--accent);
    text-decoration: none;
  }

  .source-link:hover { text-decoration: underline; }

  /* ── Buttons ─────────────────────────────────────────────── */
  .btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, border-color 0.15s, color 0.15s;
  }

  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid transparent; }
  .btn-ghost:hover { color: var(--text); border-color: var(--border); }
  .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }

  /* ── Load More ───────────────────────────────────────────── */
  .load-more-row {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .spinner-inline {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 0.35rem;
  }

  /* ── Alert Banner ────────────────────────────────────────── */
  .alert-banner {
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    font-size: 0.88rem;
  }

  .alert-banner.error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.4);
    color: #fca5a5;
  }
</style>
