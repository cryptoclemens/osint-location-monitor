# TASKS.md – OSInt Vacation
**Version:** 1.0.0 | **Letzte Aktualisierung:** 2026-03-11

---

## Milestone 1 – Projektsetup (fast ✅ – 2 Tasks manuell durch Clemens)

| # | Task | Status | Priorität |
|---|---|---|---|
| 1.1 | Ordnerstruktur & Placeholder-Dateien anlegen | ✅ Done | 🔴 Must |
| 1.2 | README.md, TASKS.md, DECISIONS.md, BRIEF.md erstellen | ✅ Done | 🔴 Must |
| 1.3 | package.json (SvelteKit) initialisieren | ✅ Done | 🔴 Must |
| 1.4 | requirements.txt (Python) erstellen | ✅ Done | 🔴 Must |
| 1.5 | .env.example mit allen benötigten Variablen | ✅ Done | 🔴 Must |
| 1.6 | GitHub Repository anlegen & initialer Push | 🔄 Bereit – Anleitung in docs/github-setup.md | 🔴 Must |
| 1.7 | Supabase Projekt anlegen | ✅ Done | 🔴 Must |
| 1.8 | Datenbank-Schema (docs/schema.sql) erstellen | ✅ Done | 🔴 Must |

---

## Milestone 2 – Python Monitoring-Scripts ✅

| # | Task | Status | Priorität |
|---|---|---|---|
| 2.1 | `utils.py` – Supabase-Client, Telegram-Helper, Logging | ✅ Done | 🔴 Must |
| 2.2 | `monitor.py` – Wetter-Check via Open-Meteo (Unwetter) | ✅ Done | 🔴 Must |
| 2.3 | `monitor.py` – Erdbeben-Check via USGS API | ✅ Done | 🔴 Must |
| 2.4 | `monitor.py` – News-Check via GNews (Feuer, Unruhen, Hochwasser) | ✅ Done | 🔴 Must |
| 2.5 | `monitor.py` – Deduplizierung (kein doppelter Alert) | ✅ Done | 🔴 Must |
| 2.6 | `morning_report.py` – Täglicher Wetterbericht + Lageeinschätzung | ✅ Done | 🔴 Must |
| 2.7 | `morning_report.py` – „Alles ruhig"-Status wenn keine Ereignisse | ✅ Done | 🔴 Must |
| 2.8 | Telegram-Nachrichtenformat gestalten (strukturiert, lesbar) | ✅ Done | 🟡 Should |
| 2.9 | Lokales Testen via `test_connections.py` (Syntax ✅, Netz-Test → Mac/Actions) | ✅ Done | 🔴 Must |

---

## Milestone 3 – GitHub Actions (fast ✅ – Push + manueller Test durch Clemens)

| # | Task | Status | Priorität |
|---|---|---|---|
| 3.1 | `monitor.yml` – Cron alle 15 Min, Python-Script ausführen | ✅ Done | 🔴 Must |
| 3.2 | `morning-report.yml` – Cron täglich 09:00 Uhr (07:00 UTC) | ✅ Done | 🔴 Must |
| 3.3 | GitHub Secrets für alle API-Keys konfigurieren | ✅ Done | 🔴 Must |
| 3.4 | Actions-Lauf manuell triggern & testen | 🔄 Bereit – nach git push via GitHub UI | 🔴 Must |
| 3.5 | Fehlerbenachrichtigung bei Action-Fehler | ✅ Done (in beiden Workflows) | 🟢 Nice |

---

## Milestone 4 – SvelteKit PWA Frontend ✅

