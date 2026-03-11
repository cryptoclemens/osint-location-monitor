# DECISIONS.md – Architekturentscheidungen
**Projekt:** OSInt Vacation
**Version:** 0.9.0 | **Letzte Aktualisierung:** 2026-03-11

> Dieses Dokument hält alle relevanten Architektur- und Technologie-Entscheidungen fest.
> Format: Datum · Entscheidung · Begründung · Alternativen (abgelehnt)

---

## Vorlage

```
### [YYYY-MM-DD] Titel der Entscheidung
**Status:** Entschieden / Offen / Überdacht
**Entscheidung:** Was wurde entschieden?
**Begründung:** Warum diese Entscheidung?
**Alternativen:** Was wurde abgelehnt und warum?
```

---

## Entscheidungen

### [2026-03-10] Tech-Stack: SvelteKit + Supabase + GitHub Actions
**Status:** Entschieden

**Entscheidung:** SvelteKit als PWA-Framework, Supabase als Datenbank & Auth-Backend, GitHub Actions als kostenloser Scheduler für Monitoring-Scripts.

**Begründung:**
- Budget 0€ → alle Komponenten kostenlos nutzbar
- GitHub Actions eliminiert das "Einschlafen"-Problem von Render/Railway Free Tier
- Da Projekt auf GitHub Public liegt, ist Actions eine natürliche Erweiterung
- Supabase liefert Auth + Postgres + Row-Level-Security out-of-the-box

**Alternativen:**
- *Next.js + FastAPI auf Render:* Render Free Tier schläft ein, zwei separate Deployments nötig → abgelehnt
- *Next.js Full-Stack auf Vercel:* Serverless Timeout-Limit problematisch für Crawler-Jobs → als Fallback vorgemerkt

---

### [2026-03-10] Monitoring-Scripts: Python statt Node.js
**Status:** Entschieden

**Entscheidung:** Die Monitoring- und Crawler-Scripts werden in Python geschrieben.

**Begründung:**
- Python hat überlegene Libraries für HTTP-Crawling (requests, BeautifulSoup, httpx)
- Bessere API-Anbindung für wissenschaftliche Datenquellen (USGS, GDELT)
- Weniger Overhead als Node.js für reine Backend-Scripts

**Alternativen:**
- *Node.js Scripts:* Weniger geeignete Crawling-Libraries im Vergleich → abgelehnt

---

### [2026-03-10] Wetter-API: Open-Meteo
**Status:** Entschieden

**Entscheidung:** Open-Meteo als primäre Wetter-API.

**Begründung:**
- Komplett kostenlos, kein API-Key nötig
- Europäische Server, gute Abdeckung für europäische Locations
- Stündliche Auflösung reicht für Unwetter-Erkennung

**Alternativen:**
- *OpenWeatherMap:* Free Tier limitiert (1.000 Calls/Tag) → als Fallback vorgemerkt
- *WeatherAPI:* Ähnliche Limits, komplexere Lizenz → abgelehnt

---

### [2026-03-10] Datenbankschema: RLS auf allen Tabellen
**Status:** Entschieden

**Entscheidung:** Row-Level-Security (RLS) ist auf allen Tabellen aktiviert. Jeder User sieht und bearbeitet nur seine eigenen Daten. Die Python-Scripts (GitHub Actions) nutzen den `service_role` Key, der RLS umgeht.

**Begründung:**
- Mehrere Nutzer können die App nutzen (Clemens + Freunde mit Ferienhäusern)
- Datenisolation ist von Anfang an eingebaut, kein nachträgliches Absichern nötig
- Supabase RLS ist deklarativ und wird direkt in PostgreSQL erzwungen

**Alternativen:**
- *Kein RLS, stattdessen App-seitige Filterung:* Sicherheitsrisiko, falsche Queries könnten fremde Daten leaken → abgelehnt

---

### [2026-03-10] Branching-Strategie: main-only für Prototyp
**Status:** Entschieden

**Entscheidung:** Für den Prototypen gibt es nur den `main`-Branch. Kein Feature-Branching.

**Begründung:**
- Einzelentwickler, kein Team-Overhead nötig
- Zeitersparnis in der frühen Entwicklungsphase
- Kann jederzeit auf Feature-Branches umgestellt werden

