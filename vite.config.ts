import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'client',
  resolve: {
    alias: {
      '@redliner/shared': path.resolve(__dirname, 'shared/src'),
    },
  },
  build: {
    outDir: '../dist/client',
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
