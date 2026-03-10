# BRIEF.md – OSInt Location Monitor
**Version:** 0.1.0
**Datum:** 2026-03-10
**Autor:** Clemens Pompeÿ

---

## 1. Kernfunktion

Eine Progressive Web App, die öffentlich verfügbare Informationen zu spezifischen, europäischen Adressen (z. B. Ferienhaus) kontinuierlich überwacht und den Eigentümer via Telegram benachrichtigt, sobald kritische Ereignisse in der Region auftreten (Unwetter, Hochwasser, Feuer, Unruhen etc.).

---

## 2. Zielgruppe & Problem

**Nutzer:** Abwesende Ferienhaus-Eigentümer und deren Freunde/Bekannte in ähnlicher Situation.

**Hauptproblem:** Die Eigentümer sind die meiste Zeit nicht vor Ort und haben keinen Überblick über aktuelle Ereignisse am Anwesen. Das verhindert rechtzeitiges Reagieren – z. B. einen Hausmeister oder eine Vertrauensperson loszuschicken.

---

## 3. MVP – Version 1

Die folgenden Features müssen in Version 1 funktionieren:

- **Ortsauswahl:** Eingabe einer konkreten Adresse (z. B. Straße, Ort, Land)
- **Ereignis-Kategorien:** Auswahl aus 5 kritischen Kategorien (z. B. Unwetter, Hochwasser, Feuer, politische Unruhen, Erdbeben/Naturkatastrophen)
- **Telegram-Benachrichtigung:** Push-Alerts bei kritischen Ereignissen über bestehenden Bot
- **Live-Daten von Tag 1:** Keine Demo-Daten – Crawler lokaler Tageszeitungen und freier APIs als Informationsquellen
- **Täglicher Morgenbericht (09:00 Uhr):** Automatische Telegram-Nachricht mit aktueller Temperatur, Wetterlage und kurzer politischer Lageeinschätzung für den Ort
- **Optional (v1):** Login-Bereich (gesicherter Admin-Bereich) zur Verwaltung von Orten, Telegram-Zugangsdaten und Kategorien

---

## 4. Out of Scope (explizit ausgeschlossen)

- Keine Mobile Native App (iOS/Android)
- Kein Abo-Modell oder Monetarisierung im Prototypen
- Keine In-App-Payments, keine Affiliate-Links (z. B. Mietwagen-Buchungen)

---

## 5. Integrationen & APIs

- **Telegram Bot:** Bestehender Bot, HTTP API-Token liegt vor
- **Wetter:** Kostenlose API (z. B. Open-Meteo, OpenWeatherMap Free Tier)
- **News/Ereignisse:** Web-Crawler lokaler Tageszeitungen + kostenlose News-APIs (z. B. GNews, NewsAPI Free Tier)
- **Politische Lage:** Öffentlich verfügbare Quellen / News-Aggregatoren

---

## 6. Constraints

| Constraint | Details |
|---|---|
| Budget | 0 € (nur kostenlose APIs und Services) |
| Hosting | Kostenlos (z. B. Vercel, Render, Railway Free Tier) |
| Repository | GitHub Public Repository |
| Zeitrahmen | Kein fixer Deadline-Druck |
| Deployment | Cloud-hosted, kein lokaler Betrieb |

---

## 7. Definition of Done (Version 1)

- [ ] Mindestens eine Adresse ist im System hinterlegt
- [ ] Täglich um 09:00 Uhr trifft eine Telegram-Nachricht mit Wetter + politischer Lageeinschätzung ein
- [ ] Bei einem Unwetter (oder Test-Event) in der Region wird automatisch eine Telegram-Alert-Nachricht ausgelöst
- [ ] Die App ist als PWA im Browser und auf dem Smartphone nutzbar

---

## 8. Ereignis-Kategorien (final)

| # | Kategorie | Beschreibung |
|---|---|---|
| 1 | Unwetter | Sturm, Hagel, Schneefall, Extremtemperaturen |
| 2 | Hochwasser | Überschwemmungen, Pegelstände |
| 3 | Feuer / Waldbrand | Wald- und Flächenbrände, Großbrände |
| 4 | Politische Unruhen | Demonstrationen, Ausschreitungen, Sicherheitslage |
| 5 | Erdbeben | Seismische Aktivitäten in der Region |

---

## 9. Alert-Timing & Berichtsformat

- **Kritische Alerts:** Auslösung innerhalb von **15 Minuten** nach Erkennung
- **Täglicher Morgenbericht (09:00 Uhr):**
  - Aktuelle Temperatur & Wetterlage
  - Kurze politische Lageeinschätzung
  - **"Alles ruhig"-Status** wenn keine Ereignisse vorliegen

---

*Dokument finalisiert am 2026-03-10 – bereit für Tech-Stack-Entscheidung.*