**Alternativen:**
- *Feature-Branches:* Overhead ohne Mehrwert beim Einzelprojekt → für später vorgemerkt

---

### [2026-03-10] GitHub Actions als Scheduler
**Status:** Entschieden

**Entscheidung:** GitHub Actions Cron Jobs triggern die Python-Scripts alle 15 Minuten (monitor) und täglich um 09:00 Uhr (morning report).

**Begründung:**
- 0€ Kosten – bei Public Repos sind GitHub Actions unlimitiert kostenlos
- Kein dedizierter Server nötig, kein "Einschlafen"-Problem
- Jeder Lauf ist im GitHub-UI sichtbar und nachvollziehbar (Logging kostenlos)

**Alternativen:**
- *Render/Railway Cron:* Einschlafen-Problem auf Free Tier → abgelehnt
- *Vercel Cron Jobs:* 60-Sek. Timeout für Serverless Functions zu kurz für Crawler → abgelehnt

---

### [2026-03-10] Alert-Deduplizierung: 2-Stunden-Fenster
**Status:** Entschieden

**Entscheidung:** Ein Alert wird nur einmalig pro Location + Kategorie innerhalb von 2 Stunden gesendet. Die Prüfung erfolgt via Supabase-Query auf die `alerts`-Tabelle.

**Begründung:**
- Der Monitor läuft alle 15 Minuten → ohne Dedup würde derselbe Unwetter 8x pro Stunde gemeldet
- 2 Stunden als Fenster: kurz genug um Folge-Events nicht zu unterdrücken, lang genug gegen Spam

**Alternativen:**
- *1 Stunde:* Zu kurz, länger anhaltende Events würden mehrfach alertet → abgelehnt
- *24 Stunden:* Zu lang, Folge-Ereignisse würden unterdrückt → abgelehnt

---

### [2026-03-10] Unwetter-Schwellwerte: WMO Code + Windgeschwindigkeit
**Status:** Entschieden

**Entscheidung:** Ein UNWETTER-Alert wird ausgelöst bei WMO Code ≥ 82 (schwere Gewitter, Sturm) ODER Windgeschwindigkeit ≥ 70 km/h. Quelle: Open-Meteo (kostenlos, kein API-Key).

**Begründung:**
- WMO 82/85/86/95/96/99 entsprechen internationalen Definitionen für Unwetter
- 70 km/h Wind = Beaufort 8 (Sturm), in DE/EU-Wetterwarnungen als Warnstufe Orange
- Open-Meteo: kostenlos, kein Ratelimit für Non-Commercial, europäische Server

---

### [2026-03-10] GDELT nicht genutzt, GNews als News-Quelle
**Status:** Entschieden

**Entscheidung:** Für News-basierte Kategorien (Feuer, Hochwasser, Unruhen) wird GNews Free Tier verwendet. GDELT wurde evaluiert aber nicht implementiert.

