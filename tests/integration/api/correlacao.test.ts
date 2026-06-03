// TODO: Phase 19 — Test expects body.numerologia.vida but API may return different structure.
// Verify numerologia shape returned by /api/mapa and update test assertions accordingly.
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

  it('returns MapaAlmaCompleto with all system sections', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Maria da Silva',
      dataNascimento: '1985-03-15',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json() as Record<string, unknown>;

    expect(body).toHaveProperty('perfil');
    expect(body).toHaveProperty('numerologia');
    expect(body).toHaveProperty('odu');
    expect(body).toHaveProperty('astrologia');
    expect(body).toHaveProperty('tarot');
    expect(body).toHaveProperty('chakras');
    expect(body).toHaveProperty('convergencias');
    expect(body).toHaveProperty('orixasDominantes');
    expect(body).toHaveProperty('dataCalculo');
    expect(body).toHaveProperty('versao');
  });

  it('returns numerologia with vida number', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Joao Silva',
      dataNascimento: '1985-03-15',
    });
    const response = await POST(request);
    const body = await response.json() as { numerologia: { vida: number } };
    expect(body.numerologia).toBeDefined();
    expect(typeof body.numerologia.vida).toBe('number');
    expect(body.numerologia.vida).toBeGreaterThanOrEqual(1);
    expect(body.numerologia.vida).toBeLessThanOrEqual(33);
  });

  it('returns odu with regente and orixas', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Test User',
      dataNascimento: '1990-06-15',
    });
    const response = await POST(request);
    const body = await response.json() as { odu: { regente: { nome: string }; orixas: string[] } };
    expect(body.odu).toBeDefined();
    expect(body.odu.regente.nome).toBeDefined();
    expect(Array.isArray(body.odu.orixas)).toBe(true);
    expect(body.odu.orixas.length).toBeGreaterThan(0);
  });

  it('returns astrologia with planet positions', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Test User',
      dataNascimento: '2000-01-01',
    });
    const response = await POST(request);
    const body = await response.json() as { astrologia: Record<string, unknown> };
    expect(body.astrologia).toBeDefined();
    expect(body.astrologia).toHaveProperty('sol');
    expect(body.astrologia).toHaveProperty('lua');
  });

  it('returns convergencias array', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Carlos Santos',
      dataNascimento: '1970-01-01',
    });
    const response = await POST(request);
    const body = await response.json() as { convergencias: unknown[] };
    expect(Array.isArray(body.convergencias)).toBe(true);
  });

  it('returns tarot birth card in range 0-21', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
    });
    const response = await POST(request);
    const body = await response.json() as { tarot: { cartaNascimento: number } };
    expect(body.tarot).toBeDefined();
    expect(body.tarot.cartaNascimento).toBeGreaterThanOrEqual(0);
    expect(body.tarot.cartaNascimento).toBeLessThanOrEqual(21);
  });

  it('validates required nomeCompleto field', async () => {
    const request = createMapaRequest({
      dataNascimento: '1990-01-01',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('validates required dataNascimento field', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Test User',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('accepts optional hora field for ascendant calculation', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
      hora: '14:30',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('accepts optional cidade field for coordinates', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
      cidade: 'Rio de Janeiro',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('produces consistent numerologia for same birth date', async () => {
    const payload = {
      nomeCompleto: 'Joao Silva',
      dataNascimento: '1985-03-15',
    };
    const [res1, res2] = await Promise.all([
      POST(createMapaRequest(payload)),
      POST(createMapaRequest(payload)),
    ]);
    const body1 = await res1.json() as { numerologia: { vida: number } };
    const body2 = await res2.json() as { numerologia: { vida: number } };
    expect(body1.numerologia.vida).toBe(body2.numerologia.vida);
  });
});
