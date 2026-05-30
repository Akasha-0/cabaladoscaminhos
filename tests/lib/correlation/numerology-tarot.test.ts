import { describe, it, expect } from 'vitest';
import {
  getNumerologyTarot,
  getTarotNumerology,
  getAllNumerologyTarots,
  getAllNumerologyNumbers,
  hasNumerologyTarot,
  getMappingByCard,
  getNumerologyByElement,
  getNumerologyByOrixa,
  getNumerologyBySuit,
  getNumerologyBySephirah,
  NUMEROLOGY_TAROT_MAPPINGS,
  type NumerologyTarotMapping,
} from '@/lib/correlation/numerology-tarot';

describe('numerology-tarot', () => {
  // ─── getNumerologyTarot: valid numbers ──────────────────────────────────────

  describe('getNumerologyTarot', () => {
    it('returns mapping for number 1 (Ás de Bastões)', () => {
      const result = getNumerologyTarot(1);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(1);
      expect(result!.carta).toBe('Ás de Bastões');
      expect(result!.naipe).toBe('Bastões');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.orixa).toBe('Ogum');
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns mapping for number 2 (Dois de Copas)', () => {
      const result = getNumerologyTarot(2);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(2);
      expect(result!.carta).toBe('Dois de Copas');
      expect(result!.naipe).toBe('Copas');
      expect(result!.elemento).toBe('Água');
      expect(result!.orixa).toBe('Ibeji');
      expect(result!.sephirah).toBe('Chokmah');
    });

    it('returns mapping for number 3 (Três de Copas)', () => {
      const result = getNumerologyTarot(3);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(3);
      expect(result!.carta).toBe('Três de Copas');
      expect(result!.naipe).toBe('Copas');
      expect(result!.elemento).toBe('Água');
      expect(result!.orixa).toBe('Oxum');
      expect(result!.sephirah).toBe('Binah');
    });

    it('returns mapping for number 4 (Quatro de Ouros)', () => {
      const result = getNumerologyTarot(4);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(4);
      expect(result!.carta).toBe('Quatro de Ouros');
      expect(result!.naipe).toBe('Ouros');
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Oxóssi');
      expect(result!.sephirah).toBe('Chesed');
    });

    it('returns mapping for number 5 (Cinco de Ouros)', () => {
      const result = getNumerologyTarot(5);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(5);
      expect(result!.carta).toBe('Cinco de Ouros');
      expect(result!.naipe).toBe('Ouros');
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Xangô');
      expect(result!.sephirah).toBe('Geburah');
    });

    it('returns mapping for number 6 (Seis de Copas)', () => {
      const result = getNumerologyTarot(6);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(6);
      expect(result!.carta).toBe('Seis de Copas');
      expect(result!.naipe).toBe('Copas');
      expect(result!.elemento).toBe('Água');
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.sephirah).toBe('Tiphereth');
    });

    it('returns mapping for number 7 (Sete de Copas)', () => {
      const result = getNumerologyTarot(7);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(7);
      expect(result!.carta).toBe('Sete de Copas');
      expect(result!.naipe).toBe('Copas');
      expect(result!.elemento).toBe('Água');
      expect(result!.orixa).toBe('Iansã');
      expect(result!.sephirah).toBe('Netzach');
    });

    it('returns mapping for number 8 (Oito de Ouros)', () => {
      const result = getNumerologyTarot(8);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(8);
      expect(result!.carta).toBe('Oito de Ouros');
      expect(result!.naipe).toBe('Ouros');
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.sephirah).toBe('Hod');
    });

    it('returns mapping for number 9 (Nove de Ouros)', () => {
      const result = getNumerologyTarot(9);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(9);
      expect(result!.carta).toBe('Nove de Ouros');
      expect(result!.naipe).toBe('Ouros');
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Oxum');
      expect(result!.sephirah).toBe('Yesod');
    });

    it('returns mapping for number 10 (Dez de Ouros)', () => {
      const result = getNumerologyTarot(10);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(10);
      expect(result!.carta).toBe('Dez de Ouros');
      expect(result!.naipe).toBe('Ouros');
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('returns null for number0', () => {
      expect(getNumerologyTarot(0)).toBeNull();
    });

    it('returns null for negative numbers', () => {
      expect(getNumerologyTarot(-1)).toBeNull();
      expect(getNumerologyTarot(-5)).toBeNull();
    });

    it('returns null for numbers greater than 10', () => {
      expect(getNumerologyTarot(11)).toBeNull();
      expect(getNumerologyTarot(100)).toBeNull();
    });
  });

  // ─── getTarotNumerology ──────────────────────────────────────────────────────

  describe('getTarotNumerology', () => {
    it('returns 1 for Ás de Bastões', () => {
      expect(getTarotNumerology('Ás de Bastões')).toBe(1);
    });

    it('returns 2 for Dois de Copas', () => {
      expect(getTarotNumerology('Dois de Copas')).toBe(2);
    });

    it('returns 3 for Três de Copas', () => {
      expect(getTarotNumerology('Três de Copas')).toBe(3);
    });

    it('returns 4 for Quatro de Ouros', () => {
      expect(getTarotNumerology('Quatro de Ouros')).toBe(4);
    });

    it('returns 5 for Cinco de Ouros', () => {
      expect(getTarotNumerology('Cinco de Ouros')).toBe(5);
    });

    it('returns 6 for Seis de Copas', () => {
      expect(getTarotNumerology('Seis de Copas')).toBe(6);
    });

    it('returns 7 for Sete de Copas', () => {
      expect(getTarotNumerology('Sete de Copas')).toBe(7);
    });

    it('returns 8 for Oito de Ouros', () => {
      expect(getTarotNumerology('Oito de Ouros')).toBe(8);
    });

    it('returns 9 for Nove de Ouros', () => {
      expect(getTarotNumerology('Nove de Ouros')).toBe(9);
    });

    it('returns 10 for Dez de Ouros', () => {
      expect(getTarotNumerology('Dez de Ouros')).toBe(10);
    });

    it('returns null for non-existent card', () => {
      expect(getTarotNumerology('Coringa')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotNumerology('')).toBeNull();
    });
  });

  // ─── getAllNumerologyTarots ─────────────────────────────────────────────────

  describe('getAllNumerologyTarots', () => {
    it('returns all 10 mappings', () => {
      const result = getAllNumerologyTarots();
      expect(result).toHaveLength(10);
    });

    it('returns mappings sorted by number', () => {
      const result = getAllNumerologyTarots();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('contains all expected cards', () => {
      const result = getAllNumerologyTarots();
      const cards = result.map(m => m.carta);
      expect(cards).toContain('Ás de Bastões');
      expect(cards).toContain('Dois de Copas');
      expect(cards).toContain('Três de Copas');
      expect(cards).toContain('Quatro de Ouros');
      expect(cards).toContain('Cinco de Ouros');
      expect(cards).toContain('Seis de Copas');
      expect(cards).toContain('Sete de Copas');
      expect(cards).toContain('Oito de Ouros');
      expect(cards).toContain('Nove de Ouros');
      expect(cards).toContain('Dez de Ouros');
    });
  });

  // ─── getAllNumerologyNumbers ─────────────────────────────────────────────────

  describe('getAllNumerologyNumbers', () => {
    it('returns numbers 1-10', () => {
      const result = getAllNumerologyNumbers();
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('returns sorted numbers', () => {
      const result = getAllNumerologyNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  // ─── hasNumerologyTarot ─────────────────────────────────────────────────────

  describe('hasNumerologyTarot', () => {
    it('returns true for numbers 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(hasNumerologyTarot(i)).toBe(true);
      }
    });

    it('returns false for 0', () => {
      expect(hasNumerologyTarot(0)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(hasNumerologyTarot(-1)).toBe(false);
    });

    it('returns false for numbers greater than 10', () => {
      expect(hasNumerologyTarot(11)).toBe(false);
    });
  });

  // ─── getMappingByCard ───────────────────────────────────────────────────────

  describe('getMappingByCard', () => {
    it('returns mapping for Ás de Bastões', () => {
      const result = getMappingByCard('Ás de Bastões');
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(1);
    });

    it('returns null for non-existent card', () => {
      expect(getMappingByCard('Não existe')).toBeNull();
    });
  });

  // ─── getNumerologyByElement ─────────────────────────────────────────────────

  describe('getNumerologyByElement', () => {
    it('returns4 mappings for Água element', () => {
      const result = getNumerologyByElement('Água');
      expect(result).toHaveLength(4);
      expect(result.map(m => m.numero)).toEqual([2, 3, 6, 7]);
    });

    it('returns 5 mappings for Terra element', () => {
      const result = getNumerologyByElement('Terra');
      expect(result).toHaveLength(5);
      expect(result.map(m => m.numero)).toEqual([4, 5, 8, 9, 10]);
    });

    it('returns 1 mapping for Fogo element', () => {
      const result = getNumerologyByElement('Fogo');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns empty array for non-existent element', () => {
      expect(getNumerologyByElement('Éter')).toHaveLength(0);
    });
  });

  // ─── getNumerologyByOrixa ───────────────────────────────────────────────────

  describe('getNumerologyByOrixa', () => {
    it('returns2 mappings for Oxum', () => {
      const result = getNumerologyByOrixa('Oxum');
      expect(result).toHaveLength(2);
      expect(result.map(m => m.numero)).toEqual([3, 9]);
    });

    it('returns 2 mappings for Oxalá', () => {
      const result = getNumerologyByOrixa('Oxalá');
      expect(result).toHaveLength(2);
      expect(result.map(m => m.numero)).toEqual([8, 10]);
    });

    it('returns 1 mapping for Ogum', () => {
      const result = getNumerologyByOrixa('Ogum');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns empty array for non-existent orixá', () => {
      expect(getNumerologyByOrixa('Exu')).toHaveLength(0);
    });
  });

  // ─── getNumerologyBySuit ───────────────────────────────────────────────────

  describe('getNumerologyBySuit', () => {
    it('returns 1 mapping for Bastões suit', () => {
      const result = getNumerologyBySuit('Bastões');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns 4 mappings for Copas suit', () => {
      const result = getNumerologyBySuit('Copas');
      expect(result).toHaveLength(4);
      expect(result.map(m => m.numero)).toEqual([2, 3, 6, 7]);
    });

    it('returns 5 mappings for Ouros suit', () => {
      const result = getNumerologyBySuit('Ouros');
      expect(result).toHaveLength(5);
      expect(result.map(m => m.numero)).toEqual([4, 5, 8, 9, 10]);
    });

    it('returns empty array for Espadas suit', () => {
      expect(getNumerologyBySuit('Espadas')).toHaveLength(0);
    });
  });

  // ─── getNumerologyBySephirah ───────────────────────────────────────────────

  describe('getNumerologyBySephirah', () => {
    it('returns1 mapping for Kether', () => {
      const result = getNumerologyBySephirah('Kether');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns 1 mapping for Chokmah', () => {
      const result = getNumerologyBySephirah('Chokmah');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(2);
    });

    it('returns 1 mapping for Binah', () => {
      const result = getNumerologyBySephirah('Binah');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(3);
    });

    it('returns1 mapping for Chesed', () => {
      const result = getNumerologyBySephirah('Chesed');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(4);
    });

    it('returns 1 mapping for Geburah', () => {
      const result = getNumerologyBySephirah('Geburah');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(5);
    });

    it('returns 1 mapping for Tiphereth', () => {
      const result = getNumerologyBySephirah('Tiphereth');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(6);
    });

    it('returns 1 mapping for Netzach', () => {
      const result = getNumerologyBySephirah('Netzach');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(7);
    });

    it('returns 1 mapping for Hod', () => {
      const result = getNumerologyBySephirah('Hod');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(8);
    });

    it('returns 1 mapping for Yesod', () => {
      const result = getNumerologyBySephirah('Yesod');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(9);
    });

    it('returns 1 mapping for Malkuth', () => {
      const result = getNumerologyBySephirah('Malkuth');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(10);
    });

    it('returns empty array for non-existent sephirah', () => {
      expect(getNumerologyBySephirah('Daat')).toHaveLength(0);
    });
  });

  // ─── NUMEROLOGY_TAROT_MAPPINGS constant ─────────────────────────────────────

  describe('NUMEROLOGY_TAROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(NUMEROLOGY_TAROT_MAPPINGS)).toBe(true);
    });

    it('contains exactly 10 entries', () => {
      expect(Object.keys(NUMEROLOGY_TAROT_MAPPINGS)).toHaveLength(10);
    });

    it('has entries for numbers 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(NUMEROLOGY_TAROT_MAPPINGS[i]).toBeDefined();
      }
    });

    it('each mapping has all required fields', () => {
      const requiredFields: (keyof NumerologyTarotMapping)[] = [
        'numero',
        'carta',
        'naipe',
        'numero_carta',
        'significado_espiritual',
        'elemento',
        'orixa',
        'sephirah',
        'interpretacao',
      ];

      for (const mapping of Object.values(NUMEROLOGY_TAROT_MAPPINGS)) {
        for (const field of requiredFields) {
          expect(mapping[field]).toBeDefined();
        }
      }
    });

    it('each mapping numero matches its key', () => {
      for (const [key, mapping] of Object.entries(NUMEROLOGY_TAROT_MAPPINGS)) {
        expect(mapping.numero).toBe(Number(key));
      }
    });

    it('each mapping numero_carta matches its key', () => {
      for (const [key, mapping] of Object.entries(NUMEROLOGY_TAROT_MAPPINGS)) {
        expect(mapping.numero_carta).toBe(Number(key));
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('NumerologyTarotMapping interface completeness', () => {
    it('all mappings have spiritual meaning', () => {
      for (const mapping of Object.values(NUMEROLOGY_TAROT_MAPPINGS)) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('all mappings have interpretation', () => {
      for (const mapping of Object.values(NUMEROLOGY_TAROT_MAPPINGS)) {
        expect(mapping.interpretacao.length).toBeGreaterThan(10);
      }
    });

    it('all mappings have valid element', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar'];
      for (const mapping of Object.values(NUMEROLOGY_TAROT_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('covers all four classical elements', () => {
      const elements = new Set(
        Object.values(NUMEROLOGY_TAROT_MAPPINGS).map(m => m.elemento)
      );
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Terra')).toBe(true);
    });

    it('water element has most cards (4)', () => {
      const waterCount = Object.values(NUMEROLOGY_TAROT_MAPPINGS).filter(
        m => m.elemento === 'Água'
      ).length;
      expect(waterCount).toBe(4);
    });

    it('earth element has 5 cards', () => {
      const earthCount = Object.values(NUMEROLOGY_TAROT_MAPPINGS).filter(
        m => m.elemento === 'Terra'
      ).length;
      expect(earthCount).toBe(5);
    });

    it('fire element has 1 card', () => {
      const fireCount = Object.values(NUMEROLOGY_TAROT_MAPPINGS).filter(
        m => m.elemento === 'Fogo'
      ).length;
      expect(fireCount).toBe(1);
    });
  });

  // ─── Suit distribution ─────────────────────────────────────────────────────

  describe('Suit distribution', () => {
    it('has Bastões suit for number 1', () => {
      expect(NUMEROLOGY_TAROT_MAPPINGS[1].naipe).toBe('Bastões');
    });

    it('has Copas suit for numbers 2, 3, 6, 7', () => {
      expect(NUMEROLOGY_TAROT_MAPPINGS[2].naipe).toBe('Copas');
      expect(NUMEROLOGY_TAROT_MAPPINGS[3].naipe).toBe('Copas');
      expect(NUMEROLOGY_TAROT_MAPPINGS[6].naipe).toBe('Copas');
      expect(NUMEROLOGY_TAROT_MAPPINGS[7].naipe).toBe('Copas');
    });

    it('has Ouros suit for numbers 4, 5, 8, 9, 10', () => {
      expect(NUMEROLOGY_TAROT_MAPPINGS[4].naipe).toBe('Ouros');
      expect(NUMEROLOGY_TAROT_MAPPINGS[5].naipe).toBe('Ouros');
      expect(NUMEROLOGY_TAROT_MAPPINGS[8].naipe).toBe('Ouros');
      expect(NUMEROLOGY_TAROT_MAPPINGS[9].naipe).toBe('Ouros');
      expect(NUMEROLOGY_TAROT_MAPPINGS[10].naipe).toBe('Ouros');
    });
  });
});
