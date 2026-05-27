// Runtime config. Set `apiUrl` to your Cloudflare Worker URL.
// On the web, leaving it blank falls back to /.netlify/functions/claude.
// On Android/iOS (Capacitor), this MUST be an absolute https URL.
// On Cloudflare Pages, the API is served from the same origin at /api/claude.
// For Capacitor builds, set this to the absolute Pages URL before `cap sync`.
window.APP_CONFIG = {
  apiUrl: '/api/claude',
};
