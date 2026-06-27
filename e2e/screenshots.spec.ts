/**
 * Screenshots E2E — Captura visual de rotas chave
 *
 * Gera PNGs em /workspace/cabaladoscaminhos/.screenshots/
 * Útil para:
 * - Revisões visuais rápidas sem subir o dev server
 * - Documentação no README/docs
 * - Detecção de regressões visuais (futuro: integrar com Playwright visual diff)
 *
 * IMPORTANTE: rodar `npm run dev` manualmente antes OU usar Playwright config
 * (que tem webServer embutido). Para rodar este spec standalone:
 *   npm run dev  (em outro terminal)
 *   npx playwright test e2e/screenshots.spec.ts
 */

import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SCREENSHOTS_DIR = path.resolve(process.cwd(), '.screenshots');

// Garante que o diretório existe
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
});

const ROUTES: Array<{ name: string; path: string; fullPage?: boolean }> = [
  { name: 'home', path: '/' },
  { name: 'feed-empty', path: '/feed' },
  { name: 'library', path: '/library' },
  { name: 'validation', path: '/validacao' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'notifications', path: '/notifications' },
  { name: 'profile-placeholder', path: '/u/test-user-smoke' },
];

for (const route of ROUTES) {
  test(`screenshot ${route.name}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    // Aguardar conteúdo assentar (hydration + data fetch)
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(800);

    const outPath = path.join(SCREENSHOTS_DIR, `${route.name}.png`);
    await page.screenshot({
      path: outPath,
      fullPage: route.fullPage ?? true,
    });

    // Sanity check: arquivo existe e tem tamanho razoável (> 1KB)
    const stat = fs.statSync(outPath);
    if (stat.size < 1024) {
      throw new Error(`screenshot ${route.name} é muito pequeno (${stat.size} bytes) — render pode ter falhado`);
    }
  });
}
