import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockRedisGet = vi.fn();
const mockRedisPing = vi.fn();

vi.mock('@/lib/redis', () => ({
  getRedisClient: () =>
    Promise.resolve({
      get: (...args: unknown[]) => mockRedisGet(...args),
      ping: () => mockRedisPing(),
    }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockRedisPing.mockResolvedValue('PONG');
});

afterEach(() => {
  // Limpa env vars temporárias
  delete process.env.TRANSITS_FALLBACK_PATH;
});

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('GET /api/akasha/transits/today', () => {
  it('retorna 200 com payload do Redis quando cache hit', async () => {
    const transits = { sun: 'Leão', moon: 'Escorpião' };
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(transits));

    const { GET } = await import('@/app/api/akasha/transits/today/route');
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe('redis');
    expect(body.transits).toEqual(transits);
    expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('retorna 200 com payload do fallback quando Redis nao tem a chave', async () => {
    // Cria arquivo de fallback temporário
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'transits-'));
    const fallbackPath = path.join(tmpDir, 'transits.json');
    const today = new Date().toISOString().split('T')[0];
    fs.writeFileSync(
      fallbackPath,
      JSON.stringify({
        [today]: { sun: 'Capricórnio' },
      })
    );
    process.env.TRANSITS_FALLBACK_PATH = fallbackPath;

    mockRedisGet.mockResolvedValueOnce(null);

    const { GET } = await import('@/app/api/akasha/transits/today/route');
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe('fallback');
    expect(body.transits).toEqual({ sun: 'Capricórnio' });

    fs.rmSync(tmpDir, { recursive: true });
  });

  it('retorna 503 com mensagem clara quando nem Redis nem fallback estao disponiveis', async () => {
    mockRedisGet.mockResolvedValueOnce(null);
    // Sem arquivo de fallback
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'transits-empty-'));
    process.env.TRANSITS_FALLBACK_PATH = path.join(tmpDir, 'nope.json');

    const { GET } = await import('@/app/api/akasha/transits/today/route');
    const res = await GET();

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.source).toBe('none');
    expect(body.error).toBe('trânsitos_do_dia_indisponíveis');
    expect(body.message).toMatch(/meia-noite UTC/);

    fs.rmSync(tmpDir, { recursive: true });
  });

  it('inclui header Cache-Control para reduzir carga no Redis', async () => {
    mockRedisGet.mockResolvedValueOnce(JSON.stringify({ sun: 'Áries' }));

    const { GET } = await import('@/app/api/akasha/transits/today/route');
    const res = await GET();

    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toMatch(/max-age=/);
  });
});
