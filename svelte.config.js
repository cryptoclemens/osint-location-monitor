// SvelteKit configuration for OSInt Location Monitor
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use Vercel adapter for deployment
    adapter: adapter(),
    alias: {
      $lib: './src/lib'
    }
  }
};

export default config;
