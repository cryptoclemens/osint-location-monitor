// Lighthouse CI configuration for OSInt Location Monitor
// Run: npx @lhci/cli autorun --config=.lighthouserc.js --url=<VERCEL_URL>
// Or:  npx lighthouse <VERCEL_URL>/login --output=html --output-path=./lighthouse-report.html

module.exports = {
  ci: {
    collect: {
      // Update this URL after Vercel deployment:
      url: ['https://osint-location-monitor.vercel.app/login'],
      numberOfRuns: 1,
      settings: {
        // Emulate a mobile device (Lighthouse default)
        formFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 4,
        },
        // Skip navigating to the full app (requires auth)
        // Audit only the login page + manifest + SW reachability
        onlyAudits: [
          // Performance
          'first-contentful-paint',
          'largest-contentful-paint',
          'cumulative-layout-shift',
          'total-blocking-time',
          'speed-index',
          // Accessibility
          'color-contrast',
          'document-title',
          'duplicate-id-aria',
          'form-field-multiple-labels',
          'html-has-lang',
          'image-alt',
          'label',
          'link-name',
          'meta-description',
          'meta-viewport',
          // Best Practices
          'doctype',
          'errors-in-console',
          'is-on-https',
          'no-vulnerable-libraries',
          'uses-https',
          // SEO
          'description',
          'font-size',
          'tap-targets',
          'viewport',
          // PWA
          'installable-manifest',
          'maskable-icon',
          'service-worker',
          'themed-omnibox',
          'viewport',
        ],
      },
    },
    assert: {
      assertions: {
        'categories:performance':     ['warn', { minScore: 0.9 }],
        'categories:accessibility':   ['error', { minScore: 0.9 }],
        'categories:best-practices':  ['warn', { minScore: 0.9 }],
        'categories:seo':             ['warn', { minScore: 0.9 }],
        // PWA audits
        'installable-manifest':       ['warn', { logLevel: 'info' }],
        'service-worker':             ['warn', { logLevel: 'info' }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
