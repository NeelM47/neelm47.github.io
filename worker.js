const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    try {
      const { name, email, message } = await request.json();

      if (!name || !email || !message) {
        return new Response('Missing fields', { status: 400, headers: CORS_HEADERS });
      }

      const res = await fetch(
        'https://api.github.com/repos/NeelM47/neelm47.github.io/dispatches',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.GH_PAT}`,
            'Content-Type': 'application/json',
            'User-Agent': 'portfolio-contact-worker',
          },
          body: JSON.stringify({
            event_type: 'contact-form',
            client_payload: { name, email, message },
          }),
        }
      );

      if (res.ok) {
        return new Response('OK', { status: 200, headers: CORS_HEADERS });
      } else {
        const body = await res.text();
        return new Response(`GitHub API error: ${res.status} ${body}`, { status: 502, headers: CORS_HEADERS });
      }
    } catch {
      return new Response('Bad request', { status: 400, headers: CORS_HEADERS });
    }
  },
};