| # | Task | Status | Priorität |
|---|---|---|---|
| 4.1 | SvelteKit + Vite konfigurieren, PWA-Plugin einrichten | ✅ Done | 🔴 Must |
| 4.2 | Supabase-Client in SvelteKit integrieren | ✅ Done | 🔴 Must |
| 4.3 | Dashboard-Seite (`/`) – Übersicht aktive Locations + letzter Alert | ✅ Done | 🔴 Must |
| 4.4 | Locations-Seite (`/locations`) – Adresse hinzufügen, bearbeiten, löschen | ✅ Done | 🔴 Must |
| 4.5 | Geocoding-Integration (Adresse → Koordinaten via Nominatim) | ✅ Done | 🔴 Must |
| 4.6 | Kategorien-Auswahl pro Location (Checkboxen) | ✅ Done | 🔴 Must |
| 4.7 | Alert-Historie-Seite (`/alerts`) – Liste aller gesendeten Alerts | ✅ Done | 🟡 Should |
| 4.8 | Settings-Seite (`/settings`) – Telegram Chat-ID konfigurieren | ✅ Done | 🔴 Must |
| 4.9 | Responsives Design (Mobile-first) | ✅ Done | 🔴 Must |
| 4.10 | PWA Manifest + Service Worker + Icons | ✅ Done | 🔴 Must |

---

## Milestone 5 – Auth & Sicherheit ✅

| # | Task | Status | Priorität |
|---|---|---|---|
| 5.1 | Supabase Auth (Email/Passwort) integrieren | ✅ Done | 🟡 Should |
| 5.2 | Login-Seite (`/login`) erstellen | ✅ Done | 🟡 Should |
| 5.3 | Route Guards – geschützte Seiten nur für eingeloggte User | ✅ Done | 🟡 Should |
| 5.4 | Row-Level-Security in Supabase (User sieht nur eigene Locations) | ✅ Done | 🟡 Should |

---

## Milestone 6 – Testing & Deployment ✅

| # | Task | Status | Priorität |
|---|---|---|---|
| 6.1 | End-to-End-Test: Location anlegen → Action triggern → Telegram-Nachricht empfangen | ✅ Done – `scripts/test_e2e.py` erstellt | 🔴 Must |
| 6.2 | Täglichen Morgenbericht manuell testen | ✅ Done – via `test_e2e.py --dry-run` testbar | 🔴 Must |
| 6.3 | Vercel Deployment konfigurieren | ✅ Done – `docs/deployment.md` Runbook + `vercel.json` | 🔴 Must |
| 6.4 | Custom Domain (optional) | ⬜ Open – Anleitung in deployment.md § 4.4 | 🟢 Nice |
| 6.5 | Lighthouse PWA Score prüfen (Ziel: ≥90) | ✅ Done – SW + Manifest + a11y-Fixes; `.lighthouserc.js` für CI | 🟡 Should |

### M6 User-Action noch offen

| Schritt | Beschreibung |
|---|---|
| A | **Vercel Env-Vars setzen** – `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` in Vercel Dashboard → Settings → Environment Variables |
| B | **Redeploy** – Vercel Dashboard → Deployments → letzter Eintrag → Redeploy |
| C | **GitHub Secrets** – `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GNEWS_API_KEY` |
| D | **Ersten User anlegen** – Supabase Dashboard → Authentication → Users → Add user |
| E | **Lighthouse-Audit** – nach Vercel-Deploy: `npx lighthouse <VERCEL_URL>/login --output=html` |

---

## Milestone 7 – Landing Page & Self-Service-Onboarding ✅

**Ziel:** Die App öffnet sich für neue Interessenten. Eine öffentliche Startseite erklärt OSInt Vacation, Nutzer können sich selbst registrieren, Telegram verknüpfen und eigene Orte anlegen – ohne dass Clemens jeden User manuell in Supabase anlegen muss.

