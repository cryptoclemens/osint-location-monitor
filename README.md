# OSInt Vacation

**Version:** 0.9.0 | **Status:** Live ✅ | **Letzte Änderung:** 2026-03-11

> Überwache öffentlich verfügbare Informationen zu deinen Ferienhäusern und Immobilien – und erhalte automatische Telegram-Alerts bei kritischen Ereignissen, egal wo du gerade bist.

🌐 **Live App:** [osi-nt-henna.vercel.app](https://osi-nt-henna.vercel.app/)

---

## Was ist OSInt Vacation?

Wenn du ein Ferienhaus, eine Finca oder eine Zweitwohnung in Europa besitzt, bist du meistens nicht vor Ort. OSInt Vacation überwacht 24/7 öffentliche Quellen rund um deine eingetragenen Adressen und schickt dir sofort eine Telegram-Nachricht, wenn etwas Kritisches passiert – bevor du es aus den Nachrichten erfährst.

**Kein manuelles Nachschauen. Kein verpasstes Unwetter. Kein überraschtes Aufwachen.**

---

## Features

| Feature | Beschreibung |
|---|---|
| 📍 **Ortsüberwachung** | Beliebige Adressen in Europa per Geocoding hinterlegen |
| 🚨 **5 Ereignis-Kategorien** | Unwetter, Hochwasser, Feuer/Waldbrand, Politische Unruhen, Erdbeben |
| 📲 **Telegram-Alerts** | Benachrichtigung innerhalb von 15 Minuten nach Ereigniserkennung |
| ☀️ **Täglicher Morgenbericht** | Automatisch um 09:00 Uhr: Wetter, Lage & „Alles ruhig"-Status |
| 📱 **Progressive Web App** | Installierbar auf Desktop & Smartphone, funktioniert offline |
| 🔐 **Self-Service-Registrierung** | Email + Passwort, Onboarding-Wizard, Passwort-Reset |
| 🛡️ **Rate Limiting & Security-Header** | IP-basiertes Rate Limiting, CSP, HSTS, X-Frame-Options |
| 📊 **Alert-Historie** | Chronologische Übersicht aller gesendeten Alerts mit Filterung & Pagination |

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | [SvelteKit 2](https://kit.svelte.dev/) (PWA, SSR) |
| Datenbank & Auth | [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security) |
| Scheduler | [GitHub Actions](https://github.com/features/actions) (Cron) |
| Monitoring-Scripts | Python 3.11+ |
| Hosting | [Vercel](https://vercel.com/) (Free Tier) |
| Wetter | [Open-Meteo](https://open-meteo.com/) (kostenlos, kein API-Key) |
| Erdbeben | [USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/) |
| News/Ereignisse | [GNews API](https://gnews.io/) |
| Geocoding | [Nominatim / OpenStreetMap](https://nominatim.org/) |
| Benachrichtigung | Telegram Bot API |
| Tests | [Vitest](https://vitest.dev/) v4 |

---

## Meilensteine

| # | Milestone | Status |
|---|---|---|
| M1 | Projektsetup, Supabase-Schema, GitHub-Repo | ✅ |
| M2 | Python Monitoring-Scripts (Wetter, Erdbeben, News, Morgenbericht) | ✅ |
| M3 | GitHub Actions Cron-Scheduler | ✅ |
| M4 | SvelteKit PWA Frontend (Dashboard, Locations, Alerts, Settings) | ✅ |
| M5 | Auth & RLS (Login, Route Guards, Row-Level Security) | ✅ |
| M6 | Deployment & Testing (Vercel, E2E, Lighthouse) | ✅ |
| M7 | Landing Page & Self-Service-Onboarding (Registrierung, Onboarding-Wizard) | ✅ |
| M8 | Performance (Server-side Loading, Keep-Alive, In-Memory-Cache) | ✅ |
| M9 | Sicherheit & Code-Qualität (Rate Limiting, Security-Header, Vitest, Komponenten) | ✅ |
| M10 | Polish & Developer Experience | 🔄 Geplant |

---

## Setup

### Voraussetzungen

- Node.js >= 18
- Python >= 3.11
- Supabase Account (kostenlos)
- Vercel Account (kostenlos)
- Telegram Bot Token ([Anleitung](https://core.telegram.org/bots/tutorial))

### 1. Repository klonen

```bash
git clone https://github.com/cryptoclemens/osint-location-monitor.git
cd osint-location-monitor
```

### 2. Abhängigkeiten installieren

```bash
# Node-Abhängigkeiten (inkl. Vitest)
npm install

# Python-Abhängigkeiten
pip install -r requirements.txt
```

### 3. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env.local
# .env.local mit deinen Werten befüllen
```

Benötigte Variablen:

| Variable | Beschreibung |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot HTTP API Token |
| `PUBLIC_SITE_URL` | Deine Vercel-URL (für E-Mail-Redirects) |

### 4. Supabase einrichten

```bash
# Schema im Supabase SQL-Editor ausführen:
# docs/schema.sql  → Tabellen + RLS-Policies
# docs/migration-0.7.0.sql  → onboarding_done-Spalte
```

Danach im Supabase Dashboard:
- **Authentication → Providers → Email** → „Enable Sign Ups" aktivieren
- **Authentication → URL Configuration** → Site URL auf deine Vercel-URL setzen

### 5. Lokal starten

```bash
npm run dev
```

### 6. Tests ausführen

```bash
npm test
# → 14 Unit-Tests (rateLimit + geocoding), alle grün
```

### 7. Deployment (Vercel)

```bash
vercel deploy
# oder: git push origin main → Vercel deployed automatisch
```

### 8. GitHub Actions Secrets konfigurieren

Unter *Settings → Secrets and variables → Actions* hinterlegen:

| Secret | Beschreibung |
|---|---|
| `SUPABASE_URL` | Supabase Projekt-URL |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role Key (nur in Actions!) |
| `SUPABASE_ANON_KEY` | Supabase Anon Key |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot HTTP API Token |
| `TELEGRAM_CHAT_ID` | Deine Telegram Chat-ID |
| `GNEWS_API_KEY` | GNews API Key (Free Tier) |

---

## Projektstruktur

```
osint-location-monitor/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte          # App-Shell, Navigation, Footer
│   │   ├── +page.svelte            # Landing Page (öffentlich)
│   │   ├── dashboard/              # Übersicht (auth-geschützt)
│   │   ├── locations/              # Orte verwalten
│   │   ├── alerts/                 # Alert-Historie mit Pagination
│   │   ├── settings/               # Telegram + Account-Einstellungen
│   │   ├── register/               # Self-Service-Registrierung (Server Action)
│   │   ├── login/                  # Login
│   │   ├── onboarding/             # Onboarding-Wizard (nach erstem Login)
│   │   ├── reset-password/         # Passwort vergessen
│   │   └── api/test-telegram/      # POST-Endpoint: Telegram-Verbindungstest
│   ├── lib/
│   │   ├── supabase.js             # Supabase Client + Cache + CRUD-Funktionen
│   │   ├── rateLimit.js            # IP-basiertes Rate Limiting (Sliding Window)
│   │   └── components/
│   │       ├── LocationModal.svelte # Ort hinzufügen/bearbeiten (Formular + Geocoding)
│   │       └── LocationCard.svelte  # Einzelne Orts-Kachel
│   └── test/
│       ├── rateLimit.test.js       # 8 Unit-Tests für checkRateLimit()
│       ├── geocoding.test.js       # 6 Unit-Tests für geocodeAddress()
│       └── __mocks__/              # SvelteKit $env/$app Stubs für Vitest
├── scripts/
│   ├── monitor.py                  # 15-Min-Monitoring (Wetter, Erdbeben, News)
│   ├── morning_report.py           # Täglicher Morgenbericht 09:00 Uhr
│   └── utils.py                    # Supabase-Client, Telegram-Helper, Logging
├── .github/workflows/
│   ├── monitor.yml                 # Cron alle 15 Min
│   ├── morning-report.yml          # Cron täglich 09:00 Uhr
│   └── supabase-keepalive.yml      # Tägl. Ping gegen Supabase-Pause
├── docs/
│   ├── schema.sql                  # Vollständiges Datenbankschema
│   ├── security-checklist.md       # RLS-Audit + Service-Key-Verifikation
│   ├── deployment.md               # Vercel Deployment Runbook
│   └── supabase-setup.md           # Supabase Einrichtungsanleitung
├── static/                         # PWA Assets, Icons, manifest.json
├── .env.example                    # Vorlage für Umgebungsvariablen
├── vercel.json                     # Security-Header (CSP, HSTS, X-Frame-Options)
├── BRIEF.md                        # Lebende Projektbeschreibung
├── TASKS.md                        # Aufgaben & Meilensteine
└── README.md
```

---

## Sicherheit

- **Row-Level Security** – Jeder Nutzer sieht ausschließlich seine eigenen Daten (Supabase RLS)
- **Rate Limiting** – 5 Anfragen/Minute/IP auf `/register` und `/reset-password`
- **Security-Header** – CSP, X-Frame-Options: DENY, HSTS, Referrer-Policy (via `vercel.json`)
- **Server-seitige Secrets** – `TELEGRAM_BOT_TOKEN` und `SUPABASE_SERVICE_KEY` verlassen niemals den Server
- **Server Actions** – Registrierung läuft server-seitig (kein direkter Supabase-Call im Browser)

---

## Lizenz

MIT – Open Source, freie Nutzung und Weitergabe.

---

*Entwickelt von [Clemens Pompeÿ](https://github.com/cryptoclemens) – München 2026*
