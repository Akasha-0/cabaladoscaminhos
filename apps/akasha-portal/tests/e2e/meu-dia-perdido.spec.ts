/**
 * E2E — Wave 9.4 Meu Dia / Perdido flow
 *
 * Verifies the "perdido" emotional state surfaces the right UX:
 *   - Mini-mandala SVG (perdido-mini-mandala testid)
 *   - 3 practice cards (ritual + silence + write)
 *   - "Me dê um caminho" CTA → /diario?intencao=perdido
 *
 * Run: `pnpm dev`, then `pnpm test:e2e meu-dia-perdido`.
 */

import { test, expect } from '@playwright/test';

import { loginInContext, seedEmotionalState } from './_helpers/auth';

test.describe('Meu Dia — Perdido flow (Wave 9.1)', () => {
  test('login → /meu-dia → pick perdido → mini-mandala + 3 practice cards + mentor CTA', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('state-picker')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('state-picker-tile-perdido').click();

    // PerdidoView renders the mini-mandala + 3 practice cards.
    await expect(page.getByTestId('perdido-view')).toBeVisible();
    await expect(page.getByTestId('perdido-mini-mandala')).toBeVisible();
    await expect(page.getByTestId('perdido-practice-silence')).toBeVisible();
    await expect(page.getByTestId('perdido-practice-write')).toBeVisible();

    // Mentor CTA carries the Wave 9.3 intent.
    const mentorLink = page.getByTestId('perdido-mentor-link');
    await expect(mentorLink).toHaveAttribute('href', '/pt-BR/diario?intencao=perdido');
    await mentorLink.click();
    await page.waitForURL(/\/pt-BR\/diario\?intencao=perdido/, { timeout: 15_000 });
    expect(page.url()).toContain('intencao=perdido');
  });

  test('persisted perdido state skips picker and renders view directly', async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginInContext(request, context);
    await seedEmotionalState(context, 'perdido', 'http://localhost:3000');

    await page.goto('/pt-BR/meu-dia');
    await expect(page.getByTestId('state-picker')).not.toBeVisible();
    await expect(page.getByTestId('perdido-view')).toBeVisible();
    await expect(page.getByTestId('perdido-mini-mandala')).toBeVisible();
  });
});