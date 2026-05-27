# cloudflare/ — local dev helper

The production deploy lives at the repo root (`wrangler.toml` + `worker.js`).
Pushing to `main` triggers a Workers Builds deploy automatically.

This folder only contains `devserver.js`, a small Node script that — when running
in a GitHub Codespace — serves `public/` and proxies `/api/claude` to a locally
running `wrangler dev` instance (on port 8787). Useful for in-browser testing
without flipping Codespace port visibility.

## Local dev

```bash
# Terminal 1: run the Worker locally
npx wrangler dev               # from repo root; uses .dev.vars for the API key

# Terminal 2: serve public/ + proxy /api/claude → 8787
node cloudflare/devserver.js   # listens on port 8080
```

Put your Anthropic key in a gitignored `.dev.vars` file at the repo root:

```
ANTHROPIC_API_KEY=sk-ant-...
```
