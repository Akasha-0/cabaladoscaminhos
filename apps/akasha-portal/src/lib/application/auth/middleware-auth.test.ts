/**
 * middleware-auth.test.ts — Unit tests for middleware-auth.ts
 *
 * Covers: authRefresh, parseSetCookies (via authRefresh).
 * Does NOT test validateAuthOrigin (covered in akasha-jwt.test.ts).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { authRefresh, type RefreshedCookie } from './middleware-auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMockRequest(overrides: Partial<{
 cookie: string | null;
 origin: string | null;
 nextUrlOrigin: string;
}> = {}): NextRequest {
 const cookie = overrides.cookie ?? '__Host-akasha_refresh=token123';
 const origin = overrides.origin ?? 'http://localhost:3000';
 const nextUrlOrigin = overrides.nextUrlOrigin ?? 'http://localhost:3000';

 const headers = new Headers();
 if (cookie) headers.set('cookie', cookie);
 if (origin) headers.set('origin', origin);

 return {
  headers: {
   get: (name: string) => headers.get(name),
  },
  nextUrl: new URL(nextUrlOrigin),
 } as unknown as NextRequest;
}

function makeMockResponse(cookies: string[]): Response {
 const res = new Response(null, { status: 200 });
 // Simulate Set-Cookie headers
 cookies.forEach((c) => res.headers.append('set-cookie', c));
 return res;
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
 vi.restoreAllMocks();
});

afterEach(() => {
 vi.restoreAllMocks();
});

// ─── authRefresh ─────────────────────────────────────────────────────────────

describe('authRefresh', () => {
 it('calls the internal refresh endpoint with POST', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse(['__Host-akasha_session=new-access; Path=/; HttpOnly'])
  );
  const req = makeMockRequest();
  await authRefresh(req);
  expect(fetchSpy).toHaveBeenCalledOnce();
  const [url, options] = fetchSpy.mock.calls[0]!;
  expect(url).toBe('http://localhost:3000/api/akasha/auth/refresh');
  expect(options!.method).toBe('POST');
 });

 it('forwards the incoming cookie header to the refresh endpoint', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([])
  );
  const req = makeMockRequest({ cookie: '__Host-akasha_refresh=my-token' });
  await authRefresh(req);
  const [, options] = fetchSpy.mock.calls[0]!;
  expect((options!.headers as Headers).get('cookie')).toBe('__Host-akasha_refresh=my-token');
 });

 it('forwards the incoming Origin header', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([])
  );
  const req = makeMockRequest({ origin: 'http://localhost:3000' });
  await authRefresh(req);
  const [, options] = fetchSpy.mock.calls[0]!;
  expect((options!.headers as Headers).get('origin')).toBe('http://localhost:3000');
 });

 it('returns null and does NOT throw when fetch throws AbortError (timeout)', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(
   new DOMException('aborted', 'AbortError')
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('returns null when response is not ok (4xx/5xx)', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   new Response(null, { status: 401 })
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('returns null when response is ok but Set-Cookie header is absent', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   new Response(null, { status: 200 })
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('returns null when Set-Cookie is present but empty list', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('returns parsed RefreshedCookie array when response has Set-Cookie headers', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([
    '__Host-akasha_session=fresh-access; Path=/; HttpOnly; SameSite=Lax',
    '__Host-akasha_refresh=fresh-refresh; Path=/; HttpOnly; SameSite=Lax',
   ])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).not.toBeNull();
  expect(result!.length).toBe(2);
  expect(result!.find((c) => c.name === '__Host-akasha_session')?.value).toBe('fresh-access');
  expect(result!.find((c) => c.name === '__Host-akasha_refresh')?.value).toBe('fresh-refresh');
 });

 it('uses redirect:manual so manual redirects return raw Set-Cookie headers', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   new Response(null, { status: 200 })
  );
  const req = makeMockRequest();
  await authRefresh(req);
  const [, options] = fetchSpy.mock.calls[0]!;
  expect(options!.redirect).toBe('manual');
 });

 it('aborts fetch via AbortController.signal', async () => {
  let capturedSignal: AbortSignal | null = null;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, options) => {
   capturedSignal = options!.signal as AbortSignal;
   // Resolve immediately so we can check the signal
   return makeMockResponse([]);
  });
  const req = makeMockRequest();
  await authRefresh(req);
  expect(capturedSignal).not.toBeNull();
  // Signal should be aborted when timeout fires (we use a short mock response so it won't abort mid-test)
  expect(capturedSignal!.aborted).toBe(false);
 });

 it('returns null when network error is thrown (non-AbortError)', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network failure'));
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('strips cookie attributes and returns only name=value pairs', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([
    '__Host-akasha_session=token; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900',
   ])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result!.length).toBe(1);
  expect(result![0]).toEqual({
   name: '__Host-akasha_session',
   value: 'token',
  });
 });
});

// ─── parseSetCookies (indirect coverage via authRefresh) ─────────────────────

describe('parseSetCookies — indirect coverage via authRefresh', () => {
 it('skips Set-Cookie values with no = sign', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse(['invalid-header'])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('skips Set-Cookie values where name is empty', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse(['=value-without-name; Path=/'])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('handles multiple cookies with one being malformed', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([
    '__Host-akasha_session=valid-token; Path=/; HttpOnly',
    'malformed-no-equals',
    '__Host-akasha_refresh=refresh-token; Path=/; HttpOnly',
   ])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result!.length).toBe(2);
 });

 it('handles empty Set-Cookie list', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
   makeMockResponse([])
  );
  const req = makeMockRequest();
  const result = await authRefresh(req);
  expect(result).toBeNull();
 });

 it('handles missing getSetCookie (falls back to empty array)', async () => {
   // Simulate older runtime by mocking fetch to resolve with a plain object
   // whose `headers` field intentionally lacks `getSetCookie`. This drives
   // the typeof !== 'function' branch in parseSetCookies.
   vi.spyOn(globalThis, 'fetch').mockResolvedValue({
     ok: true,
     headers: {
       getSetCookie: undefined,
       get: () => null,
     },
   } as unknown as Response);
   const req = makeMockRequest();
   const result = await authRefresh(req);
   // Without getSetCookie the cookies won't be parsed — returns null
   expect(result).toBeNull();
 });
});

// ─── RefreshedCookie interface ────────────────────────────────────────────────

describe('RefreshedCookie type', () => {
 it('accepts an object with name and value strings', () => {
  const cookie: RefreshedCookie = { name: '__Host-akasha_session', value: 'abc123' };
  expect(cookie.name).toBe('__Host-akasha_session');
  expect(cookie.value).toBe('abc123');
 });
});
