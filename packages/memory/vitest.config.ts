import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'memory',
    include: ['./tests/**/*.test.ts'],
    environment: 'node',
  },
});