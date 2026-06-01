/**
 * Odu Ifá - Tarot Major Arcana Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOduTarot,
  getTarotOdu,
  getOduByArcanoNumber,
  getAllOduTarots,
  getAllOduNumbers,
  getAllOduTarotNames,
  getAllArcanos,
  hasOduTarot,
  hasTarotOdu,
  getOduSimbolismo,
  getOduConexaoEspiritual,
  getOduArcano,
  getOduArcanoNumber,
  ODU_TAROT_MAPPINGS,
  type OduTarotMapping,
} from '@/lib/correlation/odu-tarot';

describe('Odu-Tarot Correlation', () => {
  // ─── getOduTarot: Odu numbers 1-16 ──────────────────────────────────────────

  describe('getOduTarot', () => {
    it('should return correct mapping for Odu 1 (Okaran) → O Louco', () => {
      const result = getOduTarot(1);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(1);
      expect(result!.odu.nome).toBe('Okaran');
      expect(result!.arcano.nome).toBe('O Louco');
      expect(result!.arcano.numero_carta).toBe(0);
    });

    it('should return correct mapping for Odu 2 (Ejiokô) → A Sacerdotisa', () => {
      const result = getOduTarot(2);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(2);
      expect(result!.odu.nome).toBe('Ejiokô');
      expect(result!.arcano.nome).toBe('A Sacerdotisa');
      expect(result!.arcano.numero_carta).toBe(2);
    });

    it('should return correct mapping for Odu 3 (Etaogundá) → A Imperatriz', () => {
      const result = getOduTarot(3);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(3);
      expect(result!.odu.nome).toBe('Etaogundá');
      expect(result!.arcano.nome).toBe('A Imperatriz');
      expect(result!.arcano.numero_carta).toBe(3);
    });

    it('should return correct mapping for Odu 4 (Irosun) → A Lua', () => {
      const result = getOduTarot(4);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(4);
      expect(result!.odu.nome).toBe('Irosun');
      expect(result!.arcano.nome).toBe('A Lua');
      expect(result!.arcano.numero_carta).toBe(18);
    });

    it('should return correct mapping for Odu 5 (Oxé) → O Hierofante', () => {
      const result = getOduTarot(5);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(5);
      expect(result!.odu.nome).toBe('Oxé');
      expect(result!.arcano.nome).toBe('O Hierofante');
      expect(result!.arcano.numero_carta).toBe(5);
    });

    it('should return correct mapping for Odu 6 (Obará) → O Sol', () => {
      const result = getOduTarot(6);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(6);
      expect(result!.odu.nome).toBe('Obará');
      expect(result!.arcano.nome).toBe('O Sol');
      expect(result!.arcano.numero_carta).toBe(19);
    });

    it('should return correct mapping for Odu 7 (Odi) → O Carro', () => {
      const result = getOduTarot(7);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(7);
      expect(result!.odu.nome).toBe('Odi');
      expect(result!.arcano.nome).toBe('O Carro');
      expect(result!.arcano.numero_carta).toBe(7);
    });

    it('should return correct mapping for Odu 8 (EjiOníle) → A Justiça', () => {
      const result = getOduTarot(8);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(8);
      expect(result!.odu.nome).toBe('EjiOníle');
      expect(result!.arcano.nome).toBe('A Justiça');
      expect(result!.arcano.numero_carta).toBe(11);
    });

    it('should return correct mapping for Odu 9 (Ossá) → O Eremita', () => {
      const result = getOduTarot(9);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(9);
      expect(result!.odu.nome).toBe('Ossá');
      expect(result!.arcano.nome).toBe('O Eremita');
      expect(result!.arcano.numero_carta).toBe(9);
    });

    it('should return correct mapping for Odu 10 (Ofun) → A Roda da Fortuna', () => {
      const result = getOduTarot(10);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(10);
      expect(result!.odu.nome).toBe('Ofun');
      expect(result!.arcano.nome).toBe('A Roda da Fortuna');
      expect(result!.arcano.numero_carta).toBe(10);
    });

    it('should return correct mapping for Odu 11 (Owarin) → A Força', () => {
      const result = getOduTarot(11);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(11);
      expect(result!.odu.nome).toBe('Owarin');
      expect(result!.arcano.nome).toBe('A Força');
      expect(result!.arcano.numero_carta).toBe(8);
    });

    it('should return correct mapping for Odu 12 (Ejilsebora) → A Torre', () => {
      const result = getOduTarot(12);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(12);
      expect(result!.odu.nome).toBe('Ejilsebora');
      expect(result!.arcano.nome).toBe('A Torre');
      expect(result!.arcano.numero_carta).toBe(16);
    });

    it('should return correct mapping for Odu 13 (Olobón) → A Morte', () => {
      const result = getOduTarot(13);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(13);
      expect(result!.odu.nome).toBe('Olobón');
      expect(result!.arcano.nome).toBe('A Morte');
      expect(result!.arcano.numero_carta).toBe(13);
    });

    it('should return correct mapping for Odu 14 (Iká) → O Enforcado', () => {
      const result = getOduTarot(14);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(14);
      expect(result!.odu.nome).toBe('Iká');
      expect(result!.arcano.nome).toBe('O Enforcado');
      expect(result!.arcano.numero_carta).toBe(12);
    });

    it('should return correct mapping for Odu 15 (Ogbogbé) → O Diabo', () => {
      const result = getOduTarot(15);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(15);
      expect(result!.odu.nome).toBe('Ogbogbé');
      expect(result!.arcano.nome).toBe('O Diabo');
      expect(result!.arcano.numero_carta).toBe(15);
    });

    it('should return correct mapping for Odu 16 (Alafia) → A Estrela', () => {
      const result = getOduTarot(16);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(16);
      expect(result!.odu.nome).toBe('Alafia');
      expect(result!.arcano.nome).toBe('A Estrela');
      expect(result!.arcano.numero_carta).toBe(17);
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

  // ─── getTarotOdu: reverse lookup ─────────────────────────────────────────────

  describe('getTarotOdu', () => {
    it('should return Odu 1 for O Louco', () => {
      expect(getTarotOdu('O Louco')).toBe(1);
    });

    it('should return Odu 2 for A Sacerdotisa', () => {
      expect(getTarotOdu('A Sacerdotisa')).toBe(2);
    });

    it('should return Odu 6 for O Sol', () => {
      expect(getTarotOdu('O Sol')).toBe(6);
    });

    it('should return Odu 9 for O Eremita', () => {
      expect(getTarotOdu('O Eremita')).toBe(9);
    });

    it('should return Odu 16 for A Estrela', () => {
      expect(getTarotOdu('A Estrela')).toBe(16);
    });

    it('should return null for non-existent arcano', () => {
      expect(getTarotOdu('Não Existe')).toBeNull();
    });

    it('should be case-sensitive', () => {
      expect(getTarotOdu('o louco')).toBeNull();
      expect(getTarotOdu('O Louco')).toBe(1);
    });
  });

  // ─── getOduByArcanoNumber ────────────────────────────────────────────────────

  describe('getOduByArcanoNumber', () => {
    it('should return Odu 1 for arcano number 0 (O Louco)', () => {
      expect(getOduByArcanoNumber(0)).toBe(1);
    });

    it('should return Odu 2 for arcano number 2 (A Sacerdotisa)', () => {
      expect(getOduByArcanoNumber(2)).toBe(2);
    });

    it('should return Odu 8 for arcano number 11 (A Justiça)', () => {
      expect(getOduByArcanoNumber(11)).toBe(8);
    });

    it('should return null for non-existent arcano number (1)', () => {
      expect(getOduByArcanoNumber(1)).toBeNull();
    });

    it('should return null for arcano number 21', () => {
      expect(getOduByArcanoNumber(21)).toBeNull();
    });
  });

  // ─── getAllOduTarots ────────────────────────────────────────────────────────

  describe('getAllOduTarots', () => {
    it('should return all 16 mappings', () => {
      const result = getAllOduTarots();
      expect(result).toHaveLength(16);
    });

    it('should return mappings sorted by Odu number', () => {
      const result = getAllOduTarots();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].odu.numero).toBeLessThan(result[i + 1].odu.numero);
      }
    });

    it('should contain all Odu numbers from 1 to 16', () => {
      const result = getAllOduTarots();
      const oduNumeros = result.map((r) => r.odu.numero);
      for (let i = 1; i <= 16; i++) {
        expect(oduNumeros).toContain(i);
      }
    });

    it('should contain all required fields in each mapping', () => {
      const result = getAllOduTarots();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('odu');
        expect(mapping.odu).toHaveProperty('numero');
        expect(mapping.odu).toHaveProperty('nome');
        expect(mapping.odu).toHaveProperty('nomeingles');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping.arcano).toHaveProperty('nome');
        expect(mapping.arcano).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('conexao_espiritual');
        expect(mapping).toHaveProperty('simbolismo');
      });
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

  // ─── getAllOduTarotNames ────────────────────────────────────────────────────

  describe('getAllOduTarotNames', () => {
    it('should return 16 Odu names', () => {
      const result = getAllOduTarotNames();
      expect(result).toHaveLength(16);
    });

    it('should contain key Odu names', () => {
      const result = getAllOduTarotNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Obará'); // Odu 6 with O Sol
    });

    it('should contain all 16 Odu names from mappings', () => {
      const result = getAllOduTarotNames();
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

  // ─── getAllArcanos ─────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('should return 16 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(16);
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

  // ─── hasOduTarot ───────────────────────────────────────────────────────────

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

  // ─── getOduSimbolismo ───────────────────────────────────────────────────────

  describe('getOduSimbolismo', () => {
    it('should return simbolismo array for valid Odu', () => {
      const result = getOduSimbolismo(1);
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu', () => {
      expect(getOduSimbolismo(0)).toBeNull();
      expect(getOduSimbolismo(17)).toBeNull();
    });

    it('should return array with string elements', () => {
      const result = getOduSimbolismo(1);
      result!.forEach((symbol) => {
        expect(typeof symbol).toBe('string');
      });
    });
  });

  // ─── getOduConexaoEspiritual ────────────────────────────────────────────────

  describe('getOduConexaoEspiritual', () => {
    it('should return conexao_espiritual string for valid Odu', () => {
      const result = getOduConexaoEspiritual(1);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu', () => {
      expect(getOduConexaoEspiritual(0)).toBeNull();
      expect(getOduConexaoEspiritual(17)).toBeNull();
    });

    it('should return descriptive spiritual connection', () => {
      const result = getOduConexaoEspiritual(6); // Obará → O Sol
      expect(result).toContain('riqueza');
      expect(result).toContain('fartura');
    });
  });

  // ─── getOduArcano ───────────────────────────────────────────────────────────

  describe('getOduArcano', () => {
    it('should return arcano name for valid Odu', () => {
      expect(getOduArcano(1)).toBe('O Louco');
      expect(getOduArcano(6)).toBe('O Sol');
      expect(getOduArcano(16)).toBe('A Estrela');
    });

    it('should return null for invalid Odu', () => {
      expect(getOduArcano(0)).toBeNull();
      expect(getOduArcano(17)).toBeNull();
    });
  });

  // ─── getOduArcanoNumber ─────────────────────────────────────────────────────

  describe('getOduArcanoNumber', () => {
    it('should return arcano number for valid Odu', () => {
      expect(getOduArcanoNumber(1)).toBe(0);
      expect(getOduArcanoNumber(6)).toBe(19);
      expect(getOduArcanoNumber(12)).toBe(16);
    });

    it('should return null for invalid Odu', () => {
      expect(getOduArcanoNumber(0)).toBeNull();
      expect(getOduArcanoNumber(17)).toBeNull();
    });
  });

  // ─── ODU_TAROT_MAPPINGS constant ───────────────────────────────────────────

  describe('ODU_TAROT_MAPPINGS', () => {
    it('should have 16 entries', () => {
      expect(Object.keys(ODU_TAROT_MAPPINGS)).toHaveLength(16);
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODU_TAROT_MAPPINGS)).toBe(true);
    });

    it('should contain all Odu numbers from 1 to 16', () => {
      for (let i = 1; i <= 16; i++) {
        expect(ODU_TAROT_MAPPINGS[i]).toBeDefined();
      }
    });

    it('each mapping should be frozen', () => {
      for (const mapping of Object.values(ODU_TAROT_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── OduTarotMapping interface completeness ─────────────────────────────────

  describe('OduTarotMapping interface completeness', () => {
    it('should have valid odu structure for each mapping', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODU_TAROT_MAPPINGS[i];
        expect(mapping.odu.numero).toBe(i);
        expect(typeof mapping.odu.nome).toBe('string');
        expect(typeof mapping.odu.nomeingles).toBe('string');
      }
    });

    it('should have valid arcano structure for each mapping', () => {
      for (const mapping of Object.values(ODU_TAROT_MAPPINGS)) {
        expect(typeof mapping.arcano.nome).toBe('string');
        expect(typeof mapping.arcano.numero_carta).toBe('number');
        expect(mapping.arcano.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.arcano.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('should have valid conexao_espiritual for each mapping', () => {
      for (const mapping of Object.values(ODU_TAROT_MAPPINGS)) {
        expect(typeof mapping.conexao_espiritual).toBe('string');
        expect(mapping.conexao_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('should have valid simbolismo array for each mapping', () => {
      for (const mapping of Object.values(ODU_TAROT_MAPPINGS)) {
        expect(Array.isArray(mapping.simbolismo)).toBe(true);
        expect(mapping.simbolismo.length).toBeGreaterThan(0);
        mapping.simbolismo.forEach((s) => {
          expect(typeof s).toBe('string');
        });
      }
    });
  });

  // ─── Default export ────────────────────────────────────────────────────────

  describe('default export', () => {
    it('should export all required functions', async () => {
      const mod = await import('@/lib/correlation/odu-tarot');
      const defaultExport = mod.default;

      expect(typeof defaultExport.getOduTarot).toBe('function');
      expect(typeof defaultExport.getTarotOdu).toBe('function');
      expect(typeof defaultExport.getAllOduTarots).toBe('function');
      expect(typeof defaultExport.ODU_TAROT_MAPPINGS).toBe('object');
    });

    it('should export correct ODU_TAROT_MAPPINGS', async () => {
      const mod = await import('@/lib/correlation/odu-tarot');
      const defaultExport = mod.default;

      expect(defaultExport.ODU_TAROT_MAPPINGS).toBe(ODU_TAROT_MAPPINGS);
    });
  });

  // ─── Cross-validation with other mappings ──────────────────────────────────

  describe('Cross-validation with Tarot Major Arcana', () => {
    it('O Louco (0) should map to Okaran (1) - both represent beginnings', () => {
      const mapping = getOduTarot(1);
      expect(mapping!.arcano.numero_carta).toBe(0);
      expect(mapping!.arcano.nome).toBe('O Louco');
    });

    it('O Sol (19) should map to Obará (6) - both represent success and abundance', () => {
      const mapping = getOduTarot(6);
      expect(mapping!.arcano.numero_carta).toBe(19);
      expect(mapping!.arcano.nome).toBe('O Sol');
    });

    it('A Estrela (17) should map to Alafia (16) - both represent hope and healing', () => {
      const mapping = getOduTarot(16);
      expect(mapping!.arcano.numero_carta).toBe(17);
      expect(mapping!.arcano.nome).toBe('A Estrela');
    });

    it('A Lua (18) should map to Irosun (4) - both represent intuition and the unconscious', () => {
      const mapping = getOduTarot(4);
      expect(mapping!.arcano.numero_carta).toBe(18);
      expect(mapping!.arcano.nome).toBe('A Lua');
    });
  });
});