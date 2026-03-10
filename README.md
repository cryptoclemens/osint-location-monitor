# OSInt Location Monitor
**Version:** 0.1.0 | **Status:** In Development | **Letzte Änderung:** 2026-03-10

> Überwache öffentlich verfügbare Informationen zu deinen Immobilien und erhalte automatische Telegram-Alerts bei kritischen Ereignissen – egal wo du gerade bist.

---

## Features

- 📍 **Ortsüberwachung** – Hinterlege beliebige Adressen in Europa
- 🚨 **5 Ereignis-Kategorien** – Unwetter, Hochwasser, Feuer/Waldbrand, Politische Unruhen, Erdbeben
- 📱 **Progressive Web App** – Nutzbar auf Desktop & Smartphone ohne App-Installation
- 🤖 **Telegram-Alerts** – Benachrichtigung innerhalb von 15 Minuten nach Ereigniserkennung
- ☀️ **Täglicher Morgenbericht** – Automatisch um 09:00 Uhr: Wetter, Lage & „Alles ruhig"-Status
- 🔐 **Geschützter Admin-Bereich** – Login via Supabase Auth

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | [SvelteKit](https://kit.svelte.dev/) (PWA) |
| Datenbank & Auth | [Supabase](https://supabase.com/) (PostgreSQL) |
| Scheduler | [GitHub Actions](https://github.com/features/actions) (Cron) |
| Monitoring-Scripts | Python 3.11+ |
| Hosting | [Vercel](https://vercel.com/) (Free Tier) |
| Wetter | [Open-Meteo](https://open-meteo.com/) (kostenlos, kein API-Key) |
| Erdbeben | [USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/) |
| News/Ereignisse | [GNews API](https://gnews.io/) + [GDELT Project](https://www.gdeltproject.org/) |
| Geocoding | [Nominatim / OpenStreetMap](https://nominatim.org/) |
| Benachrichtigung | Telegram Bot API |

---

## Setup

### Voraussetzungen

- Node.js >= 18
- Python >= 3.11
- Supabase Account (kostenlos)
- Vercel Account (kostenlos)
- Telegram Bot Token (vorhanden)

### 1. Repository klonen

```bash
git clone https://github.com/DEIN_USERNAME/osint-location-monitor.git
cd osint-location-monitor
```

### 2. Abhängigkeiten installieren

```bash
# Node-Abhängigkeiten
npm install

# Python-Abhängigkeiten
pip install -r requirements.txt
```

### 3. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env.local
# .env.local mit deinen Werten befüllen (siehe .env.example)
```

### 4. Supabase einrichten

```bash
# Datenbank-Schema ausführen (Datei: docs/schema.sql)
# Im Supabase Dashboard unter SQL Editor einfügen
```

### 5. Lokal starten

```bash
npm run dev
```

### 6. Deployment (Vercel)

```bash
npm run build
vercel deploy
```

### 7. GitHub Actions Secrets konfigurieren

Folgende Secrets im GitHub Repository unter *Settings → Secrets → Actions* hinterlegen:

| Secret | Beschreibung |
|---|---|
| `SUPABASE_URL` | Deine Supabase Projekt-URL |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role Key |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot HTTP API Token |
| `GNEWS_API_KEY` | GNews API Key (Free Tier) |

---

## Projektstruktur

```
osint-location-monitor/
├── src/
│   ├── routes/             # SvelteKit-Seiten
│   │   ├── +page.svelte    # Dashboard
│   │   ├── locations/      # Orte verwalten
│   │   ├── alerts/         # Alert-Historie
│   │   └── settings/       # Einstellungen
│   └── lib/
│       ├── supabase.js     # Supabase Client
│       ├── stores/         # Svelte Stores
│       └── utils/          # Hilfsfunktionen
├── scripts/
│   ├── monitor.py          # 15-Min-Monitoring
│   ├── morning_report.py   # Täglicher Morgenbericht
│   └── utils.py            # Gemeinsame Hilfsfunktionen
├── .github/workflows/
│   ├── monitor.yml         # Cron alle 15 Min
│   └── morning-report.yml  # Cron täglich 09:00
├── static/                 # PWA Assets, Icons
├── docs/                   # Schema, Dokumentation
├── .env.example
├── BRIEF.md
├── TASKS.md
├── DECISIONS.md
└── README.md
```

---

## Lizenz

MIT – Open Source, freie Nutzung.

---

*Entwickelt von Clemens Pompeÿ – München 2026*
