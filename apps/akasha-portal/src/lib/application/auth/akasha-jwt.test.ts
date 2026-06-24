/**
 * akasha-jwt.test.ts — Unit tests for akasha-jwt.ts
 *
 * Covers: cookie constants, AkashaJwtSecretMissingError,
 * signAkashaAccessToken, signAkashaRefreshToken, verifyAkashaToken,
 * setAkashaSessionCookie, setAkashaRefreshCookie,
 * clearAkashaSessionCookie, clearAkashaRefreshCookie.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
 AKASHA_TOKEN_COOKIE,
 AKASHA_REFRESH_COOKIE,
 signAkashaAccessToken,
 signAkashaRefreshToken,
 verifyAkashaToken,
 setAkashaSessionCookie,
 setAkashaRefreshCookie,
 clearAkashaSessionCookie,
 clearAkashaRefreshCookie,
 AkashaJwtSecretMissingError,
 type AkashaTokenPayload,
} from './akasha-jwt';

// ─── Setup ───────────────────────────────────────────────────────────────────

const TEST_SECRET = 'test-jwt-secret-for-unit-tests-only';
const originalSecret = process.env.JWT_SECRET;
const originalAllowedOrigins = process.env.ALLOWED_ORIGINS;

beforeEach(() => {
 process.env.JWT_SECRET = TEST_SECRET;
 delete process.env.ALLOWED_ORIGINS;
 vi.unstubAllEnvs();
});

afterEach(() => {
 if (originalSecret === undefined) {
  delete process.env.JWT_SECRET;
 } else {
  process.env.JWT_SECRET = originalSecret;
 }
 if (originalAllowedOrigins === undefined) {
  delete process.env.ALLOWED_ORIGINS;
 } else {
  process.env.ALLOWED_ORIGINS = originalAllowedOrigins;
 }
 vi.unstubAllEnvs();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function roundTrip<T>(token: string, secret: string): T {
 return jwt.verify(token, secret) as T;
}

type MockCookieResponse = {
 cookies: {
  set: (name: string, value: string, opts?: Record<string, unknown>) => void;
 };
};

function makeMockResponse() {
 const cookies: Record<string, { value: string; opts?: Record<string, unknown> }[]> = {};
 let lastOpts: Record<string, unknown> = {};
 const response: MockCookieResponse & {
  cookies: MockCookieResponse['cookies'] & {
   getAll: () => Record<string, { value: string; opts?: Record<string, unknown> }[]>;
   getLastOpts: () => Record<string, unknown>;
  };
 } = {
  cookies: {
   set: (name, value, opts) => {
    lastOpts = opts ?? {};
    cookies[name] = cookies[name] ?? [];
    cookies[name].push({ value, opts });
   },
   getAll: () => cookies,
   getLastOpts: () => lastOpts,
  },
 };
 return response;
}

// ─── Constants ──────────────────────────────────────────────────────────────

describe('akasha-jwt — constants', () => {
 it('AKASHA_TOKEN_COOKIE is __Host-akasha_session', () => {
  expect(AKASHA_TOKEN_COOKIE).toBe('__Host-akasha_session');
 });

 it('AKASHA_REFRESH_COOKIE is __Host-akasha_refresh', () => {
  expect(AKASHA_REFRESH_COOKIE).toBe('__Host-akasha_refresh');
 });
});

// ─── AkashaJwtSecretMissingError ───────────────────────────────────────────

describe('AkashaJwtSecretMissingError', () => {
 it('carries a message mentioning JWT_SECRET', () => {
  const err = new AkashaJwtSecretMissingError();
  expect(err.message).toContain('JWT_SECRET');
  expect(err.name).toBe('AkashaJwtSecretMissingError');
 });

 it('is an instance of Error', () => {
  expect(new AkashaJwtSecretMissingError()).toBeInstanceOf(Error);
 });
 it('signAkashaAccessToken throws when JWT_SECRET is empty', () => {
  process.env.JWT_SECRET = '';
  expect(() => signAkashaAccessToken({ id: 'u1', email: 'e@e.com' })).toThrow(
   AkashaJwtSecretMissingError
  );
 });

 it('signAkashaAccessToken throws when JWT_SECRET is shorter than 32 chars (boundary)', () => {
  process.env.JWT_SECRET = 'a'.repeat(31);
  expect(() => signAkashaAccessToken({ id: 'u1', email: 'e@e.com' })).toThrow(
   AkashaJwtSecretMissingError
  );
 });

 it('signAkashaAccessToken accepts JWT_SECRET at exactly 32 chars', () => {
  process.env.JWT_SECRET = 'a'.repeat(32);
  expect(() => signAkashaAccessToken({ id: 'u1', email: 'e@e.com' })).not.toThrow();
 });

 it('signAkashaRefreshToken throws when JWT_SECRET is shorter than 32 chars', () => {
  process.env.JWT_SECRET = 'a'.repeat(31);
  expect(() => signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' })).toThrow(
   AkashaJwtSecretMissingError
  );
 });

 it('verifyAkashaToken returns null when getSecret throws (no leaked exception)', async () => {
  // Boundary: secret becomes invalid between sign and verify (env mutation, config drift).
  // The try/catch in verifyAkashaToken MUST swallow AkashaJwtSecretMissingError
  // and return null so callers see a uniform "invalid token" rather than a 500.
  process.env.JWT_SECRET = 'a'.repeat(31);
  const payload = await verifyAkashaToken('any.token.here');
  expect(payload).toBeNull();
 });

});

// ─── signAkashaAccessToken ─────────────────────────────────────────────────

describe('signAkashaAccessToken', () => {
 it('returns a non-empty string token', () => {
  const token = signAkashaAccessToken({ id: 'user-1', email: 'a@b.com' });
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(0);
 });

 it('encodes sub and email in the payload', () => {
  const user = { id: 'user-42', email: 'alice@example.com' };
  const token = signAkashaAccessToken(user);
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  expect(decoded.sub).toBe(user.id);
  expect(decoded.email).toBe(user.email);
 });

 it('sets type to access', () => {
  const token = signAkashaAccessToken({ id: 'u1', email: 'e@e.com' });
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  expect(decoded.type).toBe('access');
 });

 it('does NOT include jti in access token', () => {
  const token = signAkashaAccessToken({ id: 'u1', email: 'e@e.com' });
  const decoded = roundTrip<AkashaTokenPayload & Record<string, unknown>>(token, TEST_SECRET);
  expect(decoded).not.toHaveProperty('jti');
 });

 it('sets expiresIn of 15 minutes (900 seconds)', () => {
  const before = Math.floor(Date.now() / 1000);
  const token = signAkashaAccessToken({ id: 'u1', email: 'e@e.com' });
  const after = Math.floor(Date.now() / 1000);
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  const expectedMin = before + 15 * 60;
  const expectedMax = after + 15 * 60;
  expect(decoded.exp!).toBeGreaterThanOrEqual(expectedMin);
  expect(decoded.exp!).toBeLessThanOrEqual(expectedMax);
 });

 it('throws AkashaJwtSecretMissingError when JWT_SECRET is absent', () => {
  delete process.env.JWT_SECRET;
  expect(() => signAkashaAccessToken({ id: 'u1', email: 'e@e.com' })).toThrow(
   AkashaJwtSecretMissingError
  );
 });
});

// ─── signAkashaRefreshToken ────────────────────────────────────────────────

describe('signAkashaRefreshToken', () => {
 it('returns a non-empty JWT string with a UUID v4 jti embedded in the payload', () => {
  const token = signAkashaRefreshToken({ id: 'user-1', email: 'a@b.com' });
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(0);
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  expect(typeof decoded.jti).toBe('string');
  expect(decoded.jti!.length).toBeGreaterThan(0);
 });

 it('jti is a valid UUID v4', () => {
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  expect(decoded.jti).toMatch(
   /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
 });

 it('encodes sub and email in the payload', () => {
  const user = { id: 'user-99', email: 'bob@example.com' };
  const token = signAkashaRefreshToken(user);
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  expect(decoded.sub).toBe(user.id);
  expect(decoded.email).toBe(user.email);
 });

 it('sets type to refresh', () => {
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  expect(decoded.type).toBe('refresh');
 });

 it('includes a unique jti in the payload on each call', () => {
  const token1 = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const token2 = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const decoded1 = roundTrip<AkashaTokenPayload>(token1, TEST_SECRET);
  const decoded2 = roundTrip<AkashaTokenPayload>(token2, TEST_SECRET);
  expect(decoded1.jti).toBeTruthy();
  expect(decoded2.jti).toBeTruthy();
  expect(decoded1.jti).not.toBe(decoded2.jti);
 });

 it('sets expiresIn of 30 days (2592000 seconds)', () => {
  const before = Math.floor(Date.now() / 1000);
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const after = Math.floor(Date.now() / 1000);
  const decoded = roundTrip<AkashaTokenPayload>(token, TEST_SECRET);
  const expectedMin = before + 30 * 24 * 60 * 60;
  const expectedMax = after + 30 * 24 * 60 * 60;
  expect(decoded.exp!).toBeGreaterThanOrEqual(expectedMin);
  expect(decoded.exp!).toBeLessThanOrEqual(expectedMax);
 });

 it('throws AkashaJwtSecretMissingError when JWT_SECRET is absent', () => {
  delete process.env.JWT_SECRET;
  expect(() => signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' })).toThrow(
   AkashaJwtSecretMissingError
  );
 });
});

// ─── verifyAkashaToken ─────────────────────────────────────────────────────

describe('verifyAkashaToken', () => {
 it('returns null when token is null', async () => {
  const payload = await verifyAkashaToken(null);
  expect(payload).toBeNull();
 });

 it('returns null when token is undefined', async () => {
  const payload = await verifyAkashaToken(undefined);
  expect(payload).toBeNull();
 });

 it('returns null when token is empty string', async () => {
  const payload = await verifyAkashaToken('');
  expect(payload).toBeNull();
 });

 it('returns null for an invalid token format', async () => {
  const payload = await verifyAkashaToken('not.a.valid.token');
  expect(payload).toBeNull();
 });

 it('returns null for a token signed with the wrong secret', async () => {
  const token = jwt.sign({ sub: 'u1', email: 'e@e.com', type: 'access' }, 'wrong-secret');
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns null for an expired token', async () => {
  const expiredToken = jwt.sign(
   { sub: 'u1', email: 'e@e.com', type: 'access', exp: Math.floor(Date.now() / 1000) - 100 },
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(expiredToken);
  expect(payload).toBeNull();
 });

 it('returns null for a token missing sub', async () => {
  const token = jwt.sign(
   { email: 'e@e.com', type: 'access' } as Record<string, unknown>,
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns null for a token missing email', async () => {
  const token = jwt.sign(
   { sub: 'u1', type: 'access' } as Record<string, unknown>,
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns null for a token with an invalid type field', async () => {
  const token = jwt.sign(
   { sub: 'u1', email: 'e@e.com', type: 'admin' } as Record<string, unknown>,
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns payload when expectedType=access and token is access', async () => {
  const token = signAkashaAccessToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token, 'access');
  expect(payload).not.toBeNull();
  expect(payload!.type).toBe('access');
 });

 it('returns null when expectedType=access but token is refresh', async () => {
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token, 'access');
  expect(payload).toBeNull();
 });

 it('returns payload when expectedType=refresh and token is refresh', async () => {
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token, 'refresh');
  expect(payload).not.toBeNull();
  expect(payload!.type).toBe('refresh');
  expect(payload!.jti).toBeDefined();
 });

 it('returns null when expectedType=refresh but token is access', async () => {
  const token = signAkashaAccessToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token, 'refresh');
  expect(payload).toBeNull();
 });

 it('returns a valid payload for a correctly-signed access token with correct iss/aud', async () => {
  const token = jwt.sign(
   { sub: 'u1', email: 'e@e.com', type: 'access', iss: 'akasha', aud: 'akasha-portal' },
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(token);
  expect(payload).not.toBeNull();
  expect(payload!.sub).toBe('u1');
  expect(payload!.email).toBe('e@e.com');
  expect(payload!.type).toBe('access');
 });

 it('returns null for a token with wrong issuer', async () => {
  const token = jwt.sign(
   { sub: 'u1', email: 'e@e.com', type: 'access', iss: 'wrong-issuer', aud: 'akasha-portal' },
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns null for a token with wrong audience', async () => {
  const token = jwt.sign(
   { sub: 'u1', email: 'e@e.com', type: 'access', iss: 'akasha', aud: 'wrong-audience' },
   TEST_SECRET
  );
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns null when decoded payload is a primitive (not an object)', async () => {
  const token = jwt.sign('primitive-string', TEST_SECRET);
  const payload = await verifyAkashaToken(token);
  expect(payload).toBeNull();
 });

 it('returns a valid payload for a correctly-signed refresh token', async () => {
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token);
  expect(payload).not.toBeNull();
  expect(payload!.sub).toBe('u1');
  expect(payload!.email).toBe('e@e.com');
  expect(payload!.type).toBe('refresh');
  expect(payload!.jti).toBeTruthy();
 });
});

// ─── end-to-end token lifecycle ────────────────────────────────────────────

describe('end-to-end token lifecycle', () => {
 it('access token signed by signAkashaAccessToken verifies cleanly', async () => {
  const user = { id: 'user-e2e', email: 'e2e@test.com' };
  const token = signAkashaAccessToken(user);
  const payload = await verifyAkashaToken(token);
  expect(payload).not.toBeNull();
  expect(payload!.sub).toBe(user.id);
  expect(payload!.email).toBe(user.email);
  expect(payload!.type).toBe('access');
 });

 it('refresh token signed by signAkashaRefreshToken verifies cleanly', async () => {
  const user = { id: 'user-e2e', email: 'e2e@test.com' };
  const token = signAkashaRefreshToken(user);
  const payload = await verifyAkashaToken(token, 'refresh');
  expect(payload).not.toBeNull();
  expect(payload!.sub).toBe(user.id);
  expect(payload!.email).toBe(user.email);
  expect(payload!.type).toBe('refresh');
  expect(payload!.jti).toBeTruthy();
 });

 it('access token cannot be used as refresh (type mismatch)', async () => {
  const token = signAkashaAccessToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token, 'refresh');
  expect(payload).toBeNull();
 });

 it('refresh token cannot be used as access (type mismatch)', async () => {
  const token = signAkashaRefreshToken({ id: 'u1', email: 'e@e.com' });
  const payload = await verifyAkashaToken(token, 'access');
  expect(payload).toBeNull();
 });
});

// ─── setAkashaSessionCookie ────────────────────────────────────────────────

describe('setAkashaSessionCookie', () => {
 it('calls response.cookies.set with __Host-akasha_session and the token value', () => {
  const response = makeMockResponse();
  setAkashaSessionCookie(response, 'token-abc');
  const cookies = response.cookies.getAll();
  expect(cookies[AKASHA_TOKEN_COOKIE]).toBeDefined();
  expect(cookies[AKASHA_TOKEN_COOKIE]![0].value).toBe('token-abc');
 });

 it('sets httpOnly and sameSite:lax in cookie options', () => {
  const response = makeMockResponse();
  setAkashaSessionCookie(response, 'tok');
  expect(response.cookies.getLastOpts()).toMatchObject({ httpOnly: true, sameSite: 'lax' });
 });

 it('sets secure: true when NODE_ENV is production', () => {
  vi.stubEnv('NODE_ENV', 'production');
  const response = makeMockResponse();
  setAkashaSessionCookie(response, 'tok');
  expect(response.cookies.getLastOpts()).toMatchObject({ secure: true });
 });

 it('sets secure: true even when NODE_ENV is not production (cookies always https)', () => {
  vi.stubEnv('NODE_ENV', 'development');
  const response = makeMockResponse();
  setAkashaSessionCookie(response, 'tok');
  expect(response.cookies.getLastOpts()).toMatchObject({ secure: true });
 });
});

// ─── setAkashaRefreshCookie ────────────────────────────────────────────────

describe('setAkashaRefreshCookie', () => {
 it('calls response.cookies.set with __Host-akasha_refresh and the refresh token value', () => {
  const response = makeMockResponse();
  setAkashaRefreshCookie(response, 'refresh-token-xyz');
  const cookies = response.cookies.getAll();
  expect(cookies[AKASHA_REFRESH_COOKIE]).toBeDefined();
  expect(cookies[AKASHA_REFRESH_COOKIE]![0].value).toBe('refresh-token-xyz');
 });

 it('sets sameSite:lax and httpOnly on refresh cookie (required for redirect POST)', () => {
  const response = makeMockResponse();
  setAkashaRefreshCookie(response, 'tok');
  expect(response.cookies.getLastOpts()).toMatchObject({ sameSite: 'lax', httpOnly: true });
 });

 it('sets maxAge to AKASHA_REFRESH_TTL_SECONDS (30 days)', () => {
  const response = makeMockResponse();
  setAkashaRefreshCookie(response, 'tok');
  // 30 days in seconds
  expect(response.cookies.getLastOpts()).toMatchObject({ maxAge: 30 * 24 * 60 * 60 });
 });

 it('sets secure:true and priority:medium (matching production cookie hygiene)', () => {
  const response = makeMockResponse();
  setAkashaRefreshCookie(response, 'tok');
  expect(response.cookies.getLastOpts()).toMatchObject({ secure: true, priority: 'medium' });
 });

 it('sets path:/ so cookie is sent on all routes', () => {
  const response = makeMockResponse();
  setAkashaRefreshCookie(response, 'tok');
  expect(response.cookies.getLastOpts()).toMatchObject({ path: '/' });
 });
});

// ─── clearAkashaSessionCookie ──────────────────────────────────────────────

describe('clearAkashaSessionCookie', () => {
 it('sets akasha_session cookie to empty string', () => {
  const response = makeMockResponse();
  clearAkashaSessionCookie(response);
  const cookies = response.cookies.getAll();
  expect(cookies[AKASHA_TOKEN_COOKIE]).toBeDefined();
  expect(cookies[AKASHA_TOKEN_COOKIE]![0].value).toBe('');
 });

 it('passes maxAge: 0 to trigger immediate expiry', () => {
  const response = makeMockResponse();
  clearAkashaSessionCookie(response);
  expect(response.cookies.getLastOpts()).toMatchObject({ maxAge: 0 });
 });
});

// ─── clearCookieOptions sameSite:strict ──────────────────────────────────

describe('clearAkashaSessionCookie — sameSite:strict', () => {
 it('sets sameSite:strict on session cookie to prevent cross-origin clearing', () => {
  const response = makeMockResponse();
  clearAkashaSessionCookie(response);
  expect(response.cookies.getLastOpts()).toMatchObject({ sameSite: 'strict' });
 });

 it('sets secure:true and httpOnly:true on cleared session cookie', () => {
  const response = makeMockResponse();
  clearAkashaSessionCookie(response);
  expect(response.cookies.getLastOpts()).toMatchObject({ secure: true, httpOnly: true });
 });
});

// ─── clearAkashaRefreshCookie ──────────────────────────────────────────────

describe('clearAkashaRefreshCookie', () => {
 it('sets akasha_refresh cookie to empty string', () => {
  const response = makeMockResponse();
  clearAkashaRefreshCookie(response);
  const cookies = response.cookies.getAll();
  expect(cookies[AKASHA_REFRESH_COOKIE]).toBeDefined();
  expect(cookies[AKASHA_REFRESH_COOKIE]![0].value).toBe('');
 });

 it('passes maxAge: 0 to trigger immediate expiry', () => {
  const response = makeMockResponse();
  clearAkashaRefreshCookie(response);
  expect(response.cookies.getLastOpts()).toMatchObject({ maxAge: 0 });
 });
});

// ─── clearAkashaRefreshCookie sameSite:strict ─────────────────────────────

describe('clearAkashaRefreshCookie — sameSite:strict', () => {
 it('sets sameSite:strict on refresh cookie for secure clearing', () => {
  const response = makeMockResponse();
  clearAkashaRefreshCookie(response);
  expect(response.cookies.getLastOpts()).toMatchObject({ sameSite: 'strict' });
 });

 it('sets secure:true and httpOnly:true on cleared refresh cookie', () => {
  const response = makeMockResponse();
  clearAkashaRefreshCookie(response);
  expect(response.cookies.getLastOpts()).toMatchObject({ secure: true, httpOnly: true });
 });
});
