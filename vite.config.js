import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'assets/*.webp',
        'assets/*.png',
        'assets/*.mp3',
        'assets/*.ogg',
        'assets/*.wav',
      ],
      manifest: {
        name: 'PALMQuest: Coconut Palm Crackers Virtual Laboratory',
        short_name: 'PALMQuest',
        description: 'Coconut Palm Utilization for Cracker Development Virtual Laboratory Challenge',
        theme_color: '#451a03',
        background_color: '#fdfaf5',
        display: 'standalone',
        orientation: 'landscape',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,mp3,ogg,wav}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'palmquest-images',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'audio',
            handler: 'CacheFirst',
            options: {
              cacheName: 'palmquest-audio',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'palmquest-fonts',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
    {
      name: 'legacy-image-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            req.url = req.url
              .replace(/^\/images\//, '/assets/')
              .replace(/\.(png|jpe?g)$/i, (m) => m.toLowerCase().includes('cursor') ? m : '.webp');
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            req.url = req.url
              .replace(/^\/images\//, '/assets/')
              .replace(/\.(png|jpe?g)$/i, (m) => m.toLowerCase().includes('cursor') ? m : '.webp');
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
