# TASKS.md – OSInt Vacation
**Version:** 0.9.0 | **Letzte Aktualisierung:** 2026-03-11

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

## Milestone 8 – Performance & Stabilität ⬜

**Ziel:** Ladezeiten von 3+ Minuten auf < 5 Sekunden reduzieren. Ursachen: Supabase Free-Tier Cold Start (Projekt pausiert nach Inaktivität) + alle Daten werden ausschließlich client-seitig nach dem JS-Bootstrap geladen.

**Diagnose:** Drei unabhängige Ursachen wurden identifiziert:
1. **Cold Start** – Supabase Free Tier pausiert das Projekt nach ~7 Tagen Inaktivität → 30–180 s Aufwachzeit
2. **Client-seitiges Datenladen** – alle Seiten nutzen `onMount()` statt SvelteKit-`load()`-Funktionen → extra Render-Zyklus vor dem ersten Supabase-Request
3. **DB-Query auf jede Seite** – `+layout.server.js` prüft `onboarding_done` bei jedem Request via Supabase → unnötiger Overhead nach einmaligem Check

| # | Task | Status | Priorität |
|---|---|---|---|
| 8.1 | Server-side `load()` für Dashboard – `+page.server.js` mit parallelem `getLocations` + `getAlerts` via `locals.supabase` | ⬜ Open | 🔴 Must |
| 8.2 | Server-side `load()` für Locations – `+page.server.js` mit `getLocations` | ⬜ Open | 🔴 Must |
| 8.3 | Server-side `load()` für Alerts – `+page.server.js` mit `getAlerts` | ⬜ Open | 🔴 Must |
| 8.4 | Supabase Keep-Alive – GitHub Actions Cron (täglich) pingt Supabase mit `SELECT 1` → verhindert Projekt-Pause | ⬜ Open | 🔴 Must |
| 8.5 | `onboarding_done`-Cookie-Cache in `+layout.server.js` – nach erstem Check Cookie setzen, Folge-Requests lesen Cookie statt DB | ⬜ Open | 🟡 Should |
| 8.6 | Svelte-Seiten anpassen – `onMount`-Datenfetching durch `data`-Prop aus `load()` ersetzen (Dashboard, Locations, Alerts) | ⬜ Open | 🔴 Must |
| 8.7 | DECISIONS.md + TASKS.md aktualisieren + Commit + Push | ⬜ Open | 🔴 Must |

### Erwartetes Ergebnis nach M8

| Szenario | Vorher | Nachher |
|---|---|---|
| Supabase warm (normale Nutzung) | ~3–10 s | < 1 s (Daten im initialen HTML) |
| Supabase kalt (nach Inaktivität) | 3+ Minuten | < 30 s (Keep-Alive verhindert Pause; falls doch kalt: Server-SSR puffert den Warte-Request) |
| Navigation zwischen Seiten | ~3–5 s pro Seite | < 1 s (In-Memory-Cache aus M7 greift) |

---

## Milestone 9 – Sicherheit & Code-Qualität ⬜

**Ziel:** Die App vor dem öffentlichen Launch absichern. Ergebnis eines vollständigen Code-Reviews (2026-03-11) mit Fokus auf Sicherheit, Performance-Engpässe, Code-Qualität und Fehlerbehandlung.

### 🔴 Kritisch – vor dem öffentlichen Launch

| # | Task | Status | Priorität |
|---|---|---|---|
| 9.1 | **Rate Limiting** – `/register`, `/reset-password` und Geocoding-Endpoint gegen Missbrauch absichern (z. B. Supabase-seitiger Schutz + client-seitiger Debounce auf Geocoding) | ⬜ Open | 🔴 Must |
| 9.2 | **Geocoding-Timeout** – `geocodeAddress()` in `supabase.js` mit 8-Sekunden-Timeout absichern (analog zum 10-s-Timeout in `loadLocations()`) | ⬜ Open | 🔴 Must |
| 9.3 | **Supabase RLS-Audit** – Manuelle Prüfung aller Row-Level-Security-Policies im Supabase Dashboard; sicherstellen, dass kein User Daten anderer User lesen/schreiben kann | ⬜ Open | 🔴 Must |
| 9.4 | **Service-Key-Prüfung** – Verifizieren, dass `SUPABASE_SERVICE_KEY` nicht in Vercel-Env-Vars landet und nicht im Frontend-Bundle auftaucht (`.gitignore`, Vercel-Dashboard-Check) | ⬜ Open | 🔴 Must |

