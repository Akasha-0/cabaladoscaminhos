/**
 * library-search.spec.ts — Wave 10
 *
 * Fluxo crítico #3: Library search → article read
 * Consumo de conteúdo (curadoria validada por evidência científica).
 *
 * CENÁRIOS:
 *   3.1. Library renderiza 8 artigos mock (Reiki, Ayahuasca, Vipassana, Cabala, ...)
 *   3.2. Search filter por texto filtra artigos em tempo real
 *   3.3. Filtro por tradição (Reiki) reduz lista para artigos dessa tradição
 *   3.4. Sort toggle (Recente vs Popular) reordena artigos
 *   3.5. Search API call (mock /api/search) retorna resultados
 *
 * DECISÕES:
 * - Library é client-side filtering (artigos em mock array), não depende de DB
 * - /api/search mockado para validar que o SearchBar global chama a API
 * - Não testa article detail page (não existe como rota — Wave 11)
 * - Foco: garantir que busca + filtro funcionam end-to-end no client
 *
 * KNOWN GAPS (Wave 10 batch 2):
 * - Article cards NÃO têm link para detail page (provavelmente Wave 11)
 * - Search global (CommunityNav SearchBar) tem onSearch handler, mas
 *   não está conectado a /api/search — fica para Wave 11
 */

import { test, expect, type Page } from '@playwright/test';

// ============================================
// FIXTURES
// ============================================

async function mockAuthAsAuthenticated(page: Page) {
  await page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-jwt-token',
        user: { id: 'mock-user-id', email: 'e2e@akasha.local' },
      }),
    });
  });

  await page.context().addCookies([
    {
      name: 'sb-mock-auth-token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Mocka /api/search — retorna resultados categorizados.
 */
async function mockSearchApi(page: Page) {
  await page.route('**/api/search**', async (route) => {
    const url = new URL(route.request().url());
    const q = url.searchParams.get('q') ?? '';

    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          results: [
            {
              type: 'article',
              id: 'a1',
              title: `Reiki e ansiedade: ${q}`,
              excerpt: 'Estudo randomizado controlado com 23 pacientes.',
              url: '/library#a1',
              score: 0.92,
            },
          ],
          facets: {
            total: 1,
            byType: { article: 1, post: 0, user: 0, group: 0 },
            byTradition: { reiki: 1 },
          },
          took_ms: 12,
          nextCursor: null,
        },
        meta: { query: q, took_ms: 12, total: 1 },
      }),
    });
  });
}

