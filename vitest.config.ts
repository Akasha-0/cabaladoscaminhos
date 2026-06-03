import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    testTimeout: 60000,
    env: {
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-bytes-long',
      DATABASE_URL: 'postgresql://placeholder:placeholder@localhost/placeholder',
    },
    projects: [
      {
        test: {
          name: 'core-logic',
          environment: 'node',
          include: [
            'tests/lib/ai/**',
            'tests/calculators/**',
            'tests/lib/auth/**',
            'tests/lib/db/**',
            'tests/lib/divination/**',
            'tests/lib/constants/**',
          ],
          exclude: [
            'tests/lib/divination/divination-methods.test.ts',
            'tests/lib/divination/reading-history.test.ts',
          ],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
      {
        test: {
          name: 'core-api',
          environment: 'node',
          include: [
            'tests/api/**',
            'tests/middleware/**',
          ],
          exclude: [
            'tests/api/timer.test.ts',
            'tests/api/progresso.test.ts',
            'tests/api/gamification/**',
            'tests/api/healthcare/**',
            'tests/api/orixa/**',
          ],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
      {
        test: {
          name: 'core-ui',
          environment: 'jsdom',
          include: [
            'tests/cockpit/**',
            'tests/components/**',
          ],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
      {
        test: {
          name: 'legacy',
          environment: 'jsdom',
          include: [
            'tests/lib/akashic/**',
            'tests/lib/ancestor/**',
            'tests/lib/aromatherapy/**',
            'tests/lib/ascension*/**',
            'tests/lib/aura/**',
            'tests/lib/awakening/**',
            'tests/lib/ayurveda/**',
            'tests/lib/dosha*/**',
            'tests/lib/element-compatibility/**',
            'tests/lib/gamification/**',
            'tests/lib/healing*/**',
            'tests/lib/herb*/**',
            'tests/lib/orixa*/**',
            'tests/lib/reiki*/**',
            'tests/lib/sign-relationships/**',
            'tests/app/dashboard/chakra*',
            'tests/app/dashboard/orixa*',
            'tests/app/dashboard/ritual*',
            'tests/components/onboarding/**',
            // Legacy hook tests — modules removed with B2C cleanup
            // 'tests/hooks/*',
          ],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: [
            'tests/integration/**',
          ],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
    ],
  },
});
