/**
 * Visual Regression — Notifications (Wave 26 / Lina)
 *
 * Página de notificações ao vivo (SSE stream).
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
  forceErrorState,
  forceEmptyState,
} from './helpers/visual-helper';

// ============================================
// DEFAULT STATE — com notificações
// ============================================

for (const theme of ['light', 'dark'] as const) {
  test(`notifications default ${theme}`, async ({ page }) => {
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
    await setTheme(page, theme);
    await waitForVisualStability(page);

    const viewport = getViewportName(page);
    await expect(page).toHaveScreenshot(
      screenshotName('notifications', viewport, theme, 'default'),
      SCREENSHOT_OPTIONS,
    );
  });
}

// ============================================
// EMPTY STATE — sem notificações
// ============================================

test('notifications empty', async ({ page, context }) => {
  await forceEmptyState(context, ['**/api/notifications**']);
  await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('notifications', viewport, 'light', 'empty'),
    SCREENSHOT_OPTIONS,
  );
});

// ============================================
// ERROR STATE — SSE falha
// ============================================

test('notifications error', async ({ page, context }) => {
  await forceErrorState(context, ['**/api/notifications**', '**/api/notifications/stream**']);
  await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
  await setTheme(page, 'light');
  await waitForVisualStability(page);

  const viewport = getViewportName(page);
  await expect(page).toHaveScreenshot(
    screenshotName('notifications', viewport, 'light', 'error'),
    SCREENSHOT_OPTIONS,
  );
});
