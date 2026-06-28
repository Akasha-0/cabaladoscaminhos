/**
 * Visual Regression — Onboarding (Wave 26 / Lina)
 *
 * Fluxo de onboarding (3 passos): boas-vindas → tradições → completar.
 * Captura: default (passo 1) + loading state.
 *
 * Por que onboarding é crítico:
 *   - Primeira impressão do usuário novo
 *   - Define retenção D1/D7
 *   - Wave 19 redesenhou (ONBOARDING-FIRST-TIME-UX-W19.md)
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
// DEFAULT STATE — step 1 (boas-vindas)
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`onboarding default ${theme}`, async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('onboarding', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// DEFAULT STATE — landing intermediária (welcome)
// ============================================

test('onboarding welcome', async ({ page }) => {
  await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('onboarding', viewport, 'light', 'default'),
    SCREENSHOT_OPTIONS,
  );
});
