import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getTarotByArcano,
  getArcanoByNumber,
  getElementByNumber,
  getChakraByNumber,
  getNumerologiaByNumber,
  getFrequencyByNumber,
  getNumeroByArcano,
  getAllTarotTarots,
  getAllArcanos,
  getTarotsByElement,
  getTarotsByChakra,
  getTarotsByNumerologia,
  getTarotsByFrequency,
  hasTarotTarot,
  getTarotsByOrixa,
  getTarotsBySephirah,
  getSimbolismoByArcano,
  getSignificadoByArcano,
  getPlanetaByArcano,
  getDiaSemanaByArcano,
  TAROT_TAROT_MAP,
  TODOS_ARCANOS_MAIORES,
  TODOS_ELEMENTOS,
  SOLFEGGIO_FREQUENCIES,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot: valid numbers ─────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mapping for number 0', () => {
      const result = getTarotTarot(0);
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for number 1', () => {
      const result = getTarotTarot(1);
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for number 2', () => {
      const result = getTarotTarot(2);
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
    });

    it('returns mapping for number 3', () => {
      const result = getTarotTarot(3);
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
    });

    it('returns mapping for number 4', () => {
      const result = getTarotTarot(4);
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.numero_carta).toBe(4);
    });

    it('returns mapping for number 5', () => {
      const result = getTarotTarot(5);
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.numero_carta).toBe(5);
    });

    it('returns mapping for number 6', () => {
      const result = getTarotTarot(6);
      expect(result?.arcano).toBe('Os Enamorados');
      expect(result?.numero_carta).toBe(6);
    });

    it('returns mapping for number 7', () => {
      const result = getTarotTarot(7);
      expect(result?.arcano).toBe('O Carro');
      expect(result?.numero_carta).toBe(7);
    });

    it('returns mapping for number 8', () => {
      const result = getTarotTarot(8);
      expect(result?.arcano).toBe('A Justiça');
      expect(result?.numero_carta).toBe(8);
    });

    it('returns mapping for number 9', () => {
      const result = getTarotTarot(9);
      expect(result?.arcano).toBe('O Eremita');
      expect(result?.numero_carta).toBe(9);
    });

    it('returns mapping for number 10', () => {
      const result = getTarotTarot(10);
      expect(result?.arcano).toBe('A Roda da Fortuna');
      expect(result?.numero_carta).toBe(10);
    });

    it('returns mapping for number 11', () => {
      const result = getTarotTarot(11);
      expect(result?.arcano).toBe('A Força');
      expect(result?.numero_carta).toBe(11);
    });

    it('returns mapping for number 12', () => {
      const result = getTarotTarot(12);
      expect(result?.arcano).toBe('O Enforcado');
      expect(result?.numero_carta).toBe(12);
    });

    it('returns mapping for number 13', () => {
      const result = getTarotTarot(13);
      expect(result?.arcano).toBe('A Morte');
      expect(result?.numero_carta).toBe(13);
    });

    it('returns mapping for number 14', () => {
      const result = getTarotTarot(14);
      expect(result?.arcano).toBe('A Temperança');
      expect(result?.numero_carta).toBe(14);
    });

    it('returns mapping for number 15', () => {
      const result = getTarotTarot(15);
      expect(result?.arcano).toBe('O Diabo');
      expect(result?.numero_carta).toBe(15);
    });

    it('returns mapping for number 16', () => {
      const result = getTarotTarot(16);
      expect(result?.arcano).toBe('A Torre');
      expect(result?.numero_carta).toBe(16);
    });

    it('returns mapping for number 17', () => {
      const result = getTarotTarot(17);
      expect(result?.arcano).toBe('A Estrela');
      expect(result?.numero_carta).toBe(17);
    });

    it('returns mapping for number 18', () => {
      const result = getTarotTarot(18);
      expect(result?.arcano).toBe('A Lua');
      expect(result?.numero_carta).toBe(18);
    });

    it('returns mapping for number 19', () => {
      const result = getTarotTarot(19);
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
    });

    it('returns mapping for number 20', () => {
      const result = getTarotTarot(20);
      expect(result?.arcano).toBe('O Julgamento');
      expect(result?.numero_carta).toBe(20);
    });

    it('returns mapping for number 21', () => {
      const result = getTarotTarot(21);
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.numero_carta).toBe(21);
    });

    it('returns null for number22', () => {
      expect(getTarotTarot(22)).toBeNull();
    });

    it('returns null for negative numbers', () => {
      expect(getTarotTarot(-1)).toBeNull();
    });
  });

  // ─── getTarotByArcano ────────────────────────────────────────────────────────

  describe('getTarotByArcano', () => {
    it('returns mapping for O Louco', () => {
      const result = getTarotByArcano('O Louco');
      expect(result?.numero_carta).toBe(0);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotByArcano('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for A Sacerdotisa', () => {
      const result = getTarotByArcano('A Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
    });

    it('returns mapping for O Sol', () => {
      const result = getTarotByArcano('O Sol');
      expect(result?.numero_carta).toBe(19);
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotByArcano('O Mundo');
      expect(result?.numero_carta).toBe(21);
    });

    it('returns null for non-existent arcano', () => {
      expect(getTarotByArcano('Non Existent')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getTarotByArcano('o mago')?.numero_carta).toBe(1);
      expect(getTarotByArcano('O MAGO')?.numero_carta).toBe(1);
      expect(getTarotByArcano('O SOL')?.numero_carta).toBe(19);
    });
  });

  // ─── getArcanoByNumber ───────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns arcano name for valid numbers', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(10)).toBe('A Roda da Fortuna');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid numbers', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getElementByNumber ───────────────────────────────────────────────────────

  describe('getElementByNumber', () => {
    it('returns element for valid numbers', () => {
      expect(getElementByNumber(0)).toBe('Ar');
      expect(getElementByNumber(1)).toBe('Ar');
      expect(getElementByNumber(2)).toBe('Água');
      expect(getElementByNumber(3)).toBe('Terra');
      expect(getElementByNumber(4)).toBe('Fogo');
    });

    it('returns null for invalid numbers', () => {
      expect(getElementByNumber(22)).toBeNull();
      expect(getElementByNumber(-1)).toBeNull();
    });
  });

  // ─── getChakraByNumber ───────────────────────────────────────────────────────

  describe('getChakraByNumber', () => {
    it('returns chakra for valid numbers', () => {
      expect(getChakraByNumber(0)).toBe(7);
      expect(getChakraByNumber(1)).toBe(5);
      expect(getChakraByNumber(2)).toBe(6);
    });

    it('returns null for invalid numbers', () => {
      expect(getChakraByNumber(22)).toBeNull();
      expect(getChakraByNumber(-1)).toBeNull();
    });
  });

  // ─── getNumerologiaByNumber ──────────────────────────────────────────────────

  describe('getNumerologiaByNumber', () => {
    it('returns numerology for valid numbers', () => {
      expect(getNumerologiaByNumber(0)).toBe(0);
      expect(getNumerologiaByNumber(1)).toBe(1);
      expect(getNumerologiaByNumber(2)).toBe(2);
      expect(getNumerologiaByNumber(11)).toBe(11);
    });

    it('returns null for invalid numbers', () => {
      expect(getNumerologiaByNumber(22)).toBeNull();
      expect(getNumerologiaByNumber(-1)).toBeNull();
    });
  });

  // ─── getFrequencyByNumber ────────────────────────────────────────────────────

  describe('getFrequencyByNumber', () => {
    it('returns frequency for valid numbers', () => {
      expect(getFrequencyByNumber(0)).toBe(417);
      expect(getFrequencyByNumber(1)).toBe(396);
      expect(getFrequencyByNumber(2)).toBe(528);
    });

    it('returns null for invalid numbers', () => {
      expect(getFrequencyByNumber(22)).toBeNull();
      expect(getFrequencyByNumber(-1)).toBeNull();
    });
  });

  // ─── getNumeroByArcano ────────────────────────────────────────────────────────

  describe('getNumeroByArcano', () => {
    it('returns card number for valid arcano', () => {
      expect(getNumeroByArcano('O Louco')).toBe(0);
      expect(getNumeroByArcano('O Mago')).toBe(1);
      expect(getNumeroByArcano('O Sol')).toBe(19);
      expect(getNumeroByArcano('O Mundo')).toBe(21);
    });

    it('returns null for non-existent arcano', () => {
      expect(getNumeroByArcano('Non Existent')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getNumeroByArcano('o mago')).toBe(1);
      expect(getNumeroByArcano('O MAGO')).toBe(1);
    });
  });

  // ─── getAllTarotTarots ───────────────────────────────────────────────────────

  describe('getAllTarotTarots', () => {
    it('returns array with all 22 mappings', () => {
      const results = getAllTarotTarots();
      expect(results).toHaveLength(22);
    });

    it('returns mappings sorted by numero_carta', () => {
      const results = getAllTarotTarots();
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].numero_carta).toBeLessThan(results[i + 1].numero_carta);
      }
    });

    it('includes all expected arcano names', () => {
      const results = getAllTarotTarots();
      const arcanoNames = results.map((r) => r.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('A Sacerdotisa');
      expect(arcanoNames).toContain('A Imperatriz');
      expect(arcanoNames).toContain('O Imperador');
      expect(arcanoNames).toContain('O Hierofante');
      expect(arcanoNames).toContain('Os Enamorados');
      expect(arcanoNames).toContain('O Carro');
      expect(arcanoNames).toContain('A Justiça');
      expect(arcanoNames).toContain('O Eremita');
      expect(arcanoNames).toContain('A Roda da Fortuna');
      expect(arcanoNames).toContain('A Força');
      expect(arcanoNames).toContain('O Enforcado');
      expect(arcanoNames).toContain('A Morte');
      expect(arcanoNames).toContain('A Temperança');
      expect(arcanoNames).toContain('O Diabo');
      expect(arcanoNames).toContain('A Torre');
      expect(arcanoNames).toContain('A Estrela');
      expect(arcanoNames).toContain('A Lua');
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('O Julgamento');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('each mapping has all required fields', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('chakra_nome');
        expect(mapping).toHaveProperty('numerologia');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('simbolismo');
        expect(mapping).toHaveProperty('significado_espiritual');
 expect(Array.isArray(mapping.simbolismo)).toBe(true);
        expect(mapping.simbolismo.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array with all 22 arcano names', () => {
      const results = getAllArcanos();
      expect(results).toHaveLength(22);
    });

    it('returns arcano names sorted by card number', () => {
      const results = getAllArcanos();
      expect(results[0]).toBe('O Louco');
      expect(results[1]).toBe('O Mago');
      expect(results[21]).toBe('O Mundo');
    });
  });

  // ─── hasTarotTarot ───────────────────────────────────────────────────────────

  describe('hasTarotTarot', () => {
    it('returns true for valid numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(hasTarotTarot(i)).toBe(true);
      }
    });

    it('returns false for number22', () => {
      expect(hasTarotTarot(22)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(hasTarotTarot(-1)).toBe(false);
    });
  });

  // ─── getTarotsByElement ─────────────────────────────────────────────────────

  describe('getTarotsByElement', () => {
    it('returns cards for Fogo element', () => {
      const results = getTarotsByElement('Fogo');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.elemento).toBe('Fogo');
      }
    });

    it('returns cards for Água element', () => {
      const results = getTarotsByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.elemento).toBe('Água');
      }
    });

    it('returns cards for Ar element', () => {
      const results = getTarotsByElement('Ar');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.elemento).toBe('Ar');
      }
    });

    it('returns cards for Terra element', () => {
      const results = getTarotsByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.elemento).toBe('Terra');
      }
    });

    it('returns empty array for non-existent element', () => {
      expect(getTarotsByElement('Non Existent')).toHaveLength(0);
    });
  });

  // ─── getTarotsByChakra ───────────────────────────────────────────────────────

  describe('getTarotsByChakra', () => {
    it('returns cards for chakra 4', () => {
      const results = getTarotsByChakra(4);
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.chakra).toBe(4);
      }
    });

    it('returns cards for chakra 6', () => {
      const results = getTarotsByChakra(6);
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.chakra).toBe(6);
      }
    });

    it('returns empty array for non-existent chakra', () => {
      expect(getTarotsByChakra(10)).toHaveLength(0);
    });
  });

  // ─── getTarotsByNumerologia ─────────────────────────────────────────────────

  describe('getTarotsByNumerologia', () => {
    it('returns cards for numerology 1', () => {
      const results = getTarotsByNumerologia(1);
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.numerologia).toBe(1);
      }
    });

    it('returns cards for master number 11', () => {
      const results = getTarotsByNumerologia(11);
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.numerologia).toBe(11);
      }
    });

    it('returns empty array for non-existent numerology', () => {
      expect(getTarotsByNumerologia(99)).toHaveLength(0);
    });
  });

  // ─── getTarotsByFrequency ───────────────────────────────────────────────────

  describe('getTarotsByFrequency', () => {
    it('returns cards for frequency 528', () => {
      const results = getTarotsByFrequency(528);
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.frequencia).toBe(528);
      }
    });

    it('returns empty array for non-existent frequency', () => {
      expect(getTarotsByFrequency(999)).toHaveLength(0);
    });
  });

  // ─── getTarotsByOrixa ────────────────────────────────────────────────────────

  describe('getTarotsByOrixa', () => {
    it('returns cards for Oxum', () => {
      const results = getTarotsByOrixa('Oxum');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.orixa?.toLowerCase()).toBe('oxum');
      }
    });

    it('returns cards for Ogum', () => {
      const results = getTarotsByOrixa('Ogum');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.orixa?.toLowerCase()).toBe('ogum');
      }
    });

    it('is case-insensitive', () => {
      const results = getTarotsByOrixa('OXUM');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for non-existent orixá', () => {
      expect(getTarotsByOrixa('Non Existent')).toHaveLength(0);
    });
  });

  // ─── getTarotsBySephirah ─────────────────────────────────────────────────────

  describe('getTarotsBySephirah', () => {
    it('returns cards for Aleph', () => {
      const results = getTarotsBySephirah('Aleph');
      expect(results.length).toBeGreaterThan(0);
      for (const m of results) {
        expect(m.sephirah?.toLowerCase()).toBe('aleph');
      }
    });

    it('is case-insensitive', () => {
      const results = getTarotsBySephirah('ALEPH');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for non-existent sephirah', () => {
      expect(getTarotsBySephirah('Non Existent')).toHaveLength(0);
    });
  });

  // ─── getSimbolismoByArcano ──────────────────────────────────────────────────

  describe('getSimbolismoByArcano', () => {
    it('returns symbolism array for valid arcano', () => {
      const result = getSimbolismoByArcano('O Mago');
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns null for non-existent arcano', () => {
      expect(getSimbolismoByArcano('Non Existent')).toBeNull();
    });

    it('is case-insensitive', () => {
      const result = getSimbolismoByArcano('O MAGO');
      expect(result).not.toBeNull();
    });
  });

  // ─── getSignificadoByArcano ────────────────────────────────────────────────

  describe('getSignificadoByArcano', () => {
    it('returns spiritual meaning for valid arcano', () => {
      const result = getSignificadoByArcano('O Sol');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns null for non-existent arcano', () => {
      expect(getSignificadoByArcano('Non Existent')).toBeNull();
    });
  });

  // ─── getPlanetaByArcano ─────────────────────────────────────────────────────

  describe('getPlanetaByArcano', () => {
    it('returns planet for valid arcano', () => {
      const result = getPlanetaByArcano('O Sol');
      expect(result).toBe('Sol');
    });

    it('returns null for non-existent arcano', () => {
      expect(getPlanetaByArcano('Non Existent')).toBeNull();
    });
  });

  // ─── getDiaSemanaByArcano ───────────────────────────────────────────────────

  describe('getDiaSemanaByArcano', () => {
    it('returns day of week for valid arcano', () => {
      const result = getDiaSemanaByArcano('O Sol');
      expect(result).toBe('Domingo');
    });

    it('returns null for non-existent arcano', () => {
      expect(getDiaSemanaByArcano('Non Existent')).toBeNull();
    });
  });

  // ─── TAROT_TAROT_MAP constant ───────────────────────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('has 22 entries', () => {
      expect(Object.keys(TAROT_TAROT_MAP).length).toBe(22);
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });

    it('has keys 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(i in TAROT_TAROT_MAP).toBe(true);
      }
    });

    it('each mapping is frozen', () => {
      for (const mapping of Object.values(TAROT_TAROT_MAP)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── TODOS_ARCANOS_MAIORES constant ─────────────────────────────────────────

  describe('TODOS_ARCANOS_MAIORES', () => {
    it('has 22 entries', () => {
      expect(TODOS_ARCANOS_MAIORES).toHaveLength(22);
    });

    it('contains numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TODOS_ARCANOS_MAIORES).toContain(i);
      }
    });

    it('is sorted', () => {
      for (let i = 0; i < TODOS_ARCANOS_MAIORES.length - 1; i++) {
        expect(TODOS_ARCANOS_MAIORES[i]).toBeLessThan(TODOS_ARCANOS_MAIORES[i + 1]);
      }
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_MAIORES)).toBe(true);
    });
  });

  // ─── TODOS_ELEMENTOS constant ───────────────────────────────────────────────

  describe('TODOS_ELEMENTOS', () => {
    it('has expected elements', () => {
      expect(TODOS_ELEMENTOS).toContain('Fogo');
      expect(TODOS_ELEMENTOS).toContain('Água');
      expect(TODOS_ELEMENTOS).toContain('Ar');
      expect(TODOS_ELEMENTOS).toContain('Terra');
      expect(TODOS_ELEMENTOS).toContain('Éter');
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TODOS_ELEMENTOS)).toBe(true);
    });
  });

  // ─── SOLFEGGIO_FREQUENCIES constant ─────────────────────────────────────────

  describe('SOLFEGGIO_FREQUENCIES', () => {
    it('has expected frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('is frozen', () => {
      expect(Object.isFrozen(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all arcano have symbolism', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.simbolismo.length).toBeGreaterThan(0);
      }
    });

    it('all arcano have spiritual meaning', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('all arcano have chakra_nome', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.chakra_nome.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('covers all four classical elements', () => {
      const results = getAllTarotTarots();
      const elements = new Set(results.map((m) => m.elemento));
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
      expect(elements.has('Terra')).toBe(true);
    });
  });

  // ─── Chakra distribution ─────────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('all arcano have valid chakra (1-7)', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.chakra).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra).toBeLessThanOrEqual(7);
      }
    });

    it('covers multiple chakras', () => {
      const results = getAllTarotTarots();
      const chakras = new Set(results.map((m) => m.chakra));
      expect(chakras.size).toBeGreaterThan(3);
    });
  });

  // ─── Frequency distribution ─────────────────────────────────────────────────

  describe('Frequency distribution', () => {
    it('all arcano have valid frequency', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
      }
    });
  });
});
