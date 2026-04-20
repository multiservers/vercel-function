const AUTH_TOKEN = process.env.AUTH_TOKEN || 'change-me';
const BACKEND_URL = process.env.BACKEND_URL || 'http://62-3-12-151.sslip.io:8443';
const AUTH_PREFIX = '/api/v/' + AUTH_TOKEN;

export default async function handler(request: Request): Promise<Response> {
  const url = request.url;
  const idx = url.indexOf(AUTH_PREFIX);
  if (idx === -1) {
    return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } });
  }

  try {
    const remainder = url.substring(idx + AUTH_PREFIX.length);
    const backendURL = BACKEND_URL + remainder;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k !== 'host' && k !== 'x-key' && !k.startsWith('x-vercel') && !k.startsWith('x-forwarded') && k !== 'forwarded') {
        headers.set(key, value);
      }
    });

    const method = request.method;
    const backendResponse = await fetch(backendURL, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? request.body : undefined,
      // @ts-ignore
      duplex: 'half',
    });

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k !== 'transfer-encoding' && k !== 'connection') {
        responseHeaders.set(key, value);
      }
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response('Bad Gateway', { status: 502 });
  }
}

// RUNTIME_CONFIG_PLACEHOLDER
