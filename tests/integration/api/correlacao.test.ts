import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

function createMapaRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/mapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/mapa - Full Spiritual Profile Correlation', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    POST = mapaModule.POST;
  });

  it('returns full profile with numerology for valid birth date', async () => {
    const request = createMapaRequest({
      userId: 'user-123',
      nome: 'Maria da Silva',
      dataNascimento: '1985-03-15',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(body).toHaveProperty('numerologia');
    expect(body).toHaveProperty('odu');
    expect(body).toHaveProperty('astrologia');
    expect(body).toHaveProperty('tarot');
    expect(body).toHaveProperty('orixas');
    expect(body).toHaveProperty('sefirot');
    expect(body).toHaveProperty('convergences');
  });

  it('returns numerologia with life path number', async () => {
    const request = createMapaRequest({
      userId: 'user-123',
      nome: 'Joao Silva',
      dataNascimento: '1985-03-15',
    });
    const response = await POST(request);
    const body = await response.json() as { numerologia: { numero_vida: number } };
    expect(body.numerologia).toBeDefined();
    expect(typeof body.numerologia?.numero_vida).toBe('number');
  });

  it('returns Odu with orixa regente', async () => {
    const request = createMapaRequest({
      userId: 'user-456',
      nome: 'Test User',
      dataNascimento: '1990-06-15',
    });
    const response = await POST(request);
    const body = await response.json() as { odu: { nome: string; orixas: string[] } };
    expect(body.odu).toBeDefined();
    expect(typeof body.odu?.nome).toBe('string');
    expect(Array.isArray(body.odu?.orixas)).toBe(true);
    expect(body.odu?.orixas.length).toBeGreaterThan(0);
  });

  it('returns astrologia with sign positions', async () => {
    const request = createMapaRequest({
      userId: 'user-789',
      nome: 'Test User',
      dataNascimento: '2000-01-01',
    });
    const response = await POST(request);
    const body = await response.json() as { astrologia: Record<string, unknown> };
    expect(body.astrologia).toBeDefined();
    expect(Object.keys(body.astrologia).length).toBeGreaterThan(0);
  });

  it('returns convergences array', async () => {
    const request = createMapaRequest({
      userId: 'user-conv',
      nome: 'Carlos Santos',
      dataNascimento: '1970-01-01',
    });
    const response = await POST(request);
    const body = await response.json() as { convergences: unknown[] };
    expect(Array.isArray(body.convergences)).toBe(true);
  });

  it('returns tarot birth card', async () => {
    const request = createMapaRequest({
      userId: 'user-tarot',
      nome: 'Ana Costa',
      dataNascimento: '1985-03-15',
    });
    const response = await POST(request);
    const body = await response.json() as { tarot: { carta_nascimento: number } };
    expect(body.tarot).toBeDefined();
    expect(body.tarot?.carta_nascimento).toBeGreaterThanOrEqual(0);
    expect(body.tarot?.carta_nascimento).toBeLessThanOrEqual(21);
  });

  it('validates required userId field', async () => {
    const request = createMapaRequest({
      nome: 'No ID User',
      dataNascimento: '1990-01-01',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('validates required nome field', async () => {
    const request = createMapaRequest({
      userId: 'user-123',
      dataNascimento: '1990-01-01',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('validates required dataNascimento field', async () => {
    const request = createMapaRequest({
      userId: 'user-123',
      nome: 'Test User',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('accepts optional hora field for ascendant calculation', async () => {
    const request = createMapaRequest({
      userId: 'user-time',
      nome: 'Ana Costa',
      dataNascimento: '1985-03-15',
      hora: '14:30',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('accepts optional local field for city-based coordinates', async () => {
    const request = createMapaRequest({
      userId: 'user-local',
      nome: 'Ana Costa',
      dataNascimento: '1985-03-15',
      local: 'Rio de Janeiro',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('produces consistent reading for same birth date', async () => {
    const payload = {
      userId: 'user-consistent',
      nome: 'Joao Silva',
      dataNascimento: '1985-03-15',
    };
    const [res1, res2] = await Promise.all([
      POST(createMapaRequest(payload)),
      POST(createMapaRequest(payload)),
    ]);
    const body1 = await res1.json() as { numerologia: { numero_vida: number } };
    const body2 = await res2.json() as { numerologia: { numero_vida: number } };
    expect(body1.numerologia.numero_vida).toBe(body2.numerologia.numero_vida);
  });
});
