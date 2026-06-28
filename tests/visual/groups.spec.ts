/**
 * Visual Regression — Groups (Wave 26 / Lina)
 *
 * Lista de grupos da comunidade + detalhe (/groups/[slug]).
 * Captura: default (lista) + empty + error + loading states.
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
  forceLoadingState,
  forceErrorState,
  forceEmptyState,
} from './helpers/visual-helper';

// ============================================
// DEFAULT STATE — lista de grupos
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`groups default ${theme}`, async ({ page }) => {
    await page.goto('/groups', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('groups', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// EMPTY STATE — sem grupos
// ============================================

test('groups empty', async ({ page, context }) => {
  await forceEmptyState(context, ['**/api/groups**']);
  await page.goto('/groups', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('groups', viewport, 'light', 'empty'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// LOADING STATE
// ============================================

test('groups loading', async ({ page, context }) => {
  await forceLoadingState(context, ['**/api/groups**']);
  await page.goto('/groups', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await page.waitForTimeout(800);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('groups', viewport, 'light', 'loading'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// ERROR STATE
// ============================================

test('groups error', async ({ page, context }) => {
  await forceErrorState(context, ['**/api/groups**']);
  await page.goto('/groups', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('groups', viewport, 'light', 'error'),
    SCREENSHOT_OPTIONS,
  );
});
