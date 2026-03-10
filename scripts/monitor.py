"""
monitor.py – 15-minute event monitor for OSInt Location Monitor
Checks each active location against all enabled alert categories:
  - unwetter:  Severe weather via Open-Meteo
  - erdbeben:  Earthquakes via USGS
  - feuer:     Wildfires via GNews
  - hochwasser: Floods via GNews
  - unruhen:   Political unrest via GNews

Run: python scripts/monitor.py
     python scripts/monitor.py --test   (uses Munich as test location)
"""

import sys
import argparse
import requests
from datetime import datetime, timezone, timedelta
from loguru import logger

# Add parent dir so utils is importable when called from project root
sys.path.insert(0, __file__.rsplit("/", 1)[0])

from utils import (
    load_environment, setup_logging, get_required_env,
    get_active_locations, is_duplicate_alert, log_alert,
    send_telegram, wmo_description, SEVERE_WEATHER_CODES,
)


# ─────────────────────────────────────────────
# Category metadata (emoji, severity label, dedup window)
# ─────────────────────────────────────────────

CATEGORY_META = {
    "unwetter":   {"emoji": "🌩️",  "label": "Unwetter",          "severity": "high"},
    "hochwasser": {"emoji": "🌊",  "label": "Hochwasser",         "severity": "high"},
    "feuer":      {"emoji": "🔥",  "label": "Feuer / Waldbrand",  "severity": "critical"},
    "unruhen":    {"emoji": "⚠️",  "label": "Politische Unruhen", "severity": "medium"},
    "erdbeben":   {"emoji": "🏔️",  "label": "Erdbeben",           "severity": "high"},
}

# GNews search terms per category (multilingual for European coverage)
GNEWS_QUERIES = {
    "hochwasser": "Hochwasser OR Überschwemmung OR flood OR inondation OR alluvione",
    "feuer":      "Waldbrand OR Feuer OR wildfire OR incendio OR feu de forêt",
    "unruhen":    "Unruhen OR Ausschreitungen OR riot OR manifestation OR proteste",
}


# ─────────────────────────────────────────────
# Weather check (Open-Meteo – free, no API key)
# ─────────────────────────────────────────────

WIND_THRESHOLD_KMH = 70  # Wind speed triggering an alert

