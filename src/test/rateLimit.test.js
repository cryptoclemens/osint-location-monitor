// rateLimit.test.js – Unit tests for the IP-based rate limiter (M9 – Task 9.9)
// Run with: npm test

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '../lib/rateLimit.js';

// We use vi.useFakeTimers() to control Date.now() so we can test window expiry
// without actually sleeping.

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset timer mocks before each test
    vi.useRealTimers();
  });

  it('allows first request', () => {
    const { allowed, retryAfter } = checkRateLimit('1.2.3.4', '/test-route-a', { max: 3, windowMs: 60_000 });
    expect(allowed).toBe(true);
    expect(retryAfter).toBe(0);
  });

  it('allows requests up to the limit', () => {
    const ip    = '10.0.0.1';
    const route = '/test-route-b';
    const opts  = { max: 3, windowMs: 60_000 };

    const r1 = checkRateLimit(ip, route, opts);
    const r2 = checkRateLimit(ip, route, opts);
    const r3 = checkRateLimit(ip, route, opts);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
  });

  it('blocks request when limit is exceeded', () => {
    const ip    = '10.0.0.2';
    const route = '/test-route-c';
    const opts  = { max: 2, windowMs: 60_000 };

    checkRateLimit(ip, route, opts); // 1st
    checkRateLimit(ip, route, opts); // 2nd (at limit)
    const r3 = checkRateLimit(ip, route, opts); // 3rd → blocked

    expect(r3.allowed).toBe(false);
    expect(r3.retryAfter).toBeGreaterThan(0);
    expect(r3.retryAfter).toBeLessThanOrEqual(60);
  });

  it('returns positive retryAfter when blocked', () => {
    const ip    = '10.0.0.3';
    const route = '/test-route-d';
    const opts  = { max: 1, windowMs: 30_000 };

    checkRateLimit(ip, route, opts); // consumes the 1 allowed slot
    const { allowed, retryAfter } = checkRateLimit(ip, route, opts);

    expect(allowed).toBe(false);
    // retryAfter should be between 1 and 30 seconds
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });

  it('uses separate counters per IP', () => {
    const route = '/test-route-e';
    const opts  = { max: 1, windowMs: 60_000 };

    checkRateLimit('192.168.1.1', route, opts); // fills slot for IP1
    const r2 = checkRateLimit('192.168.1.2', route, opts); // different IP → still allowed

    expect(r2.allowed).toBe(true);
  });

  it('uses separate counters per route', () => {
    const ip   = '10.0.0.5';
    const opts = { max: 1, windowMs: 60_000 };

    checkRateLimit(ip, '/route-x', opts); // fills slot for route-x
    const r2 = checkRateLimit(ip, '/route-y', opts); // different route → still allowed

    expect(r2.allowed).toBe(true);
  });

  it('allows requests again after the window expires', () => {
    vi.useFakeTimers();
    const ip    = '10.0.0.6';
    const route = '/test-route-f';
    const opts  = { max: 1, windowMs: 5_000 }; // 5-second window

    checkRateLimit(ip, route, opts);                           // fills the window
    const blocked = checkRateLimit(ip, route, opts);           // blocked
    expect(blocked.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(6_000);

    const allowed = checkRateLimit(ip, route, opts);           // should be allowed again
    expect(allowed.allowed).toBe(true);

    vi.useRealTimers();
  });

  it('uses default limit of 5 requests / 60s when no opts provided', () => {
    const ip    = '10.0.0.7';
    const route = '/test-route-g';

    // Exhaust default limit of 5
    for (let i = 0; i < 5; i++) checkRateLimit(ip, route);

    const r6 = checkRateLimit(ip, route);
    expect(r6.allowed).toBe(false);
  });
});
