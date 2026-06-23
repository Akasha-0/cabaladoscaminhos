import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    pool: 'forks',
    testTimeout: 15000,
    include: ['./src/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@akasha/core-iching': path.resolve(__dirname, '../core-iching/src/index.ts'),
    },
  },
});
