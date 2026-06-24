/**
 * E2E — Wave 9.4 Meu Dia / Ansioso flow
 *
 * Reproduces the full "ansioso" emotional state journey:
 *   1. Log in via /api/akasha/auth/login.
 *   2. Visit /pt-BR/meu-dia (no state yet → picker shows).
 *   3. Click the "🌊 Ansioso" tile.
 *   4. Verify <BreathOrb> + start-breath button render.
 *   5. Click "Começar respiração" → orb phase becomes "inhale".
 *   6. Verify the Mentor CTA links to /pt-BR/diario?intencao=ansiedade.
 *   7. Click the Mentor CTA → assert we land on the diario page with
 *      the intencao=ansiedade query param present (this is what the
 *      Wave 9.3 dispatcher reads to bias the tool selection).
 *
 * Run: `pnpm dev` (one terminal), then `pnpm test:e2e meu-dia-ansioso`.
 */

import { test, expect } from '@playwright/test';

import { loginInContext, seedEmotionalState } from './_helpers/auth';

test.describe('Meu Dia — Ansioso flow (Wave 9.1 + 9.3)', () => {
  test('login → /meu-dia → pick ansioso → breath orb + mentor CTA', async ({
    page,
    context,
    request,
    baseURL,
  }) => {
    test.setTimeout(60_000);

    // Auth — fails loudly if E2E_TEST_PASSWORD is unset / user not seeded.
    await loginInContext(request, context);

    // Wipe any previously persisted emotional state so we exercise the
    // full picker → pick → view flow (no skip).
    await context.clearCookies();
    await context.addInitScript(() => {
      try {
        window.localStorage.removeItem('akasha.emotionalState');
      } catch {
        /* ignore */
      }
    });

    // 1. Visit /meu-dia — first paint should show the StatePicker.
    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('state-picker')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('state-picker-tile-ansioso')).toBeVisible();

    // 2. Pick "ansioso" — picker disappears, AnsiosoView takes over.
    await page.getByTestId('state-picker-tile-ansioso').click();

    // 3. Verify the AnsiosoView + BreathOrb + start-breath button.
    await expect(page.getByTestId('ansioso-view')).toBeVisible();
    await expect(page.getByTestId('breath-orb')).toBeVisible();
    await expect(page.getByTestId('ansioso-start-breath')).toBeVisible();

    // 4. Mentor CTA should point at /diario?intencao=ansiedade.
    const mentorLink = page.getByTestId('ansioso-mentor-link');
    await expect(mentorLink).toHaveAttribute('href', '/pt-BR/diario?intencao=ansiedade');

    // 5. Start the breath orb — phase should move from "idle" to "inhale".
    await page.getByTestId('ansioso-start-breath').click();
    await expect(page.getByTestId('breath-orb')).toHaveAttribute('data-phase', /^(inhale|hold)$/);

    // 6. Follow the mentor link — should land on /diario with the
    //    Wave 9.3 intent query param preserved.
    await mentorLink.click();
    await page.waitForURL(/\/pt-BR\/diario\?intencao=ansiedade/, { timeout: 15_000 });
    expect(page.url()).toContain('intencao=ansiedade');
    // Diario renders the MandatoUnificado component which carries a
    // semantic landmark — verify we're not on a redirect-to-login page.
    await expect(page).not.toHaveURL(/\/login/);

    // 7. Verify the emotional state was persisted (localStorage + cookie).
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('akasha.emotionalState')
    );
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored ?? '{}').state).toBe('ansioso');
  });

  test('persisted ansioso state skips the picker on next visit', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);
    await seedEmotionalState(context, 'ansioso', 'http://localhost:3000');

    await page.goto('/pt-BR/meu-dia');
    // Picker should NOT appear — state was already recorded.
    await expect(page.getByTestId('state-picker')).not.toBeVisible();
    await expect(page.getByTestId('ansioso-view')).toBeVisible();
    await expect(page.getByTestId('breath-orb')).toBeVisible();
  });
});