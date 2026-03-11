<!-- /onboarding – First-login wizard: Telegram setup + first location -->
<!-- Shown once after registration. Sets profiles.onboarding_done = true when complete. -->
<script>
  import { goto } from '$app/navigation';
  import { supabase, geocodeAddress, createLocation, setLocationCategories } from '$lib/supabase.js';

  // ── Wizard step (1 = welcome, 2 = telegram, 3 = first location, 4 = done) ──
  let step = 1;

  // ── Step 2: Telegram ──
  let chatId   = '';
  let testing  = false;
  let testMsg  = null; // null | 'ok' | 'error'
  let testError = null;

  // ── Step 3: Location ──
  let locName    = '';
  let locAddress = '';
  let locLat     = null;
  let locLon     = null;
  let locCountry = '';
  let geocoding  = false;
  let geocodeErr = null;
  let categories = { unwetter: true, hochwasser: false, feuer: true, unruhen: false, erdbeben: false };
  let saving     = false;
  let saveErr    = null;

  const CATEGORY_LIST = [
    { key: 'unwetter',   label: 'Unwetter',          icon: '⛈️' },
    { key: 'hochwasser', label: 'Hochwasser',         icon: '🌊' },
    { key: 'feuer',      label: 'Feuer',              icon: '🔥' },
    { key: 'unruhen',    label: 'Unruhen',            icon: '⚠️' },
    { key: 'erdbeben',   label: 'Erdbeben',           icon: '🌍' },
  ];

  // ── Save Telegram Chat-ID to profiles ──
  async function saveTelegram() {
    if (!chatId.trim()) { step = 3; return; } // skip if empty
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ telegram_chat_id: chatId.trim() }).eq('id', user.id);
    }
    step = 3;
  }

  // ── Test Telegram connection via /api/test-telegram (optional) ──
  async function testTelegram() {
    if (!chatId.trim()) { testError = 'Bitte Chat-ID eingeben.'; return; }
    testing = true; testMsg = null; testError = null;
    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatId.trim() }),
      });
      if (res.ok) { testMsg = 'ok'; }
      else { testMsg = 'error'; testError = (await res.json())?.error ?? 'Test fehlgeschlagen.'; }
    } catch (e) {
      testMsg = 'error'; testError = 'Verbindungsfehler.';
    } finally {
      testing = false;
    }
  }

  // ── Geocode address ──
  async function handleGeocode() {
    if (!locAddress.trim()) return;
    geocoding = true; geocodeErr = null;
    try {
      const r = await geocodeAddress(locAddress);
      if (r) {
        locLat = r.lat; locLon = r.lon;
        locCountry = r.country_code ?? '';
        if (!locName.trim()) locName = r.display_name.split(',')[0].trim();
      } else {
        geocodeErr = 'Adresse nicht gefunden.';
      }
    } catch (e) { geocodeErr = e.message; }
    finally { geocoding = false; }
  }

  // ── Save location + mark onboarding done ──
  async function handleSaveLocation() {
    if (!locLat || !locLon) { saveErr = 'Bitte erst Adresse per 🔍 bestätigen.'; return; }
    const activeCats = Object.entries(categories).filter(([,v]) => v).map(([k]) => k);
    if (activeCats.length === 0) { saveErr = 'Bitte mindestens eine Kategorie auswählen.'; return; }

    saving = true; saveErr = null;
    try {
      const loc = await createLocation({
        name: locName.trim() || locAddress.trim(),
        address: locAddress.trim(),
        latitude: locLat, longitude: locLon,
        country_code: locCountry.toUpperCase(),
        is_active: true,
      });
      await setLocationCategories(loc.id, activeCats);
      await markOnboardingDone();
      step = 4;
    } catch (e) {
      saveErr = 'Speichern fehlgeschlagen: ' + e.message;
    } finally { saving = false; }
  }

  // ── Skip location step, just mark done ──
  async function skipLocation() {
    await markOnboardingDone();
    step = 4;
  }

  async function markOnboardingDone() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ onboarding_done: true }).eq('id', user.id);
    }
  }
</script>

<svelte:head><title>Einrichtung – OSInt Vacation</title></svelte:head>

