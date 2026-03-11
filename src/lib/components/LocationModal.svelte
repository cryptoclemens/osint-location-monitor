<!-- LocationModal.svelte – Add/Edit location dialog (M9 – Task 9.8) -->
<!--
  Extracted from locations/+page.svelte to keep that file manageable.
  Manages its own form state, geocoding, and save logic.
  Communicates with the parent via Svelte event dispatching:
    - "close"  → user dismissed the modal without saving
    - "saved"  → mutation succeeded, parent should refresh the list
-->
<script>
  import { createEventDispatcher } from 'svelte';
  import {
    createLocation,
    updateLocation,
    setLocationCategories,
    geocodeAddress
  } from '$lib/supabase.js';

  const dispatch = createEventDispatcher();

  // ── Props ─────────────────────────────────────────────────────────
  /** Currently edited location object, or null when creating a new one */
  export let editingLocation = null;

  /** Category definitions (passed from parent to stay DRY) */
  export let categories = [];

  // ── Form state ────────────────────────────────────────────────────
  let form = buildForm(editingLocation);
  let geocoding  = false;
  let geocodeError = null;
  let saving     = false;
  let saveError  = null;

  // Re-initialise form whenever the editingLocation prop changes
  $: form = buildForm(editingLocation);

  function buildForm(loc) {
    if (!loc) {
      return {
        name: '', address: '', latitude: null, longitude: null,
        country_code: '', is_active: true,
        categories: { unwetter: false, hochwasser: false, feuer: false, unruhen: false, erdbeben: false },
      };
    }
    const activeCats = { unwetter: false, hochwasser: false, feuer: false, unruhen: false, erdbeben: false };
    (loc.location_categories || []).forEach(lc => { if (lc.is_active) activeCats[lc.category] = true; });
    return {
      name: loc.name, address: loc.address,
      latitude: loc.latitude, longitude: loc.longitude,
      country_code: loc.country_code || '', is_active: loc.is_active,
      categories: activeCats,
    };
  }

  function formatCoords(lat, lon) {
    if (!lat || !lon) return '—';
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
  }

  // ── Geocoding ─────────────────────────────────────────────────────
  async function handleGeocode() {
    if (!form.address.trim()) return;
    geocoding = true;
    geocodeError = null;
    try {
      const result = await geocodeAddress(form.address);
      if (result) {
        form.latitude    = result.lat;
        form.longitude   = result.lon;
        form.country_code = result.country_code?.toUpperCase() || '';
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

  // ── Save ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim() || !form.address.trim()) {
      saveError = 'Name und Adresse sind Pflichtfelder.';
      return;
    }
    if (!form.latitude || !form.longitude) {
      saveError = 'Bitte zuerst Adresse per 🔍 Geocoding bestätigen.';
      return;
    }
    const activeCategoryKeys = Object.entries(form.categories).filter(([, v]) => v).map(([k]) => k);
    if (activeCategoryKeys.length === 0) {
      saveError = 'Bitte mindestens eine Kategorie auswählen.';
      return;
    }

    saving = true;
    saveError = null;
    try {
      const payload = {
        name:         form.name.trim(),
        address:      form.address.trim(),
        latitude:     form.latitude,
        longitude:    form.longitude,
        country_code: form.country_code.toUpperCase(),
        is_active:    form.is_active,
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
      dispatch('saved');
    } catch (e) {
      saveError = 'Speichern fehlgeschlagen: ' + e.message;
    } finally {
      saving = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-overlay" on:click|self={handleClose}>
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-header">
      <h2>{editingLocation ? 'Ort bearbeiten' : 'Neuen Ort hinzufügen'}</h2>
      <button class="close-btn" on:click={handleClose} aria-label="Dialog schließen">✕</button>
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
        <span class="form-label">Überwachungs-Kategorien * <span class="field-hint-inline">(mind. eine)</span></span>
        <div class="categories-grid" role="group" aria-label="Überwachungs-Kategorien">
          {#each categories as cat}
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
      <button class="btn btn-ghost" on:click={handleClose}>Abbrechen</button>
      <button class="btn btn-primary" on:click={handleSave} disabled={saving}>
        {saving ? '⏳ Speichern…' : (editingLocation ? '💾 Änderungen speichern' : '➕ Ort hinzufügen')}
      </button>
    </div>
  </div>
</div>

<style>
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
    padding: 1.5rem 1.5rem 1rem;
    position: sticky;
    top: 0;
    background: var(--card-bg);
    z-index: 1;
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

  /* ── Form ──────────────────────────────────────────── */
  .form-group { margin-bottom: 1.25rem; }

  .form-group label, .form-label, .toggle-label {
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

  .field-error   { color: #fca5a5; font-size: 0.78rem; margin: 0.3rem 0 0; }
  .field-success { color: #86efac; font-size: 0.78rem; margin: 0.3rem 0 0; }
  .field-hint    { color: var(--text-dim); font-size: 0.76rem; margin: 0.25rem 0 0; }
  .field-hint-inline { color: var(--text-dim); font-size: 0.8rem; font-weight: 400; text-transform: none; letter-spacing: 0; }

  /* ── Toggle ──────────────────────────────────────────── */
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

  /* ── Category Checkboxes ─────────────────────────────── */
  .categories-grid { display: grid; gap: 0.45rem; }

  .cat-checkbox {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.7rem 1rem; border-radius: 10px;
    border: 1px solid var(--border); cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: var(--bg); user-select: none;
  }
  .cat-checkbox:hover { border-color: var(--accent); }
  .cat-checkbox.checked { border-color: var(--accent); background: rgba(99, 102, 241, 0.08); }
  .cat-checkbox input { display: none; }
  .cat-content { display: flex; align-items: center; gap: 0.75rem; pointer-events: none; }
  .cat-icon { font-size: 1.3rem; }
  .cat-label { font-size: 0.9rem; font-weight: 500; color: var(--text); }
  .cat-desc  { font-size: 0.72rem; color: var(--text-dim); }

  /* ── Buttons ─────────────────────────────────────────── */
  .btn {
    padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.9rem;
    font-weight: 500; cursor: pointer; border: none;
    transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid transparent; }
  .btn-ghost:hover { color: var(--text); border-color: var(--border); }

  /* ── Alert Banner ────────────────────────────────────── */
  .alert-banner { border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.88rem; }
  .alert-banner.error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  /* ── Close button ────────────────────────────────────── */
  .close-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text-dim); font-size: 1.1rem; padding: 0;
  }
  .close-btn:hover { color: var(--text); }
</style>
