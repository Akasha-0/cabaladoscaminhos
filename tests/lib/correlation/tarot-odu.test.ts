/**
 * Tarot Major Arcana - Odu Ifá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOdu,
  getOduTarot,
  getOduByTarotNumber,
  getTarotNumberByOdu,
  getAllTarotOdus,
  getAllOduNumbers,
  getAllOduNames,
  getAllArcanos,
  hasTarotOdu,
  hasOduTarot,
  getTarotSimbolismo,
  getTarotConexaoEspiritual,
  getOduNomeByArcano,
  getOduNumeroByArcano,
  TAROT_ODU_MAPPINGS,
  type TarotOduMapping,
} from '@/lib/correlation/tarot-odu';

describe('Tarot-Odu Correlation', () => {
  // ─── getTarotOdu: arcano name lookup ────────────────────────────────────────

  describe('getTarotOdu', () => {
    it('should return correct mapping for O Louco → Odu 1 (Okaran)', () => {
      const result = getTarotOdu('O Louco');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Louco');
      expect(result!.arcano.numero_carta).toBe(0);
      expect(result!.odu.numero).toBe(1);
      expect(result!.odu.nome).toBe('Okaran');
    });

    it('should return correct mapping for A Sacerdotisa → Odu 2 (Ejiokô)', () => {
      const result = getTarotOdu('A Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Sacerdotisa');
      expect(result!.arcano.numero_carta).toBe(2);
      expect(result!.odu.numero).toBe(2);
      expect(result!.odu.nome).toBe('Ejiokô');
    });

    it('should return correct mapping for A Imperatriz → Odu 3 (Etaogundá)', () => {
      const result = getTarotOdu('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Imperatriz');
      expect(result!.arcano.numero_carta).toBe(3);
      expect(result!.odu.numero).toBe(3);
      expect(result!.odu.nome).toBe('Etaogundá');
    });

    it('should return correct mapping for A Lua → Odu 4 (Irosun)', () => {
      const result = getTarotOdu('A Lua');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Lua');
      expect(result!.arcano.numero_carta).toBe(18);
      expect(result!.odu.numero).toBe(4);
      expect(result!.odu.nome).toBe('Irosun');
    });

    it('should return correct mapping for O Hierofante → Odu 5 (Oxé)', () => {
      const result = getTarotOdu('O Hierofante');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Hierofante');
      expect(result!.arcano.numero_carta).toBe(5);
      expect(result!.odu.numero).toBe(5);
      expect(result!.odu.nome).toBe('Oxé');
    });

    it('should return correct mapping for O Sol → Odu 6 (Obará)', () => {
      const result = getTarotOdu('O Sol');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Sol');
      expect(result!.arcano.numero_carta).toBe(19);
      expect(result!.odu.numero).toBe(6);
      expect(result!.odu.nome).toBe('Obará');
    });

    it('should return correct mapping for O Carro → Odu 7 (Odi)', () => {
      const result = getTarotOdu('O Carro');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Carro');
      expect(result!.arcano.numero_carta).toBe(7);
      expect(result!.odu.numero).toBe(7);
      expect(result!.odu.nome).toBe('Odi');
    });

    it('should return correct mapping for A Justiça → Odu 8 (EjiOníle)', () => {
      const result = getTarotOdu('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Justiça');
      expect(result!.arcano.numero_carta).toBe(11);
      expect(result!.odu.numero).toBe(8);
      expect(result!.odu.nome).toBe('EjiOníle');
    });

    it('should return correct mapping for O Eremita → Odu 9 (Ossá)', () => {
      const result = getTarotOdu('O Eremita');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Eremita');
      expect(result!.arcano.numero_carta).toBe(9);
      expect(result!.odu.numero).toBe(9);
      expect(result!.odu.nome).toBe('Ossá');
    });

    it('should return correct mapping for A Roda da Fortuna → Odu 10 (Ofun)', () => {
      const result = getTarotOdu('A Roda da Fortuna');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Roda da Fortuna');
      expect(result!.arcano.numero_carta).toBe(10);
      expect(result!.odu.numero).toBe(10);
      expect(result!.odu.nome).toBe('Ofun');
    });

    it('should return correct mapping for A Força → Odu 11 (Owarin)', () => {
      const result = getTarotOdu('A Força');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Força');
      expect(result!.arcano.numero_carta).toBe(8);
      expect(result!.odu.numero).toBe(11);
      expect(result!.odu.nome).toBe('Owarin');
    });

    it('should return correct mapping for A Torre → Odu 12 (Ejilsebora)', () => {
      const result = getTarotOdu('A Torre');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Torre');
      expect(result!.arcano.numero_carta).toBe(16);
      expect(result!.odu.numero).toBe(12);
      expect(result!.odu.nome).toBe('Ejilsebora');
    });

    it('should return correct mapping for A Morte → Odu 13 (Olobón)', () => {
      const result = getTarotOdu('A Morte');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Morte');
      expect(result!.arcano.numero_carta).toBe(13);
      expect(result!.odu.numero).toBe(13);
      expect(result!.odu.nome).toBe('Olobón');
    });

    it('should return correct mapping for O Enforcado → Odu 14 (Iká)', () => {
      const result = getTarotOdu('O Enforcado');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Enforcado');
      expect(result!.arcano.numero_carta).toBe(12);
      expect(result!.odu.numero).toBe(14);
      expect(result!.odu.nome).toBe('Iká');
    });

    it('should return correct mapping for O Diabo → Odu 15 (Ogbogbé)', () => {
      const result = getTarotOdu('O Diabo');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('O Diabo');
      expect(result!.arcano.numero_carta).toBe(15);
      expect(result!.odu.numero).toBe(15);
      expect(result!.odu.nome).toBe('Ogbogbé');
    });

    it('should return correct mapping for A Estrela → Odu 16 (Alafia)', () => {
      const result = getTarotOdu('A Estrela');
      expect(result).not.toBeNull();
      expect(result!.arcano.nome).toBe('A Estrela');
      expect(result!.arcano.numero_carta).toBe(17);
      expect(result!.odu.numero).toBe(16);
      expect(result!.odu.nome).toBe('Alafia');
    });

    it('should return null for non-existent arcano', () => {
      expect(getTarotOdu('O Mago')).toBeNull();
      expect(getTarotOdu('Não Existe')).toBeNull();
    });

    it('should be case-sensitive', () => {
      expect(getTarotOdu('o louco')).toBeNull();
      expect(getTarotOdu('O Louco')).not.toBeNull();
    });
  });

  // ─── getOduTarot: reverse lookup by Odu number ──────────────────────────────

  describe('getOduTarot', () => {
    it('should return O Louco for Odu 1', () => {
      expect(getOduTarot(1)).toBe('O Louco');
    });

    it('should return A Sacerdotisa for Odu 2', () => {
      expect(getOduTarot(2)).toBe('A Sacerdotisa');
    });

    it('should return O Sol for Odu 6', () => {
      expect(getOduTarot(6)).toBe('O Sol');
    });

    it('should return A Estrela for Odu 16', () => {
      expect(getOduTarot(16)).toBe('A Estrela');
    });

    it('should return null for invalid Odu number (0)', () => {
      expect(getOduTarot(0)).toBeNull();
    });

    it('should return null for invalid Odu number (17)', () => {
      expect(getOduTarot(17)).toBeNull();
    });

    it('should return null for negative Odu number', () => {
      expect(getOduTarot(-1)).toBeNull();
    });
  });

  // ─── getOduByTarotNumber ─────────────────────────────────────────────────────

  describe('getOduByTarotNumber', () => {
    it('should return Odu 1 for arcano number 0 (O Louco)', () => {
      expect(getOduByTarotNumber(0)).toBe(1);
    });

    it('should return Odu 2 for arcano number 2 (A Sacerdotisa)', () => {
      expect(getOduByTarotNumber(2)).toBe(2);
    });

    it('should return Odu 8 for arcano number 11 (A Justiça)', () => {
      expect(getOduByTarotNumber(11)).toBe(8);
    });

    it('should return Odu 11 for arcano number 8 (A Força)', () => {
      expect(getOduByTarotNumber(8)).toBe(11);
    });

    it('should return null for non-existent arcano number (1)', () => {
      expect(getOduByTarotNumber(1)).toBeNull();
    });

    it('should return null for arcano number 21', () => {
      expect(getOduByTarotNumber(21)).toBeNull();
    });
  });

  // ─── getTarotNumberByOdu ─────────────────────────────────────────────────────

  describe('getTarotNumberByOdu', () => {
    it('should return 0 for Odu 1 (O Louco)', () => {
      expect(getTarotNumberByOdu(1)).toBe(0);
    });

    it('should return 19 for Odu 6 (O Sol)', () => {
      expect(getTarotNumberByOdu(6)).toBe(19);
    });

    it('should return 17 for Odu 16 (A Estrela)', () => {
      expect(getTarotNumberByOdu(16)).toBe(17);
    });

    it('should return null for invalid Odu number (0)', () => {
      expect(getTarotNumberByOdu(0)).toBeNull();
    });

    it('should return null for invalid Odu number (17)', () => {
      expect(getTarotNumberByOdu(17)).toBeNull();
    });
  });

  // ─── getAllTarotOdus ─────────────────────────────────────────────────────────

  describe('getAllTarotOdus', () => {
    it('should return all 16 mappings', () => {
      const result = getAllTarotOdus();
      expect(result).toHaveLength(16);
    });

    it('should return mappings sorted by arcano number', () => {
      const result = getAllTarotOdus();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].arcano.numero_carta).toBeLessThan(result[i + 1].arcano.numero_carta);
      }
    });

    it('should contain all arcano names from mappings', () => {
      const result = getAllTarotOdus();
      const arcanoNames = result.map((r) => r.arcano.nome);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('A Estrela');
      expect(arcanoNames).toContain('A Morte');
    });

    it('should contain all required fields in each mapping', () => {
      const result = getAllTarotOdus();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping.arcano).toHaveProperty('nome');
        expect(mapping.arcano).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('odu');
        expect(mapping.odu).toHaveProperty('numero');
        expect(mapping.odu).toHaveProperty('nome');
        expect(mapping.odu).toHaveProperty('nomeingles');
        expect(mapping).toHaveProperty('conexao_espiritual');
        expect(mapping).toHaveProperty('simbolismo');
      });
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('should return 16 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(16);
    });

    it('should return arcano names sorted alphabetically', () => {
      const result = getAllArcanos();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });

    it('should contain key arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
      expect(result).toContain('A Sacerdotisa');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Sol');
      expect(result).toContain('A Lua');
      expect(result).toContain('A Estrela');
    });
  });

  // ─── getAllOduNumbers ────────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return 16 Odu numbers', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
    });

    it('should return numbers sorted in ascending order', () => {
      const result = getAllOduNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });

    it('should contain all numbers from 1 to 16', () => {
      const result = getAllOduNumbers();
      for (let i = 1; i <= 16; i++) {
        expect(result).toContain(i);
      }
    });
  });

  // ─── getAllOduNames ──────────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return 16 Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('should contain key Odu names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Obará');
      expect(result).toContain('Alafia');
    });

    it('should contain all 16 Odu names from mappings', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Etaogundá');
      expect(result).toContain('Irosun');
      expect(result).toContain('Oxé');
      expect(result).toContain('Obará');
      expect(result).toContain('Odi');
      expect(result).toContain('EjiOníle');
      expect(result).toContain('Ossá');
      expect(result).toContain('Ofun');
      expect(result).toContain('Owarin');
      expect(result).toContain('Ejilsebora');
      expect(result).toContain('Olobón');
      expect(result).toContain('Iká');
      expect(result).toContain('Ogbogbé');
      expect(result).toContain('Alafia');
    });
  });

  // ─── hasTarotOdu ────────────────────────────────────────────────────────────

  describe('hasTarotOdu', () => {
    it('should return true for valid arcano names', () => {
      expect(hasTarotOdu('O Louco')).toBe(true);
      expect(hasTarotOdu('A Estrela')).toBe(true);
      expect(hasTarotOdu('A Morte')).toBe(true);
    });

    it('should return false for invalid arcano names', () => {
      expect(hasTarotOdu('O Mago')).toBe(false);
      expect(hasTarotOdu('Não Existe')).toBe(false);
      expect(hasTarotOdu('')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(hasTarotOdu('o louco')).toBe(false);
      expect(hasTarotOdu('O Louco')).toBe(true);
    });
  });

  // ─── hasOduTarot ────────────────────────────────────────────────────────────

  describe('hasOduTarot', () => {
    it('should return true for valid Odu numbers', () => {
      expect(hasOduTarot(1)).toBe(true);
      expect(hasOduTarot(8)).toBe(true);
      expect(hasOduTarot(16)).toBe(true);
    });

    it('should return false for invalid Odu numbers', () => {
      expect(hasOduTarot(0)).toBe(false);
      expect(hasOduTarot(17)).toBe(false);
      expect(hasOduTarot(-1)).toBe(false);
    });
  });

  // ─── getTarotSimbolismo ─────────────────────────────────────────────────────

  describe('getTarotSimbolismo', () => {
    it('should return simbolismo array for valid arcano', () => {
      const result = getTarotSimbolismo('O Louco');
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid arcano', () => {
      expect(getTarotSimbolismo('Não Existe')).toBeNull();
    });

    it('should return array with string elements', () => {
      const result = getTarotSimbolismo('O Louco');
      result!.forEach((symbol) => {
        expect(typeof symbol).toBe('string');
      });
    });

    it('should return correct simbolismo for known arcano', () => {
      const result = getTarotSimbolismo('O Sol');
      expect(result).toContain('Riqueza manifesta');
      expect(result).toContain('Fartura solar');
    });
  });

  // ─── getTarotConexaoEspiritual ─────────────────────────────────────────────

  describe('getTarotConexaoEspiritual', () => {
    it('should return conexao_espiritual string for valid arcano', () => {
      const result = getTarotConexaoEspiritual('O Louco');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid arcano', () => {
      expect(getTarotConexaoEspiritual('Não Existe')).toBeNull();
    });

    it('should return descriptive spiritual connection for O Sol', () => {
      const result = getTarotConexaoEspiritual('O Sol');
      expect(result).toContain('riqueza');
      expect(result).toContain('fartura');
    });
  });

  // ─── getOduNomeByArcano ─────────────────────────────────────────────────────

  describe('getOduNomeByArcano', () => {
    it('should return Odu name for valid arcano', () => {
      expect(getOduNomeByArcano('O Louco')).toBe('Okaran');
      expect(getOduNomeByArcano('O Sol')).toBe('Obará');
      expect(getOduNomeByArcano('A Estrela')).toBe('Alafia');
    });

    it('should return null for invalid arcano', () => {
      expect(getOduNomeByArcano('O Mago')).toBeNull();
    });
  });

  // ─── getOduNumeroByArcano ────────────────────────────────────────────────────

  describe('getOduNumeroByArcano', () => {
    it('should return Odu number for valid arcano', () => {
      expect(getOduNumeroByArcano('O Louco')).toBe(1);
      expect(getOduNumeroByArcano('O Sol')).toBe(6);
      expect(getOduNumeroByArcano('A Estrela')).toBe(16);
    });

    it('should return null for invalid arcano', () => {
      expect(getOduNumeroByArcano('O Mago')).toBeNull();
    });
  });

  // ─── TAROT_ODU_MAPPINGS constant ─────────────────────────────────────────────

  describe('TAROT_ODU_MAPPINGS', () => {
    it('should have 16 entries', () => {
      expect(Object.keys(TAROT_ODU_MAPPINGS)).toHaveLength(16);
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_ODU_MAPPINGS)).toBe(true);
    });

    it('should contain all arcano names as keys', () => {
      expect(TAROT_ODU_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_ODU_MAPPINGS['A Estrela']).toBeDefined();
      expect(TAROT_ODU_MAPPINGS['A Morte']).toBeDefined();
    });

    it('each mapping should be frozen', () => {
      for (const mapping of Object.values(TAROT_ODU_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── TarotOduMapping interface completeness ─────────────────────────────────

  describe('TarotOduMapping interface completeness', () => {
    it('should have valid arcano structure for each mapping', () => {
      for (const mapping of Object.values(TAROT_ODU_MAPPINGS)) {
        expect(typeof mapping.arcano.nome).toBe('string');
        expect(typeof mapping.arcano.numero_carta).toBe('number');
        expect(mapping.arcano.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.arcano.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('should have valid odu structure for each mapping', () => {
      for (const mapping of Object.values(TAROT_ODU_MAPPINGS)) {
        expect(typeof mapping.odu.nome).toBe('string');
        expect(typeof mapping.odu.numero).toBe('number');
        expect(mapping.odu.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.odu.numero).toBeLessThanOrEqual(16);
        expect(typeof mapping.odu.nomeingles).toBe('string');
      }
    });

    it('should have valid conexao_espiritual for each mapping', () => {
      for (const mapping of Object.values(TAROT_ODU_MAPPINGS)) {
        expect(typeof mapping.conexao_espiritual).toBe('string');
        expect(mapping.conexao_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('should have valid simbolismo array for each mapping', () => {
      for (const mapping of Object.values(TAROT_ODU_MAPPINGS)) {
        expect(Array.isArray(mapping.simbolismo)).toBe(true);
        expect(mapping.simbolismo.length).toBeGreaterThan(0);
        mapping.simbolismo.forEach((s) => {
          expect(typeof s).toBe('string');
        });
      }
    });
  });

  // ─── Default export ─────────────────────────────────────────────────────────

  describe('default export', () => {
    it('should export all required functions', async () => {
      const module = await import('@/lib/correlation/tarot-odu');
      const defaultExport = module.default;

      expect(typeof defaultExport.getTarotOdu).toBe('function');
      expect(typeof defaultExport.getOduTarot).toBe('function');
      expect(typeof defaultExport.getAllTarotOdus).toBe('function');
      expect(typeof defaultExport.TAROT_ODU_MAPPINGS).toBe('object');
    });

    it('should export correct TAROT_ODU_MAPPINGS', async () => {
      const module = await import('@/lib/correlation/tarot-odu');
      const defaultExport = module.default;

      expect(defaultExport.TAROT_ODU_MAPPINGS).toBe(TAROT_ODU_MAPPINGS);
    });
  });

  // ─── Cross-validation ───────────────────────────────────────────────────────

  describe('Cross-validation', () => {
    it('O Louco (0) should map to Okaran (1) - both represent beginnings', () => {
      const result = getTarotOdu('O Louco');
      expect(result!.arcano.numero_carta).toBe(0);
      expect(result!.odu.numero).toBe(1);
    });

    it('O Sol (19) should map to Obará (6) - both represent success and abundance', () => {
      const result = getTarotOdu('O Sol');
      expect(result!.arcano.numero_carta).toBe(19);
      expect(result!.odu.numero).toBe(6);
    });

    it('A Estrela (17) should map to Alafia (16) - both represent hope and healing', () => {
      const result = getTarotOdu('A Estrela');
      expect(result!.arcano.numero_carta).toBe(17);
      expect(result!.odu.numero).toBe(16);
    });

    it('A Lua (18) should map to Irosun (4) - both represent intuition', () => {
      const result = getTarotOdu('A Lua');
      expect(result!.arcano.numero_carta).toBe(18);
      expect(result!.odu.numero).toBe(4);
    });

    it('bidirectional lookup should be consistent', () => {
      for (let i = 1; i <= 16; i++) {
        const arcanoName = getOduTarot(i);
        expect(arcanoName).not.toBeNull();
        const reverseMapping = getTarotOdu(arcanoName!);
        expect(reverseMapping).not.toBeNull();
        expect(reverseMapping!.odu.numero).toBe(i);
      }
    });
  });
});