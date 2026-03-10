<script>
  import { onMount } from 'svelte';
  import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    setLocationCategories,
    geocodeAddress
  } from '$lib/supabase.js';

  // ── State ──────────────────────────────────────────────────────────
  let locations = [];
  let loading = true;
  let error = null;

  // Modal state
  let showModal = false;
  let editingLocation = null; // null = new, object = editing

  // Form state
  let form = {
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    country_code: '',
    is_active: true,
    categories: {
      unwetter: false,
      hochwasser: false,
      feuer: false,
      unruhen: false,
      erdbeben: false
    }
  };

  let geocoding = false;
  let geocodeError = null;
  let saving = false;
  let saveError = null;
  let deleteConfirm = null; // location id pending deletion confirm

  // Category definitions
  const CATEGORIES = [
    { key: 'unwetter',   label: 'Unwetter',          icon: '⛈️',  desc: 'Sturm, Gewitter, Hagel' },
    { key: 'hochwasser', label: 'Hochwasser',         icon: '🌊',  desc: 'Überflutungen, Starkregen' },
    { key: 'feuer',      label: 'Feuer / Waldbrand',  icon: '🔥',  desc: 'Brand, Waldbrand' },
    { key: 'unruhen',    label: 'Politische Unruhen', icon: '⚠️',  desc: 'Demos, Unruhen, Sperrzonen' },
    { key: 'erdbeben',   label: 'Erdbeben',           icon: '🌍',  desc: 'Seismische Ereignisse ≥ M4.0' },
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────
  onMount(async () => {
    await loadLocations();
  });

  async function loadLocations() {
    loading = true;
    error = null;
    try {
      locations = await getLocations();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  // ── Modal helpers ──────────────────────────────────────────────────
  function resetForm() {
    form = {
      name: '',
      address: '',
      latitude: null,
      longitude: null,
      country_code: '',
      is_active: true,
      categories: { unwetter: false, hochwasser: false, feuer: false, unruhen: false, erdbeben: false }
    };
    geocodeError = null;
    saveError = null;
  }

  function openAddModal() {
    editingLocation = null;
    resetForm();
    showModal = true;
  }

  function openEditModal(loc) {
    editingLocation = loc;
    const activeCats = { unwetter: false, hochwasser: false, feuer: false, unruhen: false, erdbeben: false };
    (loc.location_categories || []).forEach(lc => {
      if (lc.is_active) activeCats[lc.category] = true;
    });
    form = {
      name: loc.name,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      country_code: loc.country_code || '',
      is_active: loc.is_active,
      categories: activeCats
    };
    geocodeError = null;
    saveError = null;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingLocation = null;
  }

  // ── Geocoding ──────────────────────────────────────────────────────
  async function handleGeocode() {
    if (!form.address.trim()) return;
    geocoding = true;
    geocodeError = null;
    try {
      const result = await geocodeAddress(form.address);
      if (result) {
        form.latitude = result.lat;
        form.longitude = result.lon;
        form.country_code = result.country_code?.toUpperCase() || '';
        // Auto-fill name if still empty
        if (!form.name.trim() && result.display_name) {
          form.name = result.display_name.split(',')[0].trim();
        }
      } else {
        geocodeError = 'Adresse nicht gefunden. Bitte präzisieren.';
      }
    } catch (e) {
      geocodeError = 'Fehler beim Geocoding: ' + e.message;
    } finally {
      geocoding = false;
    }
  }

  // ── Save (create / update) ─────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim() || !form.address.trim()) {
      saveError = 'Name und Adresse sind Pflichtfelder.';
      return;
    }
    if (!form.latitude || !form.longitude) {
      saveError = 'Bitte zuerst Adresse per 🔍 Geocoding bestätigen.';
      return;
    }
    const activeCategoryKeys = Object.entries(form.categories)
      .filter(([, v]) => v).map(([k]) => k);
    if (activeCategoryKeys.length === 0) {
      saveError = 'Bitte mindestens eine Kategorie auswählen.';
      return;
    }

    saving = true;
    saveError = null;
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        country_code: form.country_code.toUpperCase(),
        is_active: form.is_active
      };

      let locationId;
      if (editingLocation) {
        await updateLocation(editingLocation.id, payload);
        locationId = editingLocation.id;
      } else {
        const newLoc = await createLocation(payload);
        locationId = newLoc.id;
      }
      await setLocationCategories(locationId, activeCategoryKeys);
      closeModal();
      await loadLocations();
    } catch (e) {
      saveError = 'Speichern fehlgeschlagen: ' + e.message;
    } finally {
      saving = false;
    }
  }

  // ── Toggle active ──────────────────────────────────────────────────
  async function toggleActive(loc) {
    try {
      await updateLocation(loc.id, { is_active: !loc.is_active });
      await loadLocations();
    } catch (e) {
      error = 'Fehler beim Aktualisieren: ' + e.message;
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────
  async function handleDelete(locId) {
    try {
      await deleteLocation(locId);
      deleteConfirm = null;
      await loadLocations();
    } catch (e) {
      error = 'Löschen fehlgeschlagen: ' + e.message;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function formatCoords(lat, lon) {
    if (!lat || !lon) return '—';
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
  }

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
      <button class="close-btn" on:click={() => error = null}>✕</button>
    </div>
  {/if}

  <!-- Loading -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Lade Orte…</p>
    </div>

  <!-- Empty state -->
  {:else if locations.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📍</div>
      <h2>Noch keine Orte eingetragen</h2>
      <p>Füge deinen ersten Ort hinzu, um ihn zu überwachen.</p>
      <button class="btn btn-primary" on:click={openAddModal}>Ersten Ort hinzufügen</button>
    </div>

  <!-- Locations list -->
  {:else}
    <div class="locations-grid">
      {#each locations as loc (loc.id)}
        <div class="location-card" class:inactive={!loc.is_active}>
          <div class="card-header">
            <div class="card-title-row">
              <span class="location-name">{loc.name}</span>
              <label class="toggle" title={loc.is_active ? 'Deaktivieren' : 'Aktivieren'}>
                <input type="checkbox" checked={loc.is_active} on:change={() => toggleActive(loc)} />
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
                {#each CATEGORIES as cat}
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
            <button class="btn btn-secondary btn-sm" on:click={() => openEditModal(loc)}>
              ✏️ Bearbeiten
            </button>
            {#if deleteConfirm === loc.id}
              <div class="delete-confirm">
                <span>Wirklich löschen?</span>
                <button class="btn btn-danger btn-sm" on:click={() => handleDelete(loc.id)}>Ja, löschen</button>
                <button class="btn btn-ghost btn-sm" on:click={() => deleteConfirm = null}>Abbrechen</button>
              </div>
            {:else}
              <button class="btn btn-ghost btn-sm danger-hover" on:click={() => deleteConfirm = loc.id}>
                🗑️ Löschen
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- ── Modal ──────────────────────────────────────────────────────── -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click|self={closeModal}>
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2>{editingLocation ? 'Ort bearbeiten' : 'Neuen Ort hinzufügen'}</h2>
        <button class="close-btn" on:click={closeModal}>✕</button>
      </div>

      <div class="modal-body">
        <!-- Address + Geocoding -->
        <div class="form-group">
          <label for="address">Adresse *</label>
          <div class="input-row">
            <input
              id="address"
              type="text"
              bind:value={form.address}
              placeholder="z.B. Strandweg 12, Amalfi, Italien"
              on:keydown={(e) => e.key === 'Enter' && handleGeocode()}
            />
            <button
              class="btn btn-secondary"
              on:click={handleGeocode}
              disabled={geocoding || !form.address.trim()}
            >
              {geocoding ? '⏳' : '🔍'} {geocoding ? 'Suche…' : 'Geocode'}
            </button>
          </div>
          {#if geocodeError}
            <p class="field-error">{geocodeError}</p>
          {/if}
          {#if form.latitude && form.longitude}
            <p class="field-success">
              ✅ {formatCoords(form.latitude, form.longitude)}
              {form.country_code ? `· ${form.country_code}` : ''}
            </p>
          {/if}
        </div>

        <!-- Name -->
        <div class="form-group">
          <label for="name">Name *</label>
          <input
            id="name"
            type="text"
            bind:value={form.name}
            placeholder="z.B. Ferienhaus Amalfi"
          />
        </div>

        <!-- Country Code -->
        <div class="form-group">
          <label for="country_code">Ländercode (ISO 2)</label>
          <input
            id="country_code"
            type="text"
            bind:value={form.country_code}
            placeholder="IT"
            maxlength="2"
            class="input-narrow"
          />
          <p class="field-hint">Für News-Suche. Wird beim Geocoding automatisch befüllt.</p>
        </div>

        <!-- Active toggle -->
        <div class="form-group form-group-inline">
          <span class="toggle-label">Monitoring aktiv</span>
          <label class="toggle">
            <input id="is_active" type="checkbox" bind:checked={form.is_active} />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- Categories -->
        <div class="form-group">
          <label>Überwachungs-Kategorien * <span class="field-hint-inline">(mind. eine)</span></label>
          <div class="categories-grid">
            {#each CATEGORIES as cat}
              <label class="cat-checkbox" class:checked={form.categories[cat.key]}>
                <input type="checkbox" bind:checked={form.categories[cat.key]} />
                <div class="cat-content">
                  <span class="cat-icon">{cat.icon}</span>
                  <div>
                    <div class="cat-label">{cat.label}</div>
                    <div class="cat-desc">{cat.desc}</div>
                  </div>
                </div>
              </label>
            {/each}
          </div>
        </div>

        {#if saveError}
          <div class="alert-banner error">{saveError}</div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" on:click={closeModal}>Abbrechen</button>
        <button class="btn btn-primary" on:click={handleSave} disabled={saving}>
          {saving ? '⏳ Speichern…' : (editingLocation ? '💾 Änderungen speichern' : '➕ Ort hinzufügen')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Page Layout ─────────────────────────────────────────── */
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
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .page-header h1 {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
    color: var(--text);
  }

  .subtitle { margin: 0; color: var(--text-dim); font-size: 0.9rem; }

  /* ── Loading / Empty ─────────────────────────────────────── */
  .loading-state, .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-dim);
  }

  .spinner {
    width: 40px;
    height: 40px;
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

  /* ── Grid ────────────────────────────────────────────────── */
  .locations-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 640px) {
    .locations-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* ── Card ────────────────────────────────────────────────── */
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
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
    font-size: 0.83rem;
    align-items: flex-start;
  }

  .meta-label { color: var(--text-dim); min-width: 85px; flex-shrink: 0; }
  .meta-value { color: var(--text); }
  .mono { font-family: monospace; font-size: 0.78rem; }

  .categories-display { display: flex; flex-wrap: wrap; gap: 0.3rem; }

  .cat-badge {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border-radius: 999px;
    padding: 0.15rem 0.5rem;
    font-size: 0.72rem;
    white-space: nowrap;
  }

  .no-cats { color: var(--text-dim); font-style: italic; }

  /* ── Card Actions ────────────────────────────────────────── */
  .card-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
    border-top: 1px solid var(--border);
    padding-top: 0.75rem;
    margin-top: auto;
  }

  .delete-confirm {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    font-size: 0.82rem;
    color: var(--text-dim);
  }

  /* ── Toggle Switch ───────────────────────────────────────── */
  .toggle {
    position: relative;
    display: inline-block;
    width: 42px;
    height: 22px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .toggle input { opacity: 0; width: 0; height: 0; }

  .toggle-slider {
    position: absolute;
    inset: 0;
    background: var(--border);
    border-radius: 999px;
    transition: background 0.2s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

  /* ── Buttons ─────────────────────────────────────────────── */
  .btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
  }

  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid transparent; }
  .btn-ghost:hover { color: var(--text); border-color: var(--border); }
  .btn-danger { background: #ef4444; color: white; }
  .btn-danger:hover { opacity: 0.85; }
  .danger-hover:hover { color: #ef4444 !important; border-color: #ef4444 !important; }
  .btn-sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; }

  /* ── Alert Banner ────────────────────────────────────────── */
  .alert-banner {
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    font-size: 0.88rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .alert-banner.error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    font-size: 1rem;
    padding: 0;
    flex-shrink: 0;
  }

  /* ── Modal ───────────────────────────────────────────────── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
    backdrop-filter: blur(2px);
  }

  .modal {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0;
    position: sticky;
    top: 0;
    background: var(--card-bg);
    z-index: 1;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 { margin: 0; font-size: 1.2rem; }

  .modal-body { padding: 1.25rem 1.5rem; flex: 1; }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    position: sticky;
    bottom: 0;
    background: var(--card-bg);
    flex-wrap: wrap;
  }

  /* ── Form ────────────────────────────────────────────────── */
  .form-group { margin-bottom: 1.25rem; }

  .form-group label, .toggle-label {
    display: block;
    font-size: 0.83rem;
    color: var(--text-dim);
    margin-bottom: 0.4rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .form-group-inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    padding: 0.75rem 1rem;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .form-group-inline .toggle-label { margin: 0; }

  input[type="text"] {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.9rem;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  input[type="text"]:focus { outline: none; border-color: var(--accent); }

  .input-narrow { width: 80px; text-transform: uppercase; }

  .input-row { display: flex; gap: 0.5rem; align-items: stretch; }
  .input-row input { flex: 1; }
  .input-row .btn { white-space: nowrap; flex-shrink: 0; }

  .field-error { color: #fca5a5; font-size: 0.78rem; margin: 0.3rem 0 0; }
  .field-success { color: #86efac; font-size: 0.78rem; margin: 0.3rem 0 0; }
  .field-hint { color: var(--text-dim); font-size: 0.76rem; margin: 0.25rem 0 0; }
  .field-hint-inline { color: var(--text-dim); font-size: 0.8rem; font-weight: 400; text-transform: none; letter-spacing: 0; }

  /* ── Category Checkboxes ─────────────────────────────────── */
  .categories-grid { display: grid; gap: 0.45rem; }

  .cat-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: var(--bg);
    user-select: none;
  }

  .cat-checkbox:hover { border-color: var(--accent); }

  .cat-checkbox.checked {
    border-color: var(--accent);
    background: rgba(99, 102, 241, 0.08);
  }

  .cat-checkbox input { display: none; }

  .cat-content { display: flex; align-items: center; gap: 0.75rem; pointer-events: none; }

  .cat-icon { font-size: 1.3rem; }
  .cat-label { font-size: 0.9rem; font-weight: 500; color: var(--text); }
  .cat-desc { font-size: 0.72rem; color: var(--text-dim); }
</style>
