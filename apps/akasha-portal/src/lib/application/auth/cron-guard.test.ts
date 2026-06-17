import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { verifyCronSecret } from './cron-guard';

function makeRequest(opts: {
  authHeader?: string | null;
  querySecret?: string | null;
  url?: string;
}): NextRequest {
  const url = new URL(opts.url ?? 'http://localhost/api/cron/test');
  if (opts.querySecret) url.searchParams.set('secret', opts.querySecret);

  const headers = new Headers();
  if (opts.authHeader) headers.set('authorization', opts.authHeader);

  return {
    headers,
    url: url.toString(),
  } as unknown as NextRequest;
}

describe('verifyCronSecret', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret-123';
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  it('retorna 401 quando CRON_SECRET não está configurado', () => {
    delete process.env.CRON_SECRET;
    const req = makeRequest({ authHeader: 'Bearer test-secret-123' });
    const result = verifyCronSecret(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });

  it('retorna null (OK) quando Authorization Bearer header bate', () => {
    const req = makeRequest({ authHeader: 'Bearer test-secret-123' });
    expect(verifyCronSecret(req)).toBeNull();
  });

  it('retorna 401 quando ?secret= query param é fornecido (legado removido por leak em logs)', () => {
    // Não aceitamos ?secret= query — vazaria em logs de proxy/cdn.
    const req = makeRequest({ querySecret: 'test-secret-123' });
    expect(verifyCronSecret(req)?.status).toBe(401);
  });

  it('retorna 401 quando Authorization Bearer está errado', () => {
    const req = makeRequest({ authHeader: 'Bearer wrong-secret' });
    const result = verifyCronSecret(req);
    expect(result?.status).toBe(401);
  });

  it('retorna 401 quando ?secret= query está errado', () => {
    const req = makeRequest({ querySecret: 'wrong-secret' });
    const result = verifyCronSecret(req);
    expect(result?.status).toBe(401);
  });

  it('retorna 401 quando nenhum método é fornecido', () => {
    const req = makeRequest({});
    const result = verifyCronSecret(req);
    expect(result?.status).toBe(401);
  });

  it('Authorization Bearer sem prefixo Bearer é rejeitado', () => {
    const req = makeRequest({ authHeader: 'test-secret-123' });
    const result = verifyCronSecret(req);
    expect(result?.status).toBe(401);
  });

  it('Cache-Control: no-store no 401 (não cachear)', () => {
    const req = makeRequest({});
    const result = verifyCronSecret(req);
    expect(result?.headers.get('Cache-Control')).toBe('no-store');
  });
});
