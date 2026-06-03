/**
 * Spiritual Reading Integration Tests
 * Tests the full spiritual map pipeline via POST /api/mapa
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth — must precede module-level imports
const OPERATOR_MOCK = {
  id: 'operator_test_001',
  email: 'test@operator.com',
  name: 'Test Operator',
  role: 'ADMIN' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ativo: true,
};
vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: vi.fn(() => Promise.resolve(OPERATOR_MOCK)),
  getOperatorFromRequest: vi.fn(() => Promise.resolve(OPERATOR_MOCK)),
}));

function createMapaRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/mapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Full Spiritual Reading Pipeline', () => {
  let mapaPOST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    mapaPOST = mapaModule.POST;
  });

  describe('Birth date consistency', () => {
    it('produces consistent numerology across multiple calls', async () => {
      const payload = {
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      };
      const [res1, res2] = await Promise.all([
        mapaPOST(createMapaRequest(payload)),
        mapaPOST(createMapaRequest(payload)),
      ]);
      const body1 = await res1.json() as { numerologia: { vida: number } };
      const body2 = await res2.json() as { numerologia: { vida: number } };
      expect(body1.numerologia.vida).toBe(body2.numerologia.vida);
    });

    it('includes Odu from birth date', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Joao Silva',
        dataNascimento: '1985-03-15',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as { odu: { regente: { nome: string; numero: number } } };
      expect(body.odu.regente.nome).toBeDefined();
      expect(body.odu.regente.numero).toBeGreaterThanOrEqual(1);
      expect(body.odu.regente.numero).toBeLessThanOrEqual(16);
    });

    it('includes convergencias array', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Ana Costa',
        dataNascimento: '1985-03-15',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as { convergencias: unknown[] };
      expect(Array.isArray(body.convergencias)).toBe(true);
    });
  });

  describe('End-to-end reading generation', () => {
    it('generates complete spiritual reading in single call', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
        hora: '14:30',
        cidade: 'Rio de Janeiro',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as Record<string, unknown>;
      expect(response.status).toBe(200);
      expect(body.perfil).toBeDefined();
      expect(body.numerologia).toBeDefined();
      expect(body.odu).toBeDefined();
      expect(body.astrologia).toBeDefined();
      expect(body.tarot).toBeDefined();
      expect(body.convergencias).toBeDefined();
      expect(body.chakras).toBeDefined();
      expect(Array.isArray(body.orixasDominantes)).toBe(true);
    });

    it('reading with hora includes ascendente in astrologia', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1985-03-15',
        hora: '10:00',
        cidade: 'São Paulo',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as { astrologia: Record<string, unknown> };
      expect(body.astrologia).toBeDefined();
      expect(body.astrologia.ascendente).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('generates reading within reasonable time', async () => {
      const start = Date.now();
      const request = createMapaRequest({
        nomeCompleto: 'Performance Test User',
        dataNascimento: '1985-03-15',
      });
      const response = await mapaPOST(request);
      const elapsed = Date.now() - start;
      expect(response.status).toBe(200);
      expect(elapsed).toBeLessThan(5000);
    });
  });
});
