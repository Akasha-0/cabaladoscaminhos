/**
 * Mapa da Alma API Integration Tests
 *
 * Tests the aggregated spiritual data endpoint:
 * - POST /api/mapa - Returns MapaAlmaCompleto from spiritual engine
 * - GET /api/mapa - Returns cached result by userId
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================
// TEST HELPERS
// ============================================================

function createMapaRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/mapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createMapaGetRequest(userId: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/mapa?userId=${userId}`, {
    method: 'GET',
  });
}

// ============================================================
// TESTS
// ============================================================

describe('POST /api/mapa', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    POST = mapaModule.POST;
  });

  it('should return 200 + MapaAlmaCompleto for valid input', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Maria Silva',
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;

    // Top-level fields from MapaAlmaCompleto
    expect(data).toHaveProperty('perfil');
    expect(data).toHaveProperty('numerologia');
    expect(data).toHaveProperty('odu');
    expect(data).toHaveProperty('astrologia');
    expect(data).toHaveProperty('tarot');
    expect(data).toHaveProperty('chakras');
    expect(data).toHaveProperty('convergencias');
    expect(data).toHaveProperty('orixasDominantes');
    expect(data).toHaveProperty('dataCalculo');
    expect(data).toHaveProperty('versao');
    expect(typeof data.dataCalculo).toBe('string');
    expect(data.versao).toBe('1.0.0');
  });

  it('should accept optional hora and cidade parameters', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'João Santos',
      dataNascimento: '1990-07-22',
      hora: '14:30',
      cidade: 'Rio de Janeiro',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    expect(data).toHaveProperty('perfil');
    const perfil = data.perfil as Record<string, unknown>;
    expect(perfil.hora).toBe('14:30');
    expect(perfil.cidade).toBe('Rio de Janeiro');
  });

  it('should include numerologia fields', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    const numerologia = data.numerologia as Record<string, unknown>;
    expect(numerologia).toHaveProperty('vida');
    expect(numerologia).toHaveProperty('expressao');
    expect(numerologia).toHaveProperty('motivacao');
    expect(numerologia).toHaveProperty('impressao');
    expect(typeof numerologia.vida).toBe('number');
    expect(numerologia.vida).toBeGreaterThanOrEqual(1);
    expect(numerologia.vida).toBeLessThanOrEqual(33);
  });

  it('should include odu with regente and orixas', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    const odu = data.odu as Record<string, unknown>;
    expect(odu).toHaveProperty('regente');
    expect(odu).toHaveProperty('orixas');
    expect(odu).toHaveProperty('quizilas');
    expect(odu).toHaveProperty('preceitos');
    const regente = odu.regente as Record<string, unknown>;
    expect(regente).toHaveProperty('numero');
    expect(regente).toHaveProperty('nome');
    expect(regente.numero).toBeGreaterThanOrEqual(1);
    expect(regente.numero).toBeLessThanOrEqual(16);
    expect(Array.isArray(odu.orixas)).toBe(true);
  });

  it('should include astrologia with ascendente and planetas', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
      hora: '10:00',
      cidade: 'São Paulo',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    const astrologia = data.astrologia as Record<string, unknown>;
    expect(astrologia).toHaveProperty('ascendente');
    expect(astrologia).toHaveProperty('sol');
    expect(astrologia).toHaveProperty('lua');
    expect(astrologia).toHaveProperty('casas');
  });

  it('should include tarot with birth card in range 0-21', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    const tarot = data.tarot as Record<string, unknown>;
    expect(tarot).toHaveProperty('cartaNascimento');
    expect(tarot).toHaveProperty('cartaAnoPessoal');
    expect(tarot).toHaveProperty('cartaAlma');
    expect(typeof tarot.cartaNascimento).toBe('number');
    expect(tarot.cartaNascimento).toBeGreaterThanOrEqual(0);
    expect(tarot.cartaNascimento).toBeLessThanOrEqual(21);
  });

  it('should include chakras and convergencias', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    const chakras = data.chakras as Record<string, unknown>;
    expect(chakras).toHaveProperty('chakras');
    expect(chakras).toHaveProperty('dominante');
    expect(chakras).toHaveProperty('bloqueado');
    expect(chakras).toHaveProperty('equilibrio');
    expect(Array.isArray(chakras.chakras)).toBe(true);

    const convergencias = data.convergencias as unknown[];
    expect(Array.isArray(convergencias)).toBe(true);
  });
});

describe('Validation', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    POST = mapaModule.POST;
  });

  it('should return 400 when nomeCompleto is missing', async () => {
    const request = createMapaRequest({
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json() as Record<string, unknown>;
    expect(data).toHaveProperty('error');
  });

  it('should return 400 when dataNascimento is missing', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid date format', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'Ana Costa',
      dataNascimento: '15/03/1985',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for nomeCompleto too short', async () => {
    const request = createMapaRequest({
      nomeCompleto: 'X',
      dataNascimento: '1985-03-15',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/mapa', () => {
  let GET: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    GET = mapaModule.GET;
  });

  it('should return 400 when userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/mapa', { method: 'GET' });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('should return 404 for unknown userId', async () => {
    const request = createMapaGetRequest('unknown-user-xyz');
    const response = await GET(request);
    expect(response.status).toBe(404);
  });
});
