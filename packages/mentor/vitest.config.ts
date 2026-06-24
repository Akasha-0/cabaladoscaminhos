import path from 'path';
import { defineConfig } from 'vitest/config';

const sharedAliases = {
  '@': path.resolve(__dirname, '../../apps/akasha-portal/src'),
  '@akasha/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
  '@akasha/core': path.resolve(__dirname, '../../packages/akasha-core/src/index.ts'),
  '@akasha/core-astrology': path.resolve(__dirname, '../../packages/core-astrology/src/index.ts'),
  '@akasha/core-cabala': path.resolve(__dirname, '../../packages/core-cabala/src/index.ts'),
  '@akasha/core-odus': path.resolve(__dirname, '../../packages/core-odus/src/index.ts'),
  '@akasha/core-tantra': path.resolve(__dirname, '../../packages/core-tantra/src/index.ts'),
  '@akasha/core-iching': path.resolve(__dirname, '../../packages/core-iching/src/index.ts'),
  '@akasha/core-pilar6': path.resolve(__dirname, '../../packages/core-pilar6/src/index.ts'),
  '@akasha/core-pilar7': path.resolve(__dirname, '../../packages/core-pilar7/src/index.ts'),
  '@akasha/mentor': path.resolve(__dirname, './src/index.ts'),
  '@akasha/mentor/*': path.resolve(__dirname, './src/*'),
  '@akasha/mcp': path.resolve(__dirname, '../../packages/mcp/src/index.ts'),
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
  resolve: {
    alias: sharedAliases,
  },
});
