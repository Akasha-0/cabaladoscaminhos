import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateAuthOrigin } from './akasha-jwt';
import type { NextResponse } from 'next/server';

function makeRequest(headers: Record<string, string | null>): Request {
  return new Request('https://localhost:3000/api/akasha/auth/login', {
    method: 'POST',
    headers,
  }) as unknown as Request;
}

describe('validateAuthOrigin', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOWED_ORIGINS', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 403 when Sec-Fetch-Site is cross-site', async () => {
    const req = makeRequest({
      'origin': 'https://legitimate-site.com',
      'sec-fetch-site': 'cross-site',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).not.toBeNull();
    const resp = result as NextResponse;
    expect(resp.status).toBe(403);
    const json = await resp.json();
    expect(json.error).toBe('Cross-site request forbidden');
  });

  it('returns 403 when Origin header is missing', async () => {
    const req = makeRequest({
      'sec-fetch-site': 'same-origin',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).not.toBeNull();
    const resp = result as NextResponse;
    expect(resp.status).toBe(403);
    const json = await resp.json();
    expect(json.error).toBe('Origin header required');
  });

  it('returns null (allowed) when origin is in ALLOWED_ORIGINS', async () => {
    vi.stubEnv('ALLOWED_ORIGINS', 'https://app.example.com,https://admin.example.com');
    vi.stubEnv('NODE_ENV', 'production');
    const req = makeRequest({
      'origin': 'https://app.example.com',
      'sec-fetch-site': 'same-origin',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).toBeNull();
  });

  it('returns 403 when origin is NOT in ALLOWED_ORIGINS', async () => {
    vi.stubEnv('ALLOWED_ORIGINS', 'https://app.example.com');
    vi.stubEnv('NODE_ENV', 'production');
    const req = makeRequest({
      'origin': 'https://attacker.com',
      'sec-fetch-site': 'same-origin',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).not.toBeNull();
    const resp = result as NextResponse;
    expect(resp.status).toBe(403);
    const json = await resp.json();
    expect(json.error).toBe('Forbidden');
  });

  it('returns null (allowed) in development with localhost origin', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ALLOWED_ORIGINS', '');
    const req = makeRequest({
      'origin': 'http://localhost:3000',
      'sec-fetch-site': 'same-origin',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).toBeNull();
  });

  it('returns null (allowed) in development with 127.0.0.1 origin', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ALLOWED_ORIGINS', '');
    const req = makeRequest({
      'origin': 'http://127.0.0.1:3000',
      'sec-fetch-site': 'same-origin',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).toBeNull();
  });

  it('returns 403 in development with non-localhost origin and no ALLOWED_ORIGINS', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ALLOWED_ORIGINS', '');
    const req = makeRequest({
      'origin': 'https://remote-site.com',
      'sec-fetch-site': 'same-origin',
    });
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).not.toBeNull();
    const resp = result as NextResponse;
    expect(resp.status).toBe(403);
  });

  it('rejects localhost attacker subdomain in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ALLOWED_ORIGINS', '');
    const req = makeRequest({
      'origin': 'http://localhost.attacker.com:3000',
      'sec-fetch-site': 'same-origin',
    });
    // URL parser will see hostname = 'localhost.attacker.com', not 'localhost' → reject
    const result = validateAuthOrigin(req as Parameters<typeof validateAuthOrigin>[0]);
    expect(result).not.toBeNull();
    const resp = result as NextResponse;
    expect(resp.status).toBe(403);
  });
});
