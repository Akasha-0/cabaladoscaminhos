import { describe, it, expect } from 'vitest';
import { getHealing } from '@/lib/energy/energy-healing';

describe('energy-healing module', () => {
  describe('getHealing', () => {
    it('returns all healing methods when no methodId is provided', () => {
      const result = getHealing();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(5);
    });

    it('returns all healing methods with correct structure', () => {
      const result = getHealing() as Array<{
        id: string;
        name: string;
        description: string;
        applications: string[];
      }>;

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('applications');
      expect(Array.isArray(result[0].applications)).toBe(true);
    });

    it('returns all five healing method IDs', () => {
      const result = getHealing() as Array<{ id: string }>;
      const ids = result.map((m) => m.id);

      expect(ids).toContain('reiki');
      expect(ids).toContain('cristal');
      expect(ids).toContain('sagrada');
      expect(ids).toContain('som');
      expect(ids).toContain('chakras');
    });

    it('returns empty array for unknown methodId', () => {
      const result = getHealing('unknown-method');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('returns HealingResult with method, recommendation, and duration for valid methodId', () => {
      const result = getHealing('reiki') as {
        method: { id: string };
        recommendation: string;
        duration: string;
      };

      expect(result).toHaveProperty('method');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('duration');
      expect(result.method.id).toBe('reiki');
    });

    it('returns correct recommendation for reiki', () => {
      const result = getHealing('reiki') as { recommendation: string };

      expect(result.recommendation).toContain('45-60 minutos');
      expect(result.recommendation).toContain('imposição das mãos');
    });

    it('returns correct duration for reiki', () => {
      const result = getHealing('reiki') as { duration: string };

      expect(result.duration).toBe('45-60 minutos');
    });

    it('returns correct recommendation for cristal', () => {
      const result = getHealing('cristal') as { recommendation: string };

      expect(result.recommendation).toContain('20-30 minutos');
      expect(result.recommendation).toContain('cristais');
    });

    it('returns correct duration for cristal', () => {
      const result = getHealing('cristal') as { duration: string };

      expect(result.duration).toBe('20-30 minutos');
    });

    it('returns correct recommendation for sagrada', () => {
      const result = getHealing('sagrada') as { recommendation: string };

      expect(result.recommendation).toContain('30 minutos');
      expect(result.recommendation).toContain('mandalas');
    });

    it('returns correct duration for sagrada', () => {
      const result = getHealing('sagrada') as { duration: string };

      expect(result.duration).toBe('30 minutos');
    });

    it('returns correct recommendation for som', () => {
      const result = getHealing('som') as { recommendation: string };

      expect(result.recommendation).toContain('40-50 minutos');
      expect(result.recommendation).toContain('sons harmônicos');
    });

    it('returns correct duration for som', () => {
      const result = getHealing('som') as { duration: string };

      expect(result.duration).toBe('40-50 minutos');
    });

    it('returns correct recommendation for chakras', () => {
      const result = getHealing('chakras') as { recommendation: string };

      expect(result.recommendation).toContain('30-40 minutos');
      expect(result.recommendation).toContain('chakra');
    });

    it('returns correct duration for chakras', () => {
      const result = getHealing('chakras') as { duration: string };

      expect(result.duration).toBe('30-40 minutos');
    });
    it('returns empty array for unknown methodId and does not have recommendation/duration', () => {
      const result = getHealing('invalid');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
      expect(result).not.toHaveProperty('recommendation');
      expect(result).not.toHaveProperty('duration');
    });
    it('method contains all expected properties for each healing method', () => {
      const result = getHealing('reiki') as { method: { id: string; name: string; description: string; applications: string[] } };

      expect(result.method.id).toBe('reiki');
      expect(result.method.name).toBe('Reiki');
      expect(result.method.description).toContain('energia vital');
      expect(Array.isArray(result.method.applications)).toBe(true);
      expect(result.method.applications.length).toBeGreaterThan(0);
    });

    it('each healing method has non-empty applications array', () => {
      const result = getHealing() as Array<{ applications: string[] }>;

      result.forEach((method) => {
        expect(method.applications.length).toBeGreaterThan(0);
        expect(typeof method.applications[0]).toBe('string');
      });
    });
  });
});