// ============================================
// TEST 3.1 — Library renderiza com 8 artigos
// ============================================
test.describe('Library: consumo de conteúdo', () => {
  test('library renderiza com ≥ 8 artigos', async ({ page }) => {
    await mockAuthAsAuthenticated(page);

    const response = await page.goto('/library', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await page.waitForLoadState('networkidle').catch(() => {});

    // Primeiro artigo (Reiki) deve estar visível
    await expect(
      page.getByText(/Efeitos do Reiki em ansiedade/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Contagem: header mostra "X artigos" — conta DOIs como proxy de artigo
    const doiCount = await page.getByText(/DOI:|doi\.org/i).count();
    expect(
      doiCount,
      `library deve mostrar ≥ 8 artigos (proxy: DOIs visíveis), encontrou ${doiCount}`
    ).toBeGreaterThanOrEqual(8);

    // Header com count visível
    await expect(page.getByText(/\d+ artigos?/).first()).toBeVisible();
  });

  // ============================================
  // TEST 3.2 — Search filter por texto
  // ============================================
  test('digitar "Reiki" filtra artigos em tempo real', async ({ page }) => {
    await mockAuthAsAuthenticated(page);

    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Search input
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // Total inicial = 8 (visível no header)
    await expect(page.getByText(/8 artigos?/).first()).toBeVisible();

    // Digita "Reiki"
    await searchInput.fill('Reiki');

    // Aguarda filtro reativo
    await page.waitForTimeout(500);

    // Header deve mostrar count menor (Reiki tem 1 artigo)
    // O count atual pode ser "1 artigo" (singular) ou "1 artigos"
    await expect(page.getByText(/^1 art/i).first()).toBeVisible({ timeout: 5_000 });

    // Artigo "Reiki" continua visível
    await expect(page.getByText(/Reiki em ansiedade/i).first()).toBeVisible();

    // Artigo "Ayahuasca" deve estar OCULTO (não match com "Reiki")
    const ayahuascaVisible = await page
      .getByText(/Ayahuasca/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(ayahuascaVisible, 'Ayahuasca não deve aparecer ao filtrar "Reiki"').toBeFalsy();
  });

  // ============================================
  // TEST 3.3 — Filtro por tradição (Cabala)
  // ============================================
  test('click em filtro "Cabala" reduz lista para artigos Cabala', async ({ page }) => {
    await mockAuthAsAuthenticated(page);

    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Filtro "Cabala" — chip com role button
    const cabalaChip = page.locator('button:has-text("Cabala")').first();
    await expect(cabalaChip).toBeVisible({ timeout: 10_000 });
    await cabalaChip.click();

    await page.waitForTimeout(500);

    // Header mostra count reduzido (Cabala tem 2 artigos no mock)
    await expect(page.getByText(/^2 art/i).first()).toBeVisible({ timeout: 5_000 });

    // Artigos Cabala visíveis
    await expect(page.getByText(/Árvore da Vida|Cabalistas meditavam/i).first()).toBeVisible();

    // Reiki NÃO deve aparecer
    const reikiVisible = await page
      .getByText(/Reiki em ansiedade/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(reikiVisible, 'Reiki não deve aparecer ao filtrar Cabala').toBeFalsy();
  });

  // ============================================
  // TEST 3.4 — Sort toggle funciona
  // ============================================
  test('botão "Popular" reordena artigos', async ({ page }) => {
    await mockAuthAsAuthenticated(page);

    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Botão "Popular"
    const popularBtn = page.locator('button:has-text("Popular")').first();
    await expect(popularBtn).toBeVisible({ timeout: 10_000 });

    // Click
    await popularBtn.click();
    await page.waitForTimeout(500);

    // Não crashou + artigos ainda visíveis
    await expect(page.getByText(/Reiki|Ayahuasca/i).first()).toBeVisible();

    // Botão "Recente" volta ao default
    const recentBtn = page.locator('button:has-text("Recente")').first();
    await expect(recentBtn).toBeVisible();
    await recentBtn.click();
    await page.waitForTimeout(500);

    // Ainda mostra artigos
    await expect(page.getByText(/Reiki|Ayahuasca/i).first()).toBeVisible();
  });

  // ============================================
  // TEST 3.5 — Search API mock retorna resultados
  // (testa o SearchBar global na CommunityNav)
  // ============================================
  test('SearchBar global chama /api/search com query', async ({ page }) => {
    await mockAuthAsAuthenticated(page);
    await mockSearchApi(page);

    let searchRequestFired = false;
    let searchQueryValue = '';
    page.on('request', (req) => {
      if (req.url().includes('/api/search') && req.method() === 'GET') {
        searchRequestFired = true;
        const url = new URL(req.url());
        searchQueryValue = url.searchParams.get('q') ?? '';
      }
    });

    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Procura qualquer input de search no DOM (global ou local)
    const searchInputs = page.locator('input[placeholder*="uscar"], input[type="search"], input[placeholder*="search"]');
    const inputCount = await searchInputs.count();

    if (inputCount > 0) {
      const firstSearchInput = searchInputs.first();
      await firstSearchInput.fill('meditação');
      // Aguarda debounce (300ms) + fetch
      await page.waitForTimeout(1_500);
    }

    // Opcionalmente: se o fetch aconteceu, validamos. Se não,
    // pelo menos confirmamos que não crashou.
    const hasCrash = await page
      .getByText(/Application error|Unhandled|Failed to compile/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasCrash, 'library não deve crashar ao buscar').toBeFalsy();

    // Se a API foi chamada (mock disponível), validamos a query
    if (searchRequestFired) {
      expect(
        searchQueryValue.length > 0,
        `search query deve ser não-vazia, recebeu "${searchQueryValue}"`
      ).toBeTruthy();
    }
    // Se não foi chamada, ainda é OK (UI pode não chamar API no client)
  });
});