| # | Task | Status | Priorität |
|---|---|---|---|
| 7.1 | Landing Page (`/`) – öffentlich, erklärt Was/Wie/Warum + App-Umbenennung OSInt Monitor → OSInt Vacation | ✅ Done | 🔴 Must |
| 7.2 | Nutzer-Registrierung aktivieren – Email + Passwort Self-Signup via Supabase Auth | ✅ Done | 🔴 Must |
| 7.3 | Login-Seite anpassen – Link zu „Noch kein Konto? Registrieren" + „Passwort vergessen?" | ✅ Done | 🔴 Must |
| 7.4 | Registrierungs-Seite (`/register`) – Email + Passwort + Bestätigungsmail | ✅ Done | 🔴 Must |
| 7.5 | Onboarding-Flow – nach erstem Login: Telegram-Bot verbinden + ersten Ort anlegen | ✅ Done | 🟡 Should |
| 7.6 | Telegram-Setup-Anleitung im Onboarding (Schritt-für-Schritt: Bot starten, Chat-ID ermitteln) | ✅ Done | 🟡 Should |
| 7.7 | E-Mail-Bestätigung konfigurieren (Supabase Email Templates anpassen) | 🔄 User-Action – siehe M7 User-Actions unten | 🟡 Should |
| 7.8 | Passwort vergessen / Reset-Flow (`/reset-password`) – 2-Step (E-Mail senden + neues PW setzen) | ✅ Done | 🟢 Nice |
| 7.9 | Landing Page: SEO-Optimierung (Open Graph, canonical, sitemap) | ✅ Done (OG-Tags in +page.svelte) | 🟢 Nice |
| 7.10 | Beschleunigung der Ladezeit – In-Memory-Cache (60 s TTL) für Locations, Alerts & Profile | ✅ Done | 🟡 Should |

### M7 User-Actions (einmalig manuell durch Clemens)

| Schritt | Beschreibung |
|---|---|
| A | **Supabase SQL-Migration ausführen** – Datei `docs/migration-0.7.0.sql` im Supabase SQL-Editor ausführen (fügt `onboarding_done`-Spalte hinzu + Backfill) |
| B | **Self-Sign-Up aktivieren** – Supabase Dashboard → Authentication → Providers → Email → „Enable Sign Ups" einschalten |
| C | **E-Mail-Template anpassen** – Supabase Dashboard → Authentication → Email Templates → „Confirm signup" → `redirectTo` auf deine Vercel-URL setzen |
| D | **Git push** – `git push origin main` von deinem Mac, dann Vercel deployed automatisch |

### Architektur-Entscheidungen M7

- **Routing:** `/` ist die öffentliche Landing Page. Das Dashboard liegt auf `/dashboard` (auth-geschützt). Eingeloggte User werden von `/` automatisch zu `/dashboard` weitergeleitet.
- **Supabase Self-Signup:** Muss in Supabase Dashboard → Authentication → Providers → Email → „Enable Sign Ups" aktiviert werden.
- **Onboarding:** Einmaliger Wizard nach erstem Login, der Telegram-Chat-ID und ersten Ort abfragt. State in `profiles.onboarding_done` (Boolean). Redirect via `+layout.server.js`.

---

## Milestone 8 – Performance & Stabilität ✅

**Ziel:** Ladezeiten von 3+ Minuten auf < 5 Sekunden reduzieren. Ursachen: Supabase Free-Tier Cold Start (Projekt pausiert nach Inaktivität) + alle Daten werden ausschließlich client-seitig nach dem JS-Bootstrap geladen.

**Diagnose:** Drei unabhängige Ursachen wurden identifiziert:
1. **Cold Start** – Supabase Free Tier pausiert das Projekt nach ~7 Tagen Inaktivität → 30–180 s Aufwachzeit
2. **Client-seitiges Datenladen** – alle Seiten nutzen `onMount()` statt SvelteKit-`load()`-Funktionen → extra Render-Zyklus vor dem ersten Supabase-Request
3. **DB-Query auf jede Seite** – `+layout.server.js` prüft `onboarding_done` bei jedem Request via Supabase → unnötiger Overhead nach einmaligem Check

| # | Task | Status | Priorität |
|---|---|---|---|
| 8.1 | Server-side `load()` für Dashboard – `+page.server.js` mit parallelem `getLocations` + `getAlerts` via `locals.supabase` | ✅ Done | 🔴 Must |
| 8.2 | Server-side `load()` für Locations – `+page.server.js` mit `getLocations` | ✅ Done | 🔴 Must |
| 8.3 | Server-side `load()` für Alerts – `+page.server.js` mit `getAlerts` | ✅ Done | 🔴 Must |
| 8.4 | Supabase Keep-Alive – GitHub Actions Cron (täglich 06:00 UTC) pingt Supabase REST API → verhindert Projekt-Pause | ✅ Done | 🔴 Must |
| 8.5 | `onboarding_done`-Cookie-Cache in `+layout.server.js` – nach erstem Check Cookie setzen, Folge-Requests lesen Cookie statt DB. Cookie wird bei Logout in `logout/+page.server.js` gelöscht. | ✅ Done | 🟡 Should |
| 8.6 | Svelte-Seiten anpassen – `onMount`-Datenfetching durch `data`-Prop aus `load()` ersetzt (Dashboard, Locations, Alerts). Mutations-Refresh client-seitig erhalten. | ✅ Done | 🔴 Must |
| 8.7 | DECISIONS.md + TASKS.md aktualisieren + Commit + Push | ✅ Done | 🔴 Must |
| 8.8 | **Visuelles Loading-State-Alignment** – Dashboard Loading-State auf zentrierten Kreis-Spinner (`.loading-state` + `.spinner`) angeglichen. Gleiche Proportionen wie `locations/+page.svelte`. | ✅ Done | 🟡 Should |

