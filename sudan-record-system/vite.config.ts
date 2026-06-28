import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'offline.html', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'سجل الأشخاص',
        short_name: 'سجل الأشخاص',
        description: 'Private, secure digital record system for managing person records.',
        theme_color: '#8B1E1E',
        background_color: '#ececec',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Fall back to the offline page when a navigation request fails (no network).
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Signed photo URLs expire — prefer network; do not long-cache private records.
            urlPattern: /\/storage\/v1\/object\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'record-photos',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 15 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      devOptions: {
        // Keep the service worker disabled in dev to avoid caching headaches.
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
