// geocoding.test.js – Unit tests for geocodeAddress() (M9 – Task 9.9)
// Tests the AbortController timeout + response parsing logic using mocked fetch.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodeAddress } from '../lib/supabase.js';

// ── Helpers ───────────────────────────────────────────────────────────────

/** Build a minimal Nominatim API response for a known location. */
function nominatimResponse(overrides = {}) {
  return [
    {
      lat: '48.1351',
      lon: '11.5820',
      display_name: 'München, Bayern, Deutschland',
      address: { country_code: 'de', ...overrides.address },
      ...overrides,
    },
  ];
}

/** Mock global.fetch to return a resolved response. */
function mockFetch(data, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok:   status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────

describe('geocodeAddress', () => {
  it('returns lat, lon, display_name, country_code for a valid address', async () => {
    mockFetch(nominatimResponse());

    const promise = geocodeAddress('München');
    // Let timers run so the fetch resolves
    vi.runAllTimersAsync();
    const result = await promise;

    expect(result).not.toBeNull();
    expect(result.lat).toBe(48.1351);
    expect(result.lon).toBe(11.5820);
    expect(result.display_name).toBe('München, Bayern, Deutschland');
    expect(result.country_code).toBe('DE'); // uppercased
  });

  it('returns null when Nominatim returns an empty array', async () => {
    mockFetch([]);

    const promise = geocodeAddress('xyzzy-nonexistent-place-123');
    vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeNull();
  });

  it('throws a German timeout error when the fetch throws an AbortError', async () => {
    // Directly simulate what the AbortController does: fetch rejects with AbortError.
    // This tests the catch branch in geocodeAddress without needing real timers.
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';

    global.fetch = vi.fn().mockRejectedValue(abortError);

    // Use real timers for this test so clearTimeout works cleanly
    vi.useRealTimers();

    await expect(geocodeAddress('Berlin', 8_000)).rejects.toThrow('Geocoding-Zeitüberschreitung');
  });

  it('throws when Nominatim returns a non-OK HTTP status', async () => {
    mockFetch(null, 500);

    const promise = geocodeAddress('Roma');
    vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Geocoding-Fehler (HTTP 500)');
  });

  it('uppercases country_code from the API response', async () => {
    mockFetch(nominatimResponse({ address: { country_code: 'it' } }));

    const promise = geocodeAddress('Roma');
    vi.runAllTimersAsync();
    const result = await promise;

    expect(result.country_code).toBe('IT');
  });

  it('returns empty string for country_code when address is missing', async () => {
    mockFetch([
      { lat: '51.5', lon: '-0.1', display_name: 'London', address: {} },
    ]);

    const promise = geocodeAddress('London');
    vi.runAllTimersAsync();
    const result = await promise;

    expect(result.country_code).toBe('');
  });
});
