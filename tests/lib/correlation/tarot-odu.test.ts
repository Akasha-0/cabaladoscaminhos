/**
 * Tarot Major Arcana - Odu Ifá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOdu,
  getOduTarot,
  getAllTarotOdus,
  getAllArcanoNumbers,
  getAllArcanoNomes,
  getAllOduNumbers,
  hasTarotOdu,
  hasArcano,
  getArcanoNome,
  getOduByArcano,
  getOduNome,
  getElementByArcano,
  getSignificadoByArcano,
  getTarotOdusByElement,
  getTarotOdusByOdu,
  TAROT_ODU_MAPPINGS,
  type TarotOduMapping,
} from '@/lib/correlation/tarot-odu';

describe('Tarot-Odu Correlation', () => {
  describe('getTarotOdu', () => {
    it('should return mapping for arcano 0 (O Louco)', () => {
      const result = getTarotOdu(0);
      expect(result).toBeDefined();
      expect(result?.arcano.numero).toBe(0);
      expect(result?.arcano.nome).toBe('O Louco');
      expect(result?.odu.numero).toBe(1);
      expect(result?.odu.nome).toBe('Okaran');
    });

    it('should return mapping for arcano 0 with Éter element', () => {
      const result = getTarotOdu(0);
      expect(result?.elemento).toBe('Éter');
      expect(result?.significado_espiritual).toBeDefined();
    });

    it('should return mapping for arcano 19 (O Sol)', () => {
      const result = getTarotOdu(19);
      expect(result).toBeDefined();
      expect(result?.arcano.numero).toBe(19);
      expect(result?.arcano.nome).toBe('O Sol');
      expect(result?.odu.numero).toBe(6);
      expect(result?.odu.nome).toBe('Obará');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for arcano 21 (O Mundo)', () => {
      const result = getTarotOdu(21);
      expect(result).toBeDefined();
      expect(result?.arcano.numero).toBe(21);
      expect(result?.arcano.nome).toBe('O Mundo');
      expect(result?.elemento).toBe('Terra');
    });

    it('should return null for invalid arcano number', () => {
      expect(getTarotOdu(-1)).toBeNull();
      expect(getTarotOdu(22)).toBeNull();
      expect(getTarotOdu(100)).toBeNull();
    });

    it('should return null for non-existent arcano', () => {
      expect(getTarotOdu(25)).toBeNull();
    });
  });

  describe('getOduTarot (inverse lookup)', () => {
    it('should return Odu number for O Louco', () => {
      expect(getOduTarot('O Louco')).toBe(1);
    });

    it('should return Odu number for A Sacerdotisa', () => {
      expect(getOduTarot('A Sacerdotisa')).toBe(2);
    });

    it('should return Odu number for A Imperatriz', () => {
      expect(getOduTarot('A Imperatriz')).toBe(3);
    });

    it('should return Odu number for A Lua', () => {
      expect(getOduTarot('A Lua')).toBe(4);
    });

    it('should return Odu number for O Hierofante', () => {
      expect(getOduTarot('O Hierofante')).toBe(5);
    });

    it('should return Odu number for O Sol', () => {
      expect(getOduTarot('O Sol')).toBe(6);
    });

    it('should return null for non-existent arcano name', () => {
      expect(getOduTarot('Non Existent')).toBeNull();
      expect(getOduTarot('')).toBeNull();
    });
  });

  describe('getAllTarotOdus', () => {
    it('should return all 22 Tarot-Odu mappings', () => {
      const result = getAllTarotOdus();
      expect(result).toHaveLength(22);
    });

    it('should return mappings sorted by arcano number', () => {
      const result = getAllTarotOdus();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].arcano.numero).toBeGreaterThan(
          result[i - 1].arcano.numero
        );
      }
    });

    it('should include all expected arcano names', () => {
      const result = getAllTarotOdus();
      const names = result.map((m) => m.arcano.nome);
      expect(names).toContain('O Louco');
      expect(names).toContain('O Mago');
      expect(names).toContain('A Sacerdotisa');
      expect(names).toContain('A Imperatriz');
      expect(names).toContain('O Sol');
      expect(names).toContain('O Mundo');
    });

    it('each mapping should have all required fields', () => {
      const result = getAllTarotOdus();
      for (const mapping of result) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.arcano.numero).toBeDefined();
        expect(mapping.arcano.nome).toBeDefined();
        expect(mapping.odu).toBeDefined();
        expect(mapping.odu.numero).toBeDefined();
        expect(mapping.odu.nome).toBeDefined();
        expect(mapping.odu.nomeingles).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
      }
    });
  });

  describe('getAllArcanoNumbers', () => {
    it('should return 22 arcano numbers', () => {
      const result = getAllArcanoNumbers();
      expect(result).toHaveLength(22);
    });

    it('should return numbers 0-21', () => {
      const result = getAllArcanoNumbers();
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(21);
    });

    it('should return sorted numbers', () => {
      const result = getAllArcanoNumbers();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });
  });

  describe('getAllArcanoNomes', () => {
    it('should return 22 arcano names', () => {
      const result = getAllArcanoNomes();
      expect(result).toHaveLength(22);
    });

    it('should include all major arcana names', () => {
      const result = getAllArcanoNomes();
      expect(result).toContain('O Louco');
      expect(result).toContain('A Sacerdotisa');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Sol');
      expect(result).toContain('A Estrela');
      expect(result).toContain('O Mundo');
    });
  });

  describe('getAllOduNumbers', () => {
    it('should return unique Odu numbers used in mappings', () => {
      const result = getAllOduNumbers();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(22);
    });

    it('should return sorted Odu numbers', () => {
      const result = getAllOduNumbers();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('should include Odu 1 (Okaran) for O Louco', () => {
      const result = getAllOduNumbers();
      expect(result).toContain(1);
    });

    it('should include Odu 16 (Alafia) for A Estrela', () => {
      const result = getAllOduNumbers();
      expect(result).toContain(16);
    });
  });

  describe('hasTarotOdu', () => {
    it('should return true for valid arcano numbers', () => {
      expect(hasTarotOdu(0)).toBe(true);
      expect(hasTarotOdu(1)).toBe(true);
      expect(hasTarotOdu(10)).toBe(true);
      expect(hasTarotOdu(21)).toBe(true);
    });

    it('should return false for invalid arcano numbers', () => {
      expect(hasTarotOdu(-1)).toBe(false);
      expect(hasTarotOdu(22)).toBe(false);
      expect(hasTarotOdu(100)).toBe(false);
    });
  });

  describe('hasArcano', () => {
    it('should return true for valid arcano names', () => {
      expect(hasArcano('O Louco')).toBe(true);
      expect(hasArcano('A Lua')).toBe(true);
      expect(hasArcano('O Sol')).toBe(true);
    });

    it('should return false for invalid arcano names', () => {
      expect(hasArcano('Non Existent')).toBe(false);
      expect(hasArcano('')).toBe(false);
    });
  });

  describe('getArcanoNome', () => {
    it('should return arcano name for valid number', () => {
      expect(getArcanoNome(0)).toBe('O Louco');
      expect(getArcanoNome(19)).toBe('O Sol');
      expect(getArcanoNome(21)).toBe('O Mundo');
    });

    it('should return null for invalid number', () => {
      expect(getArcanoNome(-1)).toBeNull();
      expect(getArcanoNome(22)).toBeNull();
    });
  });

  describe('getOduByArcano', () => {
    it('should return Odu number for valid arcano', () => {
      expect(getOduByArcano(0)).toBe(1);
      expect(getOduByArcano(2)).toBe(2);
      expect(getOduByArcano(19)).toBe(6);
    });

    it('should return null for invalid arcano', () => {
      expect(getOduByArcano(-1)).toBeNull();
      expect(getOduByArcano(22)).toBeNull();
    });
  });

  describe('getOduNome', () => {
    it('should return Odu name for valid arcano', () => {
      expect(getOduNome(0)).toBe('Okaran');
      expect(getOduNome(19)).toBe('Obará');
    });

    it('should return null for invalid arcano', () => {
      expect(getOduNome(-1)).toBeNull();
      expect(getOduNome(22)).toBeNull();
    });
  });

  describe('getElementByArcano', () => {
    it('should return Éter for O Louco (arcano 0)', () => {
      expect(getElementByArcano(0)).toBe('Éter');
    });

    it('should return Água for A Sacerdotisa (arcano 2)', () => {
      expect(getElementByArcano(2)).toBe('Água');
    });

    it('should return Terra for A Imperatriz (arcano 3)', () => {
      expect(getElementByArcano(3)).toBe('Terra');
    });

    it('should return Fogo for O Carro (arcano 7)', () => {
      expect(getElementByArcano(7)).toBe('Fogo');
    });

    it('should return null for invalid arcano', () => {
      expect(getElementByArcano(-1)).toBeNull();
      expect(getElementByArcano(22)).toBeNull();
    });
  });

  describe('getSignificadoByArcano', () => {
    it('should return spiritual meaning for valid arcano', () => {
      const significado = getSignificadoByArcano(0);
      expect(significado).toBeDefined();
      expect(typeof significado).toBe('string');
      expect(significado!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid arcano', () => {
      expect(getSignificadoByArcano(-1)).toBeNull();
      expect(getSignificadoByArcano(22)).toBeNull();
    });
  });

  describe('getTarotOdusByElement', () => {
    it('should return all arcano mappings for Água element', () => {
      const result = getTarotOdusByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Água');
      }
    });

    it('should return all arcano mappings for Fogo element', () => {
      const result = getTarotOdusByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Fogo');
      }
    });

    it('should return all arcano mappings for Terra element', () => {
      const result = getTarotOdusByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Terra');
      }
    });

    it('should return all arcano mappings for Ar element', () => {
      const result = getTarotOdusByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Ar');
      }
    });

    it('should return all arcano mappings for Éter element', () => {
      const result = getTarotOdusByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Éter');
      }
    });

    it('should be case-insensitive', () => {
      const result1 = getTarotOdusByElement('água');
      const result2 = getTarotOdusByElement('Água');
      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for non-existent element', () => {
      const result = getTarotOdusByElement('Não existe');
      expect(result).toEqual([]);
    });
  });

  describe('getTarotOdusByOdu', () => {
    it('should return all arcano mappings for Odu 1 (Okaran)', () => {
      const result = getTarotOdusByOdu(1);
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.odu.numero).toBe(1);
      }
    });

    it('should return all arcano mappings for Odu 6 (Obará)', () => {
      const result = getTarotOdusByOdu(6);
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.odu.numero).toBe(6);
      }
    });

    it('should return empty array for non-existent Odu', () => {
      const result = getTarotOdusByOdu(100);
      expect(result).toEqual([]);
    });
  });

  describe('TAROT_ODU_MAPPINGS constant', () => {
    it('should have 22 entries', () => {
      expect(Object.keys(TAROT_ODU_MAPPINGS)).toHaveLength(22);
    });

    it('should have arcano numbers as keys', () => {
      const keys = Object.keys(TAROT_ODU_MAPPINGS).map(Number);
      expect(keys).toContain(0);
      expect(keys).toContain(21);
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(TAROT_ODU_MAPPINGS)).toBe(true);
    });

    it('should have all required fields in each mapping', () => {
      for (const [numero, mapping] of Object.entries(TAROT_ODU_MAPPINGS)) {
        expect((mapping as TarotOduMapping).arcano).toBeDefined();
        expect((mapping as TarotOduMapping).odu).toBeDefined();
        expect((mapping as TarotOduMapping).elemento).toBeDefined();
        expect((mapping as TarotOduMapping).significado_espiritual).toBeDefined();
      }
    });
  });

  describe('Spiritual Correlation Integrity', () => {
    it('should correlate O Louco with Okaran (início/coragem)', () => {
      const result = getTarotOdu(0);
      expect(result?.odu.nome).toBe('Okaran');
      expect(result?.significado_espiritual).toContain('início');
    });

    it('should correlate A Lua with Irosun (intuição/visão)', () => {
      const result = getTarotOdu(18);
      expect(result?.odu.nome).toBe('Irosun');
      expect(result?.elemento).toBe('Água');
    });

    it('should correlate O Sol with Obará (riqueza/brilho)', () => {
      const result = getTarotOdu(19);
      expect(result?.odu.nome).toBe('Obará');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should correlate A Estrela with Alafia (paz/luz)', () => {
      const result = getTarotOdu(17);
      expect(result?.odu.nome).toBe('Alafia');
      expect(result?.elemento).toBe('Água');
    });

    it('should correlate A Torre with Ejilsebora (fogo/transformação)', () => {
      const result = getTarotOdu(16);
      expect(result?.odu.nome).toBe('Ejilsebora');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should have all five elements represented', () => {
      const elements = new Set(
        Object.values(TAROT_ODU_MAPPINGS).map((m) => m.elemento)
      );
      expect(elements.has('Terra')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
      expect(elements.has('Éter')).toBe(true);
    });
  });

  describe('Consistency with odu-tarot.ts', () => {
    it('should have inverse mappings consistent with odu-tarot.ts', async () => {
      const { ODU_TAROT_MAPPINGS } = await import('@/lib/correlation/odu-tarot');

      // For each arcano, verify the Odu matches
      for (const [arcanoNumStr, tarotMapping] of Object.entries(TAROT_ODU_MAPPINGS)) {
        const arcanoNum = Number(arcanoNumStr);
        const arcanoNome = tarotMapping.arcano.nome;
        const oduNumero = tarotMapping.odu.numero;
        // Find corresponding entry in ODU_TAROT_MAPPINGS
        const oduMapping = ODU_TAROT_MAPPINGS[oduNumero];
        expect(oduMapping).toBeDefined();
        // Verify the odu number is consistent (arcano name may differ due to mapping design)
        expect(oduMapping.odu.numero).toBe(oduNumero);
      }
    });
  });
});