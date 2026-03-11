// api/test-telegram/+server.js – Test-Telegram-Verbindung (M9 – Task 9.0)
//
// POST /api/test-telegram
// Body: { chatId: string }
//
// Sends a test message via the Telegram Bot API to the provided chat ID.
// The TELEGRAM_BOT_TOKEN is read server-side from env vars (never exposed to client).
// Returns { ok: true } on success or { error: string } with an appropriate HTTP status.
//
// Used by: /onboarding (Step 2 – verify Telegram connection before saving)

import { json } from '@sveltejs/kit';
// Use $env/dynamic/private instead of $env/static/private so the build
// does NOT fail when TELEGRAM_BOT_TOKEN is absent at build time (e.g. on Vercel
// before the env var is configured). The value is read at request time instead.
import { env } from '$env/dynamic/private';

/** Maximum allowed chat ID length (Telegram IDs are numeric, max ~15 digits) */
const MAX_CHAT_ID_LENGTH = 20;

export const POST = async ({ request }) => {
  // Read token inside the handler so $env/dynamic/private is evaluated per-request
  // (not once at module load time, which may run before env vars are injected).
  const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;

  // ── Parse + validate body ───────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültiger Request-Body (kein JSON).' }, { status: 400 });
  }

  const chatId = String(body?.chatId ?? '').trim();

  if (!chatId) {
    return json({ error: 'chatId fehlt.' }, { status: 400 });
  }
  if (chatId.length > MAX_CHAT_ID_LENGTH || !/^-?\d+$/.test(chatId)) {
    return json({ error: 'Ungültige Chat-ID. Nur numerische Werte erlaubt.' }, { status: 400 });
  }

  // ── Check bot token ─────────────────────────────────────────────────
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('[test-telegram] TELEGRAM_BOT_TOKEN is not configured.');
    return json({ error: 'Telegram Bot nicht konfiguriert. Bitte TELEGRAM_BOT_TOKEN in Vercel → Settings → Environment Variables setzen.' }, { status: 503 });
  }

  // ── Send test message via Telegram Bot API ──────────────────────────
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const testMessage =
    '✅ *OSInt Vacation – Verbindungstest*\n\n' +
    'Dein Telegram ist erfolgreich mit OSInt Vacation verbunden\\. ' +
    'Du wirst ab sofort Alerts für deine überwachten Orte erhalten\\.';

  let response;
  try {
    // 10-second timeout to avoid hanging Vercel serverless function
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    response = await fetch(telegramUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        chat_id:    chatId,
        text:       testMessage,
        parse_mode: 'MarkdownV2',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch (e) {
    if (e?.name === 'AbortError') {
      return json({ error: 'Telegram API antwortet nicht (Timeout). Bitte später erneut versuchen.' }, { status: 504 });
    }
    console.error('[test-telegram] fetch error:', e);
    return json({ error: 'Netzwerkfehler beim Senden der Testnachricht.' }, { status: 502 });
  }

  const result = await response.json();

  if (!result.ok) {
    // Map common Telegram error codes to German user messages
    const tgCode = result.error_code;
    const tgDesc = (result.description ?? '').toLowerCase();
    let userMsg;
    if (tgCode === 401 || tgDesc.includes('unauthorized')) {
      // 401 = invalid or revoked bot token
      userMsg = 'Bot-Token ungültig. Bitte den TELEGRAM_BOT_TOKEN über @BotFather prüfen und in Vercel korrekt setzen.';
    } else if (tgCode === 404 || tgDesc.includes('not found') || (tgCode === 400 && tgDesc.includes('chat not found'))) {
      // 404 / "Not Found" / 400 "chat not found" = Bot kennt diese Chat-ID nicht
      // → Nutzer muss dem Bot erst /start schicken, damit Telegram die Verbindung kennt
      userMsg = 'Chat-ID nicht gefunden. Öffne Telegram, suche den Bot und sende /start – danach erneut testen.';
    } else if (tgCode === 403) {
      userMsg = 'Bot wurde blockiert. Bitte entsperre den Bot in Telegram und versuche es erneut.';
    } else {
      userMsg = result.description ?? 'Testnachricht konnte nicht gesendet werden.';
    }
    return json({ error: userMsg }, { status: 422 });
  }

  return json({ ok: true });
};
