// Runtime config. Set `apiUrl` to your Cloudflare Worker URL.
// On the web, leaving it blank falls back to /.netlify/functions/claude.
// On Android/iOS (Capacitor), this MUST be an absolute https URL.
window.APP_CONFIG = {
  apiUrl: '',  // e.g. 'https://callingo-claude.<your-subdomain>.workers.dev'
};
