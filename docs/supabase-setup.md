# Supabase Setup – Schritt-für-Schritt
**Einmalig manuell ausführen**

---

## 1. Supabase Projekt anlegen

1. Gehe zu https://supabase.com und logge dich ein (kostenlos)
2. Klick auf **"New project"**
3. Wähle eine Organisation (oder erstelle eine)
4. Einstellungen:
   - **Name:** `osint-location-monitor`
   - **Database Password:** Sicheres Passwort wählen und speichern!
   - **Region:** `West EU (Ireland)` – am nächsten für europäische Locations
5. Klick auf **"Create new project"** – warte ~2 Minuten

---

## 2. Datenbank-Schema ausführen

1. Im Supabase Dashboard → Linke Sidebar → **"SQL Editor"**
2. Klick auf **"New query"**
3. Öffne die Datei `docs/schema.sql` aus dem Projekt
4. Kopiere den gesamten Inhalt
5. Füge ihn in den SQL Editor ein
6. Klick auf **"Run"** (oder Cmd+Enter)
7. Alle Tabellen und Policies sollten ohne Fehler erstellt werden

**Erwartetes Ergebnis:**
```
✓ profiles
✓ locations
✓ location_categories
✓ alerts
✓ RLS Policies (4 Stück)
✓ Indexes (5 Stück)
```

---

## 3. API Keys kopieren

1. Linke Sidebar → **"Project Settings"** → **"API"**
2. Kopiere:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public** Key → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** Key → `SUPABASE_SERVICE_KEY` *(nur für GitHub Actions, niemals ins Frontend!)*

---

## 4. Auth einrichten (für späteren Milestone 5)

1. Linke Sidebar → **"Authentication"** → **"Providers"**
2. **Email** sollte standardmäßig aktiviert sein → ✓
3. Optional: **"Email Confirmations"** deaktivieren für einfacheres Testen

---

## 5. Ersten Test-User anlegen

1. Linke Sidebar → **"Authentication"** → **"Users"** → **"Invite user"**
2. Trage deine E-Mail ein
3. Du erhältst eine Einladungs-E-Mail → Passwort setzen

---

## 6. Umgebungsvariablen in .env.local eintragen

```bash
cd /PFAD/ZU/DEINEM/ORDNER/OSInt
cp .env.example .env.local
```

Dann `.env.local` öffnen und die Supabase-Werte eintragen.

---

*Nach diesem Setup ist Supabase bereit für Milestone 2 (Python Scripts) und Milestone 4 (Frontend).*
