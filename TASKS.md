# TASKS.md – OSInt Location Monitor
**Version:** 0.6.0 | **Letzte Aktualisierung:** 2026-03-10

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

## Milestone 7 – Landing Page & Self-Service-Onboarding

**Ziel:** Die App öffnet sich für neue Interessenten. Eine öffentliche Startseite erklärt OSInt, Nutzer können sich selbst registrieren, Telegram verknüpfen und eigene Orte anlegen – ohne dass Clemens jeden User manuell in Supabase anlegen muss.

| # | Task | Status | Priorität |
|---|---|---|---|
| 7.1 | Landing Page (`/`) – öffentlich, erklärt Was/Wie/Warum OSInt Monitor | ⬜ Open | 🔴 Must |
| 7.2 | Nutzer-Registrierung aktivieren – Email + Passwort Self-Signup via Supabase Auth | ⬜ Open | 🔴 Must |
| 7.3 | Login-Seite anpassen – Link zu „Noch kein Konto? Registrieren" | ⬜ Open | 🔴 Must |
| 7.4 | Registrierungs-Seite (`/register`) – Email + Passwort + Bestätigungsmail | ⬜ Open | 🔴 Must |
| 7.5 | Onboarding-Flow – nach erstem Login: Telegram-Bot verbinden + ersten Ort anlegen | ⬜ Open | 🟡 Should |
| 7.6 | Telegram-Setup-Anleitung im Onboarding (Schritt-für-Schritt: Bot starten, Chat-ID ermitteln) | ⬜ Open | 🟡 Should |
| 7.7 | E-Mail-Bestätigung konfigurieren (Supabase Email Templates anpassen) | ⬜ Open | 🟡 Should |
| 7.8 | Passwort vergessen / Reset-Flow (`/reset-password`) | ⬜ Open | 🟢 Nice |
| 7.9 | Landing Page: SEO-Optimierung (Open Graph, canonical, sitemap) | ⬜ Open | 🟢 Nice |

### Architektur-Entscheidungen M7

- **Routing:** `/` wird zur Landing Page (öffentlich). Dashboard wird nach `/dashboard` verschoben oder bleibt hinter Auth-Guard auf `/`.
- **Supabase Self-Signup:** In Supabase Dashboard → Authentication → Providers → Email → „Enable Sign Ups" aktivieren.
- **Onboarding:** Einmaliger Wizard nach erstem Login, der Telegram-Chat-ID und ersten Ort abfragt. State in `profiles.onboarding_done` (Boolean).

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
