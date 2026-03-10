// supabase.js – Supabase client for SvelteKit frontend
// Uses the PUBLIC anon key (safe for browser) – RLS ensures data isolation.
// Server-side scripts use the SERVICE_KEY instead (see scripts/utils.py).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey  = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  const { data, error } = await supabase
    .from('locations')
    .insert(location)
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
  // Delete existing, then insert fresh selection
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

export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'de,en', 'User-Agent': 'OSInt-Location-Monitor/1.0' }
  });
  if (!res.ok) throw new Error('Geocoding request failed');
  return res.json(); // Array of results with lat, lon, display_name, address
}
