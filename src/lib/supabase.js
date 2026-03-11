// supabase.js – Browser-side Supabase client (SvelteKit frontend)
// Uses the PUBLIC anon key + cookie-based session via @supabase/ssr.
// Server-side scripts (GitHub Actions) use SERVICE_KEY → bypass RLS.

import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Singleton browser client – cookies are synced automatically
export const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// ── In-Memory Cache (Task 7.10) ────────────────────────────────────────────
// Lightweight in-memory cache with TTL to avoid redundant Supabase round-trips.
// Cache is shared within a browser session and is automatically invalidated
// after mutations (create/update/delete). TTL defaults to 60 seconds.
//
// Why in-memory instead of sessionStorage?
// - No JSON serialisation overhead
// - No cross-tab sync issues (each tab has its own Supabase session)
// - SSR-safe (no window/sessionStorage access required)

const _cache = new Map(); // key → { data, ts }

/**
 * Returns cached data if still fresh, otherwise fetches fresh data,
 * caches it, and returns it.
 *
 * @param {string} key      - Cache key (should be unique per query)
 * @param {Function} fn     - Async function that fetches the data
 * @param {number} ttlMs    - Time-to-live in milliseconds (default: 60 s)
 */
async function withCache(key, fn, ttlMs = 60_000) {
  const now = Date.now();
  const cached = _cache.get(key);
  if (cached && (now - cached.ts) < ttlMs) {
    return cached.data;
  }
  const data = await fn();
  _cache.set(key, { data, ts: now });
  return data;
}

/** Invalidate a specific cache entry (e.g. after mutating data). */
export function invalidateCache(key) {
  _cache.delete(key);
}

/** Invalidate all cache entries (e.g. on sign-out or full refresh). */
export function invalidateAllCache() {
  _cache.clear();
}

// ── Auth helpers ───────────────────────────────────────────

/** Returns the currently logged-in user object, or null. */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

/** Sign in with email + password. Throws on failure. */
export async function signIn(email, password) {
  invalidateAllCache(); // Clear stale data from any previous session
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out the current user. */
export async function signOut() {
  invalidateAllCache(); // Ensure no data leaks between sessions
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Locations ─────────────────────────────────────────────

/** Fetch all locations with their categories. Cached for 60 s. */
export async function getLocations() {
  return withCache('locations', async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*, location_categories(category, is_active)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });
}

export async function createLocation(location) {
  // Attach the current user's ID – required by RLS policy
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const { data, error } = await supabase
    .from('locations')
    .insert({ ...location, user_id: user.id })
    .select()
    .single();
  if (error) throw error;

  invalidateCache('locations'); // Force fresh fetch on next getLocations() call
  return data;
}

export async function updateLocation(id, updates) {
  const { error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
  invalidateCache('locations');
}

export async function deleteLocation(id) {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);
  if (error) throw error;
  invalidateCache('locations');
}

// ── Categories ────────────────────────────────────────────

export async function setLocationCategories(locationId, categories) {
  // Delete existing rows, then insert fresh selection
  await supabase.from('location_categories').delete().eq('location_id', locationId);
  if (categories.length === 0) return;
  const rows = categories.map(cat => ({
    location_id: locationId,
    category: cat,
    is_active: true,
  }));
  const { error } = await supabase.from('location_categories').insert(rows);
  if (error) throw error;
  invalidateCache('locations'); // Categories are embedded in getLocations() result
}

// ── Alerts ────────────────────────────────────────────────

/** Fetch recent alerts. Cached for 60 s. */
export async function getAlerts(limit = 50) {
  return withCache(`alerts_${limit}`, async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*, locations(name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  });
}

/**
 * Load a batch of alerts at a given offset (M9 – Task 9.5 Pagination).
 * Not cached – offset-based queries are request-specific and must always be fresh.
 *
 * @param {number} offset - Number of records to skip
 * @param {number} limit  - Number of records per batch (default: 50)
 */
export async function loadMoreAlerts(offset, limit = 50) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, locations(name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data ?? [];
}

// ── User Profile ───────────────────────────────────────────

/**
 * Get the current user's profile (telegram_chat_id, onboarding_done, etc.).
 * Cached for 120 s since profiles change infrequently.
 */
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return withCache(`profile_${user.id}`, async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  }, 120_000);
}

/**
 * Update the current user's profile.
 * Automatically invalidates the profile cache.
 */
export async function updateProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) throw error;
  invalidateCache(`profile_${user.id}`);
}

// ── Geocoding (Nominatim / OpenStreetMap) ─────────────────

/**
 * Geocode a free-text address using Nominatim (OpenStreetMap).
 * Returns { lat, lon, display_name, country_code } or null if not found.
 *
 * M9 (Task 9.2): Added 8-second AbortController timeout to prevent hanging
 * requests from blocking the UI indefinitely.
 *
 * @param {string} address  - Free-text address to geocode
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 8 000)
 */
export async function geocodeAddress(address, timeoutMs = 8_000) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`;

  // AbortController allows us to cancel the fetch after `timeoutMs`
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      headers: {
        'Accept-Language': 'de,en',
        'User-Agent': 'OSInt-Vacation/1.0',
      },
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('Geocoding-Zeitüberschreitung (8 s). Bitte Internetverbindung prüfen.');
    }
    throw new Error('Geocoding-Anfrage fehlgeschlagen: ' + (e?.message ?? String(e)));
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`Geocoding-Fehler (HTTP ${res.status})`);

  const results = await res.json();
  if (!results || results.length === 0) return null;

  const r = results[0];
  return {
    lat:          parseFloat(r.lat),
    lon:          parseFloat(r.lon),
    display_name: r.display_name,
    country_code: r.address?.country_code?.toUpperCase() ?? '',
  };
}
