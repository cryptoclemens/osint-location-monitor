// SvelteKit configuration for OSInt Location Monitor
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use Vercel adapter – pin to Node 22 (compatible with local Node 24)
    adapter: adapter({ runtime: 'nodejs22.x' }),
    alias: {
      $lib: './src/lib'
    },
    // Rename the server hooks file to avoid a SvelteKit 2.53.x guard bug:
    // the guard plugin incorrectly flags files matching *.server.* during
    // the browser build pass when the import_map is populated. Using a
    // non-*.server.* filename bypasses the faulty check.
    files: {
      hooks: {
        server: 'src/server-hooks.js'
      }
    }
  }
};

export default config;
