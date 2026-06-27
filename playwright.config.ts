import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — Akasha Portal v3.0 (Wave 10)
 *
 * Smoke E2E para os 3 fluxos críticos do produto:
 *   1. signup-onboarding-feed  → novo usuário chega ao feed
 *   2. feed-interaction        → core social (post → like)
 *   3. library-search          → consumo de conteúdo (search → article)
 *
 * Design decisions (Wave 10 — Ravena / QA Engineer):
 * - Mobile-first viewport (iPhone 13) porque o uso real é mobile (consulta cotidiana)
 * - Single worker porque sandbox tem pouca RAM (~2GB) — paralelo causaria OOM
 * - Timeout 30s por teste (Next.js dev mode é lento na primeira rota)
 * - Web server: `npm run dev` (pnpm não está disponível no sandbox)
 * - Reutiliza .env.example como env padrão (Supabase mock, sem rede)
 * - Screenshots/videos APENAS em falha (não em sucesso) — economiza disco
 * - Projects: chromium-desktop (smoke rápido) + mobile-safari (uso real)
 * - testIgnore para arquivos *.skip.ts quando sandbox OOM (defensive)
 *
 * IMPORTANTE: este arquivo NÃO roda `next build` antes — usa `next dev` que
 * aceita mudanças HMR e é o ambiente real de uso. Para CI, considerar
 * `next build && next start` em vez de `next dev` (mais rápido, menos flake).
 */

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts$/,
  testIgnore: /.*\.skip\.spec\.ts$/,

  // Sandbox: evita OOM com workers paralelos
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // retry 1x em CI; sem retry em local

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : 'list',

  outputDir: './test-results/playwright',
  timeout: 30_000, // 30s por teste (Next.js dev compila sob demanda)
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    // Defaults: mobile-first (uso real é mobile)
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // --------------------------------------------------------------
    // Project 1: iPhone 13 (mobile-chromium) — uso real do produto
    // --------------------------------------------------------------
    {
      name: 'mobile-chromium',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // --------------------------------------------------------------
    // Project 2: Pixel 5 (mobile-chromium alt) — Android coverage
    // --------------------------------------------------------------
    {
      name: 'mobile-chromium-alt',
      use: {
        ...devices['Pixel 5'],
      },
    },

    // --------------------------------------------------------------
    // Project 3: Desktop chromium — desktop coverage (admin/devtools)
    // --------------------------------------------------------------
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 min para Next.js dev compilar a primeira rota
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
