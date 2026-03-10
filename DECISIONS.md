# DECISIONS.md – Architekturentscheidungen
**Projekt:** OSInt Location Monitor
**Version:** 0.1.0 | **Letzte Aktualisierung:** 2026-03-10

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

*Weitere Entscheidungen werden laufend ergänzt.*
