# TASKS.md – OSInt Location Monitor
**Version:** 0.3.0 | **Letzte Aktualisierung:** 2026-03-10

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

## Milestone 4 – SvelteKit PWA Frontend

| # | Task | Status | Priorität |
|---|---|---|---|
| 4.1 | SvelteKit + Vite konfigurieren, PWA-Plugin einrichten | ⬜ Open | 🔴 Must |
| 4.2 | Supabase-Client in SvelteKit integrieren | ⬜ Open | 🔴 Must |
| 4.3 | Dashboard-Seite (`/`) – Übersicht aktive Locations + letzter Alert | ⬜ Open | 🔴 Must |
| 4.4 | Locations-Seite (`/locations`) – Adresse hinzufügen, bearbeiten, löschen | ⬜ Open | 🔴 Must |
| 4.5 | Geocoding-Integration (Adresse → Koordinaten via Nominatim) | ⬜ Open | 🔴 Must |
| 4.6 | Kategorien-Auswahl pro Location (Checkboxen) | ⬜ Open | 🔴 Must |
| 4.7 | Alert-Historie-Seite (`/alerts`) – Liste aller gesendeten Alerts | ⬜ Open | 🟡 Should |
| 4.8 | Settings-Seite (`/settings`) – Telegram Chat-ID konfigurieren | ⬜ Open | 🔴 Must |
| 4.9 | Responsives Design (Mobile-first) | ⬜ Open | 🔴 Must |
| 4.10 | PWA Manifest + Service Worker + Icons | ⬜ Open | 🔴 Must |

---

## Milestone 5 – Auth & Sicherheit

| # | Task | Status | Priorität |
|---|---|---|---|
| 5.1 | Supabase Auth (Email/Passwort) integrieren | ⬜ Open | 🟡 Should |
| 5.2 | Login-Seite (`/login`) erstellen | ⬜ Open | 🟡 Should |
| 5.3 | Route Guards – geschützte Seiten nur für eingeloggte User | ⬜ Open | 🟡 Should |
| 5.4 | Row-Level-Security in Supabase (User sieht nur eigene Locations) | ⬜ Open | 🟡 Should |

---

## Milestone 6 – Testing & Deployment

| # | Task | Status | Priorität |
|---|---|---|---|
| 6.1 | End-to-End-Test: Location anlegen → Action triggern → Telegram-Nachricht empfangen | ⬜ Open | 🔴 Must |
| 6.2 | Täglichen Morgenbericht manuell testen | ⬜ Open | 🔴 Must |
| 6.3 | Vercel Deployment konfigurieren | ⬜ Open | 🔴 Must |
| 6.4 | Custom Domain (optional) | ⬜ Open | 🟢 Nice |
| 6.5 | Lighthouse PWA Score prüfen (Ziel: ≥90) | ⬜ Open | 🟡 Should |

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
