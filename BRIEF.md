# BRIEF.md – OSInt Vacation
**Version:** 0.9.0
**Erstellt:** 2026-03-10 | **Aktualisiert:** 2026-03-11
**Autor:** Clemens Pompeÿ

> Dieses Dokument ist die lebende Projektbeschreibung. Es wird nach jedem Meilenstein aktualisiert
> und spiegelt den aktuellen Funktionsumfang sowie die noch geplanten Features wider.

---

## 1. Kernfunktion

**OSInt Vacation** ist eine Progressive Web App, die öffentlich verfügbare Informationen zu spezifischen europäischen Adressen (z. B. Ferienhaus, Finca, Zweitwohnsitz) kontinuierlich überwacht und den Eigentümer via Telegram benachrichtigt, sobald kritische Ereignisse in der Region auftreten (Unwetter, Hochwasser, Feuer, Unruhen, Erdbeben).

Zusätzlich erhalten Nutzer täglich um 09:00 Uhr einen Morgenbericht mit aktueller Wetterlage und politischer Lageeinschätzung für ihre überwachten Orte.

---

## 2. Zielgruppe & Problem

**Nutzer:** Abwesende Ferienhaus-Eigentümer und Personen mit Immobilien oder regelmäßigen Reisezielen in Europa, die sie nicht ständig persönlich besuchen können.

**Hauptproblem:** Die Eigentümer sind die meiste Zeit nicht vor Ort und haben keinen Überblick über aktuelle Ereignisse am Anwesen. Das verhindert rechtzeitiges Reagieren – z. B. einen Hausmeister oder eine Vertrauensperson loszuschicken.

**Lösung:** Automatisches, 24/7-Monitoring mit sofortiger Telegram-Benachrichtigung. Kein manuelles Nachschauen auf Nachrichtenseiten nötig.

---

## 3. Erledigte Meilensteine & aktueller Funktionsumfang

| Meilenstein | Beschreibung | Status |
|---|---|---|
| M1 – Setup | Projektstruktur, Supabase-Schema, GitHub-Repo | ✅ Fertig |
| M2 – Python Monitoring | Wetter, Erdbeben, News-Crawler, Telegram-Alerts, Morgenbericht | ✅ Fertig |
| M3 – GitHub Actions | Cron-Scheduler (15 Min. Monitor, 09:00 Morgenbericht), Secrets | ✅ Fertig |
| M4 – PWA Frontend | SvelteKit, Dashboard, Locations, Alerts, Settings, PWA-Manifest | ✅ Fertig |
| M5 – Auth | Supabase Auth (Email/Passwort), Login, Route Guards, RLS | ✅ Fertig |
| M6 – Deployment | Vercel-Deploy, E2E-Tests, Service Worker, Lighthouse-Config | ✅ Fertig |
| M7 – Onboarding | Landing Page, Self-Signup, Onboarding-Wizard, Passwort-Reset | ✅ Fertig |
| M8 – Performance | Server-side Loading, Supabase Keep-Alive, Cache-Optimierungen | ✅ Fertig |
| M9 – Sicherheit & Qualität | Rate Limiting, Security-Header, Pagination, Tests, Komponenten | ✅ Fertig |

### Was heute funktioniert (Live auf Vercel)

- **Monitoring läuft automatisch** via GitHub Actions alle 15 Minuten (Unwetter, Erdbeben, Feuer, Unruhen, Hochwasser)
- **Täglicher Morgenbericht** um 09:00 Uhr per Telegram
- **Telegram-Alerts** bei kritischen Ereignissen (< 15 Min. Reaktionszeit)
- **Web-App (PWA)** unter der Vercel-URL – installierbar auf Smartphone
- **Dashboard:** Übersicht aktiver Orte und letzter Alerts
- **Locations:** Orte via Adresse/Geocoding hinzufügen, bearbeiten, löschen
- **Alert-Historie:** Alle versendeten Alerts mit Kategorie, Schweregrad, Quelle
- **Settings:** Telegram Chat-ID konfigurieren
- **Öffentliche Landing Page** (`/`) mit Produkt-Beschreibung, Features, CTA
- **Self-Service-Registrierung** (`/register`) – neue Nutzer können sich selbst anmelden
- **Onboarding-Wizard** (`/onboarding`) – führt neue Nutzer durch Telegram-Setup + ersten Ort
- **Passwort vergessen** (`/reset-password`) – vollständiger Reset-Flow via E-Mail