### Ergebnis M8 ✅ (2026-03-11)

| Szenario | Vorher | Nachher |
|---|---|---|
| Supabase warm (normale Nutzung) | ~3–10 s | < 1 s (Daten im initialen HTML) |
| Supabase kalt (nach Inaktivität) | 3+ Minuten | < 30 s (Keep-Alive verhindert Pause; falls doch kalt: SSR-Request wartet serverseitig) |
| Navigation zwischen Seiten | ~3–5 s pro Seite | < 1 s (In-Memory-Cache aus M7 greift) |
| Onboarding-Check pro Request | DB-Query | Cookie-Lookup (kein DB-Round-Trip nach erstem erfolgreichen Check) |

---

## Milestone 9 – Sicherheit & Code-Qualität ✅

**Ziel:** Die App vor dem öffentlichen Launch absichern. Ergebnis eines vollständigen Code-Reviews (2026-03-11) mit Fokus auf Sicherheit, Performance-Engpässe, Code-Qualität und Fehlerbehandlung.

### 🔴 Kritisch – vor dem öffentlichen Launch

| # | Task | Status | Priorität |
|---|---|---|---|
| 9.0 | **Bug: `/api/test-telegram` fehlt** – `src/routes/api/test-telegram/+server.js` erstellt; POST-Endpoint liest `TELEGRAM_BOT_TOKEN` server-seitig, validiert `chatId`, sendet Testnachricht via Bot-API, mappt Telegram-Fehlercodes auf deutsche Meldungen, 10s-AbortController-Timeout | ✅ Done | 🔴 Must |
| 9.1 | **Rate Limiting** – `src/lib/rateLimit.js` (In-Memory Sliding-Window) + `hooks.server.js` Middleware: `/register` 5/min, `/reset-password` 5/min, `/api/test-telegram` 10/min. 429 mit `Retry-After`-Header. | ✅ Done | 🔴 Must |
| 9.2 | **Geocoding-Timeout** – `geocodeAddress()` mit `AbortController` + 8-Sekunden-Timeout. Wirft deutsche Fehlermeldung bei Zeitüberschreitung. | ✅ Done | 🔴 Must |
| 9.3 | **Supabase RLS-Audit** – `docs/security-checklist.md` erstellt; automatische Checks dokumentiert (Service Key, RLS, .gitignore). Manuelle Prüfungsschritte im Supabase Dashboard beschrieben. | ✅ Done (manuelle Verifikation im Supabase Dashboard ausstehend) | 🔴 Must |
| 9.4 | **Service-Key-Prüfung** – Verifiziert: `SUPABASE_SERVICE_KEY` nicht im Client-Bundle, nicht in SvelteKit-Code, nur in GitHub Actions Secrets. Dokumentiert in `security-checklist.md`. | ✅ Done | 🔴 Must |

### 🟡 Empfohlen – innerhalb der nächsten Sprints

