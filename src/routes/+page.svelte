<!-- Landing Page – OSInt Vacation (public) -->
<!-- Shown to unauthenticated visitors; logged-in users are redirected to /dashboard -->
<script>
  export let data;
  $: user = data?.user ?? null;

  // Feature cards
  const FEATURES = [
    { icon: '⛈️', title: 'Unwetter',           desc: 'Sturm, Hagel, Extremregen – via Open-Meteo (WMO Code ≥82 oder Wind ≥70 km/h)' },
    { icon: '🌊', title: 'Hochwasser',           desc: 'Starkregen und Überflutungsrisiken in deiner Region' },
    { icon: '🔥', title: 'Feuer & Waldbrand',    desc: 'Nachrichten über Brände im Umkreis – via GNews API' },
    { icon: '⚠️', title: 'Politische Unruhen',  desc: 'Demonstrationen, Ausschreitungen, Sicherheitswarnungen' },
    { icon: '🌍', title: 'Erdbeben',             desc: 'Seismische Ereignisse ≥ M4.0 im 100-km-Radius – via USGS' },
    { icon: '☀️', title: 'Morgenbericht',        desc: 'Täglich 09:00 Uhr: Wetter + Lageeinschätzung per Telegram' },
  ];

  const SOURCES = [
    { icon: '🌤️', name: 'Open-Meteo' },
    { icon: '📡', name: 'USGS Earthquake' },
    { icon: '📰', name: 'GNews API' },
    { icon: '📱', name: 'Telegram Bot API' },
    { icon: '🗺️', name: 'Nominatim / OSM' },
  ];
</script>

<svelte:head>
  <title>OSInt Vacation – Überwache deine Ferienorte</title>
  <meta name="description" content="Erhalte automatische Telegram-Alerts bei Unwetter, Erdbeben, Feuer oder Unruhen rund ums Ferienhaus – kostenlos, in Echtzeit." />
  <meta property="og:title" content="OSInt Vacation – Dein Ferienort-Frühwarnsystem" />
  <meta property="og:description" content="Verpasse nie wieder kritische Ereignisse rund ums Ferienhaus. Wetter, Erdbeben, Feuer, Unruhen – direkt per Telegram." />
  <meta property="og:type" content="website" />
