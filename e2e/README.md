# E2E Tests

End-to-end tests using Playwright for browser automation.

## Setup

```bash
# Install Playwright (already in devDependencies)
npm install

# Install Chromium browser
npx playwright install chromium

# Or with system dependencies
npx playwright install --with-deps
```

**Note:** If `npx playwright install chromium` fails (e.g., on Ubuntu), use:
```bash
npx playwright install chromium-headless-shell
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific file
npm run test:e2e -- e2e/auth.spec.ts

# Run with headed browser (visible)
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug
```

## Test Files

| File | Description |
|------|-------------|
| `setup.ts` | Test fixtures and helpers |
| `auth.spec.ts` | Authentication flow tests |
| `dashboard.spec.ts` | Dashboard and navigation tests |
| `api.spec.ts` | API endpoint tests |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `http://localhost:3000` | Base URL for tests |
| `E2E_TEST_EMAIL` | `test@example.com` | Test user email |
| `E2E_TEST_PASSWORD` | `TestPassword123` | Test user password |
| `E2E_TEST_NAME` | `Test User` | Test user name |

## CI Mode

In CI, tests run with:
- 2 retries
- Screenshots on failure
- Video on failure
- No parallelization

```bash
CI=true npm run test:e2e
```

## Current Status

| Test Suite | Tests | Status |
|------------|-------|--------|
| Auth Flow | 12 | Ready (browser required) |
| Dashboard | 12 | Ready (browser required) |
| API | 14 | Ready (no browser needed) |

**Browser Installation Required:** Some tests require Chromium. If installation fails, tests will be skipped until browser is available.