### 🟡 Empfohlen – innerhalb der nächsten Sprints

| # | Task | Status | Priorität |
|---|---|---|---|
| 9.5 | **Alerts Pagination** – Alerts-Seite lädt aktuell alle Einträge auf einmal; Infinite Scroll oder „Mehr laden"-Button implementieren (max. 50 pro Batch) | ⬜ Open | 🟡 Should |
| 9.6 | **Register als Server Action** – `/register` nutzt aktuell direkten Client-Supabase-Call; auf `+page.server.js`-Action umstellen (konsistent mit Login) | ⬜ Open | 🟡 Should |
| 9.7 | **Security-Header in `vercel.json`** – `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy` und `Permissions-Policy` explizit konfigurieren | ⬜ Open | 🟡 Should |
| 9.8 | **`locations/+page.svelte` aufteilen** – 790 Zeilen in separate Komponenten extrahieren: `LocationModal.svelte`, `LocationList.svelte`, `LocationForm.svelte` | ⬜ Open | 🟡 Should |
| 9.9 | **Basis-Unit-Tests mit Vitest** – Testabdeckung für `withCache()`, `invalidateCache()`, `geocodeAddress()` und `setLocationCategories()` in `$lib/supabase.js` | ⬜ Open | 🟡 Should |
| 9.10 | **Deutsche Fehlermeldungen** – Supabase-Rohfehlermeldungen (englisch) in `register/+page.svelte` und `reset-password/+page.svelte` auf Deutsch mappen | ⬜ Open | 🟡 Should |

### 🟢 Optional – Nice to have

| # | Task | Status | Priorität |
|---|---|---|---|
| 9.11 | **Error Tracking** – Sentry Free Tier integrieren für Produktionsfehler-Monitoring | ⬜ Open | 🟢 Nice |
| 9.12 | **Offline-UX verbessern** – "Du bist offline"-Banner wenn Supabase-Calls fehlschlagen; Service Worker offline-Page aufwerten | ⬜ Open | 🟢 Nice |
| 9.13 | **JSDoc-Typen** – Alle öffentlichen Funktionen in `supabase.js` mit JSDoc-Typen annotieren (Vorstufe zu TypeScript) | ⬜ Open | 🟢 Nice |
| 9.14 | **TypeScript-Migration** – Schrittweise Migration der `.svelte`- und `.js`-Dateien auf TypeScript | ⬜ Open | 🟢 Nice |

### Review-Ergebnis Zusammenfassung

| Bereich | Befund | Risiko |
|---|---|---|
| Authentifizierung & Sessions | Korrekt implementiert via `@supabase/ssr` + `getUser()` | ✅ Sicher |
| Eingabe-Validierung & XSS | Svelte auto-escaped, Supabase parametrisiert | ✅ Sicher |
| Rate Limiting | Fehlt komplett auf Register + Reset + Geocoding | 🔴 Kritisch |
| RLS-Policies | Korrekt im Schema definiert – Produktiv-Prüfung ausstehend | 🟡 Offen |
| Supabase Service Key | Korrekt nur in GitHub Actions – Prüfung empfohlen | 🟡 Offen |
| Code-Struktur | `locations/+page.svelte` 790 Zeilen, Modal nicht extrahiert | 🟡 Mittel |
| Testabdeckung | 0% – keine Tests vorhanden | 🟡 Mittel |
| Fehlerbehandlung | Englische Supabase-Meldungen im deutschen UI | 🟢 Gering |
| Bundle-Größe | Minimal, keine unnötigen Dependencies | ✅ Gut |
| PWA/Service Worker | Korrekt implementiert, Offline-UX verbesserbar | ✅ Gut |

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
