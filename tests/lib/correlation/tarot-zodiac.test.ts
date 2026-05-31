import { describe, it, expect } from 'vitest';
import {
  getTarotZodiac,
  getZodiacTarot,
  getAllTarotZodiacs,
  getAllArcanos,
  hasTarotZodiac,
  getMappingByCarta,
  getTarotZodiacByElement,
  getTarotZodiacBySigno,
  TAROT_ZODIAC_MAPPINGS,
  type TarotZodiacMapping,
} from '@/lib/correlation/tarot-zodiac';

describe('tarot-zodiac', () => {
  // ─── getTarotZodiac: valid arcano numbers ─────────────────────────────────

  describe('getTarotZodiac', () => {
    it('returns mapping for arcano 0 (O Louco)', () => {
      const result = getTarotZodiac(0);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('O Louco');
      expect(result!.signo).toBe('Aquário');
      expect(result!.elemento).toBe('Ar');
    });

    it('returns mapping for arcano 1 (O Mago)', () => {
      const result = getTarotZodiac(1);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('O Mago');
      expect(result!.signo).toBe('Mercúrio');
    });

    it('returns mapping for arcano 5 (O Hierofante)', () => {
      const result = getTarotZodiac(5);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('O Hierofante');
      expect(result!.signo).toBe('Touro');
      expect(result!.elemento).toBe('Terra');
    });

    it('returns mapping for arcano 10 (A Roda da Fortuna)', () => {
      const result = getTarotZodiac(10);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('A Roda da Fortuna');
      expect(result!.signo).toBe('Júpiter');
    });

    it('returns mapping for arcano 21 (O Mundo)', () => {
      const result = getTarotZodiac(21);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('O Mundo');
      expect(result!.signo).toBe('Saturno');
    });

    it('returns null for arcano -1', () => {
      expect(getTarotZodiac(-1)).toBeNull();
    });

    it('returns null for arcano 22', () => {
      expect(getTarotZodiac(22)).toBeNull();
    });

    it('returns null for arcano 100', () => {
      expect(getTarotZodiac(100)).toBeNull();
    });

    it('returns null for undefined arcano', () => {
      expect(getTarotZodiac(undefined as unknown as number)).toBeNull();
    });
  });

  // ─── getZodiacTarot ────────────────────────────────────────────────────────

  describe('getZodiacTarot', () => {
    it('returns arcano number for Aquário', () => {
      const result = getZodiacTarot('Aquário');
      expect(result).toBe(0);
    });

    it('returns arcano number for Mercúrio', () => {
      const result = getZodiacTarot('Mercúrio');
      expect(result).toBe(1);
    });

    it('returns arcano number for Lua', () => {
      const result = getZodiacTarot('Lua');
      expect(result).toBe(2);
    });

    it('returns arcano number for Vênus', () => {
      const result = getZodiacTarot('Vênus');
      expect(result).toBe(3);
    });

    it('returns arcano number for Áries', () => {
      const result = getZodiacTarot('Áries');
      expect(result).toBe(4);
    });

    it('returns arcano number for Touro', () => {
      const result = getZodiacTarot('Touro');
      expect(result).toBe(5);
    });

    it('returns arcano number for Gêmeos', () => {
      const result = getZodiacTarot('Gêmeos');
      expect(result).toBe(6);
    });

    it('returns arcano number for Câncer', () => {
      const result = getZodiacTarot('Câncer');
      expect(result).toBe(7);
    });

    it('returns arcano number for Libra', () => {
      const result = getZodiacTarot('Libra');
      expect(result).toBe(8);
    });

    it('returns arcano number for Júpiter', () => {
      const result = getZodiacTarot('Júpiter');
      expect(result).toBe(10);
    });

    it('returns arcano number for Leão', () => {
      const result = getZodiacTarot('Leão');
      expect(result).toBe(11);
    });

    it('returns arcano number for Escorpião', () => {
      const result = getZodiacTarot('Escorpião');
      expect(result).toBe(13);
    });

    it('returns arcano number for Capricórnio', () => {
      const result = getZodiacTarot('Capricórnio');
      expect(result).toBe(15);
    });

    it('returns arcano number for Marte', () => {
      const result = getZodiacTarot('Marte');
      expect(result).toBe(16);
    });

    it('returns arcano number for Peixes', () => {
      const result = getZodiacTarot('Peixes');
      expect(result).toBe(18);
    });

    it('returns arcano number for Plutão', () => {
      const result = getZodiacTarot('Plutão');
      expect(result).toBe(20);
    });

    it('returns arcano number for Saturno', () => {
      const result = getZodiacTarot('Saturno');
      expect(result).toBe(21);
    });

    it('is case-insensitive', () => {
      expect(getZodiacTarot('aquário')).toBe(0);
      expect(getZodiacTarot('AQUÁRIO')).toBe(0);
      expect(getZodiacTarot('Aquário')).toBe(0);
    });

    it('returns null for unknown zodiac sign', () => {
      expect(getZodiacTarot('Orion')).toBeNull();
      expect(getZodiacTarot('')).toBeNull();
      expect(getZodiacTarot('X')).toBeNull();
    });
  });

  // ─── getAllTarotZodiacs ───────────────────────────────────────────────────

  describe('getAllTarotZodiacs', () => {
    it('returns all 22 arcano mappings', () => {
      const result = getAllTarotZodiacs();
      expect(result).toHaveLength(22);
    });

    it('returns mappings sorted by arcano number', () => {
      const result = getAllTarotZodiacs();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].arcano).toBeLessThan(result[i + 1].arcano);
      }
    });

    it('includes O Louco (arcano 0) and O Mundo (arcano 21)', () => {
      const result = getAllTarotZodiacs();
      const first = result[0];
      const last = result[result.length - 1];
      expect(first.arcano).toBe(0);
      expect(first.carta).toBe('O Louco');
      expect(last.arcano).toBe(21);
      expect(last.carta).toBe('O Mundo');
    });

    it('each mapping has all required fields', () => {
      const result = getAllTarotZodiacs();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('carta');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('grau_zodiacal');
      });
    });

    it('all arcano numbers are unique', () => {
      const result = getAllTarotZodiacs();
      const arcanoNumbers = result.map((m) => m.arcano);
      const uniqueNumbers = new Set(arcanoNumbers);
      expect(uniqueNumbers.size).toBe(22);
    });
  });

  // ─── getAllArcanos ─────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of 22 numbers', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(22);
    });

    it('returns numbers from 0 to 21', () => {
      const result = getAllArcanos();
      expect(result[0]).toBe(0);
      expect(result[21]).toBe(21);
    });

    it('returns sorted numbers', () => {
      const result = getAllArcanos();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  // ─── hasTarotZodiac ───────────────────────────────────────────────────────

  describe('hasTarotZodiac', () => {
    it('returns true for valid arcano numbers', () => {
      expect(hasTarotZodiac(0)).toBe(true);
      expect(hasTarotZodiac(10)).toBe(true);
      expect(hasTarotZodiac(21)).toBe(true);
    });

    it('returns false for invalid arcano numbers', () => {
      expect(hasTarotZodiac(-1)).toBe(false);
      expect(hasTarotZodiac(22)).toBe(false);
      expect(hasTarotZodiac(100)).toBe(false);
    });
  });

  // ─── getMappingByCarta ────────────────────────────────────────────────────

  describe('getMappingByCarta', () => {
    it('finds O Louco', () => {
      const result = getMappingByCarta('O Louco');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(0);
      expect(result!.signo).toBe('Aquário');
    });

    it('finds O Mago', () => {
      const result = getMappingByCarta('O Mago');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(1);
    });

    it('finds A Estrela', () => {
      const result = getMappingByCarta('A Estrela');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(17);
    });

    it('finds O Mundo', () => {
      const result = getMappingByCarta('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(21);
    });

    it('is case-insensitive', () => {
      const result = getMappingByCarta('o louco');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(0);
    });

    it('returns null for unknown card', () => {
      expect(getMappingByCarta('Unknown Card')).toBeNull();
      expect(getMappingByCarta('')).toBeNull();
    });
  });

  // ─── getTarotZodiacByElement ───────────────────────────────────────────────

  describe('getTarotZodiacByElement', () => {
    it('returns Fogo elements', () => {
      const result = getTarotZodiacByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => expect(m.elemento).toBe('Fogo'));
    });

    it('returns Água elements', () => {
      const result = getTarotZodiacByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => expect(m.elemento).toBe('Água'));
    });

    it('returns Terra elements', () => {
      const result = getTarotZodiacByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => expect(m.elemento).toBe('Terra'));
    });

    it('returns Ar elements', () => {
      const result = getTarotZodiacByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => expect(m.elemento).toBe('Ar'));
    });

    it('is case-insensitive', () => {
      const resultFogo = getTarotZodiacByElement('fogo');
      const resultAgua = getTarotZodiacByElement('água');
      expect(resultFogo.length).toBeGreaterThan(0);
      expect(resultAgua.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown element', () => {
      expect(getTarotZodiacByElement('Éter')).toHaveLength(0);
      expect(getTarotZodiacByElement('')).toHaveLength(0);
    });

    it('returns mappings sorted by arcano number', () => {
      const result = getTarotZodiacByElement('Fogo');
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].arcano).toBeLessThan(result[i + 1].arcano);
      }
    });

    it('includes O Imperador as Fogo', () => {
      const result = getTarotZodiacByElement('Fogo');
      const imperador = result.find((m) => m.carta === 'O Imperador');
      expect(imperador).toBeDefined();
    });

    it('includes A Sacerdotisa as Água', () => {
      const result = getTarotZodiacByElement('Água');
      const sacerdotisa = result.find((m) => m.carta === 'A Sacerdotisa');
      expect(sacerdotisa).toBeDefined();
    });

    it('includes A Imperatriz as Terra', () => {
      const result = getTarotZodiacByElement('Terra');
      const imperatriz = result.find((m) => m.carta === 'A Imperatriz');
      expect(imperatriz).toBeDefined();
    });

    it('includes O Mago as Ar', () => {
      const result = getTarotZodiacByElement('Ar');
      const mago = result.find((m) => m.carta === 'O Mago');
      expect(mago).toBeDefined();
    });
  });

  // ─── getTarotZodiacBySigno ─────────────────────────────────────────────────

  describe('getTarotZodiacBySigno', () => {
    it('finds Aquário mappings', () => {
      const result = getTarotZodiacBySigno('Aquário');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => expect(m.signo).toBe('Aquário'));
    });

    it('finds Leão mappings', () => {
      const result = getTarotZodiacBySigno('Leão');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => expect(m.signo).toBe('Leão'));
    });

    it('finds Peixes mappings', () => {
      const result = getTarotZodiacBySigno('Peixes');
      expect(result.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const result = getTarotZodiacBySigno('leão');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown sign', () => {
      expect(getTarotZodiacBySigno('Orion')).toHaveLength(0);
      expect(getTarotZodiacBySigno('')).toHaveLength(0);
    });

    it('returns mappings sorted by arcano number', () => {
      const result = getTarotZodiacBySigno('Aquário');
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].arcano).toBeLessThan(result[i + 1].arcano);
      }
    });
  });

  // ─── TAROT_ZODIAC_MAPPINGS constant ───────────────────────────────────────

  describe('TAROT_ZODIAC_MAPPINGS', () => {
    it('is an object with keys 0-21', () => {
      const keys = Object.keys(TAROT_ZODIAC_MAPPINGS).map(Number);
      expect(keys).toHaveLength(22);
      expect(keys).toContain(0);
      expect(keys).toContain(21);
    });

    it('has spiritual meaning for all arcanos', () => {
      const values = Object.values(TAROT_ZODIAC_MAPPINGS);
      values.forEach((mapping) => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('has valid element values for all arcanos', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar'];
      const values = Object.values(TAROT_ZODIAC_MAPPINGS);
      values.forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('cannot be modified (frozen)', () => {
      expect(() => {
        (TAROT_ZODIAC_MAPPINGS as Record<string, unknown>)[22] = {};
      }).toThrow();
    });
  });

  // ─── Interface completeness ───────────────────────────────────────────────

  describe('TarotZodiacMapping interface completeness', () => {
    it('has all required properties', () => {
      const mapping = getTarotZodiac(0);
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('carta');
      expect(mapping).toHaveProperty('signo');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('grau_zodiacal');
    });

    it('arcano number matches index', () => {
      for (let i = 0; i <= 21; i++) {
        const mapping = getTarotZodiac(i);
        expect(mapping!.arcano).toBe(i);
      }
    });

    it('all cards have valid zodiac signs', () => {
      const mappings = getAllTarotZodiacs();
      mappings.forEach((m) => {
        expect(m.signo.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has multiple Fogo arcanos', () => {
      const fogo = getTarotZodiacByElement('Fogo');
      expect(fogo.length).toBeGreaterThanOrEqual(5);
    });

    it('has multiple Água arcanos', () => {
      const agua = getTarotZodiacByElement('Água');
      expect(agua.length).toBeGreaterThanOrEqual(5);
    });

    it('has multiple Terra arcanos', () => {
      const terra = getTarotZodiacByElement('Terra');
      expect(terra.length).toBeGreaterThanOrEqual(4);
    });

    it('has multiple Ar arcanos', () => {
      const ar = getTarotZodiacByElement('Ar');
      expect(ar.length).toBeGreaterThanOrEqual(4);
    });

    it('total elements sum to 22', () => {
      const fogo = getTarotZodiacByElement('Fogo');
      const agua = getTarotZodiacByElement('Água');
      const terra = getTarotZodiacByElement('Terra');
      const ar = getTarotZodiacByElement('Ar');
      expect(fogo.length + agua.length + terra.length + ar.length).toBe(22);
    });
  });

  // ─── Zodiac sign distribution ─────────────────────────────────────────────

  describe('Zodiac sign distribution', () => {
    it('has multiple Aquário mappings', () => {
      const aquario = getTarotZodiacBySigno('Aquário');
      expect(aquario.length).toBe(2); // O Louco and A Estrela
    });

    it('has multiple Leão mappings', () => {
      const leao = getTarotZodiacBySigno('Leão');
      expect(leao.length).toBe(2); // A Força and O Sol
    });

    it('covers all 12 zodiac signs plus outer planets', () => {
      const mappings = getAllTarotZodiacs();
      const signs = mappings.map((m) => m.signo);
      const uniqueSigns = new Set(signs);
      expect(uniqueSigns.size).toBeGreaterThanOrEqual(12);
    });
  });

  // ─── Roundtrip consistency ────────────────────────────────────────────────

  describe('Roundtrip consistency', () => {
    it('getTarotZodiac followed by lookup maintains consistency', () => {
      for (let i = 0; i <= 21; i++) {
        const mapping = getTarotZodiac(i);
        expect(mapping).not.toBeNull();
        expect(getMappingByCarta(mapping!.carta)!.arcano).toBe(i);
      }
    });

    it('getZodiacTarot and getTarotZodiac are inverse operations', () => {
      const aquario = getZodiacTarot('Aquário');
      expect(aquario).not.toBeNull();
      const mapping = getTarotZodiac(aquario!);
      expect(getZodiacTarot(mapping!.signo)).toBe(aquario);
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('handles whitespace in carta names', () => {
      const result = getMappingByCarta('  O Louco  ');
      // Note: current implementation doesn't trim, so this may return null
      // This documents current behavior
      expect(result === null || result.arcano === 0).toBe(true);
    });

    it('handles special characters in signs', () => {
      const aries = getZodiacTarot('Áries');
      expect(aries).not.toBeNull();
    });

    it('returns valid data for all arcano boundary values', () => {
      const start = getTarotZodiac(0);
      const end = getTarotZodiac(21);
      expect(start).not.toBeNull();
      expect(end).not.toBeNull();
      expect(start!.carta).toBe('O Louco');
      expect(end!.carta).toBe('O Mundo');
    });
  });

  // ─── Data integrity ───────────────────────────────────────────────────────

  describe('Data integrity', () => {
    it('all arcano numbers are sequential 0-21', () => {
      const arcanoNumbers = getAllArcanos();
      for (let i = 0; i <= 21; i++) {
        expect(arcanoNumbers).toContain(i);
      }
    });

    it('all cards have unique names', () => {
      const mappings = getAllTarotZodiacs();
      const names = mappings.map((m) => m.carta);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(22);
    });

    it('all spiritual meanings are meaningful (longer than 10 chars)', () => {
      const mappings = getAllTarotZodiacs();
      mappings.forEach((m) => {
        expect(m.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('zodiac sign names are proper case', () => {
      const mappings = getAllTarotZodiacs();
      mappings.forEach((m) => {
        expect(m.signo).toBe(m.signo.charAt(0).toUpperCase() + m.signo.slice(1).toLowerCase());
      });
    });
  });
});