import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    testTimeout: 5000,
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
            'tests/lib/engines/**',
            'tests/calculators/**',
            'tests/lib/auth/**',
            'tests/lib/db/**',
            'tests/lib/divination/**',
            'tests/lib/constants/**',
          ],
          exclude: [
            'tests/lib/divination/divination-methods.test.ts',
            'tests/lib/divination/reading-history.test.ts',
            'tests/lib/engines/spiritual-engine.test.ts',
            'tests/lib/engines/mapa-insights.test.ts',
            'tests/lib/engines/pattern-recognizer.test.ts',
            'tests/lib/engines/predictive-synthesis.test.ts',
            'tests/lib/ai/mapa-insights.test.ts',
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
            'tests/api/stripe-webhook.test.ts',
            'tests/api/health.test.ts',
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
