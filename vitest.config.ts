import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: {
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-bytes-long',
      DATABASE_URL: 'postgresql://placeholder:placeholder@localhost/placeholder',
    },
    exclude: [
      'node_modules/**',
      '**/*.test.skip',
      '**/*.test.disabled',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
