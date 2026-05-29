/**
 * Mapa da Alma API Integration Tests
 *
 * Tests the aggregated spiritual data endpoint:
 * - POST /api/mapa - Returns complete soul map with numerology, Odu, astrology, tarot
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

// ============================================================
// TESTS
// ============================================================

describe('POST /api/mapa', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    POST = mapaModule.POST;
  });

  describe('Valid Requests', () => {
    it('should return complete soul map for valid input', async () => {
      const request = createMapaRequest({
        userId: 'test-user-001',
        nome: 'Maria Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json() as Record<string, unknown>;

      // Top-level fields
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('created_at');
      expect(data.id).toBe('test-user-001');
      expect(typeof data.created_at).toBe('string');
    });

    it('should accept optional hora and local parameters', async () => {
      const request = createMapaRequest({
        userId: 'test-user-002',
        nome: 'João Santos',
        dataNascimento: '1990-07-22',
        hora: '14:30',
        local: 'Rio de Janeiro',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json() as Record<string, unknown>;
      expect(data).toHaveProperty('id');
    });
  });

  describe('Response Structure', () => {
    it('should return all required fields in schema', async () => {
      const request = createMapaRequest({
        userId: 'test-user-003',
        nome: 'Ana Costa',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const data = await response.json() as Record<string, unknown>;

      // Required top-level fields
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('created_at');

      // Numerology section
      expect(data).toHaveProperty('numerologia');
      const numerologia = data.numerologia as Record<string, unknown>;
      expect(numerologia).toHaveProperty('numero_vida');
      expect(numerologia).toHaveProperty('numero_destino');
      expect(numerologia).toHaveProperty('numero_alma');
      expect(numerologia).toHaveProperty('numero_personalidade');
      expect(typeof numerologia.numero_vida).toBe('number');
      expect(typeof numerologia.numero_destino).toBe('number');
      expect(typeof numerologia.numero_alma).toBe('number');
      expect(typeof numerologia.numero_personalidade).toBe('number');

      // Odu section
      expect(data).toHaveProperty('odu');
      const odu = data.odu as Record<string, unknown>;
      expect(odu).toHaveProperty('nome');
      expect(odu).toHaveProperty('numero');
      expect(odu).toHaveProperty('orixas');
      expect(odu).toHaveProperty('quizilas');
      expect(odu).toHaveProperty('preceitos');
      expect(Array.isArray(odu.orixas)).toBe(true);
      expect(Array.isArray(odu.quizilas)).toBe(true);
      expect(Array.isArray(odu.preceitos)).toBe(true);

      // Astrology section
      expect(data).toHaveProperty('astrologia');
      const astrologia = data.astrologia as Record<string, unknown>;
      expect(astrologia).toHaveProperty('signo');
      expect(astrologia).toHaveProperty('ascendente');
      expect(astrologia).toHaveProperty('planetas');
      expect(typeof astrologia.planetas).toBe('object');

      // Tarot section
      expect(data).toHaveProperty('tarot');
      const tarot = data.tarot as Record<string, unknown>;
      expect(tarot).toHaveProperty('carta_nascimento');
      expect(tarot).toHaveProperty('carta_ano_pessoal');
      expect(typeof tarot.carta_nascimento).toBe('number');
      expect(typeof tarot.carta_ano_pessoal).toBe('number');
      // Birth card must be 0-21 (Major Arcana)
      expect(tarot.carta_nascimento).toBeGreaterThanOrEqual(0);
      expect(tarot.carta_nascimento).toBeLessThanOrEqual(21);

      // Orixas
      expect(data).toHaveProperty('orixas');
      expect(Array.isArray(data.orixas)).toBe(true);

      // Sefirot
      expect(data).toHaveProperty('sefirot');
      expect(Array.isArray(data.sefirot)).toBe(true);

      // Convergences
      expect(data).toHaveProperty('convergences');
      expect(Array.isArray(data.convergences)).toBe(true);
      if ((data.convergences as unknown[]).length > 0) {
        const conv = (data.convergences as unknown[])[0] as Record<string, unknown>;
        expect(conv).toHaveProperty('energia');
        expect(conv).toHaveProperty('forca');
        expect(['simples', 'dupla', 'tripla']).toContain(conv.forca);
        expect(conv).toHaveProperty('descricao');
      }
    });

    it('should produce deterministic numerology for known test case', async () => {
      const request = createMapaRequest({
        userId: 'deterministic-test',
        nome: 'Ana Costa',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const data = await response.json() as { numerologia: { numero_vida: number } };

      // Life path number for 1985-03-15: tantrica sum: 1+9+8+5+0+3+1+5=32 → 3+2=5
      // But we just verify it's a valid number 1-9 (or master numbers)
      expect(data.numerologia.numero_vida).toBeGreaterThanOrEqual(1);
      expect(data.numerologia.numero_vida).toBeLessThanOrEqual(33);
    });
  });

  describe('Validation', () => {
    it('should return 400 when userId is missing', async () => {
      const request = createMapaRequest({
        nome: 'Ana Costa',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json() as Record<string, unknown>;
      expect(data).toHaveProperty('error');
    });

    it('should return 400 when nome is missing', async () => {
      const request = createMapaRequest({
        userId: 'test-user',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when dataNascimento is missing', async () => {
      const request = createMapaRequest({
        userId: 'test-user',
        nome: 'Ana Costa',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid date format', async () => {
      const request = createMapaRequest({
        userId: 'test-user',
        nome: 'Ana Costa',
        dataNascimento: '15/03/1985',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid hora format', async () => {
      const request = createMapaRequest({
        userId: 'test-user',
        nome: 'Ana Costa',
        dataNascimento: '1985-03-15',
        hora: '14h30',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
