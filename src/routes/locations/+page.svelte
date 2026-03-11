<script>
  // M9 (Task 9.8): Refactored – modal and card extracted into dedicated components.
  // This file is now ~150 lines (was ~800).
  import { getLocations, deleteLocation, updateLocation } from '$lib/supabase.js';
  import LocationModal from '$lib/components/LocationModal.svelte';
  import LocationCard  from '$lib/components/LocationCard.svelte';

  // ── State ──────────────────────────────────────────────────────────
  /** @type {import('./$types').PageData} */
  export let data;

  let locations = data.locations;
  let loading   = false;
  let error     = data.loadError ?? null;

  // Modal state
  let showModal       = false;
  let editingLocation = null; // null = new, object = editing

  // Category definitions (shared between page + components).
  // Lowercase `categories` matches the {categories} shorthand in the template
  // passed to LocationCard / LocationModal – was CATEGORIES (bug: undefined prop).
  const categories = [
    { key: 'unwetter',   label: 'Unwetter',          icon: '⛈️',  desc: 'Sturm, Gewitter, Hagel' },
    { key: 'hochwasser', label: 'Hochwasser',         icon: '🌊',  desc: 'Überflutungen, Starkregen' },
    { key: 'feuer',      label: 'Feuer / Waldbrand',  icon: '🔥',  desc: 'Brand, Waldbrand' },
    { key: 'unruhen',    label: 'Politische Unruhen', icon: '⚠️',  desc: 'Demos, Unruhen, Sperrzonen' },
    { key: 'erdbeben',   label: 'Erdbeben',           icon: '🌍',  desc: 'Seismische Ereignisse ≥ M4.0' },
  ];

  // ── Data loading ───────────────────────────────────────────────────
  async function loadLocations() {
    loading = true;
    error   = null;
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Zeitüberschreitung – Supabase antwortet nicht (10s). Bitte Seite neu laden.')), 10_000)
      );
      locations = await Promise.race([getLocations(), timeout]);
    } catch (e) {
      error = e?.message ?? String(e);
    } finally {
      loading = false;
    }
  }

  // ── Modal helpers ──────────────────────────────────────────────────
  function openAddModal() {
    editingLocation = null;
    showModal = true;
  }

  function openEditModal(loc) {
    editingLocation = loc;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingLocation = null;
  }

  async function onModalSaved() {
    closeModal();
    await loadLocations();
  }

  // ── Card event handlers ────────────────────────────────────────────
  async function handleToggleActive(loc) {
    try {
      await updateLocation(loc.id, { is_active: !loc.is_active });
      await loadLocations();
    } catch (e) {
      error = 'Fehler beim Aktualisieren: ' + e.message;
    }
  }

  async function handleDelete(locId) {
    try {
      await deleteLocation(locId);
      await loadLocations();
    } catch (e) {
      error = 'Löschen fehlgeschlagen: ' + e.message;
    }
  }

  // ── Keyboard ───────────────────────────────────────────────────────
  function handleKeydown(e) {
    if (e.key === 'Escape' && showModal) closeModal();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Orte verwalten</h1>
      <p class="subtitle">Adressen hinzufügen, bearbeiten oder deaktivieren</p>
    </div>
    <button class="btn btn-primary" on:click={openAddModal}>
      + Ort hinzufügen
    </button>
  </div>

  <!-- Error Banner -->
  {#if error}
    <div class="alert-banner error">
      ⚠️ {error}
      <button class="close-btn" on:click={() => error = null} aria-label="Fehlermeldung schließen">✕</button>
    </div>
  {/if}

  <!-- Loading -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Lade Orte…</p>
    </div>

  <!-- Empty -->
  {:else if locations.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📍</div>
      <h2>Noch keine Orte eingetragen</h2>
      <p>Füge deinen ersten Ort hinzu, um ihn zu überwachen.</p>
      <button class="btn btn-primary" on:click={openAddModal}>Ersten Ort hinzufügen</button>
    </div>

  <!-- Locations grid -->
  {:else}
    <div class="locations-grid">
      {#each locations as loc (loc.id)}
        <LocationCard
          {loc}
          {categories}
          on:edit={(e)         => openEditModal(e.detail)}
          on:toggleActive={(e) => handleToggleActive(e.detail)}
          on:delete={(e)       => handleDelete(e.detail)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Modal (only mounted when open) -->
{#if showModal}
  <LocationModal
    {editingLocation}
    {categories}
    on:close={closeModal}
    on:saved={onModalSaved}
  />
{/if}

<style>
  .page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }

  .page-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
  }

  .page-header h1 { margin: 0 0 0.25rem; font-size: 1.75rem; color: var(--text); }
  .subtitle { margin: 0; color: var(--text-dim); font-size: 0.9rem; }

  /* ── Loading / Empty ─────────────────────────────────── */
  .loading-state, .empty-state {
    text-align: center; padding: 4rem 2rem; color: var(--text-dim);
  }

  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border); border-top-color: var(--accent);
    border-radius: 50%; animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-state h2 { color: var(--text); margin-bottom: 0.5rem; }
  .empty-state p  { margin-bottom: 1.5rem; }

  /* ── Grid ────────────────────────────────────────────── */
  .locations-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .locations-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── Alert Banner ────────────────────────────────────── */
  .alert-banner {
    border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem;
    font-size: 0.88rem; display: flex;
    justify-content: space-between; align-items: center; gap: 0.5rem;
  }
  .alert-banner.error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  .close-btn { background: none; border: none; cursor: pointer; color: inherit; font-size: 1rem; padding: 0; }

  /* ── Buttons ─────────────────────────────────────────── */
  .btn {
    padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.9rem;
    font-weight: 500; cursor: pointer; border: none;
    transition: opacity 0.15s, background 0.15s;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { opacity: 0.85; }
</style>
