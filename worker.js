// Single Worker entry point. Static files in `public/` are served automatically
// by the assets binding; this Worker handles the `/api/claude` proxy.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/claude') {
      return new Response('Not found', { status: 404 });
    }

    if (request.method === 'OPTIONS') {
      return new Response('', { status: 200, headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return json({ error: { message: 'API key not configured on server' } }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: { message: 'Invalid JSON body' } }, 400);
    }

    const payload = {
      model: body.model || 'claude-haiku-4-5-20251001',
      max_tokens: body.max_tokens || 200,
      system: body.system,
      messages: body.messages,
    };

    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return json({ error: { message: err.message } }, 500);
    }
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
