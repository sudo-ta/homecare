import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
// vitest/config re-exports Vite's defineConfig with the `test` block typed.
import { defineConfig } from 'vitest/config';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': here('./src'),
      '@shared': here('../shared/src'),
    },
  },

  server: {
    port: 5183,
    strictPort: true,
    proxy: {
      // The frontend always talks to a same-origin /api/v1. In development the
      // proxy points that at the local API, so no code carries a base URL and
      // no CORS preflight happens in the browser.
      '/api': {
        target: process.env.API_BASE_URL ?? 'http://localhost:4010',
        changeOrigin: true,
      },
    },
  },

  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // Spec section 9: initial JS under 200KB gzipped. Warn well before that,
    // since the limit is on the gzipped size and this figure is raw.
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // React and the router are on every page, so they are one long-lived
          // chunk rather than being duplicated into each route.
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)) {
            return 'react';
          }
          // The motion system is CSS and IntersectionObserver: no animation
          // library is bundled, so there is no chunk for one.
          // Form machinery is only pulled in by routes that have forms.
          if (/[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/.test(id)) {
            return 'forms';
          }
          return 'vendor';
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
