import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: {
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-bytes-long',
      DATABASE_URL: 'postgresql://placeholder:placeholder@localhost/placeholder',
    },
    // Core B2B tests - fast, gate CI
    // Exclude legacy B2C quarantine per Doc 16 AD-01
    exclude: [
      'node_modules/**',
      '**/*.test.skip',
      '**/*.test.disabled',
      // Legacy B2C quarantined - these run separately with --project legacy
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
      'tests/hooks/useAfirmacoes*',
      'tests/hooks/useAnalytics*',
      'tests/hooks/useCiclos*',
      'tests/hooks/useDashboardConfig*',
      'tests/hooks/useJourney*',
      'tests/hooks/useNotifications*',
      'tests/hooks/useNumerologia*',
      'tests/hooks/usePrevisao*',
      'tests/hooks/useRitualCalendar*',
      'tests/hooks/useRituals*',
      'tests/hooks/useSpiritualHistory*',
      'tests/hooks/useUserPreferences*',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// NOTE: Legacy B2C tests can be run separately:
// npx vitest run --exclude '' tests/lib/akashic tests/lib/ancestor ...
