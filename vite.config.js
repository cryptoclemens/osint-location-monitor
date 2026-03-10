// Vite configuration for OSInt Location Monitor
//
// NOTE on PWA: vite-plugin-pwa and @vite-pwa/sveltekit both conflict with
// @supabase/ssr + SvelteKit 2 server hooks during production builds (the PWA
// plugin's second Vite pass can't resolve SvelteKit virtual modules like
// hooks.server). The web app manifest and icons are served statically instead;
// the service worker can be added back once the upstream bug is resolved.
// See: https://github.com/vite-pwa/sveltekit/issues/

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
  ],
});
