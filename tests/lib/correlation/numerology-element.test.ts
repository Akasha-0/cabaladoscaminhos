import { describe, it, expect } from 'vitest';
import {
  getNumerologyElement,
  getAllNumerologyElements,
  getElementNumerology,
  getElementByNumero,
  getEnergiaByNumero,
  NUMERO_ELEMENTO_MAP,
  type NumerologyElementMapping,
  type Elemento,
} from '@/lib/correlation/numerology-element';

describe('numerology-element', () => {
  // ─── NUMERO_ELEMENTO_MAP: all 13 numbers ──────────────────────────────
  describe('NUMERO_ELEMENTO_MAP', () => {
    it('contains all 13 numbers (1-13)', () => {
      for (let i = 1; i <= 13; i++) {
        expect(NUMERO_ELEMENTO_MAP[i]).toBeDefined();
      }
      expect(Object.keys(NUMERO_ELEMENTO_MAP)).toHaveLength(13);
    });

    it('number 1 maps to Fogo (Kether/Exu)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[1];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.numero).toBe(1);
      expect(mapping.sephirah).toBe('Kether');
      expect(mapping.orixa).toBe('Exu / Okaran');
      expect(mapping.arquétipo).toBe('O Iniciador / O Líder');
      expect(mapping.qualidade_energetica.tipo).toBe('Quente');
    });

    it('number 2 maps to Água (Chokmah/Ibeji)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[2];
      expect(mapping.elemento).toBe('Água');
      expect(mapping.sephirah).toBe('Chokmah');
      expect(mapping.orixa).toBe('Ibeji / Ejiokô');
      expect(mapping.qualidade_energetica.tipo).toBe('Frio');
    });

    it('number 3 maps to Fogo (Binah/Ogum)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[3];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.sephirah).toBe('Binah');
      expect(mapping.orixa).toBe('Ogum / Etaogundá');
    });

    it('number 4 maps to Terra (Chesed/Iemanjá)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[4];
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.sephirah).toBe('Chesed');
      expect(mapping.orixa).toBe('Iemanjá / Irosun');
      expect(mapping.qualidade_energetica.tipo).toBe('Quente');
    });

    it('number 5 maps to Água (Geburah/Oxum)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[5];
      expect(mapping.elemento).toBe('Água');
      expect(mapping.sephirah).toBe('Geburah');
      expect(mapping.orixa).toBe('Oxum / Oxé');
      expect(mapping.qualidade_energetica.tipo).toBe('Frio');
    });

    it('number 6 maps to Fogo (Tiphereth/Xangô)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[6];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.sephirah).toBe('Tiphereth');
      expect(mapping.orixa).toBe('Xangô / Obará');
      expect(mapping.qualidade_energetica.tipo).toBe('Quente');
    });

    it('number 7 maps to Ar (Netzach/Iansã)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[7];
      expect(mapping.elemento).toBe('Ar');
      expect(mapping.sephirah).toBe('Netzach');
      expect(mapping.orixa).toBe('Iansã / Odi');
      expect(mapping.qualidade_energetica.tipo).toBe('Neutro');
    });

    it('number 8 maps to Ar (Hod/Oxalá)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[8];
      expect(mapping.elemento).toBe('Ar');
      expect(mapping.sephirah).toBe('Hod');
      expect(mapping.orixa).toBe('Oxalá / EjiOníle');
      expect(mapping.qualidade_energetica.tipo).toBe('Neutro');
    });

    it('number 9 maps to Água (Yesod/Ossá)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[9];
      expect(mapping.elemento).toBe('Água');
      expect(mapping.sephirah).toBe('Yesod');
      expect(mapping.orixa).toBe('Ossá');
      expect(mapping.qualidade_energetica.tipo).toBe('Frio');
    });

    it('number 10 maps to Terra (Malkuth/Oxalá)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[10];
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.sephirah).toBe('Malkuth');
      expect(mapping.orixa).toBe('Oxalá / Ofun');
      expect(mapping.qualidade_energetica.tipo).toBe('Quente');
    });

    it('number 11 maps to Éter (Master Number)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[11];
      expect(mapping.elemento).toBe('Éter');
      expect(mapping.sephirah).toBe('Kether / Tiphereth');
      expect(mapping.orixa).toBe('Alafia / Orunmilá');
      expect(mapping.arquétipo).toBe('O Canalizador / O Desperto');
      expect(mapping.qualidade_energetica.tipo).toBe('Neutro');
    });

    it('number 12 maps to Fogo (Geburah/Xangô)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[12];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.sephirah).toBe('Geburah');
      expect(mapping.orixa).toBe('Xangô / Ejilsebora');
      expect(mapping.arquétipo).toBe('A Justiça / O Fogo Purificador');
      expect(mapping.qualidade_energetica.tipo).toBe('Quente');
    });

    it('number 13 maps to Terra (Malkuth/Nanã)', () => {
      const mapping = NUMERO_ELEMENTO_MAP[13];
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.sephirah).toBe('Malkuth');
      expect(mapping.orixa).toBe('Nanã / Omolu / Olobón');
      expect(mapping.arquétipo).toBe('A Evolução / A Morte e Renascimento');
      expect(mapping.qualidade_energetica.tipo).toBe('Quente');
    });

    it('each mapping has complete spiritual structure', () => {
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMERO_ELEMENTO_MAP[i];
        expect(mapping.numero).toBe(i);
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.qualidade_energetica.tipo).toBeTruthy();
        expect(mapping.qualidade_energetica.polaridade).toBeTruthy();
        expect(mapping.qualidade_energetica.vibração).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.arquétipo).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.chakra).toBeTruthy();
      }
    });

    it('each mapping has valid energy quality type', () => {
      const validTypes = ['Quente', 'Frio', 'Neutro'];
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMERO_ELEMENTO_MAP[i];
        expect(validTypes).toContain(mapping.qualidade_energetica.tipo);
      }
    });

    it('each mapping has valid polarity', () => {
      const validPolarities = ['Yang', 'Yin', 'Equilibrado'];
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMERO_ELEMENTO_MAP[i];
        expect(validPolarities).toContain(mapping.qualidade_energetica.polaridade);
      }
    });
  });

  // ─── getNumerologyElement: primary lookup function ───────────────────────
  describe('getNumerologyElement', () => {
    it('returns correct mapping for number 1', () => {
      const result = getNumerologyElement(1);
      expect(result.numero).toBe(1);
      expect(result.elemento).toBe('Fogo');
      expect(result.orixa).toBe('Exu / Okaran');
    });

    it('returns correct mapping for number 7', () => {
      const result = getNumerologyElement(7);
      expect(result.numero).toBe(7);
      expect(result.elemento).toBe('Ar');
      expect(result.orixa).toBe('Iansã / Odi');
    });

    it('returns correct mapping for number 11 (Master Number)', () => {
      const result = getNumerologyElement(11);
      expect(result.numero).toBe(11);
      expect(result.elemento).toBe('Éter');
      expect(result.arquétipo).toBe('O Canalizador / O Desperto');
    });

    it('returns correct mapping for number 13', () => {
      const result = getNumerologyElement(13);
      expect(result.numero).toBe(13);
      expect(result.elemento).toBe('Terra');
      expect(result.orixa).toBe('Nanã / Omolu / Olobón');
    });

    it('throws error for number 0', () => {
      expect(() => getNumerologyElement(0)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('throws error for negative numbers', () => {
      expect(() => getNumerologyElement(-1)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('throws error for numbers greater than 13', () => {
      expect(() => getNumerologyElement(14)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('throws error for non-integer numbers', () => {
      expect(() => getNumerologyElement(3.5)).toThrow('Número fora do intervalo válido (1-13)');
    });
  });

  // ─── getAllNumerologyElements ─────────────────────────────────────────────
  describe('getAllNumerologyElements', () => {
    it('returns array of 13 mappings', () => {
      const all = getAllNumerologyElements();
      expect(all).toHaveLength(13);
    });

    it('returns array sorted by numero ascending', () => {
      const all = getAllNumerologyElements();
      for (let i = 0; i < all.length - 1; i++) {
        expect(all[i].numero).toBeLessThan(all[i + 1].numero);
      }
    });

    it('returns array containing all numbers 1-13', () => {
      const all = getAllNumerologyElements();
      const numbers = all.map((m) => m.numero);
      for (let i = 1; i <= 13; i++) {
        expect(numbers).toContain(i);
      }
    });

    it('each returned mapping has complete structure', () => {
      const all = getAllNumerologyElements();
      all.forEach((mapping) => {
        expect(mapping.numero).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.arquétipo).toBeTruthy();
      });
    });
  });

  // ─── getElementNumerology: reverse lookup by element ─────────────────────
  describe('getElementNumerology', () => {
    it('returns correct numbers for Fogo', () => {
      const fogo = getElementNumerology('Fogo');
      expect(fogo.length).toBeGreaterThan(0);
      fogo.forEach((m) => {
        expect(m.elemento).toBe('Fogo');
      });
      const numbers = fogo.map((m) => m.numero);
      expect(numbers).toContain(1);
      expect(numbers).toContain(3);
      expect(numbers).toContain(6);
      expect(numbers).toContain(12);
    });

    it('returns correct numbers for Água', () => {
      const agua = getElementNumerology('Água');
      expect(agua.length).toBeGreaterThan(0);
      agua.forEach((m) => {
        expect(m.elemento).toBe('Água');
      });
      const numbers = agua.map((m) => m.numero);
      expect(numbers).toContain(2);
      expect(numbers).toContain(5);
      expect(numbers).toContain(9);
    });

    it('returns correct numbers for Ar', () => {
      const ar = getElementNumerology('Ar');
      expect(ar.length).toBeGreaterThan(0);
      ar.forEach((m) => {
        expect(m.elemento).toBe('Ar');
      });
      const numbers = ar.map((m) => m.numero);
      expect(numbers).toContain(7);
      expect(numbers).toContain(8);
    });

    it('returns correct numbers for Terra', () => {
      const terra = getElementNumerology('Terra');
      expect(terra.length).toBeGreaterThan(0);
      terra.forEach((m) => {
        expect(m.elemento).toBe('Terra');
      });
      const numbers = terra.map((m) => m.numero);
      expect(numbers).toContain(4);
      expect(numbers).toContain(10);
      expect(numbers).toContain(13);
    });

    it('returns correct numbers for Éter', () => {
      const eter = getElementNumerology('Éter');
      expect(eter.length).toBeGreaterThan(0);
      eter.forEach((m) => {
        expect(m.elemento).toBe('Éter');
      });
      const numbers = eter.map((m) => m.numero);
      expect(numbers).toContain(11);
    });

    it('is case-insensitive', () => {
      const upper = getElementNumerology('FOGO');
      const lower = getElementNumerology('fogo');
      const mixed = getElementNumerology('FoGo');
      expect(upper.length).toBe(lower.length);
      expect(lower.length).toBe(mixed.length);
    });

    it('handles whitespace in input', () => {
      const withSpace = getElementNumerology('  Ar  ');
      const withoutSpace = getElementNumerology('Ar');
      expect(withSpace.length).toBe(withoutSpace.length);
    });

    it('handles accented characters', () => {
      expect(getElementNumerology('Agua').length).toBeGreaterThan(0);
      expect(getElementNumerology('Eter').length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown elements', () => {
      expect(getElementNumerology('unknown')).toEqual([]);
      expect(getElementNumerology('')).toEqual([]);
    });
  });

  // ─── getElementByNumero ───────────────────────────────────────────────────
  describe('getElementByNumero', () => {
    it('returns correct element for each number', () => {
      expect(getElementByNumero(1)).toBe('Fogo');
      expect(getElementByNumero(2)).toBe('Água');
      expect(getElementByNumero(3)).toBe('Fogo');
      expect(getElementByNumero(4)).toBe('Terra');
      expect(getElementByNumero(5)).toBe('Água');
      expect(getElementByNumero(6)).toBe('Fogo');
      expect(getElementByNumero(7)).toBe('Ar');
      expect(getElementByNumero(8)).toBe('Ar');
      expect(getElementByNumero(9)).toBe('Água');
      expect(getElementByNumero(10)).toBe('Terra');
      expect(getElementByNumero(11)).toBe('Éter');
      expect(getElementByNumero(12)).toBe('Fogo');
      expect(getElementByNumero(13)).toBe('Terra');
    });

    it('returns null for invalid numbers', () => {
      expect(getElementByNumero(0)).toBeNull();
      expect(getElementByNumero(-1)).toBeNull();
      expect(getElementByNumero(14)).toBeNull();
    });
  });

  // ─── getEnergiaByNumero ───────────────────────────────────────────────────
  describe('getEnergiaByNumero', () => {
    it('returns correct energy type for each number', () => {
      expect(getEnergiaByNumero(1)).toBe('Quente');
      expect(getEnergiaByNumero(2)).toBe('Frio');
      expect(getEnergiaByNumero(4)).toBe('Quente');
      expect(getEnergiaByNumero(5)).toBe('Frio');
      expect(getEnergiaByNumero(7)).toBe('Neutro');
      expect(getEnergiaByNumero(11)).toBe('Neutro');
    });

    it('returns null for invalid numbers', () => {
      expect(getEnergiaByNumero(0)).toBeNull();
      expect(getEnergiaByNumero(14)).toBeNull();
    });
  });

  // ─── Element distribution analysis ───────────────────────────────────────
  describe('element distribution', () => {
    it('Fogo has the most numbers (4 numbers: 1, 3, 6, 12)', () => {
      const fogo = getElementNumerology('Fogo');
      const fogoNumbers = fogo.map((m) => m.numero);
      expect(fogoNumbers).toContain(1);
      expect(fogoNumbers).toContain(3);
      expect(fogoNumbers).toContain(6);
      expect(fogoNumbers).toContain(12);
      expect(fogo.length).toBe(4);
    });

    it('Água has 3 numbers (2, 5, 9)', () => {
      const agua = getElementNumerology('Água');
      const aguaNumbers = agua.map((m) => m.numero);
      expect(aguaNumbers).toContain(2);
      expect(aguaNumbers).toContain(5);
      expect(aguaNumbers).toContain(9);
      expect(agua.length).toBe(3);
    });

    it('Terra has 3 numbers (4, 10, 13)', () => {
      const terra = getElementNumerology('Terra');
      const terraNumbers = terra.map((m) => m.numero);
      expect(terraNumbers).toContain(4);
      expect(terraNumbers).toContain(10);
      expect(terraNumbers).toContain(13);
      expect(terra.length).toBe(3);
    });

    it('Ar has 2 numbers (7, 8)', () => {
      const ar = getElementNumerology('Ar');
      const arNumbers = ar.map((m) => m.numero);
      expect(arNumbers).toContain(7);
      expect(arNumbers).toContain(8);
      expect(ar.length).toBe(2);
    });

    it('Éter has 1 number (11 - Master Number)', () => {
      const eter = getElementNumerology('Éter');
      expect(eter.length).toBe(1);
      expect(eter[0].numero).toBe(11);
      expect(eter[0].arquétipo).toBe('O Canalizador / O Desperto');
    });
  });

  // ─── Integration with number-mysticism patterns ───────────────────────────
  describe('spiritual archetype integration', () => {
    it('Master Number 11 (Éter) connects Crown and Beauty sephirot', () => {
      const mapping = getNumerologyElement(11);
      expect(mapping.sephirah).toBe('Kether / Tiphereth');
      expect(mapping.elemento).toBe('Éter');
      expect(mapping.qualidade_energetica.polaridade).toBe('Equilibrado');
    });

    it('Transformation numbers (12, 13) have Quente energy for fire/earth', () => {
      const twelve = getNumerologyElement(12);
      const thirteen = getNumerologyElement(13);
      expect(twelve.qualidade_energetica.tipo).toBe('Quente');
      expect(thirteen.qualidade_energetica.tipo).toBe('Quente');
    });

    it('Initiation numbers (1, 7, 11) represent spiritual paths', () => {
      const one = getNumerologyElement(1);
      const seven = getNumerologyElement(7);
      const eleven = getNumerologyElement(11);
      expect(one.elemento).toBe('Fogo');
      expect(seven.elemento).toBe('Ar');
      expect(eleven.elemento).toBe('Éter');
    });

    it('Each element has consistent chakra alignment', () => {
      const fogo = getElementNumerology('Fogo');
      fogo.forEach((m) => {
        expect(['3º Plexo Solar', '4º Cardíaco']).toContain(m.chakra);
      });

      const agua = getElementNumerology('Água');
      agua.forEach((m) => {
        expect(['2º Sacro', '6º Frontal']).toContain(m.chakra);
      });

      const terra = getElementNumerology('Terra');
      terra.forEach((m) => {
        expect(m.chakra).toBe('1º Básico');
      });

      const ar = getElementNumerology('Ar');
      ar.forEach((m) => {
        expect(['4º Cardíaco', '5º Laríngeo']).toContain(m.chakra);
      });

      const eter = getElementNumerology('Éter');
      eter.forEach((m) => {
        expect(m.chakra).toBe('7º Coronário');
      });
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('NumerologyElementMapping type is exported', () => {
      const mapping: NumerologyElementMapping = {
        numero: 1,
        elemento: 'Fogo',
        qualidade_energetica: {
          tipo: 'Quente',
          polaridade: 'Yang',
          vibração: 'Test',
        },
        significado_espiritual: 'Test',
        arquétipo: 'Test',
        orixa: 'Test',
        sephirah: 'Test',
        chakra: 'Test',
      };
      expect(mapping.numero).toBe(1);
    });

    it('Elemento type accepts all valid elements', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      elements.forEach((el) => {
        const mapping = getElementNumerology(el);
        expect(Array.isArray(mapping)).toBe(true);
      });
    });
  });
});
