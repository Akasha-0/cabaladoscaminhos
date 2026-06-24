/**
 * E2E — Wave 9.4 Meu Dia / Curioso flow
 *
 * Verifies the "curioso" emotional state surfaces the exploration hub:
 *   - 5 Pilar cards (cabala, astrologia, tantra, odu, iching)
 *   - Each card is a link with the right href pattern:
 *     /mandala?layer=N for pillars, /diario?intencao=explorar-odu for Odu
 *
 * Run: `pnpm dev`, then `pnpm test:e2e meu-dia-curioso`.
 */

import { test, expect } from '@playwright/test';

import { loginInContext, seedEmotionalState } from './_helpers/auth';

const PILARES = ['cabala', 'astrologia', 'tantra', 'odu', 'iching'] as const;

test.describe('Meu Dia — Curioso flow (Wave 9.1)', () => {
  test('login → /meu-dia → pick curioso → 5 pilar cards', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('state-picker')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('state-picker-tile-curioso').click();

    // CuriosoView renders all 5 pilar cards.
    await expect(page.getByTestId('curioso-view')).toBeVisible();
    for (const pilar of PILARES) {
      await expect(page.getByTestId(`curioso-pilar-${pilar}`)).toBeVisible();
    }

    // Href patterns — /mandala?layer=N for 4 pilares, /diario for Odu.
    await expect(page.getByTestId('curioso-pilar-cabala')).toHaveAttribute(
      'href',
      '/pt-BR/mandala?layer=2'
    );
    await expect(page.getByTestId('curioso-pilar-astrologia')).toHaveAttribute(
      'href',
      '/pt-BR/mandala?layer=4'
    );
    await expect(page.getByTestId('curioso-pilar-tantra')).toHaveAttribute(
      'href',
      '/pt-BR/mandala?layer=3'
    );
    await expect(page.getByTestId('curioso-pilar-odu')).toHaveAttribute(
      'href',
      /\/pt-BR\/diario\?intencao=explorar-odu/
    );
    await expect(page.getByTestId('curioso-pilar-iching')).toHaveAttribute(
      'href',
      '/pt-BR/mandala?layer=5'
    );
  });

  test('clicking a pilar navigates to its destination route', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);
    await seedEmotionalState(context, 'curioso', 'http://localhost:3000');

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('curioso-view')).toBeVisible();
    await page.getByTestId('curioso-pilar-cabala').click();
    await page.waitForURL(/\/pt-BR\/mandala\?layer=2/, { timeout: 15_000 });
    expect(page.url()).toContain('layer=2');
  });
});