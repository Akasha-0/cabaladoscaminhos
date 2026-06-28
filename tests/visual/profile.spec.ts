/**
 * Visual Regression — Profile (Wave 26 / Lina)
 *
 * Página de perfil do usuário (rota /u/[handle]).
 * Captura: default state em 3 viewports × 2 themes.
 *
 * Por que 1 spec só:
 *   - Profile é read-only (não tem loading/error complexo)
 *   - Empty state (sem bio, sem posts) capturado no /u/test-user-smoke
 *
 * @see docs/VISUAL-REGRESSION-W26.md
 */

import { test, expect } from '@playwright/test';
import {
  setTheme,
  getViewportName,
  screenshotName,
  SCREENSHOT_OPTIONS,
  waitForVisualStability,
  forceEmptyState,
} from './helpers/visual-helper';

// ============================================
// DEFAULT STATE — perfil com conteúdo
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`profile default ${theme}`, async ({ page }) => {
    // Usa handle determinístico — test-user-smoke existe no seed
    await page.goto('/u/test-user-smoke', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('profile', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// EMPTY STATE — perfil novo sem posts
// ============================================

test('profile empty', async ({ page, context }) => {
  await forceEmptyState(context, ['**/api/posts**', '**/api/users/**']);
  await page.goto('/u/newcomer-empty', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('profile', viewport, 'light', 'empty'),
    SCREENSHOT_OPTIONS,
  );
});
