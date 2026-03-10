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
});
