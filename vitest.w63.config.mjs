import { defineConfig } from "/tmp/vitest-download/extracted/package/dist/config.js";
import path from "path";

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/lib/w63/__tests__/search_facets_engine.test.mts'],
    testTimeout: 10000,
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
