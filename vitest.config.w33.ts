import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest config isolada para testes W33 (Stripe webhook).
 * Sem jsdom (handler é puro Node), sem React plugin, sem setup.ts.
 * Pool=forks singleFork para reduzir pressão de memória.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-bytes-long',
      DATABASE_URL: 'postgresql://placeholder:placeholder@localhost/placeholder',
    },
    include: ['tests/unit/payments/**/*.test.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});