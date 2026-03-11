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
import { TELEGRAM_BOT_TOKEN } from '$env/static/private';

/** Maximum allowed chat ID length (Telegram IDs are numeric, max ~15 digits) */
const MAX_CHAT_ID_LENGTH = 20;

export const POST = async ({ request }) => {
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
    return json({ error: 'Telegram Bot nicht konfiguriert. Bitte TELEGRAM_BOT_TOKEN setzen.' }, { status: 503 });
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
    let userMsg;
    if (tgCode === 400 && result.description?.includes('chat not found')) {
      userMsg = 'Chat-ID nicht gefunden. Stelle sicher, dass du dem Bot zuerst eine Nachricht geschickt hast.';
    } else if (tgCode === 403) {
      userMsg = 'Bot wurde vom Chat blockiert. Bitte blockiere @OSIntVacationBot nicht.';
    } else if (tgCode === 401) {
      userMsg = 'Telegram-Bot nicht autorisiert. Bitte Token in den Einstellungen prüfen.';
    } else {
      userMsg = result.description ?? 'Testnachricht konnte nicht gesendet werden.';
    }
    return json({ error: userMsg }, { status: 422 });
  }

  return json({ ok: true });
};
