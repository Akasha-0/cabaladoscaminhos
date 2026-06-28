/**
 * Visual Regression — Library (Wave 26 / Lina)
 *
 * Página de consumo de conteúdo (artigos, ensaios, papers).
 * Captura: default + empty + loading + error states em 3 viewports × 2 themes.
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
// DEFAULT STATE
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`library default ${theme}`, async ({ page }) => {
    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('library', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// EMPTY STATE
// ============================================

test('library empty', async ({ page, context }) => {
  await forceEmptyState(context, ['**/api/library**', '**/api/articles**']);
  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('library', viewport, 'light', 'empty'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// LOADING STATE
// ============================================

test('library loading', async ({ page, context }) => {
  await forceLoadingState(context, ['**/api/library**', '**/api/articles**']);
  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await page.waitForTimeout(800);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('library', viewport, 'light', 'loading'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// ERROR STATE
// ============================================

test('library error', async ({ page, context }) => {
  await forceErrorState(context, ['**/api/library**', '**/api/articles**']);
  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('library', viewport, 'light', 'error'),
    SCREENSHOT_OPTIONS,
  );
});
