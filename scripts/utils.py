"""
utils.py – Shared utilities for OSInt Location Monitor
Provides: logging setup, env loading, Supabase client,
          Telegram sender, alert deduplication and logging.
"""

import os
import sys
import requests
from datetime import datetime, timezone, timedelta
from pathlib import Path
from loguru import logger
from supabase import create_client, Client
from dotenv import load_dotenv


# ─────────────────────────────────────────────
# Environment loading
# ─────────────────────────────────────────────

def load_environment() -> None:
    """Load .env.local (local dev) or rely on system env (GitHub Actions)."""
    env_file = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        load_dotenv(env_file)
        logger.debug(f"Loaded environment from {env_file}")
    else:
        logger.debug("No .env.local found – using system environment variables")


def get_required_env(key: str) -> str:
    """Get a required environment variable or exit with a clear error."""
    value = os.getenv(key)
    if not value:
        logger.error(f"Missing required environment variable: {key}")
        sys.exit(1)
    return value


# ─────────────────────────────────────────────
# Logging setup
# ─────────────────────────────────────────────

def setup_logging(level: str = "INFO") -> None:
    """Configure loguru with clean, structured output."""
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>",
        level=level,
        colorize=True,
    )


# ─────────────────────────────────────────────
# Supabase client
# ─────────────────────────────────────────────

_supabase_client: Client | None = None

def get_supabase() -> Client:
    """Return a Supabase client using service_role key (bypasses RLS for scripts)."""
    global _supabase_client
    if _supabase_client is None:
        url = get_required_env("SUPABASE_URL")
        key = get_required_env("SUPABASE_SERVICE_KEY")
        _supabase_client = create_client(url, key)
    return _supabase_client


def get_active_locations() -> list:
    """
    Fetch all active monitoring locations with their enabled categories
    and the owner's Telegram chat_id.
    Returns a list of dicts with flattened location + category + telegram data.
    """
    sb = get_supabase()

    result = sb.table("locations").select(
        "id, name, address, latitude, longitude, country_code, user_id, "
        "profiles(telegram_chat_id), "
        "location_categories(category, is_active)"
    ).eq("is_active", True).execute()

    locations = []
    for row in result.data:
        categories = [
            c["category"]
            for c in (row.get("location_categories") or [])
            if c.get("is_active")
        ]
        profile = row.get("profiles") or {}
        telegram_chat_id = (
            profile.get("telegram_chat_id")
            or os.getenv("TELEGRAM_CHAT_ID")
        )
        locations.append({
            "id": row["id"],
            "name": row["name"],
            "address": row["address"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "country_code": row.get("country_code", ""),
            "user_id": row["user_id"],
            "telegram_chat_id": telegram_chat_id,
            "categories": categories,
        })

    logger.info(f"Loaded {len(locations)} active location(s) from Supabase")
    return locations


# ─────────────────────────────────────────────
# Alert deduplication
# ─────────────────────────────────────────────

def is_duplicate_alert(location_id: str, category: str, hours: int = 2) -> bool:
    """
    Return True if this category was already alerted for this location
    within the last `hours` hours. Prevents notification spam.
    """
    sb = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    result = sb.table("alerts").select("id").eq(
        "location_id", location_id
    ).eq("category", category).gte("created_at", since).limit(1).execute()
    return len(result.data) > 0


# ─────────────────────────────────────────────
# Alert logging to Supabase
# ─────────────────────────────────────────────

def log_alert(
    location_id: str,
    user_id: str,
    category: str,
    severity: str,
    title: str,
    message: str,
    source_url: str = None,
    telegram_sent: bool = False,
) -> None:
    """Persist a sent alert to the Supabase alerts table."""
    sb = get_supabase()
    sb.table("alerts").insert({
        "location_id": location_id,
        "user_id": user_id,
        "category": category,
        "severity": severity,
        "title": title,
        "message": message,
        "source_url": source_url,
        "telegram_sent": telegram_sent,
        "telegram_sent_at": datetime.now(timezone.utc).isoformat() if telegram_sent else None,
    }).execute()
    logger.debug(f"Alert logged to Supabase: [{category}] {title}")


# ─────────────────────────────────────────────
# Telegram sender
# ─────────────────────────────────────────────

def send_telegram(chat_id: str, message: str, parse_mode: str = "Markdown") -> bool:
    """
    Send a message via the Telegram Bot API.
    Returns True on success, False on failure (logs error but does not raise).
    """
    token = get_required_env("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        response = requests.post(url, json={
            "chat_id": chat_id,
            "text": message,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        }, timeout=10)
        response.raise_for_status()
        logger.info(f"Telegram message sent to chat_id {chat_id}")
        return True
    except requests.RequestException as e:
        logger.error(f"Telegram send failed: {e}")
        return False


# ─────────────────────────────────────────────
# WMO weather code helpers
# ─────────────────────────────────────────────

WMO_CODES = {
    0: "Klarer Himmel", 1: "Überwiegend klar", 2: "Teilweise bewölkt",
    3: "Bedeckt", 45: "Nebel", 48: "Reifnebel",
    51: "Leichter Nieselregen", 53: "Mäßiger Nieselregen", 55: "Starker Nieselregen",
    61: "Leichter Regen", 63: "Mäßiger Regen", 65: "Starker Regen",
    66: "Leichter Gefrierregen", 67: "Starker Gefrierregen",
    71: "Leichter Schneefall", 73: "Mäßiger Schneefall", 75: "Starker Schneefall",
    77: "Schneekörner",
    80: "Leichte Regenschauer", 81: "Mäßige Regenschauer", 82: "Heftige Regenschauer",
    85: "Leichte Schneeschauer", 86: "Starke Schneeschauer",
    95: "Gewitter", 96: "Gewitter mit Hagel", 99: "Gewitter mit starkem Hagel",
}

# WMO codes that trigger a UNWETTER alert (independent of wind threshold)
SEVERE_WEATHER_CODES = {82, 85, 86, 95, 96, 99}

def wmo_description(code: int) -> str:
    """Return German human-readable description for a WMO weather code."""
    return WMO_CODES.get(code, f"Unbekannt (Code {code})")