**Begründung:**
- GNews API ist deutlich einfacher zu nutzen (REST JSON vs. GDELT's komplexes Abfrageformat)
- GNews Free Tier: 100 Requests/Tag → reicht für MVP mit wenigen Locations
- GDELT hat keine Länder-/Radius-Filterung → mehr False Positives erwartet

**Alternativen:**
- *GDELT:* Zu komplex, kein Geofencing → als spätere Erweiterung vorgemerkt
- *NewsAPI.org:* Free Tier nur delayed (24h) → für Echtzeit ungeeignet → abgelehnt

---

### [2026-03-11] App-Umbenennung: OSInt Monitor → OSInt Vacation
**Status:** Entschieden

**Entscheidung:** Die App heißt ab M7 offiziell „OSInt Vacation". Alle UI-Texte, Manifest, Service Worker, HTML-Meta-Tags und die settings-Seite wurden aktualisiert.

**Begründung:**
- Der Name „OSInt Vacation" kommuniziert den Anwendungsfall klarer: Monitoring für Ferienorte/Reiseziele
- „Location Monitor" klingt technisch, nicht nutzerfreundlich
- Der neue Name ist einprägsam, SEO-freundlich und passt zum Onboarding-Flow

**Alternativen:**
- *OSInt Monitor behalten:* Zu generisch, kein klarer Bezug zur Zielgruppe → abgelehnt

---

### [2026-03-11] M7 Routing: Landing Page auf `/`, Dashboard auf `/dashboard`
**Status:** Entschieden

**Entscheidung:** Die öffentliche Landing Page liegt auf `/`. Das Dashboard, das Authentifizierung erfordert, wurde auf `/dashboard` verschoben. Eingeloggte User werden von `/` automatisch zu `/dashboard` weitergeleitet.

**Begründung:**
- SEO: Suchmaschinen indexieren `/` – eine öffentliche Landing Page statt einem Login-Wall ist besser
- UX: Neue Besucher sehen Features und CTA, nicht sofort eine Passwortmaske
- Bestehende Links auf `/` funktionieren dank Redirect weiterhin

**Alternativen:**
- *Dashboard bleibt auf `/`:* Kein SEO, keine Möglichkeit für öffentliche Landing Page → abgelehnt

---

### [2026-03-11] Self-Registration via Supabase signUp()
**Status:** Entschieden

**Entscheidung:** Neue User können sich selbst registrieren via `/register`. Supabase `signUp()` sendet eine Bestätigungs-E-Mail. Nach Bestätigung landet der User auf `/onboarding`.

**Begründung:**
- M7-Ziel: App öffnet sich für neue Interessenten ohne manuellen Eingriff durch Clemens
- Supabase bietet E-Mail-Bestätigung out-of-the-box (kein eigener Mail-Server nötig)
- `emailRedirectTo: /onboarding` leitet direkt in den Onboarding-Wizard

**Alternativen:**
- *Manuell User in Supabase anlegen:* Schlechte UX, nicht skalierbar → abgelehnt (war MVP-Kompromiss in M5)
- *Magic Link statt Passwort:* Einfacher für User, aber inkompatibel mit Reset-Flow → für später vorgemerkt

---

### [2026-03-11] Onboarding-Wizard: 3-Step-Flow nach erstem Login
**Status:** Entschieden

**Entscheidung:** Nach der E-Mail-Bestätigung (und bei `onboarding_done = false`) wird der User zu `/onboarding` weitergeleitet. Schritte: (1) Willkommen, (2) Telegram-Bot verbinden, (3) Ersten Ort anlegen. State wird in `profiles.onboarding_done` gespeichert.

**Begründung:**
- Ohne Telegram Chat-ID funktionieren keine Alerts → Onboarding stellt sicher, dass die Grundkonfiguration vorhanden ist
- Schritt-für-Schritt verhindert Überforderung neuer User
- `onboarding_done = TRUE` wird nach Abschluss gesetzt – kein erneutes Zeigen

**Alternativen:**
- *Onboarding überspringen, sofort Dashboard:* User ohne Telegram sehen keine Alerts → schlechte First-Run-Experience → abgelehnt
- *Onboarding als modale Dialoge im Dashboard:* Technisch komplexer, schwerer zu testen → abgelehnt

---

### [2026-03-11] Passwort-Reset: Client-seitiger Flow via supabase.auth.resetPasswordForEmail()
**Status:** Entschieden

**Entscheidung:** Der Reset-Flow läuft vollständig client-seitig auf `/reset-password`. Schritt 1: E-Mail eingeben → Reset-Link senden. Schritt 2: User klickt Link → landet mit `?code=` (PKCE) oder `#type=recovery` (implicit) zurück auf der Seite → `exchangeCodeForSession()` oder `onAuthStateChange('PASSWORD_RECOVERY')` → neues Passwort via `updateUser()`.

**Begründung:**
- Kein separater `/auth/callback`-Route nötig – die Reset-Seite ist ihr eigener Callback
- Unterstützt beide Supabase-Auth-Flows (PKCE und implizit)
- Der `onAuthStateChange` Listener ist die idiomatische Supabase-Lösung für PASSWORD_RECOVERY

**Alternativen:**
- *Eigener `/auth/callback` Route:* Standardansatz bei OAuth, aber für reinen E-Mail-Reset unnötig → abgelehnt

---

### [2026-03-11] Performance: In-Memory-Cache für Supabase-Abfragen (60 s TTL)
**Status:** Entschieden

**Entscheidung:** `getLocations()`, `getAlerts()` und `getProfile()` verwenden einen einfachen In-Memory-Cache mit 60-Sekunden-TTL in `$lib/supabase.js`. Mutationen (`createLocation`, `updateLocation`, `deleteLocation`, `setLocationCategories`, `updateProfile`) invalidieren den entsprechenden Cache-Eintrag automatisch.

**Begründung:**
- Supabase Free Tier: sparsamer Umgang mit API-Calls reduziert Latenz und schont das Kontingent
- Bei Navigation zwischen Seiten (Dashboard → Locations → Dashboard) werden dieselben Daten mehrfach abgefragt ohne dass sich etwas geändert hat
- In-Memory ist SSR-sicher (kein `window`/`sessionStorage`) und hat keinen Serialisierungs-Overhead

**Alternativen:**
- *sessionStorage:* JSON-Serialisierung, kein SSR-Support, cross-tab-Issues → abgelehnt
- *SvelteKit Stores mit persist:* Overhead, komplexere Invalidierung → für später vorgemerkt
- *SWR / React Query Pattern:* Overkill für diesen Use-Case → abgelehnt

---

### [2026-03-11] M8 Performance: Server-side Datenladen via +page.server.js
**Status:** Entschieden ✅ (M8 abgeschlossen)

**Entscheidung:** Dashboard, Locations und Alerts bekommen je eine `+page.server.js` mit einer `load()`-Funktion. Die Daten werden server-seitig via `locals.supabase` geladen und im initialen HTML-Response mitgeliefert. Die `onMount()`-Datenabfragen in den Svelte-Komponenten entfallen.

**Begründung:**
- Aktuell: Browser lädt HTML → JS ausführen → Supabase anfragen → rendern (3 Schritte mit Wartezeit)
- Neu: Server fragt Supabase → rendert HTML mit Daten → Browser empfängt fertiges HTML (1 Schritt)
- SvelteKit-`load()`-Funktionen laufen parallel zum Layout-Load → kein zusätzlicher Overhead
- `locals.supabase` ist bereits konfiguriert (läuft via `hooks.server.js`) – kein neuer Client nötig

**Alternativen:**
- *Client-side mit Skeleton Loader:* UX-Verbesserung ohne Architekturumstellung, aber keine Latenzeinsparung → abgelehnt
- *SvelteKit `+page.js` (universell):* Würde auch SSR nutzen, aber kein Zugriff auf `locals.supabase` → abgelehnt

---

### [2026-03-11] M8 Performance: Supabase Keep-Alive via GitHub Actions
**Status:** Entschieden ✅ (M8 abgeschlossen)

**Entscheidung:** Ein neuer GitHub-Actions-Workflow (`.github/workflows/supabase-keepalive.yml`) führt täglich einen simplen `SELECT 1`-Query via `psql` gegen Supabase aus. Das verhindert, dass das Free-Tier-Projekt in den Schlafmodus geht.

**Begründung:**
- Supabase Free Tier pausiert Projekte nach 7 Tagen ohne aktive Verbindung
- Cold Start nach Pause: 30–180 Sekunden → erklärt die gemeldeten 3+ Minuten Ladezeit
- Der tägliche Monitor-Cron (alle 15 Min.) und Morgenbericht (09:00 Uhr) sollten das Projekt eigentlich wach halten – aber nur wenn GitHub Actions auch wirklich läuft (manchmal verzögert)
- Ein expliziter Keep-Alive-Job auf ein anderes Zeitfenster (z. B. 06:00 Uhr) gibt zusätzliche Sicherheit

**Alternativen:**
- *Supabase Pro Tier (kein Pause-Problem):* 25 $/Monat → Out of Scope (Budget 0 €) → abgelehnt
- *Vercel Cron Job als Keep-Alive:* Würde funktionieren, aber GitHub Actions ist schon vorhanden → abgelehnt

---

### [2026-03-11] M8 Performance: onboarding_done-Cookie-Cache im Layout
**Status:** Entschieden ✅ (M8 abgeschlossen)

**Entscheidung:** Nach dem ersten erfolgreichen `onboarding_done = true`-Check in `+layout.server.js` wird ein kurzlebiges Cookie (z. B. 24-Stunden-TTL) gesetzt. Bei Folge-Requests liest das Layout den Cookie statt eine DB-Query abzusetzen.

**Begründung:**
- `+layout.server.js` fragt aktuell bei jedem Auth-Route-Aufruf `profiles.onboarding_done` ab
- Das ist eine synchrone Supabase-Query auf jedem Seitenaufruf – bei Cold Start besonders teuer
- `onboarding_done` wechselt nur einmal (von `false` → `true`) → häufiges Neu-Lesen nicht nötig
- Cookie-Ansatz ist SSR-sicher, HTTP-only, funktioniert ohne JavaScript

**Alternativen:**
- *JWT Custom Claims:* Eleganter, aber erfordert Supabase Edge Functions → zu viel Overhead für M8 → für später vorgemerkt
- *Layout Data weitergeben:* `onboarding_done` ist bereits im Layout-`data`-Objekt – Svelte-Routen können ihn nutzen, aber der Server muss ihn trotzdem pro Request laden → abgelehnt als alleinige Lösung

---

### [2026-03-11] M8 UX: Einheitlicher Loading-Spinner auf allen Seiten
**Status:** Entschieden ✅ (M8 abgeschlossen)

**Entscheidung:** Das Dashboard verwendet nun denselben zentrierten Kreis-Spinner (`.loading-state` + `.spinner`-Klasse) wie die Locations- und Alerts-Seite. Der frühere `empty-state`-Block mit `⏳`-Icon wurde ersetzt.

**Begründung:**
- Visuelle Konsistenz: alle drei Datenseiten zeigen dasselbe Loading-Pattern
- Der zentrierte Spinner (40px, Kreis-Animation, zentriert im Viewport) wirkt professioneller als ein Inline-Icon-Text
- Wiederverwendung der CSS-Klassen aus locations/+page.svelte → kein neues Design-System nötig

**Alternativen:**
- *empty-state mit Icon behalten:* Inkonsistent mit anderen Seiten → abgelehnt
- *Skeleton Loader:* Aufwändiger, kein Mehrwert da Loading-State mit SSR kaum noch sichtbar ist → für später vorgemerkt

---

*Weitere Entscheidungen werden laufend ergänzt.*

### [2026-03-10] Vercel Build-Konfiguration: Node 22, kein lxml im Root
**Status:** Entschieden

**Entscheidung:** `vercel.json` enthält nur `framework`, `buildCommand` und `installCommand`. Die Python `requirements.txt` liegt in `scripts/`, nicht im Projekt-Root. Der Vercel-Adapter wird mit `runtime: 'nodejs22.x'` konfiguriert.

**Begründung:**
- Vercel erkennt `requirements.txt` im Root automatisch als Python-Projekt → versucht `lxml` zu bauen → scheitert (kein `libxml2`)
- Node 24 (lokal) wird von `adapter-vercel` nicht unterstützt → `nodejs22.x` als explizite Runtime
- Keine `outputDirectory`-Überschreibung → SvelteKit/Vercel-Adapter setzt den korrekten Pfad automatisch

**Alternativen:**
- *`requirements.txt` im Root lassen:* Vercel-Build-Fehler bei `lxml` → abgelehnt
- *Python-Dependencies in Vercel-Serverless-Functions:* Nicht nötig (Python läuft nur in GitHub Actions) → abgelehnt

---

### [2026-03-10] SvelteKit Guard-Bug Fix: Vite-Plugin-Shim
**Status:** Entschieden

**Entscheidung:** Ein eigenes Vite-Plugin `serverHooksBrowserShim()` in `vite.config.js` (mit `enforce: 'pre'`) gibt für `hooks.server.js` im Browser-Build-Pass ein leeres `export {}` zurück. Dies verhindert den SvelteKit-2.x-Bug "An impossible situation occurred".

**Begründung:**
- SvelteKit 2.53.x: `vite-plugin-sveltekit-guard` teilt seinen `import_map` über SSR- und Browser-Build-Passes
- SSR-Pass registriert `hooks.server.js → [server/internal.js]`; Browser-Pass kann die Kette nicht zu einem Browser-Entrypoint auflösen → Fehler
- Der Shim-Ansatz ist permanent (kein `node_modules`-Patching, überlebt `npm install`)

**Alternativen:**
- *`node_modules` patchen:* Geht verloren bei `npm install` → abgelehnt
- *`config.kit.files.hooks.server` umbenennen:* Deprecated-Warning in SvelteKit 2.53.x → abgelehnt
- *Warten auf SvelteKit-Upstream-Fix:* Zu lang (Build bleibt blockiert) → abgelehnt

---

### [2026-03-10] PWA Service Worker: Eigener SW statt vite-plugin-pwa
**Status:** Entschieden

**Entscheidung:** Ein manueller Service Worker (`static/sw.js`) wird verwendet. Das `@vite-pwa/sveltekit`-Plugin wurde entfernt.

**Begründung:**
- `@vite-pwa/sveltekit@1.x` → Peer-Dependency-Konflikt mit `vite@6.x`
- Minimaler SW reicht für PWA-Installierbarkeit (Manifest + SW + HTTPS = DoD-4 erfüllt)
- Volle Kontrolle über Caching-Strategie ohne Plugin-Overhead

**Alternativen:**
- *`@vite-pwa/sveltekit` behalten:* npm ERESOLVE-Fehler, blockiert lokale Entwicklung → abgelehnt
- *Workbox direkt:* Overhead für den MVP-Umfang unverhältnismäßig → für später vorgemerkt

### [2026-03-10] Auth: Cookie-basierte Session via @supabase/ssr
**Status:** Entschieden

**Entscheidung:** Supabase Auth wird mit dem `@supabase/ssr` Paket eingebunden. Sessions werden als httpOnly-Cookie gespeichert (kein localStorage). Die Validierung erfolgt server-seitig in `hooks.server.js` via `getUser()` (JWT-Verifikation), nicht nur `getSession()`.

**Begründung:**
- `@supabase/ssr` ist die offizielle Supabase-Empfehlung für SvelteKit SSR
- httpOnly-Cookies sind sicherer als localStorage (kein XSS-Risiko)
- `getUser()` verifiziert den JWT gegen Supabase – verhindert gefälschte Cookies
- Route Guards laufen server-seitig im `+layout.server.js` → kein Flash of Unauthenticated Content

**Alternativen:**
- *`@supabase/auth-helpers-sveltekit` (deprecated):* Offiziell nicht mehr empfohlen → abgelehnt
- *Nur Client-seitige Guards:* Unsicher, User sieht kurz den Inhalt vor dem Redirect → abgelehnt

---

### [2026-03-10] Auth: Kein Magic Link / OAuth für MVP
**Status:** Entschieden

**Entscheidung:** Nur Email + Passwort Login für das MVP. Neue User werden direkt in Supabase Dashboard angelegt (Authentication → Users → Invite).

**Begründung:**
- MVP ist ein Single-User-Tool (Clemens + wenige Freunde)
- Kein Self-Registration nötig – Kontrolle über Wer Zugang hat
- Weniger Komplexität im MVP, Magic Link / OAuth kann später ergänzt werden

**Alternativen:**
- *Magic Link:* Einfacher für User, aber braucht eigene Email-Templates → für später vorgemerkt
- *Google OAuth:* Sinnvoll wenn mehr Nutzer, aber Overhead für MVP → abgelehnt

---

### [2026-03-10] RLS: Profile-Trigger für automatische Erstellung
**Status:** Entschieden

**Entscheidung:** Ein PostgreSQL-Trigger erstellt automatisch einen `profiles`-Eintrag wenn ein User in Supabase Auth angelegt wird. Ohne diesen Trigger würde `createLocation()` fehlschlagen, da `locations.user_id → profiles.id`.

**Begründung:**
- `locations.user_id` referenziert `profiles.id` (nicht direkt `auth.users.id`)
- Ohne Profil → Foreign-Key-Constraint-Fehler beim Location anlegen
- Trigger ist idempotent (`ON CONFLICT DO NOTHING`) und läuft automatisch

**Alternativen:**
- *Profile manuell anlegen:* Fehleranfällig und schlechte UX → abgelehnt
- *locations.user_id direkt auf auth.users:* Würde Profile-Tabelle unnötig machen, aber wir brauchen profiles für telegram_chat_id → abgelehnt

---
