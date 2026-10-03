import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react(),
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
    host: true
  }
});

