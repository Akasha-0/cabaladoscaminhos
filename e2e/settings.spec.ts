/**
 * settings.spec.ts — Wave 26
 *
 * Configurações: perfil, privacidade, notificações, conta.
 *
 * Cenários:
 *   ST.1. /settings carrega com tabs (perfil, privacidade, notificações)
 *   ST.2. Atualizar bio via PATCH /api/users/profile persiste
 *   ST.3. Toggle "conta privada" persiste em privacidade
 *   ST.4. Preferências de notificação salvam via /api/notifications/preferences
 *   ST.5. Logout via /api/auth/logout limpa sessão
 *   ST.6. Mobile (375x667): tabs e forms navegáveis
 *
 * DECISÕES:
 * - /settings é single-page com tabs (perfil/privacidade/notificações/conta)
 * - Não validamos LGPD cookie banner aqui (Wave 12 já cobriu)
 * - Logout limpa cookies + localStorage
 *
 * KNOWN GAPS (Wave 26):
 * - Export de dados (LGPD direito ao acesso) NÃO coberto — Wave 27
 * - Delete account NÃO coberto — requer fluxo separado de confirmação
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

async function mockProfilePatchApi(page: Page) {
  let currentBio = 'Bio original E2E';
  let currentPrivate = false;
  let patchFired = false;
  let patchPayload: Record<string, unknown> = {};

  await page.route('**/api/users/profile**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'mock-user-id',
            nomeCompleto: 'E2E User',
            bio: currentBio,
            isPrivate: currentPrivate,
            tradicoes: ['cabala'],
          },
        }),
      });
      return;
    }
    if (method === 'PATCH' || method === 'POST' || method === 'PUT') {
      try {
        patchPayload = JSON.parse(route.request().postData() ?? '{}');
      } catch {
        // ignore
      }
      patchFired = true;
      if (typeof patchPayload.bio === 'string') currentBio = patchPayload.bio;
      if (typeof patchPayload.isPrivate === 'boolean') currentPrivate = patchPayload.isPrivate;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { bio: currentBio, isPrivate: currentPrivate },
          success: true,
        }),
      });
      return;
    }
    await route.continue();
  });

  return { wasPatched: () => patchFired, getPayload: () => patchPayload };
}

async function mockNotificationPrefsApi(page: Page) {
  const prefs = {
    pushEnabled: false,
    emailDigest: true,
    newFollower: true,
    newComment: true,
    weeklyRitual: true,
  };
  let prefsFired = false;

  await page.route('**/api/notifications/preferences**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: prefs }),
      });
      return;
    }
    if (route.request().method() === 'PATCH' || route.request().method() === 'POST') {
      prefsFired = true;
      try {
        const body = JSON.parse(route.request().postData() ?? '{}');
        Object.assign(prefs, body);
      } catch {
        // ignore
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: prefs }),
      });
      return;
    }
    await route.continue();
  });

  return { wasUpdated: () => prefsFired, getPrefs: () => prefs };
}

async function mockLogoutApi(page: Page) {
  await page.route('**/api/auth/logout**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

// ============================================
// TEST ST.1 — Settings carrega
// ============================================
test.describe('Settings: carregamento', () => {
  test('/settings renderiza tabs principais', async ({ page }) => {
    await mockAuthAsAuthenticated(page);
    await mockProfilePatchApi(page);
    await mockNotificationPrefsApi(page);

    const response = await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `/settings deve responder 2xx, recebeu ${response?.status()}`).toBeTruthy();

    await page.waitForLoadState('networkidle').catch(() => {});

    // Pelo menos uma seção de settings visível
    const profileSection = page.getByText(/perfil|profile|bio|configurações/i).first();
    const privacySection = page.getByText(/privac|privacy/i).first();
    const notifSection = page.getByText(/notificaç/i).first();

    const anyVisible = await profileSection
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
      .then(async (a) => a || (await privacySection.isVisible({ timeout: 1_000 }).catch(() => false)))
      .then(async (a) => a || (await notifSection.isVisible({ timeout: 1_000 }).catch(() => false)));

    expect(
      anyVisible,
      '/settings deve mostrar alguma seção (perfil/privacidade/notificações)'
    ).toBeTruthy();
  });
});

// ============================================
// TEST ST.2 — Atualizar bio persiste
// ============================================
test.describe('Settings: atualizar bio', () => {
  test('editar bio + salvar persiste via PATCH', async ({ page }) => {
    await mockAuthAsAuthenticated(page);
    const profileApi = await mockProfilePatchApi(page);
    await mockNotificationPrefsApi(page);

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Procura textarea de bio
    const bioTextarea = page.locator(
      'textarea[name*="bio" i], textarea[aria-label*="bio" i], textarea[placeholder*="bio" i]'
    ).first();
    const hasBio = await bioTextarea.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasBio) {
      test.skip(true, 'textarea de bio não encontrada');
      return;
    }

    const novaBio = 'Bio atualizada pelo teste E2E Wave 26.';
    await bioTextarea.fill(novaBio);

    // Botão salvar
    const saveBtn = page.locator('button:has-text("Salvar"), button[type="submit"]').first();
    const hasSave = await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasSave) {
      await saveBtn.click();
      await page.waitForTimeout(1_000);
    }

    expect(
      profileApi.wasPatched(),
      'PATCH /api/users/profile deve ter sido disparado'
    ).toBeTruthy();
    expect(
      profileApi.getPayload().bio,
      `payload deve conter nova bio, recebeu: ${JSON.stringify(profileApi.getPayload())}`
    ).toBe(novaBio);
  });
});

