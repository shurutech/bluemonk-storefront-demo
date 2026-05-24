// Proxy /api/* requests from the storefront to the deployed BlueMonk
// Integration API. Strips browser-only headers (Origin / Referer / Cookie)
// so the request looks like a clean server-to-server call and doesn't trip
// GCP Cloud Armor in front of the backend.

const BACKEND_ORIGIN = 'https://demo.bluemonk.shurutech.com';

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const backendPath = url.pathname.replace(/^\/api/, '');
  const backendUrl = `${BACKEND_ORIGIN}${backendPath}${url.search}`;

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
  path: '/api/*',
};
