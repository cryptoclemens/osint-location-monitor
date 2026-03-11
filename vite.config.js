// Vite configuration for OSInt Location Monitor

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

/**
 * Workaround for SvelteKit 2.53.x guard-plugin bug:
 *
 * vite-plugin-sveltekit-guard shares import_map across the SSR and
 * browser build passes. During the SSR pass it registers
 *   hooks.server.js → [server/internal.js]
 * When the browser pass runs it sees hooks.server.js (via a dynamic
 * import in internal.js) but cannot trace the chain to a browser
 * entrypoint, so it throws "An impossible situation occurred".
 *
 * Fix: intercept the browser-context load for hooks.server.js BEFORE
 * the guard plugin (enforce:'pre', listed first in plugins array) and
 * return an empty module – the browser never needs server hooks.
 */
function serverHooksBrowserShim() {
  const hooksServerPath = path.resolve('src/hooks.server.js');
  return {
    name: 'server-hooks-browser-shim',
    enforce: 'pre',
    load(id, options) {
      // Only intercept in the browser (client) build pass
      if (options?.ssr) return null;
      if (id === hooksServerPath || id.endsWith('/src/hooks.server.js')) {
        // Return empty module – browser code never uses server hooks
        return 'export {};';
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    serverHooksBrowserShim(), // must be before sveltekit()
    sveltekit(),
  ],
  test: {
    // Vitest configuration (M9 – Task 9.9)
    // Only runs tests for pure-JS utility files (no Svelte component rendering).
    // SvelteKit virtual modules ($env/*) are stubbed via `resolve.alias` below.
    include:     ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    alias: {
      '$env/static/public':  path.resolve('./src/test/__mocks__/env-public.js'),
      '$env/static/private': path.resolve('./src/test/__mocks__/env-private.js'),
      '$app/navigation':     path.resolve('./src/test/__mocks__/app-navigation.js'),
      '$app/forms':          path.resolve('./src/test/__mocks__/app-forms.js'),
      '$app/stores':         path.resolve('./src/test/__mocks__/app-stores.js'),
    },
  },
});
