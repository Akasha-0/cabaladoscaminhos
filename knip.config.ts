import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: [
    // Exclude _index.js — causes 'Cannot find module default' in Knip v6
    // because Node resolution picks it up as a candidate for the 'default' module name
    '!_index.js',
    '**/*.{ts,tsx,js,jsx,mjs,cjs}',
  ],
  // Build artifacts & harness dirs — not source code
  ignore: [
    'apps/akasha-portal/out/**',
    'apps/akasha-portal/.next/**',
    '.omp/**',
    'apps/akasha-portal/cap-build.sh',
    'scripts/add-en-sections.mjs',
    'scripts/translate-en-sections.mjs',
    'traducao-areas.ts',
  ],
  ignoreDependencies: ['knip-config'],
};

export default config;