def check_weather(lat: float, lon: float) -> dict | None:
    """
    Fetch current weather from Open-Meteo and return an alert dict
    if severe conditions are detected, else None.
    Triggers on: severe WMO code (storm/hail/thunder) OR wind > 70 km/h.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,wind_speed_10m,precipitation,weather_code",
        "wind_speed_unit": "kmh",
        "timezone": "auto",
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        current = response.json().get("current", {})
    except requests.RequestException as e:
        logger.warning(f"Open-Meteo request failed: {e}")
        return None

    code = current.get("weather_code", 0)
    wind = current.get("wind_speed_10m", 0)
    temp = current.get("temperature_2m", 0)
    rain = current.get("precipitation", 0)
    description = wmo_description(code)

    is_severe_code = code in SEVERE_WEATHER_CODES
    is_high_wind   = wind >= WIND_THRESHOLD_KMH

    if not (is_severe_code or is_high_wind):
        return None  # Conditions normal

    reasons = []
    if is_severe_code:
        reasons.append(f"Wetterlage: *{description}*")
    if is_high_wind:
        reasons.append(f"Windgeschwindigkeit: *{wind} km/h*")

    return {
        "category":   "unwetter",
        "severity":   "high" if not is_severe_code else "critical",
        "title":      f"Unwetter: {description}",
        "message":    "\n".join(reasons) + f"\n🌡️ Temperatur: {temp}°C | 🌧️ Niederschlag: {rain} mm",
        "source_url": f"https://open-meteo.com",
    }


# ─────────────────────────────────────────────
# Earthquake check (USGS – free, no API key)
# ─────────────────────────────────────────────

QUAKE_RADIUS_KM    = 100   # Search radius around location
QUAKE_MIN_MAG      = 4.0   # Minimum magnitude to alert
QUAKE_LOOKBACK_MIN = 20    # Check events in last N minutes

def check_earthquake(lat: float, lon: float) -> dict | None:
    """
    Query USGS for recent earthquakes within QUAKE_RADIUS_KM.
    Returns an alert dict if a quake above QUAKE_MIN_MAG is found, else None.
    """
    since = (datetime.now(timezone.utc) - timedelta(minutes=QUAKE_LOOKBACK_MIN)).strftime(
        "%Y-%m-%dT%H:%M:%S"
    )
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format":         "geojson",
        "latitude":       lat,
        "longitude":      lon,
        "maxradiuskm":    QUAKE_RADIUS_KM,
        "minmagnitude":   QUAKE_MIN_MAG,
        "starttime":      since,
        "orderby":        "magnitude",
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        features = response.json().get("features", [])
    except requests.RequestException as e:
        logger.warning(f"USGS request failed: {e}")
        return None

    if not features:
        return None

    # Take the strongest quake
    quake = features[0]["properties"]
    mag   = quake.get("mag", 0)
    place = quake.get("place", "Unbekannter Ort")
    url_  = quake.get("url", "https://earthquake.usgs.gov")

    severity = "critical" if mag >= 6.0 else "high" if mag >= 5.0 else "medium"

    return {
        "category":   "erdbeben",
        "severity":   severity,
        "title":      f"Erdbeben M{mag:.1f} – {place}",
        "message":    f"Stärke: *M{mag:.1f}*\nOrt: {place}\nRadius: {QUAKE_RADIUS_KM} km",
        "source_url": url_,
    }


# ─────────────────────────────────────────────
# News check (GNews – free tier, API key required)
# ─────────────────────────────────────────────

GNEWS_MAX_RESULTS = 3  # Articles to fetch per query

def check_news(location_name: str, country_code: str, category: str) -> dict | None:
    """
    Search GNews for recent articles matching the category near the location.
    Returns an alert dict if relevant articles are found, else None.
    """
    if category not in GNEWS_QUERIES:
        return None

    api_key     = get_required_env("GNEWS_API_KEY")
    base_query  = GNEWS_QUERIES[category]
    # Narrow search to location name (city/region extracted from address)
    location_term = location_name.split(",")[-1].strip() if "," in location_name else location_name
    query = f"({base_query}) {location_term}"

    url = "https://gnews.io/api/v4/search"
    params = {
        "q":      query,
        "max":    GNEWS_MAX_RESULTS,
        "lang":   "de,en,fr,it,es",   # Multilingual for European coverage
        "from":   (datetime.now(timezone.utc) - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "apikey": api_key,
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        articles = response.json().get("articles", [])
    except requests.RequestException as e:
        logger.warning(f"GNews request failed for [{category}]: {e}")
        return None

    if not articles:
        return None

    meta    = CATEGORY_META[category]
    article = articles[0]  # Most relevant result
    title   = article.get("title", "")
    source  = article.get("source", {}).get("name", "Unbekannte Quelle")
    art_url = article.get("url", "")

    return {
        "category":   category,
        "severity":   meta["severity"],
        "title":      f"{meta['label']}: {title[:80]}",
        "message":    f"*Quelle:* {source}\n*Schlagzeile:* {title}",
        "source_url": art_url,
    }


# ─────────────────────────────────────────────
# Alert formatter (Telegram message)
# ─────────────────────────────────────────────

def format_alert_message(location: dict, alert: dict) -> str:
    """Build a formatted Telegram alert message."""
    meta      = CATEGORY_META.get(alert["category"], {})
    emoji     = meta.get("emoji", "🚨")
    label     = meta.get("label", alert["category"])
    timestamp = datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")

    return (
        f"🚨 *ALERT: {label}* {emoji}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"📍 *Ort:* {location['name']}\n"
        f"📋 *Kategorie:* {label}\n"
        f"⚠️ *Schweregrad:* {alert['severity'].upper()}\n\n"
        f"{alert['message']}\n\n"
        f"🕐 _Erkannt: {timestamp}_"
    )


# ─────────────────────────────────────────────
# Main monitoring loop
# ─────────────────────────────────────────────

def run_monitor(locations: list) -> None:
    """
    For each active location, run all enabled category checks.
    Sends Telegram alert and logs to Supabase if a new event is found.
    """
    total_alerts = 0

    for loc in locations:
        logger.info(f"Checking location: {loc['name']} ({loc['address']})")
        lat, lon = loc["latitude"], loc["longitude"]

        for category in loc["categories"]:
            # Skip if duplicate within dedup window
            if is_duplicate_alert(loc["id"], category):
                logger.debug(f"  [{category}] Skipped – duplicate within 2h window")
                continue

            alert = None

            if category == "unwetter":
                alert = check_weather(lat, lon)
            elif category == "erdbeben":
                alert = check_earthquake(lat, lon)
            elif category in ("hochwasser", "feuer", "unruhen"):
                alert = check_news(loc["address"], loc["country_code"], category)

            if alert:
                logger.warning(f"  [{category}] ALERT: {alert['title']}")
                message = format_alert_message(loc, alert)
                sent = send_telegram(loc["telegram_chat_id"], message)
                log_alert(
                    location_id=loc["id"],
                    user_id=loc["user_id"],
                    category=category,
                    severity=alert["severity"],
                    title=alert["title"],
                    message=alert["message"],
                    source_url=alert.get("source_url"),
                    telegram_sent=sent,
                )
                total_alerts += 1
            else:
                logger.debug(f"  [{category}] OK – no critical events")

    logger.info(f"Monitor run complete. {total_alerts} alert(s) sent.")


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OSInt Location Monitor – 15-min check")
    parser.add_argument("--test", action="store_true",
                        help="Run with a test location (Munich) without Supabase")
    parser.add_argument("--verbose", action="store_true", help="Enable DEBUG logging")
    args = parser.parse_args()

    load_environment()
    setup_logging("DEBUG" if args.verbose else "INFO")

    if args.test:
        # Test location: Munich, Germany
        import os
        test_locations = [{
            "id": "test-location-id",
            "name": "Testort München",
            "address": "Marienplatz 1, 80331 München, Deutschland",
            "latitude": 48.1351,
            "longitude": 11.5820,
            "country_code": "DE",
            "user_id": "test-user-id",
            "telegram_chat_id": os.getenv("TELEGRAM_CHAT_ID"),
            "categories": ["unwetter", "erdbeben", "feuer", "hochwasser", "unruhen"],
        }]
        logger.info("🧪 TEST MODE – using Munich as test location (no Supabase writes)")

        # In test mode: just check APIs and print results without writing to Supabase
        loc = test_locations[0]
        lat, lon = loc["latitude"], loc["longitude"]
        results = {
            "unwetter":   check_weather(lat, lon),
            "erdbeben":   check_earthquake(lat, lon),
            "hochwasser": check_news(loc["address"], loc["country_code"], "hochwasser"),
            "feuer":      check_news(loc["address"], loc["country_code"], "feuer"),
            "unruhen":    check_news(loc["address"], loc["country_code"], "unruhen"),
        }
        for cat, result in results.items():
            status = f"⚠️ ALERT: {result['title']}" if result else "✅ OK"
            logger.info(f"  [{cat}] {status}")
    else:
        locations = get_active_locations()
        if not locations:
            logger.warning("No active locations found – nothing to monitor.")
            sys.exit(0)
        run_monitor(locations)
