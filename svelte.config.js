// SvelteKit configuration for OSInt Location Monitor
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use Vercel adapter – pin to Node 22 (compatible with local Node 24)
    adapter: adapter({ runtime: 'nodejs22.x' }),
    alias: {
      $lib: './src/lib'
    }
    // hooks.server.js stays at default path src/hooks.server.js.
    // The browser-build guard bug is handled via vite.config.js plugin.
  }
};

export default config;
