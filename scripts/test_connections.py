"""
test_connections.py – Connection & API smoke tests for OSInt Location Monitor
Tests all external services without writing any data to Supabase.

Run: python scripts/test_connections.py
"""

import sys
import os
import requests
from loguru import logger

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from utils import load_environment, setup_logging, get_required_env

# Test coordinates: Munich, Germany
TEST_LAT = 48.1351
TEST_LON = 11.5820

PASS = "✅ PASS"
FAIL = "❌ FAIL"

results = {}


def test_env_vars():
    """Verify all required environment variables are set."""
    required = [
        "SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_ANON_KEY",
        "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "GNEWS_API_KEY",
    ]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        logger.error(f"Missing env vars: {missing}")
        results["ENV_VARS"] = FAIL
    else:
        logger.success(f"All {len(required)} environment variables set")
        results["ENV_VARS"] = PASS


def test_supabase():
    """Test Supabase connection by fetching from the locations table."""
    try:
        from supabase import create_client
        url = get_required_env("SUPABASE_URL")
        key = get_required_env("SUPABASE_SERVICE_KEY")
        sb  = create_client(url, key)
        # Simple read – should return empty list if no locations yet
        sb.table("locations").select("id").limit(1).execute()
        logger.success("Supabase connection OK (locations table reachable)")
        results["SUPABASE"] = PASS
    except Exception as e:
        logger.error(f"Supabase connection failed: {e}")
        results["SUPABASE"] = FAIL


def test_telegram():
    """Send a live test message via the Telegram Bot API."""
    token   = get_required_env("TELEGRAM_BOT_TOKEN")
    chat_id = get_required_env("TELEGRAM_CHAT_ID")
    url     = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        response = requests.post(url, json={
            "chat_id":    chat_id,
            "text":       "🤖 *OSInt Location Monitor* – Verbindungstest erfolgreich ✅\n_Dieses System wird dich bei kritischen Ereignissen an deinen Orten benachrichtigen._",
            "parse_mode": "Markdown",
        }, timeout=10)
        response.raise_for_status()
        logger.success(f"Telegram test message sent to chat_id {chat_id}")
        results["TELEGRAM"] = PASS
    except requests.RequestException as e:
        logger.error(f"Telegram test failed: {e}")
        results["TELEGRAM"] = FAIL


def test_open_meteo():
    """Fetch current weather for Munich via Open-Meteo."""
    url    = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude":  TEST_LAT,
        "longitude": TEST_LON,
        "current":   "temperature_2m,weather_code,wind_speed_10m",
        "timezone":  "auto",
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        current = response.json().get("current", {})
        temp    = current.get("temperature_2m", "?")
        code    = current.get("weather_code", "?")
        logger.success(f"Open-Meteo OK – München: {temp}°C, WMO code {code}")
        results["OPEN_METEO"] = PASS
    except requests.RequestException as e:
        logger.error(f"Open-Meteo test failed: {e}")
        results["OPEN_METEO"] = FAIL


def test_usgs():
    """Query USGS for recent earthquakes near Munich (expect empty result)."""
    from datetime import datetime, timezone, timedelta
    since  = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%S")
    url    = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format":       "geojson",
        "latitude":     TEST_LAT,
        "longitude":    TEST_LON,
        "maxradiuskm":  200,
        "minmagnitude": 2.0,
        "starttime":    since,
    }
    try:
        response  = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        count     = len(response.json().get("features", []))
        logger.success(f"USGS API OK – {count} earthquake(s) near Munich in last 7 days")
        results["USGS"] = PASS
    except requests.RequestException as e:
        logger.error(f"USGS test failed: {e}")
        results["USGS"] = FAIL


def test_gnews():
    """Search GNews for news about Munich."""
    api_key = get_required_env("GNEWS_API_KEY")
    url     = "https://gnews.io/api/v4/search"
    params  = {
        "q":      "München",
        "max":    1,
        "lang":   "de",
        "apikey": api_key,
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        articles = response.json().get("articles", [])
        if articles:
            logger.success(f"GNews API OK – found article: \"{articles[0]['title'][:60]}...\"")
        else:
            logger.success("GNews API OK – no articles returned (quota may be low)")
        results["GNEWS"] = PASS
    except requests.RequestException as e:
        logger.error(f"GNews test failed: {e}")
        results["GNEWS"] = FAIL


# ─────────────────────────────────────────────
# Run all tests
# ─────────────────────────────────────────────

if __name__ == "__main__":
    load_environment()
    setup_logging("INFO")

    logger.info("=" * 50)
    logger.info("OSInt Location Monitor – Connection Tests")
    logger.info("=" * 50)

    test_env_vars()
    test_supabase()
    test_telegram()
    test_open_meteo()
    test_usgs()
    test_gnews()

    # Summary
    logger.info("")
    logger.info("=" * 50)
    logger.info("RESULTS SUMMARY")
    logger.info("=" * 50)
    all_pass = True
    for name, status in results.items():
        logger.info(f"  {status}  {name}")
        if status == FAIL:
            all_pass = False

    logger.info("=" * 50)
    if all_pass:
        logger.success("All tests passed – system is ready! 🚀")
        sys.exit(0)
    else:
        logger.error("Some tests failed – check configuration above.")
        sys.exit(1)
