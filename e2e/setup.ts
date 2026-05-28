import { test as base, type Page, type BrowserContext } from '@playwright/test';

/**
 * E2E Test Fixtures
 */

export type TestData = {
  user: {
    email: string;
    password: string;
    nomeCompleto: string;
  };
};

// Create test with fixtures
export const test = base.extend<{
  page: Page;
  context: BrowserContext;
  testData: TestData;
}>({
  testData: {
    email: process.env.E2E_TEST_EMAIL || 'test@example.com',
    password: process.env.E2E_TEST_PASSWORD || 'TestPassword123',
    nomeCompleto: process.env.E2E_TEST_NAME || 'Test User',
  },
});

// Re-export from @playwright/test
export { expect, Page, BrowserContext } from '@playwright/test';

/**
 * Helper: Login via UI
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

/**
 * Helper: Register via UI
 */
export async function register(
  page: Page,
  data: {
    email: string;
    password: string;
    nomeCompleto: string;
    dataNascimento: string;
  }
): Promise<void> {
  await page.goto('/registro');
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="confirmPassword"]', data.password);
  await page.fill('input[name="nomeCompleto"]', data.nomeCompleto);
  await page.fill('input[name="dataNascimento"]', data.dataNascimento);
  await page.click('button[type="submit"]');
}

/**
 * Helper: Logout via UI
 */
export async function logout(page: Page): Promise<void> {
  // Find and click logout button (or menu)
  await page.goto('/');
  // Look for user menu or logout button
  const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout"), a:has-text("Sair")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
}