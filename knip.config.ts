import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: [
    // Exclude _index.js — causes 'Cannot find module default' in Knip v6
    // because Node resolution picks it up as a candidate for the 'default' module name
    '!_index.js',
    '**/*.{ts,tsx,js,jsx,mjs,cjs}',
  ],
  ignoreDependencies: ['knip-config'],
};

export default config;
