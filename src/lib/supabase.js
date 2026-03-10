// supabase.js – Browser-side Supabase client (SvelteKit frontend)
// Uses the PUBLIC anon key + cookie-based session via @supabase/ssr.
// Server-side scripts (GitHub Actions) use SERVICE_KEY → bypass RLS.

import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Singleton browser client – cookies are synced automatically
export const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// ── Auth helpers ───────────────────────────────────────────

/** Returns the currently logged-in user object, or null. */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

/** Sign in with email + password. Throws on failure. */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out the current user. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Locations ─────────────────────────────────────────────

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*, location_categories(category, is_active)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
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
  return data;
}

export async function updateLocation(id, updates) {
  const { error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteLocation(id) {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
}

// ── Alerts ────────────────────────────────────────────────

export async function getAlerts(limit = 50) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, locations(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ── Geocoding (Nominatim / OpenStreetMap) ─────────────────

/**
 * Geocode a free-text address using Nominatim.
 * Returns { lat, lon, display_name, country_code } or null.
 */
export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'de,en',
      'User-Agent': 'OSInt-Location-Monitor/1.0'
    }
  });
  if (!res.ok) throw new Error('Geocoding-Anfrage fehlgeschlagen');
  const results = await res.json();
  if (!results || results.length === 0) return null;

  const r = results[0];
  return {
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    display_name: r.display_name,
    country_code: r.address?.country_code?.toUpperCase() ?? ''
  };
}
