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
  });

  // ─── getZodiacTarot ────────────────────────────────────────────────────────

  describe('getZodiacTarot', () => {
    it('returns arcano number for Aquário', () => {
      const result = getZodiacTarot('Aquário');
      expect(result).not.toBeNull();
      expect(result).toBe(0);
    });

    it('returns arcano number for Leão', () => {
      const result = getZodiacTarot('Leão');
      expect(result).not.toBeNull();
      expect(result).toBe(11);
    });

    it('returns arcano number for Escorpião', () => {
      const result = getZodiacTarot('Escorpião');
      expect(result).not.toBeNull();
      expect(result).toBe(13);
    });

    it('returns null for unknown sign', () => {
      expect(getZodiacTarot('Orion')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getZodiacTarot('')).toBeNull();
    });

    it('is case-sensitive', () => {
      expect(getZodiacTarot('aquário')).toBeNull();
      expect(getZodiacTarot('AQUÁRIO')).toBeNull();
    });
  });

  // ─── getAllTarotZodiacs ────────────────────────────────────────────────────

  describe('getAllTarotZodiacs', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotZodiacs();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('returns sorted by arcano number', () => {
      const result = getAllTarotZodiacs();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].arcano).toBeLessThan(result[i + 1].arcano);
      }
    });

    it('contains O Louco as first item', () => {
      const result = getAllTarotZodiacs();
      expect(result[0].carta).toBe('O Louco');
      expect(result[0].arcano).toBe(0);
    });

    it('contains O Mundo as last item', () => {
      const result = getAllTarotZodiacs();
      expect(result[result.length - 1].carta).toBe('O Mundo');
      expect(result[result.length - 1].arcano).toBe(21);
    });

    it('each item has all required fields', () => {
      const result = getAllTarotZodiacs();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('carta');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('grau_zodiacal');
      }
    });
  });

  // ─── getAllArcanos ─────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of all arcano numbers', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('returns sorted ascending numbers', () => {
      const result = getAllArcanos();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });

    it('starts with 0 and ends with 21', () => {
      const result = getAllArcanos();
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(21);
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

    it('returns false for non-integer values', () => {
      expect(hasTarotZodiac(5.5)).toBe(false);
    });
  });

  // ─── getMappingByCarta ────────────────────────────────────────────────────

  describe('getMappingByCarta', () => {
    it('returns mapping for O Louco', () => {
      const result = getMappingByCarta('O Louco');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(0);
      expect(result!.signo).toBe('Aquário');
    });

    it('returns mapping for A Estrela', () => {
      const result = getMappingByCarta('A Estrela');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(17);
    });

    it('returns mapping for O Sol', () => {
      const result = getMappingByCarta('O Sol');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe(19);
    });

    it('returns null for unknown card', () => {
      expect(getMappingByCarta('Carta Inexistente')).toBeNull();
    });

    it('is case-sensitive', () => {
      expect(getMappingByCarta('o louco')).toBeNull();
      expect(getMappingByCarta('O LOUCO')).toBeNull();
    });
  });

  // ─── getTarotZodiacByElement ───────────────────────────────────────────────

  describe('getTarotZodiacByElement', () => {
    it('returns Fogo elements', () => {
      const result = getTarotZodiacByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Fogo');
      }
    });

    it('returns Água elements', () => {
      const result = getTarotZodiacByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Água');
      }
    });

    it('returns Terra elements', () => {
      const result = getTarotZodiacByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Terra');
      }
    });

    it('returns Ar elements', () => {
      const result = getTarotZodiacByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Ar');
      }
    });

    it('returns empty array for unknown element', () => {
      const result = getTarotZodiacByElement('Éter');
      expect(result).toEqual([]);
    });

    it('returns sorted by arcano number', () => {
      const result = getTarotZodiacByElement('Fogo');
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].arcano).toBeLessThan(result[i + 1].arcano);
      }
    });
  });

  // ─── getTarotZodiacBySigno ────────────────────────────────────────────────

  describe('getTarotZodiacBySigno', () => {
    it('returns mappings for Aquário', () => {
      const result = getTarotZodiacBySigno('Aquário');
      expect(result.length).toBe(2); // O Louco and A Estrela
      expect(result[0].carta).toBe('O Louco');
      expect(result[1].carta).toBe('A Estrela');
    });

    it('returns mappings for Leão', () => {
      const result = getTarotZodiacBySigno('Leão');
      expect(result.length).toBe(2); // A Força and O Sol
      expect(result[0].carta).toBe('A Força');
      expect(result[1].carta).toBe('O Sol');
    });

    it('returns empty array for unknown sign', () => {
      const result = getTarotZodiacBySigno('Orion');
      expect(result).toEqual([]);
    });

    it('is case-sensitive', () => {
      const result = getTarotZodiacBySigno('aquário');
      expect(result).toEqual([]);
    });
  });

  // ─── TAROT_ZODIAC_MAPPINGS constant ────────────────────────────────────────

  describe('TAROT_ZODIAC_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_ZODIAC_MAPPINGS)).toBe(true);
    });

    it('has 22 entries (0-21)', () => {
      expect(Object.keys(TAROT_ZODIAC_MAPPINGS).length).toBe(22);
    });

    it('has all arcano numbers from 0 to 21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TAROT_ZODIAC_MAPPINGS).toHaveProperty(String(i));
      }
    });

    it('contains key Major Arcana cards', () => {
      expect(TAROT_ZODIAC_MAPPINGS[0].carta).toBe('O Louco');
      expect(TAROT_ZODIAC_MAPPINGS[1].carta).toBe('O Mago');
      expect(TAROT_ZODIAC_MAPPINGS[11].carta).toBe('A Força');
      expect(TAROT_ZODIAC_MAPPINGS[21].carta).toBe('O Mundo');
    });
  });

  // ─── Interface completeness ───────────────────────────────────────────────

  describe('TarotZodiacMapping interface completeness', () => {
    it('includes all required fields', () => {
      const mapping = TAROT_ZODIAC_MAPPINGS[0];
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('carta');
      expect(mapping).toHaveProperty('signo');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('grau_zodiacal');
    });

    it('arcano field matches the key', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TAROT_ZODIAC_MAPPINGS[i].arcano).toBe(i);
      }
    });

    it('elemento field contains valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar'];
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('significado_espiritual field is non-empty', () => {
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('distributes across all four elements', () => {
      const fogo = getTarotZodiacByElement('Fogo');
      const agua = getTarotZodiacByElement('Água');
      const terra = getTarotZodiacByElement('Terra');
      const ar = getTarotZodiacByElement('Ar');

      expect(fogo.length).toBeGreaterThan(0);
      expect(agua.length).toBeGreaterThan(0);
      expect(terra.length).toBeGreaterThan(0);
      expect(ar.length).toBeGreaterThan(0);

      // Total should be 22
      expect(fogo.length + agua.length + terra.length + ar.length).toBe(22);
    });

    it('has proper fire element count', () => {
      const fogo = getTarotZodiacByElement('Fogo');
      // Fire: O Imperador(4), A Roda(10), A Força(11), A Temperança(14), A Torre(16), O Sol(19), O Julgamento(20)
      expect(fogo.length).toBe(7);
    });

    it('has proper water element count', () => {
      const agua = getTarotZodiacByElement('Água');
      // Water: A Sacerdotisa(2), O Carro(7), O Enforcado(12), A Morte(13), A Lua(18)
      expect(agua.length).toBe(5);
    });

    it('has proper earth element count', () => {
      const terra = getTarotZodiacByElement('Terra');
      // Earth: A Imperatriz(3), O Papa(5), O Eremita(9), O Diabo(15), O Mundo(21)
      expect(terra.length).toBe(5);
    });

    it('has proper air element count', () => {
      const ar = getTarotZodiacByElement('Ar');
      // Air: O Louco(0), O Mago(1), Os Enamorados(6), A Justiça(8), A Estrela(17)
      expect(ar.length).toBe(5);
    });
  });

  // ─── Zodiac sign distribution ──────────────────────────────────────────────

  describe('Zodiac sign distribution', () => {
    it('includes planetary rulers', () => {
      const planetarySigns = ['Mercúrio', 'Lua', 'Vênus', 'Júpiter', 'Marte', 'Netuno', 'Plutão', 'Saturno'];
      let foundPlanetary = 0;
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        if (planetarySigns.includes(mapping.signo)) {
          foundPlanetary++;
        }
      }
      expect(foundPlanetary).toBe(8);
    });

    it('includes traditional zodiac signs', () => {
      const zodiacSigns = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
      let foundZodiac = 0;
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        if (zodiacSigns.includes(mapping.signo)) {
          foundZodiac++;
        }
      }
      expect(foundZodiac).toBe(14);
    });

    it('Aquário appears twice (O Louco and A Estrela)', () => {
      const aquario = getTarotZodiacBySigno('Aquário');
      expect(aquario.length).toBe(2);
    });

    it('Leão appears twice (A Força and O Sol)', () => {
      const leao = getTarotZodiacBySigno('Leão');
      expect(leao.length).toBe(2);
    });
  });

  // ─── Roundtrip consistency ─────────────────────────────────────────────────

  describe('Roundtrip consistency', () => {
    it('getTarotZodiac and getZodiacTarot are inverse operations', () => {
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        const arcano = getZodiacTarot(mapping.signo);
        expect(arcano).not.toBeNull();
        const reverse = getTarotZodiac(arcano!);
        expect(reverse!.signo).toBe(mapping.signo);
      }
    });

    it('getAllArcanos contains all valid arcano numbers for getTarotZodiac', () => {
      const allArcanos = getAllArcanos();
      for (const arcano of allArcanos) {
        const result = getTarotZodiac(arcano);
        expect(result).not.toBeNull();
      }
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('handles arcano 0 correctly', () => {
      const result = getTarotZodiac(0);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('O Louco');
      expect(result!.arcano).toBe(0);
    });

    it('handles arcano 21 correctly', () => {
      const result = getTarotZodiac(21);
      expect(result).not.toBeNull();
      expect(result!.carta).toBe('O Mundo');
      expect(result!.arcano).toBe(21);
    });

    it('rejects float values', () => {
      expect(getTarotZodiac(0.5)).toBeNull();
      expect(getTarotZodiac(10.99)).toBeNull();
    });

    it('rejects string input', () => {
      expect(getTarotZodiac(NaN)).toBeNull();
    });
  });

  // ─── Data integrity ───────────────────────────────────────────────────────

  describe('Data integrity', () => {
    it('each card name is unique', () => {
      const names = getAllTarotZodiacs().map(m => m.carta);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('each arcano maps to one sign', () => {
      const signCounts: Record<string, number> = {};
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        signCounts[mapping.signo] = (signCounts[mapping.signo] || 0) + 1;
      }
      // Some signs appear twice (Aquário, Leão)
      const duplicates = Object.entries(signCounts).filter(([, count]) => count > 1);
      expect(duplicates.length).toBe(2);
    });

    it('spiritual meaning field contains meaningful content', () => {
      for (const mapping of Object.values(TAROT_ZODIAC_MAPPINGS)) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });
  });
});