# DECISIONS.md – Architekturentscheidungen
**Projekt:** OSInt Location Monitor
**Version:** 0.6.0 | **Letzte Aktualisierung:** 2026-03-10

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