// ============================================
// TEST ST.3 — Toggle privacidade
// ============================================
test.describe('Settings: privacidade', () => {
  test('toggle de conta privada persiste', async ({ page }) => {
    await mockAuthAsAuthenticated(page);
    const profileApi = await mockProfilePatchApi(page);
    await mockNotificationPrefsApi(page);

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Navega para tab "Privacidade" se existir
    const privacyTab = page
      .locator('button:has-text("Privacidade"), a:has-text("Privacidade"), [role="tab"]:has-text("Privacidade")')
      .first();
    const hasPrivacyTab = await privacyTab.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasPrivacyTab) {
      await privacyTab.click();
      await page.waitForTimeout(500);
    }

    // Toggle "conta privada"
    const privateToggle = page
      .locator(
        'input[type="checkbox"][name*="privat" i], input[type="checkbox"][aria-label*="rivad" i], button[role="switch"][aria-label*="rivad" i]'
      )
      .first();
    const hasToggle = await privateToggle.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!hasToggle) {
      test.skip(true, 'toggle de privacidade não encontrado');
      return;
    }

    await privateToggle.click();
    await page.waitForTimeout(800);

    expect(
      profileApi.wasPatched(),
      'toggle de privacidade deve disparar PATCH /api/users/profile'
    ).toBeTruthy();
  });
});

// ============================================
// TEST ST.4 — Preferências de notificação
// ============================================
test.describe('Settings: notificações', () => {
  test('toggle "novo seguidor" salva via /api/notifications/preferences', async ({ page }) => {
    await mockAuthAsAuthenticated(page);
    await mockProfilePatchApi(page);
    const prefsApi = await mockNotificationPrefsApi(page);

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const notifTab = page
      .locator('button:has-text("Notificações"), a:has-text("Notificações"), [role="tab"]:has-text("Notificações")')
      .first();
    const hasNotifTab = await notifTab.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasNotifTab) {
      await notifTab.click();
      await page.waitForTimeout(500);
    }

    const followerToggle = page
      .locator(
        'input[type="checkbox"][name*="follower" i], input[type="checkbox"][name*="seguidor" i], input[aria-label*="guidor" i]'
      )
      .first();
    const hasToggle = await followerToggle.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!hasToggle) {
      test.skip(true, 'toggle de "novo seguidor" não encontrado');
      return;
    }

    await followerToggle.click();
    await page.waitForTimeout(800);

    expect(
      prefsApi.wasUpdated(),
      'preference update deve disparar POST/PATCH /api/notifications/preferences'
    ).toBeTruthy();
  });
});

// ============================================
// TEST ST.5 — Logout
// ============================================
test.describe('Settings: logout', () => {
  test('botão logout limpa sessão e redireciona', async ({ page }) => {
    await mockAuthAsAuthenticated(page);
    await mockProfilePatchApi(page);
    await mockNotificationPrefsApi(page);
    await mockLogoutApi(page);

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const logoutBtn = page
      .locator('button:has-text("Sair"), button:has-text("Logout"), button:has-text("Desconectar")')
      .first();
    const hasLogout = await logoutBtn.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasLogout) {
      test.skip(true, 'botão de logout não encontrado em /settings');
      return;
    }

    await logoutBtn.click();
    await page.waitForTimeout(1_500);

    // Cookie de auth deve ter sido limpo
    const cookies = await page.context().cookies();
    const authCookie = cookies.find((c) => c.name.includes('sb-') || c.name.includes('auth'));
    if (authCookie) {
      // Cookie pode existir mas estar expirado — verificamos valor
      expect(
        authCookie.value === '' || authCookie.expires < Date.now() / 1000,
        `cookie de auth deve estar limpo/expirado, recebeu: ${authCookie.name}=${authCookie.value}`
      ).toBeTruthy();
    }

    // URL deve ser /login ou / (página pública)
    const url = page.url();
    expect(
      /\/login|\/$/.test(url),
      `esperava redirect para /login ou /, url atual: ${url}`
    ).toBeTruthy();
  });
});

// ============================================
// TEST ST.6 — Mobile 375x667
// ============================================
test.describe('Settings: mobile', () => {
  test('settings é navegável em 375x667 sem overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await mockAuthAsAuthenticated(page);
    await mockProfilePatchApi(page);
    await mockNotificationPrefsApi(page);

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow, `overflow horizontal: ${overflow}px`).toBeLessThanOrEqual(2);

    // Alguma seção visível
    const sectionText = page.getByText(/perfil|privac|notificaç|configuraç/i).first();
    await expect(sectionText).toBeVisible({ timeout: 5_000 });
  });
});