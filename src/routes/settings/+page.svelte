<script>
  import { version } from '$app/environment';
  import { supabase } from '$lib/supabase.js';
  import { toast } from '$lib/toastStore.js';

  // ── Server data (loaded via +page.server.js, no onMount needed) ────
  /** @type {import('./$types').PageData} */
  export let data;

  // ── State ──────────────────────────────────────────────────────────
  // Profile and chatId are initialised from server-loaded data.
  // loading is false from the start since SSR already fetched the data.
  let profile = data.profile;
  let loading = false;

  let chatId = profile?.telegram_chat_id ?? '';
  let saving = false;

  let testing = false;

  // ── Save Chat ID ───────────────────────────────────────────────────
  async function handleSave() {
    const trimmed = chatId.trim();
    if (!trimmed) {
      toast.error('⚠️ Bitte eine Telegram Chat-ID eingeben.');
      return;
    }
    if (!/^-?\d+$/.test(trimmed)) {
      toast.error('⚠️ Chat-ID muss eine Zahl sein (z.B. 158814280 oder -100123456789 für Gruppen).');
      return;
    }

    saving = true;

    try {
      if (profile) {
        const { error: err } = await supabase
          .from('profiles')
          .update({ telegram_chat_id: trimmed, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
        if (err) throw err;
      } else {
        // No profile yet – would need user.id in real auth setup
        // For now store without user_id (single-user mode)
        const { data: newProfile, error: err } = await supabase
          .from('profiles')
          .insert({ telegram_chat_id: trimmed })
          .select()
          .single();
        if (err) throw err;
        profile = newProfile;
      }
      toast.success('✅ Chat-ID erfolgreich gespeichert!');
    } catch (e) {
      toast.error('⚠️ Speichern fehlgeschlagen: ' + e.message);
    } finally {
      saving = false;
    }
  }

  // ── Test Telegram ──────────────────────────────────────────────────
  async function handleTestTelegram() {
    const trimmed = chatId.trim();
    if (!trimmed) {
      toast.error('⚠️ Bitte zuerst eine Chat-ID eingeben und speichern.');
      return;
    }

    testing = true;

    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: trimmed }),
      });
      const body = await res.json();

      if (res.ok && body.ok) {
        toast.success('✅ Test-Nachricht erfolgreich gesendet!');
      } else {
        toast.error('❌ ' + (body.userMessage ?? body.message ?? 'Test fehlgeschlagen.'));
      }
    } catch (e) {
      toast.error('❌ Verbindungsfehler: ' + e.message);
    } finally {
      testing = false;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function getChatIdHelp() {
    return `So findest du deine Telegram Chat-ID:
1. Starte deinen Bot mit /start
2. Öffne: https://api.telegram.org/bot<DEIN_TOKEN>/getUpdates
3. Suche nach "id" unter "from" oder "chat"`;
  }
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1>Einstellungen</h1>
      <p class="subtitle">Telegram-Konfiguration und App-Informationen</p>
    </div>
  </div>

  <!-- ── Telegram Section ─────────────────────────────────── -->
  <section class="settings-section">
    <div class="section-header">
      <h2>📲 Telegram</h2>
      <p>Konfiguriere, wohin deine Alerts und der Morgenbericht gesendet werden.</p>
    </div>

    <div class="settings-card">
      {#if loading}
        <div class="loading-row">
          <div class="spinner"></div>
          <span>Lade Einstellungen…</span>
        </div>
      {:else}
        <!-- Chat ID Input -->
        <div class="form-group">
          <label for="chat-id">Telegram Chat-ID</label>
          <div class="input-row">
            <input
              id="chat-id"
              type="text"
              bind:value={chatId}
              placeholder="z.B. 158814280"
              on:keydown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              class="btn btn-primary"
              on:click={handleSave}
              disabled={saving}
            >
              {saving ? '⏳' : '💾'} {saving ? 'Speichern…' : 'Speichern'}
            </button>
          </div>

          <details class="help-details">
            <summary>Wie finde ich meine Chat-ID?</summary>
            <pre class="help-text">{getChatIdHelp()}</pre>
          </details>
        </div>

        <!-- Test button -->
        <div class="form-group">
          <span class="form-label">Verbindung testen</span>
          <button
            class="btn btn-secondary"
            aria-label="Telegram-Verbindung testen"
            on:click={handleTestTelegram}
            disabled={testing || !chatId.trim()}
          >
            {testing ? '⏳ Teste…' : '🔔 Telegram testen'}
          </button>

        </div>

        <!-- Current status -->
        <div class="status-row">
          <span class="status-label">Status</span>
          {#if chatId.trim()}
            <span class="status-badge active">✅ Konfiguriert (ID: {chatId})</span>
          {:else}
            <span class="status-badge inactive">⚠️ Keine Chat-ID hinterlegt</span>
          {/if}
        </div>
      {/if}
    </div>
  </section>

  <!-- ── Monitoring Section ──────────────────────────────── -->
  <section class="settings-section">
    <div class="section-header">
      <h2>⚙️ Monitoring-Konfiguration</h2>
      <p>Diese Einstellungen werden über GitHub Actions und die Python-Scripts gesteuert.</p>
    </div>

    <div class="settings-card info-card">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Monitor-Intervall</div>
          <div class="info-value">Alle 15 Minuten</div>
          <div class="info-sub">via GitHub Actions Cron</div>
        </div>
        <div class="info-item">
          <div class="info-label">Morgenbericht</div>
          <div class="info-value">09:00 Uhr CEST</div>
          <div class="info-sub">Täglich (07:00 UTC)</div>
        </div>
        <div class="info-item">
          <div class="info-label">Deduplizierung</div>
          <div class="info-value">2 Stunden</div>
          <div class="info-sub">Kein doppelter Alert</div>
        </div>
        <div class="info-item">
          <div class="info-label">Erdbeben-Schwelle</div>
          <div class="info-value">M ≥ 4.0</div>
          <div class="info-sub">Radius: 100 km</div>
        </div>
        <div class="info-item">
          <div class="info-label">Unwetter-Wind</div>
          <div class="info-value">≥ 70 km/h</div>
          <div class="info-sub">WMO Codes ≥ 82</div>
        </div>
        <div class="info-item">
          <div class="info-label">News-Quellen</div>
          <div class="info-value">GNews API</div>
          <div class="info-sub">Feuer, Unruhen, Hochwasser</div>
        </div>
      </div>

      <div class="actions-link">
        <a
          href="https://github.com/cryptoclemens/osint-location-monitor/actions"
          target="_blank"
          rel="noopener noreferrer"
          class="link-btn"
        >
          🔗 GitHub Actions öffnen →
        </a>
      </div>
    </div>
  </section>

  <!-- ── App Info ───────────────────────────────────────── -->
  <section class="settings-section">
    <div class="section-header">
      <h2>ℹ️ App-Informationen</h2>
    </div>

    <div class="settings-card info-card">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Version</div>
          <div class="info-value">{version}</div>
          <div class="info-sub">Milestone 10 – Polish & Developer Experience</div>
        </div>
        <div class="info-item">
          <div class="info-label">Frontend</div>
          <div class="info-value">SvelteKit</div>
          <div class="info-sub">PWA, Mobile-first</div>
        </div>
        <div class="info-item">
          <div class="info-label">Datenbank</div>
          <div class="info-value">Supabase</div>
          <div class="info-sub">PostgreSQL + RLS</div>
        </div>
        <div class="info-item">
          <div class="info-label">Geocoding</div>
          <div class="info-value">Nominatim</div>
          <div class="info-sub">OpenStreetMap, kostenlos</div>
        </div>
        <div class="info-item">
          <div class="info-label">Wetter</div>
          <div class="info-value">Open-Meteo</div>
          <div class="info-sub">Kostenlos, kein API-Key</div>
        </div>
        <div class="info-item">
          <div class="info-label">Erdbeben</div>
          <div class="info-value">USGS</div>
          <div class="info-sub">Kostenlos, kein API-Key</div>
        </div>
      </div>

      <div class="actions-link">
        <a
          href="https://github.com/cryptoclemens/osint-location-monitor"
          target="_blank"
          rel="noopener noreferrer"
          class="link-btn"
        >
          📁 GitHub Repository →
        </a>
      </div>
    </div>
  </section>
</div>

<style>
  /* ── Page ────────────────────────────────────────────────── */
  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header { margin-bottom: 2rem; }
  .page-header h1 { margin: 0 0 0.25rem; font-size: 1.75rem; color: var(--text); }
  .subtitle { margin: 0; color: var(--text-dim); font-size: 0.9rem; }

  /* ── Section ─────────────────────────────────────────────── */
  .settings-section { margin-bottom: 2.5rem; }

  .section-header { margin-bottom: 1rem; }
  .section-header h2 { margin: 0 0 0.3rem; font-size: 1.2rem; color: var(--text); }
  .section-header p { margin: 0; font-size: 0.85rem; color: var(--text-dim); }

  /* ── Card ────────────────────────────────────────────────── */
  .settings-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .info-card { }

  /* ── Loading ─────────────────────────────────────────────── */
  .loading-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  .spinner {
    width: 24px; height: 24px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Form ────────────────────────────────────────────────── */
  .form-group { margin-bottom: 1.5rem; }
  .form-group:last-child { margin-bottom: 0; }

  .form-group label, .form-label {
    display: block;
    font-size: 0.82rem;
    color: var(--text-dim);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.5rem;
  }

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

  input:focus { outline: none; border-color: var(--accent); }

  .input-row { display: flex; gap: 0.5rem; }
  .input-row input { flex: 1; }
  .input-row .btn { flex-shrink: 0; }

  .field-success { color: #86efac; font-size: 0.8rem; margin: 0.35rem 0 0; }
  .field-error { color: #fca5a5; font-size: 0.8rem; margin: 0.35rem 0 0; }

  /* ── Help details ────────────────────────────────────────── */
  .help-details {
    margin-top: 0.75rem;
    font-size: 0.82rem;
  }

  .help-details summary {
    cursor: pointer;
    color: var(--accent);
    font-size: 0.82rem;
  }

  .help-text {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;
    font-size: 0.78rem;
    color: var(--text-dim);
    white-space: pre-wrap;
    font-family: monospace;
  }

  /* ── Test result ─────────────────────────────────────────── */
  .test-result {
    margin-top: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .test-result.info {
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
  }

  .test-result.success {
    background: rgba(134,239,172,0.1);
    border: 1px solid rgba(134,239,172,0.3);
    color: #86efac;
  }

  .test-result.error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
  }

  /* ── Status Row ──────────────────────────────────────────── */
  .status-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .status-label { font-size: 0.82rem; color: var(--text-dim); }

  .status-badge {
    font-size: 0.82rem;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .status-badge.active {
    background: rgba(134,239,172,0.1);
    color: #86efac;
    border: 1px solid rgba(134,239,172,0.3);
  }

  .status-badge.inactive {
    background: rgba(251,191,36,0.1);
    color: #fbbf24;
    border: 1px solid rgba(251,191,36,0.3);
  }

  /* ── Info Grid ───────────────────────────────────────────── */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: 480px) {
    .info-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .info-item {
    padding: 0.75rem;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .info-label { font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
  .info-value { font-size: 0.95rem; font-weight: 600; color: var(--text); }
  .info-sub { font-size: 0.72rem; color: var(--text-dim); margin-top: 0.15rem; }

  .actions-link { border-top: 1px solid var(--border); padding-top: 1rem; }

  .link-btn {
    font-size: 0.85rem;
    color: var(--accent);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .link-btn:hover { text-decoration: underline; }

  /* ── Buttons ─────────────────────────────────────────────── */
  .btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s;
  }

  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }

  /* ── Banner ──────────────────────────────────────────────── */
  .banner {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.88rem;
  }

  .banner.error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.4);
    color: #fca5a5;
  }
</style>
