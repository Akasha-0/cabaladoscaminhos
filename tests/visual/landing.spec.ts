/**
 * Visual Regression — Landing Page (Wave 26 / Lina)
 *
 * Página raiz (/) — porta de entrada pra novos usuários.
 * Captura: default + validation page (rota irmã) em 3 viewports × 2 themes.
 *
 * Por que landing é crítico:
 *   - 95% do tráfego começa aqui (orgânico + social)
 *   - Conversion rate direto pra signup
 *   - Wave 23 launch communications redesignou copy
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
} from './helpers/visual-helper';

// ============================================
// DEFAULT STATE — landing principal
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`landing default ${theme}`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('landing', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// VALIDATION PAGE — captura de email
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`landing validation ${theme}`, async ({ page }) => {
    await page.goto('/validacao', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('landing', viewport, theme, 'empty'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// MANIFESTO — página de visão
// ============================================

test('landing manifesto', async ({ page }) => {
  await page.goto('/manifesto', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('landing', viewport, 'light', 'loading'),
    SCREENSHOT_OPTIONS,
  );
});
