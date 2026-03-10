# Deployment-Runbook – OSInt Location Monitor
**Version:** 0.6.0 | **Stand:** 2026-03-10

Dieses Dokument beschreibt den vollständigen Deployment-Prozess vom ersten Push bis zum produktiven System.

---

## 1. Voraussetzungen

| Service | Was du brauchst | Kostenlos? |
|---|---|---|
| **GitHub** | Repository `cryptoclemens/osint-location-monitor` | ✅ |
| **Supabase** | Projekt-URL + anon key + service key | ✅ |
| **Telegram** | Bot Token + Chat-ID | ✅ |
| **GNews** | API Key (100 requests/Tag Free Tier) | ✅ |
| **Vercel** | Account (via GitHub Login) | ✅ |

---

## 2. Supabase einrichten (einmalig)

### 2.1 Datenbank-Schema anlegen
Im Supabase Dashboard → **SQL Editor** → **New Query**, dann einfügen:

```sql
-- Vollständiges Schema
-- Datei: docs/schema.sql
```

Füge den Inhalt aus `docs/schema.sql` ein und klicke **Run**.

### 2.2 Profile-Trigger anlegen (für Auth)
Im SQL Editor ausführen:

```sql
-- Datei: docs/schema-rls-patch.sql
```

Füge den Inhalt aus `docs/schema-rls-patch.sql` ein und klicke **Run**.

### 2.3 API-Schlüssel notieren
**Project Settings → API:**

| Variable | Wo | Verwendung |
|---|---|---|
| `SUPABASE_URL` | Project URL | Python-Scripts (GitHub Actions) |
| `PUBLIC_SUPABASE_URL` | Project URL | SvelteKit Frontend (Vercel) |
| `SUPABASE_SERVICE_KEY` | service_role key | Python-Scripts (bypasses RLS) |
| `SUPABASE_ANON_KEY` | anon/public key | Python-Scripts |
| `PUBLIC_SUPABASE_ANON_KEY` | anon/public key | SvelteKit Frontend (Vercel) |

> ⚠️ **Achtung:** Den `service_role` Key **niemals** im Frontend verwenden oder in den Code committen!

---

## 3. GitHub Secrets konfigurieren (für GitHub Actions)

Repository → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Beschreibung |
|---|---|
| `SUPABASE_URL` | Supabase Projekt-URL |
| `SUPABASE_SERVICE_KEY` | service_role key |
| `SUPABASE_ANON_KEY` | anon/public key |
| `TELEGRAM_BOT_TOKEN` | Bot Token von @BotFather |
| `TELEGRAM_CHAT_ID` | Deine persönliche Chat-ID |
| `GNEWS_API_KEY` | GNews API Key |

### Telegram Chat-ID herausfinden:
1. Schreibe deinem Bot eine Nachricht
2. Öffne: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Suche nach `"chat":{"id":XXXXX}` – das ist deine Chat-ID

---

## 4. Vercel Deployment

### 4.1 Erstmaliges Deployment (via CLI)
```bash
# Im Projektordner:
npx vercel

# → Bei Framework: SvelteKit wird automatisch erkannt
# → Deploy to production: y
```

### 4.2 Environment Variables in Vercel

**Vercel Dashboard → dein Projekt → Settings → Environment Variables**

Folgende Variablen **müssen** vor dem ersten Build gesetzt sein:

| Variable | Wert | Scope |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production + Preview |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production + Preview |

> 💡 Diese Variablen werden zur **Build-Zeit** in den Bundle eingebaut (`$env/static/public` in SvelteKit). Sie **müssen** vor dem Build gesetzt sein – ein Redeploy nach dem Setzen ist nötig!

### 4.3 Nach dem Setzen der Env-Vars: Redeploy
```
Vercel Dashboard → Deployments → letzter Eintrag → ⋯ → Redeploy
```

