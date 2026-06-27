import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — Smoke E2E para Akasha Portal
 *
 * Design decisions:
 * - Mobile-first viewport (iPhone 13) porque o uso real é mobile (consulta cotidiana)
 * - Single worker porque sandbox tem pouca RAM (não conseguimos rodar paralelo)
 * - Timeout 30s por teste (sandbox é lento, Next.js dev mode é lento)
 * - Web server: `npm run dev` (npm usado em vez de pnpm porque pnpm não está disponível no sandbox)
 * - Reutiliza .env.example como env padrão para testes (Supabase mock, sem rede)
 * - Screenshots/videos apenas em falha (não em sucesso) para economizar disco
 */

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false, // sandbox: evita OOM com workers paralelos
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // retry 1x em CI; sem retry em local
  workers: 1, // duplicado garantido
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  outputDir: './test-results/playwright',
  timeout: 30_000, // 30s por teste
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    // Mobile-first viewport (uso real é mobile)
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
    {
      name: 'mobile-chromium',
      use: {
        ...devices['iPhone 13'],
        // deviceScaleFactor + viewport já vem do device; sobrescrevemos para garantir
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
