/**
 * middleware-auth.ts — Edge-runtime auth refresh for Next.js middleware.
 *
 * The middleware needs fresh JWT cookies when the access token is expired but
 * the refresh token is still valid. Edge runtime cannot use `node:crypto` (which
 * is what `jsonwebtoken`/`jose` in this app use for HMAC signing), so we delegate
 * to the existing `/api/akasha/auth/refresh` route handler (Node runtime) via an
 * internal `fetch()` and forward the resulting `Set-Cookie` headers back to the
 * caller as `{name, value}[]`.
 *
 * The middleware then re-applies those cookies on its outgoing response so the
 * browser stores them for subsequent requests. See `middleware.ts:230-264`.
 *
 * SECURITY:
 *   - Edge runtime only — no `node:crypto`, no Prisma, no file system.
 *   - Forwards the incoming `cookie` header so the refresh endpoint sees the
 *     refresh token (it reads via `cookies()` from `next/headers`).
 *   - Sets `Origin` to the incoming request origin so `validateAuthOrigin()` on
 *     the refresh endpoint accepts the call.
 *   - Does NOT forward `Sec-Fetch-Site: cross-site` (we're same-origin).
 *   - 5 s timeout via `AbortController` — refresh must be fast; slow = fail.
 *   - Returns `null` on any failure path so middleware redirects to /login.
 */

import type { NextRequest } from 'next/server';

/** Path of the existing refresh route handler (Node runtime). */
const REFRESH_PATH = '/api/akasha/auth/refresh';

/** Hard cap on refresh duration; long refresh = network anomaly, fail fast. */
const REFRESH_TIMEOUT_MS = 5000;

/** Parsed Set-Cookie payload — the only fields middleware needs to re-set. */
export interface RefreshedCookie {
  name: string;
  value: string;
}

/**
 * Attempts to refresh the current session by calling the refresh endpoint
 * internally. Returns the new cookies to set on the outgoing response, or
 * `null` if refresh failed (caller should redirect to /login).
 */
export async function authRefresh(
  request: NextRequest
): Promise<RefreshedCookie[] | null> {
  const refreshUrl = `${request.nextUrl.origin}${REFRESH_PATH}`;

  // Build a minimal forward header set:
  //  - cookie: refresh endpoint reads `__Host-akasha_refresh` from `cookies()`.
  //  - origin: validateAuthOrigin() requires it (rejects non-browser clients).
  // We intentionally do NOT forward Sec-Fetch-Site — middleware is a
  // server-to-server hop on the same origin, never cross-site.
  const headers = new Headers();
  const incomingCookie = request.headers.get('cookie');
  if (incomingCookie) headers.set('cookie', incomingCookie);
  const incomingOrigin = request.headers.get('origin');
  headers.set('origin', incomingOrigin ?? request.nextUrl.origin);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  try {
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers,
      signal: controller.signal,
      // Don't follow redirects; we want the raw Set-Cookie from the refresh response.
      redirect: 'manual',
    });

    if (!response.ok) {
      return null;
    }

    const cookies = parseSetCookies(response.headers);
    return cookies.length > 0 ? cookies : null;
  } catch (err) {
    // AbortError (timeout) or network failure — treat as refresh failure.
    // Middleware will redirect to /login via the X-Akasha-Auth: invalid path.
    console.error('[middleware authRefresh] refresh failed:', err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts `name=value` pairs from a response's `Set-Cookie` headers.
 *
 * Edge runtime's `Headers.getSetCookie()` (standard since 2023) returns every
 * Set-Cookie value as a separate string. We parse just `name` and `value` —
 * the middleware re-applies the cookie with its own attributes (httpOnly,
 * sameSite, secure, path) so we don't need the full attribute list here.
 */
function parseSetCookies(headers: Headers): RefreshedCookie[] {
  // Fall back to `getSetCookie` only being a function (older runtimes / mocks).
  const rawValues =
    typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];

  const cookies: RefreshedCookie[] = [];
  for (const raw of rawValues) {
    // Set-Cookie format: "<name>=<value>; Path=/; HttpOnly; ..."
    // The first segment before ';' is name=value; everything after is attributes.
    const nameValue = raw.split(';', 1)[0]?.trim();
    if (!nameValue) continue;
    const eqIdx = nameValue.indexOf('=');
    if (eqIdx <= 0) continue;

    const name = nameValue.slice(0, eqIdx).trim();
    const value = nameValue.slice(eqIdx + 1).trim();
    if (name) cookies.push({ name, value });
  }
  return cookies;
}