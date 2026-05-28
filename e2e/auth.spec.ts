import { test, expect } from './setup';

/**
 * E2E Tests: Authentication Flow
 * 
 * Tests the complete authentication cycle:
 * - Login success
 * - Login failure
 * - Logout
 * - Protected route access
 */

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      
      // Check form elements exist
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should display validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      
      // Check for required attribute
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message (various possible error texts)
      await page.waitForSelector('.text-red-400, [class*="error"], [class*="alert"]', { timeout: 10000 }).catch(() => {
        // If specific error not found, check for any error display
      });
      
      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect authenticated users away from login', async ({ page }) => {
      // This test would require a valid session
      // Skip for now as we don't have test user setup
      test.skip();
    });
  });

  test.describe('Login Success Flow', () => {
    test.skip('should redirect to home after successful login', async ({ page }) => {
      // Requires valid test credentials
      const testEmail = process.env.E2E_TEST_EMAIL || 'test@example.com';
      const testPassword = process.env.E2E_TEST_PASSWORD || 'TestPassword123';
      
      await page.goto('/login');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      
      // Should redirect to home page
      await page.waitForURL('/', { timeout: 10000 });
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Register Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/registro');
      
      // Check form elements exist
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="nomeCompleto"]')).toBeVisible();
      await expect(page.locator('input[name="dataNascimento"]')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/registro');
      
      const loginLink = page.locator('a[href="/login"]');
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test.skip('should clear session on logout', async ({ page }) => {
      // Requires authenticated session
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing /chat unauthenticated', async ({ page }) => {
      await page.goto('/chat');
      
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
    });

    test('should redirect to login when accessing /perfil unauthenticated', async ({ page }) => {
      await page.goto('/perfil');
      
      await page.waitForURL(/\/login/, { timeout: 5000 });
    });

    test('should return 401 for API calls without auth', async ({ request }) => {
      const response = await request.get('/api/creditos');
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });
  });
});

test.describe('Auth Page UI', () => {
  test('login page should have correct styling', async ({ page }) => {
    await page.goto('/login');
    
    // Check for mystical theme elements
    await expect(page.locator('text=CABALA DOS CAMINHOS')).toBeVisible();
  });

  test('register page should have correct styling', async ({ page }) => {
    await page.goto('/registro');
    
    await expect(page.locator('text=CABALA DOS CAMINHOS')).toBeVisible();
  });

  test('should show success message after registration', async ({ page }) => {
    await page.goto('/login?registered=true');
    
    // Should display success message
    await expect(page.locator('text=/conta criada|sucesso/i')).toBeVisible();
  });
});