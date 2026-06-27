import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — Akasha Portal v3.0 (Wave 11)
 *
 * Cobertura E2E expandida de 3 → 8 specs cobrindo fluxos críticos:
 *   1. signup-onboarding-feed  → novo usuário chega ao feed
 *   2. feed-interaction        → core social (post → like/bookmark)
 *   3. library-search          → consumo de conteúdo (search → article)
 *   4. group-create-join       → comunidade (criar grupo, entrar, postar)
 *   5. akashic-chat            → chat IA com fontes + filtro de tradição
 *   6. profile-edit            → edição de perfil (bio, tradições, avatar)
 *   7. feed-para-voce          → algoritmo de recomendação (5º feed)
 *   8. notifications-realtime  → notificações ao vivo (SSE)
 *
 * Design decisions (Wave 11 — Ravena / QA Engineer):
 * - Mobile-first viewport (iPhone 13) porque o uso real é mobile (consulta cotidiana)
 * - mobile-safari (iPhone 13 WebKit) adicionado como projeto de produção —
 *   Safari é dominante no mobile real (iOS ~30% BR) mas requer WebKit (~200MB)
 * - Single worker porque sandbox tem pouca RAM (~2GB) — paralelo causaria OOM
 * - Timeout 30s por teste (Next.js dev compila sob demanda) + 5min/spec CI
 * - HTML + list reporters: HTML para humans, list para CI logs
 * - Cache `~/.cache/ms-playwright` no CI para acelerar runs subsequentes
 * - Artifacts APENAS em falha (screenshots, videos, traces) — economiza disco
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

  // Reporter duplo: HTML (humanos) + list (CI logs)
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  outputDir: './test-results/playwright',
  timeout: 30_000, // 30s por teste (Next.js dev compila sob demanda)
  expect: { timeout: 5_000 }, // 5s para assertions

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
    // Project 3: Mobile Safari (iPhone 13 WebKit) — produção iOS
    // Wave 11: adicionado para validar Safari real (30% do tráfego mobile BR)
    // Requer `npx playwright install webkit` (~200MB extra)
    // CI pode rodar manualmente em wave/feat branches para economizar minutos
    // --------------------------------------------------------------
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'], // mesma viewport que chromium, mas engine WebKit
        // WebKit tem quirks: scrollIntoView, focus management, etc.
        // Ativar se Safari coverage for prioridade
      },
    },

    // --------------------------------------------------------------
    // Project 4: Desktop chromium — desktop coverage (admin/devtools)
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