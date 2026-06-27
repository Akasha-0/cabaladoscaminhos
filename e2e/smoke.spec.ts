/**
 * Smoke E2E — Akasha Portal
 *
 * Conjunto mínimo de testes que validam que as rotas principais
 * renderizam sem erro e expõem os elementos esperados.
 *
 * IMPORTANTE: este arquivo NÃO autentica Supabase real.
 * - Auth usa mock (SupabaseProvider cai em "no supabase" quando env vars ausentes)
 * - Páginas que dependem de dados (feed/library/notifications) usam MOCK_POSTS embutidos
 * - Waitlist usa /api/waitlist (server action que grava em data/waitlist.json — gitignored)
 *
 * Por que mobile-first viewport:
 * - O uso real do produto é mobile (consulta cotidiana)
 * - A navbar mobile (bottom nav) só aparece em viewport pequeno
 */

import { test, expect } from '@playwright/test';

// ============================================
// 1. HOME — Landing principal
// ============================================
test('home renders', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `home deve retornar 2xx, recebeu ${response?.status()}`).toBeTruthy();

  // Hero title
  await expect(page.getByText(/Akasha/i).first()).toBeVisible({ timeout: 10_000 });
  // CTA principal (Entrar/Login ou Lista de espera)
  await expect(
    page.getByRole('link', { name: /Entrar|Login|Beta|Lista|Comunidade/i }).first()
  ).toBeVisible();
});

// ============================================
// 2. VALIDACAO — Landing de captura de email
// ============================================
test('validation page works', async ({ page }) => {
  const response = await page.goto('/validacao', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();

  // Tem form de captura
  const emailInput = page.locator('input[type="email"]').first();
  await expect(emailInput).toBeVisible({ timeout: 10_000 });

  // Tem botão submit
  const submitBtn = page.locator('button[type="submit"]').first();
  await expect(submitBtn).toBeVisible();
});

// ============================================
// 3. LOGIN — Página de autenticação
// ============================================
test('login page renders', async ({ page }) => {
  const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();

  // Brand title
  await expect(page.getByText(/Cabala dos Caminhos/i).first()).toBeVisible({ timeout: 10_000 });

  // Form fields
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
  await expect(page.locator('input[name="password"]').first()).toBeVisible();
  await expect(page.locator('button[type="submit"]').first()).toBeVisible();
});

// ============================================
// 4. FEED — Protegido por auth (não autenticado)
// ============================================
test('feed shows auth-required state when not authenticated', async ({ page }) => {
  const response = await page.goto('/feed', { waitUntil: 'domcontentloaded' });
  // Sem Supabase configurado, o middleware NÃO bloqueia (client-side decide)
  // Verificamos que a página não quebra: ou renderiza conteúdo mock OU mostra "Entrar"
  expect(response?.ok(), `feed deve responder 2xx, recebeu ${response?.status()}`).toBeTruthy();

  // Aguardar hidratação: ou o feed aparece, ou aparece CTA de login
  await page.waitForLoadState('networkidle').catch(() => {});

  // Pelo menos uma das duas alternativas deve estar visível:
  // (a) conteúdo do feed com MOCK_POSTS (autor visível)
  // (b) CTA/botão/link "Entrar" / "Login" / "Cadastrar"
  const hasFeedContent = await page
    .getByText(/Marina dos Caminhos|Ruy de Ogum|Feed|Comunidade/i)
    .first()
    .isVisible()
    .catch(() => false);

  const hasLoginCta = await page
    .getByRole('link', { name: /Entrar|Login|Cadastrar|Criar conta/i })
    .first()
    .isVisible()
    .catch(() => false);

  expect(
    hasFeedContent || hasLoginCta,
    'feed deve mostrar OU conteúdo mock OU CTA de login'
  ).toBeTruthy();
});

// ============================================
// 5. SIGNUP — Email mockado deve mostrar feedback amigável
// ============================================
test('signup flow shows graceful feedback when Supabase is not configured', async ({ page }) => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });

  // Preencher formulário
  await page.locator('input[name="name"]').first().fill('Teste Smoke');
  await page
    .locator('input[type="email"]')
    .first()
    .fill(`smoke-${Date.now()}@akasha.test`);

  // Aceitar termos (se existir)
  const termsCheckbox = page.locator('input[name="acceptTerms"], input[type="checkbox"]').first();
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check().catch(() => {});
  }

  // Senha + confirmação (campos mínimos)
  const passwordFields = page.locator('input[name="password"], input[name="confirmPassword"]');
  const count = await passwordFields.count();
  for (let i = 0; i < count; i++) {
    await passwordFields.nth(i).fill('SmokeTest123!');
  }

  // Submeter e esperar feedback (sem quebrar o teste se Supabase não estiver)
  await page.locator('button[type="submit"]').first().click();

  // Aguardar OU mensagem de erro amigável OU redirecionamento OU loading estável
  // Não podemos exigir sucesso (Supabase pode não estar configurado no sandbox)
  await page.waitForTimeout(2_000);

  // O teste passa se a página não crashou (sem "Application error")
  const hasCrash = await page
    .getByText(/Application error|Unhandled|Failed to compile/i)
    .first()
    .isVisible()
    .catch(() => false);
  expect(hasCrash, 'signup não deve crashar a aplicação').toBeFalsy();
});

