# Security Checklist – OSInt Vacation
**Version:** 1.0 | **Erstellt:** 2026-03-11 (M9)
**Ziel:** Manuelle Sicherheits-Actions vor dem öffentlichen Launch

---

## Ergebnis automatischer Prüfungen (M9)

| Prüfung | Ergebnis |
|---|---|
| `SUPABASE_SERVICE_KEY` im Client-Bundle? | ✅ Nicht vorhanden |
| `SUPABASE_SERVICE_KEY` in SvelteKit-Code? | ✅ Nicht vorhanden (nur GitHub Actions Secrets) |
| `.env.local` in `.gitignore`? | ✅ Ja (`.env`, `.env.local`, `.env.*.local`) |
| RLS auf allen Tabellen aktiviert? | ✅ Ja (`profiles`, `locations`, `location_categories`, `alerts`) |
| RLS-Policies korrekt (User sieht nur eigene Daten)? | ✅ Im Schema korrekt definiert |
| Rate Limiting auf sensiblen Routen? | ✅ `/register`, `/reset-password`, `/api/test-telegram` |
| Geocoding-Timeout? | ✅ 8-Sekunden-AbortController |

---

## Manuelle Actions (einmalig im Supabase Dashboard)

### 1. RLS-Policies im Supabase Dashboard verifizieren
**Wann:** Einmalig nach dem ersten Deploy

1. Supabase Dashboard → Database → Tables
2. Jede Tabelle anklicken → Tab "Policies" prüfen:
   - `profiles`: Policy "Users can manage own profile" → `auth.uid() = id` ✓
   - `locations`: Policy "Users can manage own locations" → `auth.uid() = user_id` ✓
   - `location_categories`: Policy "Users can manage own location categories" ✓
   - `alerts`: Policy "Users can view own alerts" → `auth.uid() = user_id` ✓
3. **Test:** Mit User A einloggen → Location anlegen. Mit User B einloggen → prüfen, dass User A's Location nicht sichtbar ist.

### 2. Supabase Auth Rate Limiting konfigurieren
**Wann:** Vor öffentlichem Launch

Supabase hat eingebautes Rate Limiting für Auth-Endpunkte:
1. Supabase Dashboard → Authentication → Rate Limits
2. Empfohlene Einstellungen:
   - **Email Signups:** 5 / Stunde
   - **Email OTP (Magic Link, Recovery):** 5 / Stunde
   - **Token Refresh:** 360 / Stunde (Standard)

### 3. Supabase Auth URL-Konfiguration prüfen
1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** auf Vercel-URL setzen (z. B. `https://deine-app.vercel.app`)
3. **Redirect URLs:** `https://deine-app.vercel.app/**` hinzufügen

### 4. Vercel Environment Variables prüfen
1. Vercel Dashboard → Settings → Environment Variables
2. Folgende Variablen müssen gesetzt sein:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `PUBLIC_SITE_URL` (Vercel-URL)
3. Folgende Variablen dürfen **nicht** gesetzt sein (sonst Leak-Risiko):
   - `SUPABASE_SERVICE_KEY` (nur in GitHub Secrets!)
4. Vercel → Deployments → letzter Build → Function Logs prüfen, dass kein Service-Key geloggt wird.

### 5. GitHub Secrets prüfen
1. GitHub Repo → Settings → Secrets and Variables → Actions
2. Folgende Secrets müssen vorhanden sein:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `GNEWS_API_KEY`

---

## Wiederkehrende Sicherheits-Reviews

| Frequenz | Aufgabe |
|---|---|
| Monatlich | Supabase Dashboard → Auth → Users: unbekannte User-Accounts prüfen |
| Monatlich | GitHub Actions → Logs: fehlerhafte Runs prüfen |
| Quartalsweise | API-Keys rotieren (GNews, Telegram Bot Token) |
| Bei Bedarf | Supabase → Database → Logs: unerwartete Queries prüfen |
