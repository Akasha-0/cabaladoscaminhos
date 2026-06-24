/**
 * Playwright config — Wave 9.4 E2E suite
 *
 * Scope:
 *   - 4 specs covering the Wave 9 One-Screen Hub emotional state flows.
 *   - Run against the dev server (pnpm dev) on port 3000.
 *   - Single worker to avoid parallel auth contention.
 *   - Screenshots on failure for debugging.
 *
 * This suite is currently MANUAL — there's no CI pipeline wired up
 * for Playwright in this repo yet. To run:
 *
 *   pnpm dev      # in one terminal
 *   pnpm test:e2e # in another
 *
 * Test user: Gabriel (gabriel@cabaladoscaminhos.com) — seeded by
 * prisma/seed.ts. Password: AKASHA_SEED_PASSWORD (set when running
 * seed). If the seed hasn't been run, the auth login will fail with
 * a 401 and the test will skip with a clear error.
 *
 * Auth strategy:
 *   - We POST to /api/akasha/auth/login via Playwright's request fixture
 *     to capture the cookies Set-Cookie header, then add them to the
 *     browser context. This bypasses the UI form and is deterministic.
 *   - We do NOT use page.context().addCookies() directly because the
 *     cookies are httpOnly + Secure (the `__Host-` prefix enforces this).
 *     Playwright respects both attributes when copying cookies from a
 *     response to a context.
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // We don't auto-start the dev server — the suite is manual.
  // Run `pnpm dev` first, then `pnpm test:e2e`.
});