/**
 * Visual Regression — Akashic Chat (Wave 26 / Lina)
 *
 * Chat IA com fontes e filtro de tradição. Feature premium do produto.
 * Captura: default (chat vazio) + error state em 3 viewports × 2 themes.
 *
 * Por que NÃO capturamos "com mensagem":
 *   - Chat tem respostas IA não-determinísticas — screenshot seria flaky
 *   - Foco do visual regression é LAYOUT/THEME, não conteúdo
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
  forceErrorState,
} from './helpers/visual-helper';

// ============================================
// DEFAULT STATE — chat vazio
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`akashic default ${theme}`, async ({ page }) => {
    await page.goto('/akashic', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('akashic', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// ERROR STATE — IA retorna 500/timeout
// ============================================

test('akashic error', async ({ page, context }) => {
  await forceErrorState(context, ['**/api/akashic**', '**/api/chat**']);
  await page.goto('/akashic', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('akashic', viewport, 'light', 'error'),
    SCREENSHOT_OPTIONS,
  );
});
