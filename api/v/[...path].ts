const AUTH_TOKEN = process.env.AUTH_TOKEN || 'change-me';
const BACKEND_URL = process.env.BACKEND_URL || 'http://141-11-45-240.sslip.io:8443';

function authenticate(request: Request): boolean {
  if (request.headers.get('x-key') === AUTH_TOKEN) return true;
  const url = new URL(request.url);
  return url.pathname.includes(AUTH_TOKEN);
}

export default async function handler(request: Request): Promise<Response> {
  if (!authenticate(request)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const url = new URL(request.url);
    let backendPath = url.pathname.replace(/^\/api\/v/, '');
    backendPath = backendPath.replace(`/${AUTH_TOKEN}`, '');
    const backendURL = `${BACKEND_URL}${backendPath}${url.search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== 'host' && lower !== 'x-key' && !lower.startsWith('x-vercel')
          && !lower.startsWith('x-forwarded') && lower !== 'forwarded') {
        headers.set(key, value);
      }
    });

    const backendResponse = await fetch(backendURL, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      // @ts-ignore
      duplex: 'half',
    });

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'connection') {
        responseHeaders.set(key, value);
      }
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response('Bad Gateway', { status: 502 });
  }
}

export const config = {
  runtime: 'edge',
};
