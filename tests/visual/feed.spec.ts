/**
 * Visual Regression — Feed (Wave 26 / Lina)
 *
 * Página mais importante do produto. Captura:
 * - default state (com posts)
 * - empty state (sem posts — usuário novo)
 * - loading state (skeleton)
 * - error state (500 do /api/posts)
 *
 * Em 3 viewports × 2 themes = 12 baselines (3 states × 2 themes × 3 viewports = 18 total).
 *
 * @see docs/VISUAL-REGRESSION-W26.md
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import {
  setTheme,
  getViewportName,
  screenshotName,
  SCREENSHOT_OPTIONS,
  waitForVisualStability,
  forceLoadingState,
  forceErrorState,
  forceEmptyState,
  type Theme,
} from './helpers/visual-helper';

// ============================================
// DEFAULT STATE — feed com posts
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`feed default ${theme}`, async ({ page, context }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('feed', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// EMPTY STATE — usuário sem posts
// ============================================

test('feed empty', async ({ page, context }) => {
  await forceEmptyState(context);
  await page.goto('/feed', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('feed', viewport, 'light', 'empty'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// LOADING STATE — skeleton
// ============================================

test('feed loading', async ({ page, context }) => {
  await forceLoadingState(context);
  await page.goto('/feed', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  // Sem waitForVisualStability — queremos capturar o skeleton ANTES dos dados chegarem
  await page.waitForTimeout(800);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('feed', viewport, 'light', 'loading'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// ERROR STATE — 500
// ============================================

test('feed error', async ({ page, context }) => {
  await forceErrorState(context);
  await page.goto('/feed', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('feed', viewport, 'light', 'error'),
    SCREENSHOT_OPTIONS,
  );
});
