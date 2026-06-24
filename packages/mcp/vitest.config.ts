import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    pool: 'forks',
    testTimeout: 10000,
    include: ['src/**/*.test.ts', 'src/__tests__/**/*.test.ts'],
  },
});