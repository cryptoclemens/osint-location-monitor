# CLAUDE.md – OSInt Vacation

> Diese Datei wird von Claude Code automatisch gelesen. Sie enthält den aktuellen
> Projektstand, wichtige Konventionen und Anweisungen für alle Claude-Instanzen.

---

## Projekt-Kurzübersicht

**OSInt Vacation** ist eine PWA, die europäische Adressen (Ferienhäuser, Zweitwohnsitze)
kontinuierlich überwacht und den Eigentümer via Telegram bei Unwetter, Erdbeben, Feuer,
Hochwasser oder Unruhen benachrichtigt. Täglich gibt es einen Morgenbericht mit Wetter + News.

- **Frontend:** SvelteKit PWA → Vercel
- **Datenbank + Auth:** Supabase (PostgreSQL + RLS)
- **Monitoring:** Python-Scripts via GitHub Actions (alle 15 Min. + täglich 09:00 Uhr CEST)
- **Alerts:** Telegram Bot API
- **Datenquellen:** Open-Meteo (Wetter), USGS (Erdbeben), GNews (News)

Vollständige Beschreibung: `BRIEF.md` | Alle Tasks: `TASKS.md` | Architekturentscheide: `DECISIONS.md`

---

## Aktueller Stand (2026-03-19, v0.10.1)

| Was | Status |
|---|---|
| Monitoring (15-Min-Cron) | ✅ Live |
| Morgenbericht (09:00 Uhr CEST) | ✅ Live – TELEGRAM_BOT_TOKEN heute korrigiert |
| GNews API Key | ✅ Heute erneuert (Key in GitHub Secret `GNEWS_API_KEY`) |
| PWA auf Vercel | ✅ Live |
| Milestone 10 (Polish) | ✅ Abgeschlossen |
| Nächster Meilenstein | Milestone 11 – noch nicht geplant |

---

## Wichtige Dateipfade

```
scripts/
  monitor.py          # Hauptmonitor: Wetter, Erdbeben, News → Telegram
  morning_report.py   # Täglicher Bericht: Wetter + News + Lageeinschätzung
  utils.py            # Supabase-Client, Telegram-Helper, Logging
  requirements.txt    # Python-Dependencies

.github/workflows/
  monitor.yml         # Cron alle 15 Min.
  morning-report.yml  # Cron täglich 07:00 UTC (= 09:00 CEST)
  supabase-keepalive.yml  # Täglich 06:00 UTC, verhindert Supabase-Pause

src/routes/           # SvelteKit-Seiten (Dashboard, Locations, Alerts, Settings…)
src/lib/              # Supabase-Client, RateLimit, Komponenten
docs/                 # Schema, Deployment-Runbook, Security-Checklist
```

---

## GitHub Secrets (alle müssen gesetzt sein)

| Secret | Beschreibung |
|---|---|
| `SUPABASE_URL` | Supabase Projekt-URL |
| `SUPABASE_SERVICE_KEY` | Service Role Key (umgeht RLS, nur in Actions) |
| `SUPABASE_ANON_KEY` | Anon Key (für Keep-Alive-Ping) |
| `TELEGRAM_BOT_TOKEN` | Bot-Token von @BotFather |
| `TELEGRAM_CHAT_ID` | Chat-ID des Empfängers |
| `GNEWS_API_KEY` | GNews Free Tier API Key (100 Req/Tag) |

---

## Entwicklungskonventionen

### Branch-Strategie
Bisher `main`-only. Bei gemeinsamer Entwicklung: Feature-Branch → PR → merge.

### Nach jeder Änderung
1. **`TASKS.md` aktualisieren** – geänderte Tasks auf `✅ Done` setzen oder neue Tasks hinzufügen
2. **`DECISIONS.md` ergänzen** – wenn eine Architekturentscheidung getroffen wurde (Format: `### [YYYY-MM-DD] Titel`)
3. **`CLAUDE.md` (diese Datei) aktualisieren** – Datum + Status im Abschnitt „Aktueller Stand" anpassen
4. **Alles in einem Commit** – Code + Doku-Updates gehören zusammen

### Commit-Format
```
Kurze Beschreibung (max. 72 Zeichen)

- Detail 1
- Detail 2
```

### Keine hardcodierten Secrets
API-Keys und Tokens gehören ausschließlich in GitHub Secrets (Actions) bzw.
Vercel Environment Variables (Frontend). Niemals in Code oder `.env`-Dateien committen.

---

## Bekannte Eigenheiten

- **GNews 403**: Wenn der Free-Tier-Key abgelaufen ist, läuft der Morgenbericht trotzdem durch – nur ohne News-Block. Key erneuern unter gnews.io → als `GNEWS_API_KEY` Secret setzen.
- **Supabase Cold Start**: Keep-Alive-Workflow verhindert das Einschlafen. Falls doch kalt: erste SSR-Anfrage wartet (< 30 s).
- **Vercel Build**: `TELEGRAM_BOT_TOKEN` muss auch als Vercel Env-Var gesetzt sein (`$env/dynamic/private` in `api/test-telegram/+server.js`).
- **SvelteKit Guard-Bug**: Vite-Plugin-Shim in `vite.config.js` → nicht entfernen (siehe DECISIONS.md).
