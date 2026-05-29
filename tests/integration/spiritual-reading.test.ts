import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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
        userId: 'pipeline-user-1',
        nome: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      };
      const [res1, res2] = await Promise.all([
        mapaPOST(createMapaRequest(payload)),
        mapaPOST(createMapaRequest(payload)),
      ]);
      const body1 = await res1.json() as { numerologia: { numero_vida: number } };
      const body2 = await res2.json() as { numerologia: { numero_vida: number } };
      expect(body1.numerologia.numero_vida).toBe(body2.numerologia.numero_vida);
    });

    it('includes Odu from birth date', async () => {
      const request = createMapaRequest({
        userId: 'pipeline-user-2',
        nome: 'Joao Silva',
        dataNascimento: '1985-03-15',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as { odu: { nome: string; numero: number } };
      expect(body.odu.nome).toBeDefined();
      expect(body.odu.numero).toBeGreaterThanOrEqual(1);
      expect(body.odu.numero).toBeLessThanOrEqual(16);
    });

    it('returns convergences between systems', async () => {
      const request = createMapaRequest({
        userId: 'pipeline-user-4',
        nome: 'Ana Costa',
        dataNascimento: '1985-03-15',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as { convergences: unknown[] };
      expect(Array.isArray(body.convergences)).toBe(true);
    });
  });

  describe('End-to-end reading generation', () => {
    it('generates complete spiritual reading in single call', async () => {
      const request = createMapaRequest({
        userId: 'e2e-complete',
        nome: 'Maria da Silva',
        dataNascimento: '1985-03-15',
        hora: '14:30',
        local: 'Rio de Janeiro',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as {
        id: string;
        numerologia: Record<string, unknown>;
        odu: Record<string, unknown>;
        astrologia: Record<string, unknown>;
        tarot: Record<string, unknown>;
        orixas: string[];
        sefirot: string[];
        convergences: unknown[];
      };
      expect(response.status).toBe(200);
      expect(body.id).toBe('e2e-complete');
      expect(body.numerologia).toBeDefined();
      expect(body.odu).toBeDefined();
      expect(body.astrologia).toBeDefined();
      expect(body.tarot).toBeDefined();
      expect(body.orixas.length).toBeGreaterThan(0);
      expect(body.sefirot.length).toBeGreaterThan(0);
      expect(Array.isArray(body.convergences)).toBe(true);
    });

    it('reading with hora includes astrologia', async () => {
      const request = createMapaRequest({
        userId: 'e2e-asc',
        nome: 'Test User',
        dataNascimento: '1985-03-15',
        hora: '10:00',
      });
      const response = await mapaPOST(request);
      const body = await response.json() as { astrologia: Record<string, unknown> };
      expect(body.astrologia).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('generates reading within reasonable time', async () => {
      const start = Date.now();
      const request = createMapaRequest({
        userId: 'perf-test',
        nome: 'Performance Test User',
        dataNascimento: '1985-03-15',
      });
      const response = await mapaPOST(request);
      const elapsed = Date.now() - start;
      expect(response.status).toBe(200);
      expect(elapsed).toBeLessThan(5000);
    });
  });
});
