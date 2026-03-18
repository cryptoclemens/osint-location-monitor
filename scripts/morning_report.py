"""
morning_report.py – Daily 09:00 morning briefing for OSInt Location Monitor
For each active location, sends a Telegram message with:
  - Current temperature & weather conditions
  - Recent news summary (last 24h)
  - "Alles ruhig" status if no critical events
  - Active alert count from the last 24h

Run: python scripts/morning_report.py
     python scripts/morning_report.py --test  (uses Munich, no Supabase writes)
"""

import sys
import argparse
import requests
from datetime import datetime, timezone, timedelta
from loguru import logger

sys.path.insert(0, __file__.rsplit("/", 1)[0])

from utils import (
    load_environment, setup_logging, get_required_env,
    get_supabase, get_active_locations, send_telegram, wmo_description,
)


# ─────────────────────────────────────────────
# Weather summary (Open-Meteo)
# ─────────────────────────────────────────────

def get_weather_summary(lat: float, lon: float) -> dict:
    """
    Fetch current weather and today's max/min temperatures.
    Returns a dict with temp, condition, wind, rain, high, low.
    Falls back to empty dict on error.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude":  lat,
        "longitude": lon,
        "current":   "temperature_2m,wind_speed_10m,precipitation,weather_code",
        "daily":     "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "wind_speed_unit": "kmh",
        "timezone":  "auto",
        "forecast_days": 1,
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data    = response.json()
        current = data.get("current", {})
        daily   = data.get("daily", {})
    except requests.RequestException as e:
        logger.warning(f"Open-Meteo request failed: {e}")
        return {}

    code = current.get("weather_code", 0)

    return {
        "temp":      current.get("temperature_2m", "?"),
        "condition": wmo_description(code),
        "wind":      current.get("wind_speed_10m", 0),
        "rain":      current.get("precipitation", 0),
        "high":      (daily.get("temperature_2m_max") or [None])[0],
        "low":       (daily.get("temperature_2m_min") or [None])[0],
        "rain_day":  (daily.get("precipitation_sum") or [None])[0],
    }


# ─────────────────────────────────────────────
# News summary (GNews)
# ─────────────────────────────────────────────

MORNING_KEYWORDS = "Nachrichten OR news OR aktuell OR local"

def get_news_summary(location_name: str, country_code: str, max_articles: int = 3) -> list:
    """
    Fetch the top recent news articles for the location from GNews.
    Returns a list of article dicts (title, source, url).
    """
    api_key = os.getenv("GNEWS_API_KEY")
if not api_key:
    logger.warning("GNEWS_API_KEY not set – skipping news summary")
    return []
    # Use last part of address as search term (city/region)
    location_term = location_name.split(",")[-1].strip() if "," in location_name else location_name
    query = location_term  # Broad search for morning context

    url = "https://gnews.io/api/v4/search"
    params = {
        "q":      query,
        "max":    max_articles,
        "lang":   "de,en,fr,it,es",
        "from":   (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "apikey": api_key,
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        articles = response.json().get("articles", [])
        return [
            {
                "title":  a.get("title", ""),
                "source": a.get("source", {}).get("name", ""),
                "url":    a.get("url", ""),
            }
            for a in articles
        ]
    except requests.RequestException as e:
        logger.warning(f"GNews request failed for morning report: {e}")
        return []


# ─────────────────────────────────────────────
# Recent alerts from Supabase (last 24h)
# ─────────────────────────────────────────────

def get_recent_alerts(location_id: str) -> list:
    """Return all alerts logged in the last 24 hours for this location."""
    sb   = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    result = sb.table("alerts").select(
        "category, severity, title, created_at"
    ).eq("location_id", location_id).gte("created_at", since).execute()
    return result.data or []


# ─────────────────────────────────────────────
# Report formatter
# ─────────────────────────────────────────────

WEATHER_EMOJI = {
    "Klarer Himmel": "☀️", "Überwiegend klar": "🌤️", "Teilweise bewölkt": "⛅",
    "Bedeckt": "☁️", "Nebel": "🌫️", "Reifnebel": "🌫️",
    "Gewitter": "⛈️", "Gewitter mit Hagel": "⛈️", "Gewitter mit starkem Hagel": "⛈️",
    "Schneefall": "❄️", "Schneeschauer": "🌨️",
}

def weather_emoji(condition: str) -> str:
    """Return an emoji matching the weather condition, with a sensible fallback."""
    for key, emoji in WEATHER_EMOJI.items():
        if key.lower() in condition.lower():
            return emoji
    if "regen" in condition.lower() or "schauer" in condition.lower():
        return "🌧️"
    if "schnee" in condition.lower():
        return "❄️"
    return "🌡️"


def format_morning_report(
    location: dict,
    weather: dict,
    articles: list,
    recent_alerts: list,
) -> str:
    """
    Compose a readable, structured Telegram morning report.
    Includes an 'Alles ruhig' banner when no critical events occurred.
    """
    today = datetime.now(timezone.utc).strftime("%d.%m.%Y")
    w_emoji = weather_emoji(weather.get("condition", ""))

    # ── Header ──────────────────────────────
    lines = [
        f"☀️ *Morgenbericht – {today}*",
        "━━━━━━━━━━━━━━━━━━━",
        f"📍 *{location['name']}*",
        f"_{location['address']}_",
        "",
    ]

    # ── Weather block ────────────────────────
    if weather:
        lines += [
            f"*Wetter aktuell:*",
            f"{w_emoji} {weather.get('condition', '–')}",
            f"🌡️ Aktuell: *{weather.get('temp', '?')}°C*"
            + (f"  |  Hoch: {weather['high']}°C  Tief: {weather['low']}°C"
               if weather.get("high") else ""),
            f"💨 Wind: {weather.get('wind', '?')} km/h"
            + (f"  |  🌧️ Niederschlag: {weather.get('rain', 0)} mm"
               if weather.get("rain", 0) > 0 else ""),
            "",
        ]
    else:
        lines += ["_Wetterdaten nicht verfügbar._", ""]

    # ── Alert status ─────────────────────────
    if recent_alerts:
        alert_lines = [f"*⚠️ Ereignisse letzte 24h ({len(recent_alerts)}):*"]
        for a in recent_alerts[:5]:  # max 5
            ts = a.get("created_at", "")[:16].replace("T", " ")
            alert_lines.append(f"  • [{a['category'].upper()}] {a['title']} _{ts}_")
        lines += alert_lines + [""]
    else:
        lines += ["✅ *Alles ruhig* – keine kritischen Ereignisse in den letzten 24h.", ""]

    # ── News block ───────────────────────────
    if articles:
        lines.append("*Aktuelle Nachrichten:*")
        for art in articles:
            lines.append(f"  📰 [{art['title'][:60]}...]({art['url']})")
            if art["source"]:
                lines[-1] += f" _{art['source']}_"
        lines.append("")

    # ── Footer ───────────────────────────────
    lines.append(f"_🤖 OSInt Location Monitor – {datetime.now(timezone.utc).strftime('%H:%M UTC')}_")

    return "\n".join(lines)


# ─────────────────────────────────────────────
# Main report loop
# ─────────────────────────────────────────────

def run_morning_report(locations: list, test_mode: bool = False) -> None:
    """Generate and send morning reports for all active locations."""
    for loc in locations:
        logger.info(f"Generating morning report for: {loc['name']}")

        weather  = get_weather_summary(loc["latitude"], loc["longitude"])
        articles = get_news_summary(loc["address"], loc.get("country_code", ""))

        if test_mode:
            recent_alerts = []
            logger.info("  (test mode: skipping Supabase alert fetch)")
        else:
            recent_alerts = get_recent_alerts(loc["id"])

        message = format_morning_report(loc, weather, articles, recent_alerts)
        sent    = send_telegram(loc["telegram_chat_id"], message)

        if sent:
            logger.success(f"Morning report sent for {loc['name']}")
        else:
            logger.error(f"Failed to send morning report for {loc['name']}")


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OSInt Location Monitor – Daily Morning Report")
    parser.add_argument("--test",    action="store_true",
                        help="Run with test location (Munich), no Supabase reads")
    parser.add_argument("--verbose", action="store_true", help="Enable DEBUG logging")
    args = parser.parse_args()

    load_environment()
    setup_logging("DEBUG" if args.verbose else "INFO")

    if args.test:
        import os
        test_locations = [{
            "id":              "test-location-id",
            "name":            "Testort München",
            "address":         "Marienplatz, München, Deutschland",
            "latitude":        48.1351,
            "longitude":       11.5820,
            "country_code":    "DE",
            "user_id":         "test-user-id",
            "telegram_chat_id": os.getenv("TELEGRAM_CHAT_ID"),
            "categories":      ["unwetter", "erdbeben", "feuer", "hochwasser", "unruhen"],
        }]
        logger.info("🧪 TEST MODE – using Munich as test location")
        run_morning_report(test_locations, test_mode=True)
    else:
        locations = get_active_locations()
        if not locations:
            logger.warning("No active locations found – nothing to report.")
            sys.exit(0)
        run_morning_report(locations)
