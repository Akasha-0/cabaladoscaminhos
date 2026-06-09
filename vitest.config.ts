import path from 'path';
import { defineConfig } from 'vitest/config';

const sharedAliases = {
  '@': path.resolve(__dirname, './apps/akasha-portal/src'),
  '@akasha/types': path.resolve(__dirname, './packages/types/src/index.ts'),
  '@akasha/core-astrology': path.resolve(__dirname, './packages/core-astrology/src/index.ts'),
  '@akasha/core-cabala': path.resolve(__dirname, './packages/core-cabala/src/index.ts'),
  '@akasha/core-odus': path.resolve(__dirname, './packages/core-odus/src/index.ts'),
  '@akasha/core-tantra': path.resolve(__dirname, './packages/core-tantra/src/index.ts'),
  '@akasha/core-iching': path.resolve(__dirname, './packages/core-iching/src/index.ts'),
  '@akasha/mentor/maps': path.resolve(__dirname, './packages/mentor/src/maps.ts'),
  '@akasha/mentor/types': path.resolve(__dirname, './packages/mentor/src/types.ts'),
  '@akasha/mentor/correlation': path.resolve(__dirname, './packages/mentor/src/correlation.ts'),
  '@akasha/mentor/memory': path.resolve(__dirname, './packages/mentor/src/memory.ts'),
  '@akasha/mentor': path.resolve(__dirname, './packages/mentor/src/index.ts'),
};

export default defineConfig({
  test: {
    globals: true,
    pool: 'forks',
    testTimeout: 15000,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: sharedAliases,
  },
});