</svelte:head>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">🛰️ Echtzeit-Überwachung</div>
    <h1>Dein Ferienhaus.<br>Immer im Blick.</h1>
    <p class="hero-sub">
      OSInt Vacation überwacht öffentliche Daten rund um deine europäischen
      Ferienorte und schickt dir sofort eine Telegram-Nachricht, wenn etwas
      Wichtiges passiert.
    </p>
    <div class="hero-cta">
      {#if user}
        <a href="/dashboard" class="btn-cta-primary">Zum Dashboard →</a>
      {:else}
        <a href="/register" class="btn-cta-primary">Kostenlos starten</a>
        <a href="/login"    class="btn-cta-secondary">Anmelden</a>
      {/if}
    </div>
    <p class="hero-hint">Kostenlos · Keine App nötig · Telegram-Alert in &lt; 15 Min.</p>
  </div>
</section>

<!-- FEATURES -->
<section class="features">
  <div class="section-inner">
    <h2>Was OSInt Vacation überwacht</h2>
    <div class="feature-grid">
      {#each FEATURES as f}
        <div class="feature-card">
          <div class="feature-icon">{f.icon}</div>
          <div class="feature-title">{f.title}</div>
          <div class="feature-desc">{f.desc}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how">
  <div class="section-inner narrow">
    <h2>So funktioniert es</h2>
    <ol class="steps">
      <li>
        <span class="step-num">1</span>
        <div><strong>Ort hinterlegen</strong>
          <p>Gib die Adresse deines Ferienhauses ein – Geocoding ermittelt Koordinaten automatisch.</p></div>
      </li>
      <li>
        <span class="step-num">2</span>
        <div><strong>Telegram verbinden</strong>
          <p>Starte den OSInt-Vacation-Bot einmalig und hinterlege deine Chat-ID.</p></div>
      </li>
      <li>
        <span class="step-num">3</span>
        <div><strong>Alerts empfangen</strong>
          <p>Alle 15 Minuten prüfen unsere Wächter Wetter, Erdbeben und Nachrichten.</p></div>
      </li>
      <li>
        <span class="step-num">4</span>
        <div><strong>Täglicher Morgenbericht</strong>
          <p>Täglich 09:00 Uhr: Wetter + politische Lageeinschätzung per Telegram.</p></div>
      </li>
    </ol>
  </div>
</section>

<!-- DATA SOURCES -->
<section class="sources">
  <div class="section-inner" style="text-align:center">
    <h2>Datenquellen</h2>
    <div class="source-chips">
      {#each SOURCES as s}
        <div class="source-chip"><span>{s.icon}</span><span>{s.name}</span></div>
      {/each}
    </div>
    <p class="sources-hint">Alle Quellen sind kostenlos und öffentlich – kein Lock-in.</p>
  </div>
</section>

<!-- CTA BOTTOM -->
{#if !user}
<section class="cta-bottom">
  <div class="section-inner" style="text-align:center">
    <h2>Bereit loszulegen?</h2>
    <p>Erstelle kostenlos ein Konto und füge deinen ersten Ort hinzu.</p>
    <a href="/register" class="btn-cta-primary" style="font-size:1rem">Jetzt registrieren</a>
  </div>
</section>
{/if}

<style>
  /* Override main padding for full-width sections */
  :global(.app > main) { padding: 0 !important; max-width: 100% !important; }

  section { padding: 4.5rem 1.5rem; }
  .section-inner { max-width: 900px; margin: 0 auto; }
  .section-inner.narrow { max-width: 620px; }

  h2 { text-align: center; font-size: 1.75rem; font-weight: 700; color: #e0e0f0; margin-bottom: 2.5rem; }

  /* ── Hero ── */
  .hero {
    background: linear-gradient(160deg, #0d0d22 0%, #1a1a40 55%, #0f1a2e 100%);
    text-align: center;
    padding: 6rem 1.5rem 4.5rem;
    border-bottom: 1px solid #252545;
  }
  .hero-inner { max-width: 700px; margin: 0 auto; }
  .hero-badge {
    display: inline-block; background: #1e1e3e; border: 1px solid #3a3a6a;
    color: #9090c0; padding: 0.3rem 1rem; border-radius: 99px;
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; margin-bottom: 1.75rem;
  }
  h1 {
    font-size: clamp(2.1rem, 5vw, 3.25rem); font-weight: 800;
    line-height: 1.15; color: #f0f0ff; margin-bottom: 1.35rem;
  }
  .hero-sub { color: #8888aa; font-size: 1.05rem; line-height: 1.75; max-width: 560px; margin: 0 auto 2.5rem; }
  .hero-cta { display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .hero-hint { color: #50506a; font-size: 0.8rem; }

  /* Buttons */
  .btn-cta-primary {
    background: #6366f1; color: #fff; padding: 0.8rem 2.1rem;
    border-radius: 10px; font-weight: 600; font-size: 0.975rem;
    display: inline-block; transition: background 0.15s, transform 0.1s;
  }
  .btn-cta-primary:hover { background: #5052d0; transform: translateY(-1px); color: #fff; }
  .btn-cta-secondary {
    background: transparent; border: 1px solid #353558; color: #8080a8;
    padding: 0.8rem 1.6rem; border-radius: 10px; font-weight: 500;
    font-size: 0.975rem; display: inline-block; transition: border-color 0.15s, color 0.15s;
  }
  .btn-cta-secondary:hover { border-color: #6366f1; color: #a0a0f0; }

  /* ── Features ── */
  .features { background: #0c0c1e; border-bottom: 1px solid #1e1e35; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
  .feature-card {
    background: #141428; border: 1px solid #222238; border-radius: 12px;
    padding: 1.5rem; transition: border-color 0.2s;
  }
  .feature-card:hover { border-color: #45457a; }
  .feature-icon { font-size: 1.8rem; margin-bottom: 0.75rem; }
  .feature-title { font-weight: 600; color: #c8c8ec; margin-bottom: 0.4rem; }
  .feature-desc { color: #6a6a8a; font-size: 0.85rem; line-height: 1.55; }

  /* ── How it works ── */
  .how { background: #0f0f1a; border-bottom: 1px solid #1e1e35; }
  .steps { list-style: none; display: flex; flex-direction: column; gap: 1.75rem; }
  .steps li { display: flex; align-items: flex-start; gap: 1.25rem; }
  .step-num {
    background: #6366f1; color: #fff; width: 2rem; height: 2rem;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.85rem; flex-shrink: 0; margin-top: 0.1rem;
  }
  .steps strong { display: block; color: #e0e0f0; margin-bottom: 0.3rem; font-size: 0.975rem; }
  .steps p { color: #6a6a8a; font-size: 0.875rem; line-height: 1.6; margin: 0; }

  /* ── Sources ── */
  .sources { background: #0c0c1e; border-bottom: 1px solid #1e1e35; }
  .source-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-bottom: 1.25rem; }
  .source-chip {
    background: #181830; border: 1px solid #28284a; border-radius: 99px;
    padding: 0.4rem 1.1rem; font-size: 0.875rem; color: #9090b8;
    display: flex; align-items: center; gap: 0.45rem;
  }
  .sources-hint { color: #48486a; font-size: 0.85rem; }

  /* ── CTA Bottom ── */
  .cta-bottom { background: linear-gradient(160deg, #12122a 0%, #1a1a3e 100%); border-top: 1px solid #25254a; }
  .cta-bottom p { color: #70709a; margin-bottom: 2rem; text-align: center; }

  @media (max-width: 600px) {
    .feature-grid { grid-template-columns: 1fr; }
    section { padding: 3rem 1rem; }
    h1 { font-size: 1.9rem; }
  }
</style>
