# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> Home Page >> should display app title
- Location: e2e/dashboard.spec.ts:25:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=CABALA').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=CABALA').first()

```

```yaml
- main: ✦ ✦ ✦ ✦ ✦ ✦ ✦
- alert
```

# Test source

```ts
  1   | import { test, expect } from './setup';
  2   | 
  3   | /**
  4   |  * E2E Tests: Dashboard Flow
  5   |  * 
  6   |  * Tests the main dashboard and navigation:
  7   |  * - Dashboard loading
  8   |  * - Navigation to different sections
  9   |  * - Protected pages
  10  |  */
  11  | 
  12  | test.describe('Dashboard', () => {
  13  |   test.beforeEach(async ({ page }) => {
  14  |     await page.context().clearCookies();
  15  |   });
  16  | 
  17  |   test.describe('Home Page', () => {
  18  |     test('should display on home route', async ({ page }) => {
  19  |       await page.goto('/');
  20  |       
  21  |       // Check page loads
  22  |       await expect(page).toHaveURL('/');
  23  |     });
  24  | 
  25  |     test('should display app title', async ({ page }) => {
  26  |       await page.goto('/');
  27  |       
  28  |       // Check for mystical theme
  29  |       const title = page.locator('text=CABALA');
> 30  |       await expect(title.first()).toBeVisible();
      |                                   ^ Error: expect(locator).toBeVisible() failed
  31  |     });
  32  |   });
  33  | 
  34  |   test.describe('Navigation', () => {
  35  |     test('should have navigation menu', async ({ page }) => {
  36  |       await page.goto('/');
  37  |       
  38  |       // Check for nav or menu elements
  39  |       const nav = page.locator('nav, header, [role="navigation"]');
  40  |       // May or may not be visible depending on auth state
  41  |     });
  42  | 
  43  |     test.skip('should navigate to Chat page when authenticated', async ({ page }) => {
  44  |       // Requires authentication
  45  |     });
  46  | 
  47  |     test.skip('should navigate to Profile page when authenticated', async ({ page }) => {
  48  |       // Requires authentication
  49  |     });
  50  |   });
  51  | 
  52  |   test.describe('Protected Pages', () => {
  53  |     test('should redirect unauthenticated users from /perfil', async ({ page }) => {
  54  |       await page.goto('/perfil');
  55  |       
  56  |       await page.waitForURL(/\/login/, { timeout: 5000 });
  57  |     });
  58  | 
  59  |     test('should redirect unauthenticated users from /chat', async ({ page }) => {
  60  |       await page.goto('/chat');
  61  |       
  62  |       await page.waitForURL(/\/login/, { timeout: 5000 });
  63  |     });
  64  | 
  65  |     test('should redirect unauthenticated users from /calendario', async ({ page }) => {
  66  |       await page.goto('/calendario');
  67  |       
  68  |       // May or may not be protected
  69  |       // Just check it loads or redirects
  70  |     });
  71  |   });
  72  | 
  73  |   test.describe('User Menu', () => {
  74  |     test.skip('should display user name when logged in', async ({ page }) => {
  75  |       // Requires authenticated session
  76  |     });
  77  | 
  78  |     test.skip('should have logout option', async ({ page }) => {
  79  |       // Requires authenticated session
  80  |     });
  81  |   });
  82  | });
  83  | 
  84  | test.describe('Dashboard Components', () => {
  85  |   test.describe('Insights Section', () => {
  86  |     test.skip('should display daily insight', async ({ page }) => {
  87  |       // Requires authenticated session with insights
  88  |     });
  89  | 
  90  |     test.skip('should navigate to full insights page', async ({ page }) => {
  91  |       // Requires authenticated session
  92  |     });
  93  |   });
  94  | 
  95  |   test.describe('Credits Display', () => {
  96  |     test.skip('should display user credits balance', async ({ page }) => {
  97  |       // Requires authenticated session
  98  |     });
  99  | 
  100 |     test.skip('should show add credits option', async ({ page }) => {
  101 |       // Requires authenticated session
  102 |     });
  103 |   });
  104 | });
```