### 4.4 Custom Domain (optional)
```
Vercel Dashboard → dein Projekt → Settings → Domains → Add
```
Dann im DNS-Provider einen CNAME-Eintrag hinzufügen:
```
CNAME   @   cname.vercel-dns.com
```

---

## 5. Ersten User in Supabase anlegen

Nach dem Deployment: Supabase Dashboard → **Authentication → Users → Add user**

- Email: deine E-Mail
- Password: sicheres Passwort
- "Auto Confirm User": ✅ aktivieren

Dann unter `https://deine-app.vercel.app/login` einloggen.

---

## 6. E2E-Test nach Deployment ausführen

```bash
# .env.local befüllen (siehe .env.example)
cp .env.example .env.local
# ... Werte eintragen ...

# Verbindungstest (keine Telegram-Nachrichten)
python scripts/test_connections.py

# Vollständiger E2E-Test (sendet echte Telegram-Nachrichten!)
python scripts/test_e2e.py

# E2E-Test ohne Telegram (dry-run)
python scripts/test_e2e.py --dry-run

# Mit Vercel-Health-Check
python scripts/test_e2e.py --vercel-url https://deine-app.vercel.app
```

---

## 7. GitHub Actions manuell triggern (Test)

**Repository → Actions → "OSInt Monitor" → Run workflow → Run workflow**

Prüfe danach:
- [ ] Action hat grüne Status-Symbole
- [ ] Supabase `alerts`-Tabelle zeigt neue Einträge (falls Events gefunden)
- [ ] Telegram-Nachricht kommt an (bei Events)

**Repository → Actions → "Morning Report" → Run workflow**

Prüfe:
- [ ] Telegram-Nachricht mit Wetter + Lageeinschätzung kommt an

---

## 8. Definition of Done – Checkliste

| # | Kriterium | Status |
|---|---|---|
| DoD-1 | Mindestens eine Adresse im System hinterlegt | ⬜ |
| DoD-2 | Täglich um 09:00 Uhr trifft Telegram-Morgenbericht ein | ⬜ |
| DoD-3 | Bei Test-Event wird Telegram-Alert ausgelöst | ⬜ |
| DoD-4 | App als PWA im Browser und Smartphone nutzbar | ⬜ |

---

## 9. Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER / SMARTPHONE                                           │
│  SvelteKit PWA (Vercel)                                         │
│  → /login → /locations → /alerts → /settings                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / Supabase JS SDK
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  SUPABASE (Database + Auth)                                     │
│  PostgreSQL: locations, alerts, location_categories, profiles   │
│  Auth: Email/Passwort + Row Level Security                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Service Key (bypasses RLS)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS (Scheduler)                                     │
│  ├── monitor.yml     → alle 15 Min → monitor.py                │
│  │     ├── Open-Meteo (Unwetter)                               │
│  │     ├── USGS (Erdbeben)                                     │
│  │     └── GNews (Feuer, Hochwasser, Unruhen)                  │
│  └── morning-report.yml → täglich 09:00 → morning_report.py   │
│        └── Open-Meteo + Lageeinschätzung                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Bot Token
                           ▼
                    TELEGRAM BOT
                    (Push-Nachrichten)
```

---

## 10. Troubleshooting

| Problem | Lösung |
|---|---|
| Vercel Build: `PUBLIC_SUPABASE_URL not exported` | Env-Vars in Vercel setzen, dann Redeploy |
| Vercel Build: `lxml build failed` | `requirements.txt` liegt in `scripts/`, nicht Root – prüfen |
| Login schlägt fehl | User in Supabase anlegen + Profile-Trigger aus `schema-rls-patch.sql` ausführen |
| Keine Telegram-Nachrichten | GitHub Secrets prüfen, `test_connections.py` lokal ausführen |
| GitHub Action schlägt fehl | Logs in Actions tab prüfen, Secrets vollständig? |
| Location anlegen schlägt fehl | RLS-Policies prüfen, Profile-Trigger aktiv? |
