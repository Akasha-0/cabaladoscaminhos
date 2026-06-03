import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    testTimeout: 15000,
    env: {
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-bytes-long',
      DATABASE_URL: 'postgresql://placeholder:placeholder@localhost/placeholder',
    },
    projects: [
      {
        test: {
          name: 'core-logic',
          environment: 'node',
          setupFiles: ['./tests/setup.ts'],
          testTimeout: 15000,
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
            '**/*.snap',
            '**/__snapshots__/**',
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
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/api/**', 'tests/middleware/**'],
          exclude: [
            'tests/api/timer.test.ts',
            'tests/api/progresso.test.ts',
            'tests/api/gamification/**',
            'tests/api/healthcare/**',
            'tests/api/orixa/**',
            'tests/api/stripe-webhook.test.ts',
            'tests/api/health.test.ts',
            '**/*.snap',
            '**/__snapshots__/**',
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
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/cockpit/**', 'tests/components/**'],
          exclude: [
            '**/*.snap',
            '**/__snapshots__/**',
            'tests/components/onboarding/OnboardingWizard.test.tsx',
            'tests/components/layout/AppShell.test.tsx',
            'tests/components/layout/PageHeader.test.tsx',
            'tests/components/providers/UserProvider.test.tsx',
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
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/integration/**'],
          exclude: [
            '**/*.snap',
            '**/__snapshots__/**',
            'tests/integration/middleware-auth.test.ts',
            'tests/integration/api/chat-oracle.test.ts',
            'tests/integration/api/oracle.test.ts',
            'tests/integration/api/correlacao.test.ts',
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
          name: 'e2e',
          environment: 'node',
          setupFiles: ['./tests/setup.ts'],
          testTimeout: 15000,
          include: ['tests/e2e/**'],
          exclude: [
            '**/*.snap',
            '**/__snapshots__/**',
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