// rateLimit.js – Simple in-memory rate limiter (M9 – Task 9.1)
//
// Provides IP-based rate limiting for sensitive server routes (register, reset-password).
// Implementation: sliding-window counter with auto-cleanup.
//
// ⚠️  CAVEAT (Vercel Serverless):
//     Vercel spins up multiple function instances under load. Each instance has its own
//     in-memory state, so the limits are per-instance, not global.
//     For a low-traffic free-tier app this is sufficient protection against casual abuse.
//     For stricter enforcement, replace the Map with Upstash Redis (BYOK, free tier available).
//
// Usage example:
//   import { checkRateLimit } from '$lib/rateLimit.js';
//   const { allowed, retryAfter } = checkRateLimit(ip, 'register', { max: 5, windowMs: 60_000 });
//   if (!allowed) return json({ error: '...' }, { status: 429, headers: { 'Retry-After': retryAfter } });

/** @type {Map<string, number[]>} key → sorted array of timestamps */
const _windows = new Map();

// Auto-cleanup interval: purge stale keys every 10 minutes to prevent memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, times] of _windows) {
      // Remove entries older than 10 minutes – beyond any reasonable window
      const fresh = times.filter(t => now - t < 600_000);
      if (fresh.length === 0) _windows.delete(key);
      else _windows.set(key, fresh);
    }
  }, 600_000);
}

/**
 * Check whether a request is within the allowed rate limit.
 *
 * @param {string} ip          - Client IP address (from event.getClientAddress())
 * @param {string} route       - Route identifier (e.g. 'register', 'reset')
 * @param {object} opts
 * @param {number} opts.max        - Maximum requests allowed in the window (default: 5)
 * @param {number} opts.windowMs   - Window size in milliseconds (default: 60_000 = 1 min)
 * @returns {{ allowed: boolean, retryAfter: number }}
 *   `allowed`    – true if the request is within limits
 *   `retryAfter` – seconds until the oldest request expires (only meaningful when !allowed)
 */
export function checkRateLimit(ip, route, { max = 5, windowMs = 60_000 } = {}) {
  const key = `${route}::${ip}`;
  const now  = Date.now();

  // Get existing timestamps, discard those outside the current window
  const prev  = (_windows.get(key) ?? []).filter(t => now - t < windowMs);

  if (prev.length >= max) {
    // Rate limit exceeded – compute how long until the oldest entry expires
    const oldest     = prev[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Record this request
  _windows.set(key, [...prev, now]);
  return { allowed: true, retryAfter: 0 };
}