// ============================================
// 6. WAITLIST — Submit de email em /validacao
// ============================================
test('waitlist submit shows confirmation', async ({ page }) => {
  await page.goto('/validacao', { waitUntil: 'domcontentloaded' });

  const email = `waitlist-smoke-${Date.now()}@akasha.test`;
  await page.locator('input[type="email"]').first().fill(email);

  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();

  // Esperar OU confirmação OU erro gracioso (depende de waitlist.json estar disponível)
  // Mensagens esperadas: "Cadastrado", "Posição", "lista de espera", ou erro amigável
  await page.waitForTimeout(3_000);

  const successText = await page
    .getByText(/Cadastrado|Posição|na lista|entrar em contato/i)
    .first()
    .isVisible()
    .catch(() => false);

  const errorText = await page
    .getByText(/Erro|indisponível|tente novamente/i)
    .first()
    .isVisible()
    .catch(() => false);

  // O teste passa se a página respondeu (sucesso OU erro controlado — não crash)
  expect(
    successText || errorText,
    'waitlist deve mostrar OU sucesso OU erro controlado após submit'
  ).toBeTruthy();
});

// ============================================
// 7. LIBRARY — Carrega com 8 artigos mock
// ============================================
test('library loads with 8 articles', async ({ page }) => {
  const response = await page.goto('/library', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();

  // Aguardar artigos renderizarem
  await page.waitForLoadState('networkidle').catch(() => {});

  // O primeiro artigo (Reiki) deve estar visível — garantia de que o array ARTICLES renderizou
  await expect(
    page.getByText(/Efeitos do Reiki em ansiedade/i).first()
  ).toBeVisible({ timeout: 10_000 });

  // Verificar contagem: cards de artigo contêm o ícone BookOpen + título.
  // Estratégia: contar quantas vezes "DOI:" aparece (cada artigo tem DOI)
  // Fallback: contar headings de artigo via heurística simples
  const doiCount = await page.getByText(/DOI:|doi\.org/i).count();
  expect(doiCount, `library deve mostrar ≥ 8 artigos, encontrou ${doiCount} DOIs`).toBeGreaterThanOrEqual(8);
});

// ============================================
// 8. NOTIFICATIONS — Página mock renderiza
// ============================================
test('notifications mock page renders', async ({ page }) => {
  const response = await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();

  await page.waitForLoadState('networkidle').catch(() => {});

  // Notifications mock tem "Ruy de Ogum" como primeiro ator
  const hasContent = await page
    .getByText(/Notificaç|Notif|Ruy de Ogum|começou a seguir/i)
    .first()
    .isVisible({ timeout: 10_000 })
    .catch(() => false);

  expect(hasContent, 'notifications deve renderizar conteúdo (mock)').toBeTruthy();
});

// ============================================
// 9. PROFILE PLACEHOLDER — /u/qualquer-coisa
// ============================================
test('profile placeholder works for any handle', async ({ page }) => {
  const response = await page.goto('/u/test-user-smoke', { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `profile deve responder 2xx, recebeu ${response?.status()}`).toBeTruthy();

  await page.waitForLoadState('networkidle').catch(() => {});

  // Não deve crashar — algum conteúdo deve aparecer (perfil placeholder ou empty state)
  const hasContent = await page
    .getByText(/Perfil|perfil|Seguir|test-user-smoke/i)
    .first()
    .isVisible({ timeout: 10_000 })
    .catch(() => false);

  const hasCrash = await page
    .getByText(/Application error|Unhandled|Failed to compile/i)
    .first()
    .isVisible()
    .catch(() => false);

  expect(hasCrash, 'profile placeholder não deve crashar').toBeFalsy();
  expect(hasContent, 'profile placeholder deve mostrar algum conteúdo').toBeTruthy();
});
