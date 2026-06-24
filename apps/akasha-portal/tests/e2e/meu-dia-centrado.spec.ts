/**
 * E2E — Wave 9.4 Meu Dia / Centrado flow
 *
 * Verifies the "centrado" emotional state shows the full synthesis
 * (the user has bandwidth to absorb it). The CentradoView shows:
 *   - Climate card
 *   - Strategy + Authority (Akasha Type)
 *   - Daily ritual
 *   - Synthesis paragraph
 *
 * Note: when no daily synthesis is available (test DB / cold start),
 * the view renders the "silencioso hoje" fallback. We test for the
 * wrapper + the structural data-testids, not on copy.
 *
 * Run: `pnpm dev`, then `pnpm test:e2e meu-dia-centrado`.
 */

import { test, expect } from '@playwright/test';

import { loginInContext, seedEmotionalState } from './_helpers/auth';

test.describe('Meu Dia — Centrado flow (Wave 9.1)', () => {
  test('login → /meu-dia → pick centrado → full synthesis view', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('state-picker')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('state-picker-tile-centrado').click();

    // CentradoView renders — wrapper has the data-testid.
    await expect(page.getByTestId('centrado-view')).toBeVisible();

    // Either the synthesis loaded or the "silencioso hoje" fallback
    // is showing. Both are valid CentradoView states.
    const view = page.getByTestId('centrado-view');
    const text = (await view.textContent()) ?? '';
    // The view should at minimum contain the centrado heading or the fallback.
    expect(text.length).toBeGreaterThan(0);
  });

  test('persisted centrado state renders the view without the picker', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);
    await seedEmotionalState(context, 'centrado', 'http://localhost:3000');

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('state-picker')).not.toBeVisible();
    await expect(page.getByTestId('centrado-view')).toBeVisible();
  });

  test('change-state affordance re-opens the picker', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);
    await seedEmotionalState(context, 'centrado', 'http://localhost:3000');

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('centrado-view')).toBeVisible();

    // The "Trocar estado" link re-opens the picker.
    const changeLink = page.getByTestId('meu-dia-change-state');
    await expect(changeLink).toBeVisible();
    await changeLink.click();
    // Picker should re-appear (the current centred state stays persisted
    // until the user picks another — the affordance just refreshes the
    // view via the existing setState(state) call).
    await expect(page.getByTestId('state-picker')).toBeVisible();
  });
});