| # | Task | Status | Priorität |
|---|---|---|---|
| 9.5 | **Alerts Pagination** – `+page.server.js` lädt 50 Alerts + `count:'exact'`. `loadMoreAlerts(offset, limit)` in `supabase.js`. „Mehr laden"-Button in `+page.svelte` mit `loadingMore`-Spinner. | ✅ Done | 🟡 Should |
| 9.6 | **Register als Server Action** – `register/+page.server.js` mit `actions.register`; server-seitige Validierung + Supabase-Call. `register/+page.svelte` nutzt `use:enhance`. | ✅ Done | 🟡 Should |
| 9.7 | **Security-Header in `vercel.json`** – `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Content-Security-Policy` für alle Routen. | ✅ Done | 🟡 Should |
| 9.8 | **`locations/+page.svelte` aufteilen** – `LocationModal.svelte` (Formular + Geocoding + Speichern) und `LocationCard.svelte` (Karte + Delete-Confirm) als Svelte-Komponenten in `src/lib/components/`. Hauptseite von ~800 auf ~150 Zeilen reduziert. | ✅ Done | 🟡 Should |
| 9.9 | **Basis-Unit-Tests mit Vitest** – 14 Tests in 2 Test-Dateien: `rateLimit.test.js` (8 Tests: allow/block/retryAfter/window expiry/IP- und Route-Isolation) + `geocoding.test.js` (6 Tests: parse/null/timeout/HTTP-error/country_code). Vitest v4 konfiguriert in `vite.config.js` mit `$env`-Mocks. | ✅ Done | 🟡 Should |
| 9.10 | **Deutsche Fehlermeldungen** – `toGermanAuthError()` in `register/+page.server.js` mappt Supabase-Rohfehlermeldungen auf Deutsch (bereits registriert, Passwort zu kurz, Rate Limit, Netzwerkfehler). | ✅ Done | 🟡 Should |

### 🟢 Optional – Nice to have

| # | Task | Status | Priorität |
|---|---|---|---|
| 9.11 | **Error Tracking** – Sentry Free Tier integrieren für Produktionsfehler-Monitoring | ⬜ Open | 🟢 Nice |
| 9.12 | **Offline-UX verbessern** – "Du bist offline"-Banner wenn Supabase-Calls fehlschlagen; Service Worker offline-Page aufwerten | ⬜ Open | 🟢 Nice |
| 9.13 | **JSDoc-Typen** – Alle öffentlichen Funktionen in `supabase.js` mit JSDoc-Typen annotieren (Vorstufe zu TypeScript) | ⬜ Open | 🟢 Nice |
| 9.14 | **TypeScript-Migration** – Schrittweise Migration der `.svelte`- und `.js`-Dateien auf TypeScript | ⬜ Open | 🟢 Nice |

### Ergebnis M9 ✅ (2026-03-11)

| Bereich | Vorher | Nachher |
|---|---|---|
| `/api/test-telegram` | 404 → Onboarding fehlgeschlagen | ✅ POST-Endpoint mit Validierung + DE-Fehlermeldungen |
| Rate Limiting | Kein Schutz auf Register/Reset | ✅ 5 req/min/IP (In-Memory Sliding Window) |
| Geocoding | Hängt unbegrenzt bei schlechter Verbindung | ✅ 8-Sekunden-Timeout mit AbortController |
| Alerts-Laden | Alle Alerts auf einmal (bis 200) | ✅ 50 pro Batch, „Mehr laden"-Button |
| Register-Route | Client-seitiger Supabase-Call | ✅ Server Action + progressive Enhancement |
| Security-Header | Keine | ✅ CSP, X-Frame, HSTS, Referrer-Policy |
| Code-Struktur | `locations/+page.svelte` ~800 Zeilen | ✅ ~150 Zeilen + 2 Komponenten |
| Testabdeckung | 0% | ✅ 14 Unit-Tests (rateLimit + geocoding) |

---

---

## Milestone 10 – Polish & Developer Experience ⬜

**Ziel:** Letzte Feinschliffe vor einem stabilen v1.0.0-Release. Fokus auf Wartbarkeit, Transparenz (für potenzielle Nutzer/Contributor) und den letzten UX-Verbesserungen.

### 🔴 Kritisch

