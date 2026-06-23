/**
 * @akasha/core-pilar6 — vitest config
 *
 * Co-located test config. Mirrors core-pilar7.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
  },
});