---

## 4. Geplante Features (noch offen)

| Feature | Meilenstein | Priorität |
|---|---|---|
| Server-side Datenladen (< 1 s statt 3+ Min.) | M8 | 🔴 Must |
| Supabase Keep-Alive (GitHub Actions daily ping) | M8 | 🔴 Must |
| `onboarding_done`-Cookie-Cache im Layout | M8 | 🟡 Should |
| Custom Domain | M6 (offen) | 🟢 Nice |
| Lighthouse-CI-Audit nach Deploy | M6 (offen) | 🟢 Nice |
| Supabase E-Mail-Templates anpassen | M7 (User-Action) | 🟡 Should |

---

## 5. Tech-Stack

| Schicht | Technologie | Begründung |
|---|---|---|
| Frontend | SvelteKit (PWA) | Leichtgewichtig, SSR, kein Framework-Overhead |
| Datenbank + Auth | Supabase (PostgreSQL + Auth) | Kostenlos, RLS, realtime-fähig |
| Hosting Frontend | Vercel | Zero-Config SvelteKit-Deploy, 0€ |
| Monitoring-Scripts | Python (GitHub Actions) | Beste Crawling-Libraries, 0€ bei Public Repo |
| Alerts | Telegram Bot API | Bestehender Bot, sofortige Push-Notifications |
| Wetter | Open-Meteo | Kostenlos, kein API-Key, EU-Server |
| News | GNews Free Tier | REST JSON, 100 Req./Tag |
| Geocoding | Nominatim (OSM) | Kostenlos, kein API-Key |

---

## 6. Constraints

| Constraint | Details |
|---|---|
| Budget | 0 € (nur kostenlose APIs und Services) |
| Hosting | Vercel (Frontend), GitHub Actions (Scripts), Supabase Free Tier (DB) |
| Repository | GitHub Public Repository |
| Zeitrahmen | Kein fixer Deadline-Druck |
| Deployment | Cloud-hosted, kein lokaler Betrieb |
| Datenquellen | Nur öffentlich verfügbare Informationen (OSINT-Prinzip) |

---

## 7. Ereignis-Kategorien

| # | Kategorie | Datenquelle | Schwellwert |
|---|---|---|---|
| 1 | Unwetter | Open-Meteo | WMO Code ≥ 82 ODER Wind ≥ 70 km/h |
| 2 | Hochwasser | GNews | News-Keywords im Umkreis |
| 3 | Feuer / Waldbrand | GNews | News-Keywords im Umkreis |
| 4 | Politische Unruhen | GNews | News-Keywords im Umkreis |
| 5 | Erdbeben | USGS Earthquake API | Magnitude ≥ 4.0 im Radius 100 km |

---

## 8. Alert-Verhalten

- **Kritische Alerts:** Auslösung innerhalb von 15 Minuten nach Erkennung
- **Deduplizierung:** Ein Alert pro Location + Kategorie innerhalb von 2 Stunden
- **Täglicher Morgenbericht (09:00 Uhr):**
  - Aktuelle Temperatur & Wetterlage
  - Kurze politische Lageeinschätzung
  - „Alles ruhig"-Status wenn keine Ereignisse vorliegen

---

## 9. Definition of Done

### Version 1 (MVP) – ✅ Erreicht

- [x] Mindestens eine Adresse ist im System hinterlegt
- [x] Täglich um 09:00 Uhr trifft eine Telegram-Nachricht ein
- [x] Bei einem Unwetter in der Region wird automatisch eine Telegram-Alert-Nachricht ausgelöst
- [x] Die App ist als PWA im Browser und auf dem Smartphone nutzbar

### Version 2 (aktuell) – 🔄 In Arbeit

- [x] Neue Nutzer können sich selbst registrieren (ohne manuellen Supabase-Eingriff)
- [x] Onboarding-Flow führt neue Nutzer durch die Einrichtung
- [x] Öffentliche Landing Page erklärt die App
- [ ] Ladezeiten < 5 Sekunden (auch nach Supabase-Inaktivität) ← M8

---

*Dokument zuletzt aktualisiert: 2026-03-11 nach Abschluss Milestone 7*
