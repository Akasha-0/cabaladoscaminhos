/**
 * E2E auth helper — Wave 9.4
 *
 * Logs in via the JSON API (avoids the UI form for determinism) and
 * applies the resulting cookies to the given BrowserContext. The Akasha
 * session cookie is httpOnly + Secure + __Host- prefixed — Playwright
 * respects all three when copying cookies from a request response.
 *
 * Required env (from .env / .env.local):
 *   E2E_TEST_EMAIL     — seeded user (default: gabriel@cabaladoscaminhos.com)
 *   E2E_TEST_PASSWORD  — the password set during `pnpm db:seed`
 *
 * If either env var is missing, loginInContext() throws a clear error
 * and the spec will fail loudly — better than silently skipping.
 */

import type { APIRequestContext, BrowserContext } from '@playwright/test';

const DEFAULT_EMAIL = 'gabriel@cabaladoscaminhos.com';

export interface LoginOptions {
  email?: string;
  password?: string;
  locale?: string;
}

export async function loginInContext(
  request: APIRequestContext,
  context: BrowserContext,
  opts: LoginOptions = {}
): Promise<{ email: string; cookies: Awaited<ReturnType<BrowserContext['cookies']>> }> {
  const email = opts.email ?? process.env.E2E_TEST_EMAIL ?? DEFAULT_EMAIL;
  const password = opts.password ?? process.env.E2E_TEST_PASSWORD;

  if (!password) {
    throw new Error(
      'E2E_TEST_PASSWORD env var is required to run E2E specs. Set it to the password used by `pnpm db:seed` (see prisma/seed.ts).'
    );
  }

  const locale = opts.locale ?? 'pt-BR';
  const loginUrl = `/api/akasha/auth/login?locale=${encodeURIComponent(locale)}`;
  const response = await request.post(loginUrl, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: email.trim().toLowerCase(), password },
    maxRedirects: 0,
  });

  if (!response.ok() && response.status() !== 307 && response.status() !== 303) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `E2E login failed for ${email}: ${response.status()} ${response.statusText()}\n${body}\n` +
        `Tip: ensure the user is seeded via \`pnpm db:seed\` and E2E_TEST_PASSWORD matches prisma/seed.ts.`
    );
  }

  // Pull cookies from the API request context, then apply to the
  // browser context. request.storageState() captures everything
  // set by Set-Cookie headers on this request chain.
  const storageState = await request.storageState();
  if (!storageState.cookies.length) {
    throw new Error('E2E login succeeded but no cookies were set — auth route missing Set-Cookie?');
  }
  await context.addCookies(storageState.cookies);

  return { email, cookies: storageState.cookies };
}

/**
 * Seed the user's emotional state via localStorage so the picker
 * doesn't need to be clicked on every test. The next /meu-dia load
 * will use this state directly.
 */
export async function seedEmotionalState(
  context: BrowserContext,
  state: 'centrado' | 'ansioso' | 'perdido' | 'curioso',
  origin: string
): Promise<void> {
  const record = JSON.stringify({ state, ts: Date.now() });
  await context.addInitScript(
    ({ key, value }) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // localStorage may be disabled in some test configs — ignore.
      }
    },
    { key: 'akasha.emotionalState', value: record }
  );
  // Mirror the cookie so the server-side (akasha) layout sees it too.
  await context.addCookies([
    {
      name: 'akasha_state',
      value: encodeURIComponent(record),
      url: origin,
      path: '/',
      sameSite: 'Lax',
      secure: false, // dev runs on http://localhost
    },
  ]);
}