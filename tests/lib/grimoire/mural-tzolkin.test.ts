import { describe, it, expect } from 'vitest';
import { kinDaData, familias, FamiliaTzolkin } from '@/lib/grimoire/mural-tzolkin';

describe('mural-tzolkin', () => {
  describe('kinDaData', () => {
    it('returns a valid KinTzolkin object with all required fields', () => {
      const result = kinDaData();

      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('posicao_no_ciclo');
      expect(result).toHaveProperty('dias_ate_proximo_ciclo');
      expect(result).toHaveProperty('familia');
      expect(result).toHaveProperty('familia_nome');
      expect(result).toHaveProperty('familia_cor');
      expect(result).toHaveProperty('familia_qualidade');
      expect(result).toHaveProperty('eh_portal');
      expect(result).toHaveProperty('portal_nome');
    });

    it('returns a solar familia with correct properties', () => {
      const result = kinDaData();

      expect(result.familia).toBe('solar');
      expect(result.familia_nome).toBe('Solar');
      expect(result.familia_cor).toBe('#2DD4BF');
      expect(result.familia_qualidade).toBe('Ilumina');
    });

    it('returns non-portal kin with null portal_nome', () => {
      const result = kinDaData();

      expect(result.eh_portal).toBe(false);
      expect(result.portal_nome).toBeNull();
    });

    it('returns kin with valid cycle position', () => {
      const result = kinDaData();

      expect(result.numero).toBe(1);
      expect(result.posicao_no_ciclo).toBe(1);
      expect(result.dias_ate_proximo_ciclo).toBe(260);
    });
  });

  describe('familias', () => {
    it('returns an empty array', () => {
      const result = familias();
      expect(result).toEqual([]);
    });

    it('returns an array with zero length', () => {
      const result = familias();
      expect(result.length).toBe(0);
    });
  });

  describe('FamiliaTzolkin type', () => {
    it('accepts valid familia values', () => {
      const validFamilias: FamiliaTzolkin[] = [
        'cardinal',
        'polar',
        'eletrico',
        'solar',
        'espectral',
      ];
      validFamilias.forEach((familia) => {
        const kin = kinDaData();
        // Type check: kin.familia is always one of these values
        expect(['cardinal', 'polar', 'eletrico', 'solar', 'espectral']).toContain(
          kin.familia
        );
      });
    });
  });
});
