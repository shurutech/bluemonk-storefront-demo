import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      // Local dev mirror of the Netlify rewrite (see netlify.toml). The
      // storefront calls /api/v1/... which Vite forwards to the deployed
      // backend server-to-server, so there's no browser CORS preflight to
      // worry about. To target a different backend locally (e.g. localhost),
      // paste its base URL on the setup screen instead of using /api.
      '/api': {
        target: 'https://demo.bluemonk.shurutech.com',
        changeOrigin: true,
        secure: true,
        // Strip the /api prefix — the storefront uses /api as a same-origin
        // marker for the proxy, but the backend's Integration API lives at
        // /v1/... (not /api/v1/...). The Internal/admin API is at /api/v1.
        rewrite: path => path.replace(/^\/api/, ''),
        configure: proxy => {
          proxy.on('proxyReq', proxyReq => {
            // Strip browser-only headers so the proxied request looks like a
            // legitimate server-to-server call. The deployed backend sits
            // behind GCP Cloud Armor, which rejects requests with mismatched
            // Origin or stale admin-app cookies leaked through the browser.
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('cookie');
          });
        },
      },
    },
  },
});
