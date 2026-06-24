import path from 'path';
import { defineConfig } from 'vitest/config';

const here = __dirname;
const root = path.resolve(here, '../..');

const aliases = {
  '@akasha/core': path.resolve(root, './packages/akasha-core/src/index.ts'),
  '@akasha/core-cabala': path.resolve(root, './packages/core-cabala/src/index.ts'),
  '@akasha/core-astrology': path.resolve(root, './packages/core-astrology/src/index.ts'),
  '@akasha/core-odus': path.resolve(root, './packages/core-odus/src/index.ts'),
  '@akasha/core-tantra': path.resolve(root, './packages/core-tantra/src/index.ts'),
  '@akasha/core-iching': path.resolve(root, './packages/core-iching/src/index.ts'),
  '@akasha/core-pilar6': path.resolve(root, './packages/core-pilar6/src/index.ts'),
  '@akasha/core-pilar7': path.resolve(root, './packages/core-pilar7/src/index.ts'),
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./src/**/*.test.ts'],
    testTimeout: 15000,
  },
  resolve: {
    alias: aliases,
  },
});
