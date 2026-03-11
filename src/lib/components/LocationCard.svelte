<!-- LocationCard.svelte – Single location card (M9 – Task 9.8) -->
<!--
  Extracted from locations/+page.svelte to reduce file size.
  Events dispatched to parent:
    - "edit"         → parent opens LocationModal for this location
    - "toggleActive" → parent calls updateLocation + refreshes list
    - "delete"       → parent calls deleteLocation + refreshes list
-->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  /** The location object to display */
  export let loc;

  /** Category definitions for displaying icons/labels */
  export let categories = [];

  // Local delete confirmation state (no need to lift to parent)
  let deleteConfirm = false;

  function formatCoords(lat, lon) {
    if (!lat || !lon) return '—';
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
  }
</script>

<div class="location-card" class:inactive={!loc.is_active}>
  <div class="card-header">
    <div class="card-title-row">
      <span class="location-name">{loc.name}</span>
      <label class="toggle" title={loc.is_active ? 'Deaktivieren' : 'Aktivieren'}>
        <input
          type="checkbox"
          checked={loc.is_active}
          on:change={() => dispatch('toggleActive', loc)}
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="location-address">📍 {loc.address}</div>
  </div>

  <div class="card-body">
    <div class="meta-row">
      <span class="meta-label">Koordinaten</span>
      <span class="meta-value mono">{formatCoords(loc.latitude, loc.longitude)}</span>
    </div>
    {#if loc.country_code}
      <div class="meta-row">
        <span class="meta-label">Land</span>
        <span class="meta-value">{loc.country_code}</span>
      </div>
    {/if}
    <div class="meta-row">
      <span class="meta-label">Kategorien</span>
      <span class="meta-value categories-display">
        {#each categories as cat}
          {#if (loc.location_categories || []).some(lc => lc.category === cat.key && lc.is_active)}
            <span class="cat-badge" title={cat.label}>{cat.icon} {cat.label}</span>
          {/if}
        {/each}
        {#if !(loc.location_categories || []).some(lc => lc.is_active)}
          <span class="no-cats">Keine Kategorien</span>
        {/if}
      </span>
    </div>
  </div>

  <div class="card-actions">
    <button class="btn btn-secondary btn-sm" on:click={() => dispatch('edit', loc)}>
      ✏️ Bearbeiten
    </button>
    {#if deleteConfirm}
      <div class="delete-confirm">
        <span>Wirklich löschen?</span>
        <button class="btn btn-danger btn-sm" on:click={() => dispatch('delete', loc.id)}>Ja, löschen</button>
        <button class="btn btn-ghost btn-sm" on:click={() => deleteConfirm = false}>Abbrechen</button>
      </div>
    {:else}
      <button class="btn btn-ghost btn-sm danger-hover" on:click={() => deleteConfirm = true}>
        🗑️ Löschen
      </button>
    {/if}
  </div>
</div>

<style>
  .location-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    transition: opacity 0.2s;
    display: flex;
    flex-direction: column;
  }

  .location-card.inactive { opacity: 0.5; }

  .card-header { margin-bottom: 0.75rem; }

  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
  }

  .location-name { font-size: 1.05rem; font-weight: 600; color: var(--text); }
  .location-address { font-size: 0.82rem; color: var(--text-dim); }

  .card-body { margin-bottom: 0.75rem; flex: 1; }

  .meta-row {
    display: flex; gap: 0.5rem;
    margin-bottom: 0.4rem; font-size: 0.83rem; align-items: flex-start;
  }
  .meta-label { color: var(--text-dim); min-width: 85px; flex-shrink: 0; }
  .meta-value { color: var(--text); }
  .mono { font-family: monospace; font-size: 0.78rem; }

  .categories-display { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .cat-badge {
    background: rgba(99, 102, 241, 0.15); color: #a5b4fc;
    border-radius: 999px; padding: 0.15rem 0.5rem;
    font-size: 0.72rem; white-space: nowrap;
  }
  .no-cats { color: var(--text-dim); font-style: italic; }

  /* ── Card Actions ──────────────────────────────────── */
  .card-actions {
    display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;
    border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: auto;
  }

  .delete-confirm {
    display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
    font-size: 0.82rem; color: var(--text-dim);
  }

  /* ── Toggle ────────────────────────────────────────── */
  .toggle {
    position: relative; display: inline-block;
    width: 42px; height: 22px; cursor: pointer; flex-shrink: 0;
  }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; inset: 0;
    background: var(--border); border-radius: 999px; transition: background 0.2s;
  }
  .toggle-slider::before {
    content: ''; position: absolute;
    width: 16px; height: 16px; left: 3px; top: 3px;
    background: white; border-radius: 50%; transition: transform 0.2s;
  }
  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

  /* ── Buttons ───────────────────────────────────────── */
  .btn {
    padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.9rem;
    font-weight: 500; cursor: pointer; border: none;
    transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid transparent; }
  .btn-ghost:hover { color: var(--text); border-color: var(--border); }
  .btn-danger { background: #ef4444; color: white; }
  .btn-danger:hover { opacity: 0.85; }
  .danger-hover:hover { color: #ef4444 !important; border-color: #ef4444 !important; }
  .btn-sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; }
</style>
