// SvelteKit configuration for OSInt Location Monitor
import adapter from '@sveltejs/adapter-vercel';
import { readFileSync } from 'fs';

// Read version from package.json so `import { version } from '$app/environment'`
// always reflects the current package version – no more manual updates needed.
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use Vercel adapter – pin to Node 22 (compatible with local Node 24)
    adapter: adapter({ runtime: 'nodejs22.x' }),
    alias: {
      $lib: './src/lib'
    },
    // Expose package.json version via `import { version } from '$app/environment'`
    version: { name: version }
    // hooks.server.js stays at default path src/hooks.server.js.
    // The browser-build guard bug is handled via vite.config.js plugin.
  }
};

export default config;