<div class="onboarding-page">
  <div class="onboarding-card">

    <!-- Progress bar -->
    {#if step < 4}
      <div class="progress-bar">
        {#each [1,2,3] as s}
          <div class="progress-step" class:done={step > s} class:active={step === s}>{s}</div>
          {#if s < 3}<div class="progress-line" class:done={step > s}></div>{/if}
        {/each}
      </div>
    {/if}

    <!-- ── Step 1: Welcome ── -->
    {#if step === 1}
      <div class="step-content center">
        <div class="step-icon">🛰️</div>
        <h1>Willkommen bei OSInt Vacation!</h1>
        <p>In nur 2 Schritten richtest du deine Ferienhaus-Überwachung ein.</p>
        <ul class="welcome-list">
          <li>📱 <strong>Telegram verbinden</strong> – für deine Alerts</li>
          <li>📍 <strong>Ersten Ort hinzufügen</strong> – dein Ferienhaus</li>
        </ul>
        <button class="btn-primary" on:click={() => step = 2}>Los geht's →</button>
      </div>

    <!-- ── Step 2: Telegram ── -->
    {:else if step === 2}
      <div class="step-content">
        <h1>📱 Telegram verbinden</h1>
        <p class="step-desc">Damit du Alerts empfangen kannst, benötigen wir deine Telegram Chat-ID.</p>

        <div class="telegram-guide">
          <div class="guide-step">
            <span class="guide-num">1</span>
            <span>Öffne Telegram und suche nach <strong>@userinfobot</strong></span>
          </div>
          <div class="guide-step">
            <span class="guide-num">2</span>
            <span>Sende <code>/start</code> – der Bot antwortet mit deiner Chat-ID</span>
          </div>
          <div class="guide-step">
            <span class="guide-num">3</span>
            <span>Trage die ID unten ein (z.B. <code>158814280</code>)</span>
          </div>
        </div>

        <div class="form-group">
          <label for="chat-id">Deine Telegram Chat-ID</label>
          <div class="input-row">
            <input
              id="chat-id" type="text" bind:value={chatId}
              placeholder="z.B. 158814280"
              disabled={testing}
            />
            <button class="btn-test" on:click={testTelegram} disabled={testing || !chatId.trim()}>
              {testing ? '⏳' : '🔔 Test'}
            </button>
          </div>
        </div>

        {#if testMsg === 'ok'}
          <div class="success-msg">✅ Test-Nachricht erfolgreich gesendet!</div>
        {:else if testMsg === 'error'}
          <div class="error-msg">❌ {testError}</div>
        {/if}

        <div class="step-footer">
          <button class="btn-ghost" on:click={() => step = 3}>Überspringen</button>
          <button class="btn-primary" on:click={saveTelegram}>Weiter →</button>
        </div>
      </div>

    <!-- ── Step 3: First location ── -->
    {:else if step === 3}
      <div class="step-content">
        <h1>📍 Ersten Ort hinzufügen</h1>
        <p class="step-desc">Wo liegt dein Ferienhaus? Wir überwachen dann diese Region.</p>

        <div class="form-group">
          <label for="loc-address">Adresse <span class="required">*</span></label>
          <div class="input-row">
            <input
              id="loc-address" type="text" bind:value={locAddress}
              placeholder="z.B. Via Roma 12, Florenz, Italien"
              disabled={geocoding}
            />
            <button class="btn-test" on:click={handleGeocode} disabled={geocoding || !locAddress.trim()}>
              {geocoding ? '⏳' : '🔍'}
            </button>
          </div>
          {#if geocodeErr}<div class="error-msg">{geocodeErr}</div>{/if}
          {#if locLat}<div class="coords-ok">✅ {locLat.toFixed(4)}, {locLon.toFixed(4)}</div>{/if}
        </div>

        <div class="form-group">
          <label for="loc-name">Name (optional)</label>
          <input id="loc-name" type="text" bind:value={locName} placeholder="z.B. Ferienhaus Toskana" />
        </div>

        <div class="form-group">
          <label>Kategorien überwachen</label>
          <div class="cat-grid">
            {#each CATEGORY_LIST as cat}
              <label class="cat-toggle" class:active={categories[cat.key]}>
                <input type="checkbox" bind:checked={categories[cat.key]} />
                {cat.icon} {cat.label}
              </label>
            {/each}
          </div>
        </div>

        {#if saveErr}<div class="error-msg">{saveErr}</div>{/if}

        <div class="step-footer">
          <button class="btn-ghost" on:click={skipLocation}>Überspringen</button>
          <button class="btn-primary" on:click={handleSaveLocation} disabled={saving || !locLat}>
            {saving ? '⏳ Speichern…' : '➕ Ort hinzufügen →'}
          </button>
        </div>
      </div>

    <!-- ── Step 4: Done ── -->
    {:else}
      <div class="step-content center">
        <div class="step-icon">🎉</div>
        <h1>Alles bereit!</h1>
        <p>OSInt Vacation überwacht jetzt deine Orte und benachrichtigt dich via Telegram.</p>
        <p class="hint">Die ersten Alerts kommen innerhalb der nächsten 15 Minuten, der Morgenbericht täglich um 09:00 Uhr.</p>
        <a href="/dashboard" class="btn-primary" style="display:inline-block">Zum Dashboard →</a>
      </div>
    {/if}

  </div>
</div>

<style>
  .onboarding-page {
    min-height: 80vh; display: flex; align-items: center;
    justify-content: center; padding: 2rem 1rem;
  }
  .onboarding-card {
    background: #1c1c2e; border: 1px solid #2a2a3e;
    border-radius: 16px; padding: 2.5rem 2rem;
    width: 100%; max-width: 500px;
  }

  /* Progress bar */
  .progress-bar {
    display: flex; align-items: center; justify-content: center;
    gap: 0; margin-bottom: 2rem;
  }
  .progress-step {
    width: 2rem; height: 2rem; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; font-size: 0.85rem;
    font-weight: 700; background: #2a2a3e; color: #555; border: 2px solid #3a3a55;
    z-index: 1;
  }
  .progress-step.active { background: #6366f1; color: #fff; border-color: #6366f1; }
  .progress-step.done   { background: #3a5a3a; color: #7fc97f; border-color: #4a7a4a; }
  .progress-line {
    flex: 1; height: 2px; background: #2a2a3e; max-width: 80px;
  }
  .progress-line.done { background: #4a7a4a; }

  /* Step content */
  .step-content { }
  .step-content.center { text-align: center; }
  .step-icon { font-size: 3rem; margin-bottom: 1rem; }
  h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.6rem; color: #e0e0f0; }
  .step-desc { color: #777; font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.6; }
  .hint { color: #666; font-size: 0.85rem; margin: 0.75rem 0 1.5rem; line-height: 1.6; }

  /* Welcome list */
  .welcome-list { list-style: none; text-align: left; margin: 1.25rem auto 2rem; max-width: 280px; }
  .welcome-list li { padding: 0.5rem 0; color: #9090c0; font-size: 0.9rem; }

  /* Telegram guide */
  .telegram-guide { background: #141428; border: 1px solid #222240; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
  .guide-step { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.5rem 0; font-size: 0.875rem; color: #9090b0; }
  .guide-num {
    background: #6366f1; color: #fff; width: 1.5rem; height: 1.5rem;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  }
  code { background: #222238; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.82rem; color: #a0a0c8; }

  /* Form */
  .form-group { margin-bottom: 1.25rem; }
  label { display: block; font-size: 0.875rem; color: #aaa; margin-bottom: 0.4rem; }
  .required { color: #f87272; }
  .input-row { display: flex; gap: 0.5rem; }
  .input-row input { flex: 1; }

  .btn-test {
    background: #2a2a3e; border: 1px solid #3a3a55; color: #bbb;
    border-radius: 8px; padding: 0 1rem; font-size: 0.875rem; white-space: nowrap;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-test:hover:not(:disabled) { background: #343452; }
  .btn-test:disabled { opacity: 0.4; cursor: not-allowed; }

  .coords-ok { color: #7fc97f; font-size: 0.8rem; margin-top: 0.35rem; }
  .success-msg { color: #7fc97f; font-size: 0.875rem; margin: 0.5rem 0; }
  .error-msg { color: #f87272; font-size: 0.875rem; margin: 0.5rem 0; }

  /* Categories */
  .cat-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
  .cat-toggle {
    display: flex; align-items: center; gap: 0.35rem;
    background: #1e1e34; border: 1px solid #2a2a45; border-radius: 99px;
    padding: 0.3rem 0.85rem; font-size: 0.82rem; color: #777; cursor: pointer;
    transition: all 0.15s;
  }
  .cat-toggle input { display: none; }
  .cat-toggle.active { background: #2a2a50; border-color: #6366f1; color: #a0a0f0; }

  /* Footer buttons */
  .step-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.75rem; gap: 0.75rem; }
  .btn-primary {
    background: #6366f1; color: #fff; border: none; border-radius: 8px;
    padding: 0.7rem 1.75rem; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: background 0.15s; text-decoration: none;
  }
  .btn-primary:hover:not(:disabled) { background: #5052d0; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost {
    background: transparent; border: 1px solid #2a2a3e; color: #666;
    border-radius: 8px; padding: 0.7rem 1.1rem; font-size: 0.875rem;
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  .btn-ghost:hover { border-color: #4a4a65; color: #999; }
</style>
