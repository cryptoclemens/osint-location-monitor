# GitHub Repository Setup
**Einmalige Anleitung – auf deinem Mac ausführen**

Das lokale Git-Repository ist bereits initialisiert und der erste Commit ist gemacht.
Folge diesen Schritten, um das Projekt auf GitHub zu pushen.

---

## Option A – Via GitHub CLI (empfohlen)

### 1. GitHub CLI installieren (falls noch nicht vorhanden)
```bash
brew install gh
```

### 2. Einloggen
```bash
gh auth login
# Wähle: GitHub.com → HTTPS → Yes → Login with a web browser
```

### 3. In das Projektverzeichnis wechseln
```bash
cd /PFAD/ZU/DEINEM/ORDNER/OSInt
# Beispiel: cd ~/Documents/OSInt
```

### 4. GitHub Public Repo anlegen & pushen
```bash
gh repo create osint-location-monitor \
  --public \
  --description "PWA to monitor public information at European locations and send Telegram alerts for critical events." \
  --source=. \
  --remote=origin \
  --push
```

Das war's! Das Repo ist jetzt live unter:
`https://github.com/DEIN_USERNAME/osint-location-monitor`

---

## Option B – Manuell via GitHub.com

### 1. Repository auf GitHub anlegen
1. Gehe zu https://github.com/new
2. Repository Name: `osint-location-monitor`
3. Description: `PWA to monitor public information at European locations and send Telegram alerts for critical events.`
4. Sichtbarkeit: **Public**
5. **WICHTIG:** Kein README, kein .gitignore, keine Lizenz anlegen (bereits vorhanden)
6. Klick auf **"Create repository"**

### 2. Remote hinzufügen & pushen
```bash
cd /PFAD/ZU/DEINEM/ORDNER/OSInt

git remote add origin https://github.com/DEIN_USERNAME/osint-location-monitor.git
git push -u origin main
```

---

## GitHub Actions Secrets konfigurieren (nach dem Push)

Gehe zu: `https://github.com/DEIN_USERNAME/osint-location-monitor/settings/secrets/actions`

Füge folgende **Repository Secrets** hinzu:

| Secret Name | Wert | Wo herbekommen |
|---|---|---|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Supabase → Project Settings → API → service_role key |
| `TELEGRAM_BOT_TOKEN` | Dein Bot Token | Bereits vorhanden |
| `TELEGRAM_CHAT_ID` | Deine Chat-ID | Via @userinfobot in Telegram |
| `GNEWS_API_KEY` | API Key | https://gnews.io → kostenlos registrieren |

---

*Danach sind die GitHub Actions für Milestone 3 startklar.*
