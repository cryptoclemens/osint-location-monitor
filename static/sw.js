// OSInt Location Monitor – Service Worker v0.6.0
// Minimal offline-capable SW for PWA installability

const CACHE_NAME = 'osint-monitor-v1';

// Assets to pre-cache (shell only – no app routes, which require auth/SSR)
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// ── Install: pre-cache static shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately, don't wait for old SW to expire
  self.skipWaiting();
});

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ── Fetch: network-first for navigation, cache-first for static assets ──────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip Supabase API calls and non-GET requests – always go to network
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/auth/') || url.hostname.includes('supabase.co')) return;

  // Static assets (icons, manifest) → cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/favicon.ico'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Navigation & app routes → network-first, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a minimal offline response when completely offline
        return new Response(
          `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1a1a2e">
  <title>OSInt Monitor – Offline</title>
  <style>
    body { background:#0f0f1a; color:#e0e0f0; display:flex; align-items:center;
           justify-content:center; min-height:100vh; font-family:system-ui,sans-serif;
           text-align:center; padding:2rem; }
    h1 { font-size:2rem; margin-bottom:.5rem; }
    p  { color:#888; }
  </style>
</head>
<body>
  <div>
    <h1>🛰️ Offline</h1>
    <p>Keine Internetverbindung. Bitte überprüfe deine Verbindung.</p>
  </div>
</body>
</html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
  }
});
