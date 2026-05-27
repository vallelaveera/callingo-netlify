# Cloudflare Worker — Claude proxy

Replaces `netlify/functions/claude.js`. Free tier: 100,000 requests/day, unlimited deploys.

## One-time setup

```bash
npm install -g wrangler
wrangler login
```

## Deploy

```bash
cd cloudflare
wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
wrangler deploy
```

After deploy, Cloudflare prints a URL like:
`https://callingo-claude.<your-subdomain>.workers.dev`

That URL (with no path) is your new API endpoint. Use it in the mobile app config.

## Local test

```bash
wrangler dev
# then in another shell:
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

## Update the secret later

```bash
wrangler secret put ANTHROPIC_API_KEY
```
