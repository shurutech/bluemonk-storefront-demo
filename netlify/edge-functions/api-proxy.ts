// Proxy storefront API requests to a deployed BlueMonk Integration API.
// Strips browser-only headers (Origin / Referer / Cookie) so the request
// looks like a clean server-to-server call and doesn't trip GCP Cloud Armor
// in front of the backend.
//
// Each path prefix maps to its own backend so the same build can target
// multiple deployed instances — the presenter just pastes the matching
// prefix in the setup screen:
//   /api       -> pickup-coffee.bluemonk.shurutech.com
//   /api-demo  -> demo.bluemonk.shurutech.com
//
// Longest prefix first: /api-demo must be matched before /api.
const BACKENDS: Array<[string, string]> = [
  ['/api-demo', 'https://demo.bluemonk.shurutech.com'],
  ['/api', 'https://pickup-coffee.bluemonk.shurutech.com'],
];

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  const match = BACKENDS.find(
    ([prefix]) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
  );
  if (!match) {
    return new Response('Unknown API path', { status: 404 });
  }

  const [prefix, backendOrigin] = match;
  const backendPath = url.pathname.slice(prefix.length);
  const backendUrl = `${backendOrigin}${backendPath}${url.search}`;

  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.delete('origin');
  forwardedHeaders.delete('referer');
  forwardedHeaders.delete('cookie');
  forwardedHeaders.delete('host');

  return fetch(backendUrl, {
    method: request.method,
    headers: forwardedHeaders,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer(),
  });
};

export const config = {
  path: ['/api/*', '/api-demo/*'],
};
