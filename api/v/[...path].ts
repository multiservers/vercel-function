const AUTH_TOKEN = process.env.AUTH_TOKEN || 'change-me';
const BACKEND_URL = process.env.BACKEND_URL || 'http://141-11-45-240.sslip.io:8443';
const API_PREFIX = '/api/v/';

export default async function handler(request: Request): Promise<Response> {
  const path = request.url.indexOf(API_PREFIX);
  if (path === -1) {
    return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } });
  }

  const afterPrefix = request.url.substring(path + API_PREFIX.length);
  if (!afterPrefix.startsWith(AUTH_TOKEN)) {
    return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } });
  }

  try {
    const tokenEnd = path + API_PREFIX.length + AUTH_TOKEN.length;
    const remainder = request.url.substring(tokenEnd);
    const backendURL = BACKEND_URL + remainder;

    const headers = new Headers();
    const ct = request.headers.get('content-type');
    const cl = request.headers.get('content-length');
    if (ct) headers.set('content-type', ct);
    if (cl) headers.set('content-length', cl);

    const method = request.method;
    const backendResponse = await fetch(backendURL, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? request.body : undefined,
      // @ts-ignore
      duplex: 'half',
    });

    const responseHeaders = new Headers();
    const rct = backendResponse.headers.get('content-type');
    const rcl = backendResponse.headers.get('content-length');
    if (rct) responseHeaders.set('content-type', rct);
    if (rcl) responseHeaders.set('content-length', rcl);

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response('Bad Gateway', { status: 502 });
  }
}

export const config = {
  runtime: 'edge',
};