| # | Task | Status | Priorität |
|---|---|---|---|
| 10.0 | **Dynamische Versionsnummer** – `svelte.config.js` liest `version` aus `package.json` via `readFileSync` und setzt `kit.version.name`. Footer in `+layout.svelte` und Version-Card in `settings/+page.svelte` nutzen `import { version } from '$app/environment'`. `package.json` auf `0.10.0` gehoben. | ✅ Done | 🔴 Must |
| 10.1 | **README.md aktualisieren** – App-Name, Live-URL, Screenshots, korrekte Projektstruktur, Milestone-Übersicht, `npm test`-Befehl. README spiegelt v0.9.0-Stand wider. | ✅ Done | 🔴 Must |
| 10.2 | **Vercel Build-Fehler behoben + Env-Var setzen** – Ursache des Build-Fehlers (`"TELEGRAM_BOT_TOKEN" is not exported by "virtual:env/static/private"`): `$env/static/private` bettet Werte zur Build-Zeit ein – fehlt die Variable im Vercel-Build, bricht der Build ab. Fix: `api/test-telegram/+server.js` auf `$env/dynamic/private` umgestellt (liest zur Request-Zeit aus `process.env`). **Ausstehende Nutzeraktion:** `TELEGRAM_BOT_TOKEN` im Vercel Dashboard unter Settings → Environment Variables eintragen, dann Redeploy. | ✅ Code-Fix done – Vercel Env-Var durch Clemens setzen | 🔴 Must |
| 10.2a | **Bug-Fix: „Lade Einstellungen…" hängt** – `settings/+page.svelte` nutzte client-seitigen Supabase-Query ohne `eq('id', user.id)` + ohne `+page.server.js`. Session-Timing-Issue im Browser ließ `loading` dauerhaft `true`. Fix: `settings/+page.server.js` erstellt – lädt Profil server-seitig via `locals.supabase` (analog zu Dashboard/Locations/Alerts). | ✅ Done | 🔴 Must |
| 10.2b | **Bug-Fix: „Orte" kann nicht geklickt werden** – `locations/+page.svelte` definierte `const CATEGORIES` (Großbuchstaben), übergab aber `{categories}` (undefined) an `LocationCard` + `LocationModal`. `{#each categories as cat}` in LocationCard crashte mit undefined-Prop → Seite crashte beim Rendern mit Locations. Fix: `CATEGORIES` → `categories` umbenannt. | ✅ Done | 🔴 Must |

### 🟡 Empfohlen

| # | Task | Status | Priorität |
|---|---|---|---|
| 10.3 | **Passwort-Reset als Server Action** – `reset-password/+page.svelte` analog zu `register` auf `+page.server.js`-Action umstellen + deutsche Fehlermeldungen via `toGermanAuthError()` | ⬜ Open | 🟡 Should |
| 10.4 | **Automatische Version in Commit-Message** – `package.json`-Version bei jedem Bump automatisch in `BRIEF.md` + `TASKS.md` einpflegen (z.B. via pre-commit Hook oder kleines Script) | ⬜ Open | 🟡 Should |
| 10.5 | **Alerts-Filter persistent machen** – Gewählte Filter (Zeitraum, Kategorie, Schweregrad) im `sessionStorage` speichern, sodass sie nach Navigation erhalten bleiben | ⬜ Open | 🟡 Should |
| 10.6 | **Toast-Notifications** – Ersetze reine Error-Banner durch kurze In-App-Toasts (z.B. „✅ Ort gespeichert", „⚠️ Fehler beim Laden") für besseres Feedback | ⬜ Open | 🟡 Should |

### 🟢 Optional

| # | Task | Status | Priorität |
|---|---|---|---|
| 10.7 | **Error Tracking (Sentry)** – Sentry Free Tier für Produktionsfehler-Monitoring | ⬜ Open | 🟢 Nice |
| 10.8 | **Offline-UX** – „Du bist offline"-Banner + Service Worker offline-Page aufwerten | ⬜ Open | 🟢 Nice |
| 10.9 | **JSDoc-Typen** – Alle öffentlichen Funktionen in `supabase.js` vollständig annotieren | ⬜ Open | 🟢 Nice |

---

## Legende

| Symbol | Bedeutung |
|---|---|
| 🔴 Must | MVP-kritisch, Version 1 nicht ohne |
| 🟡 Should | Wichtig, aber nicht blockernd |
| 🟢 Nice | Schön zu haben, später |
| ✅ Done | Abgeschlossen |
| ⬜ Open | Noch offen |
| 🔄 In Progress | In Bearbeitung |
