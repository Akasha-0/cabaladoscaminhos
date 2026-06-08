import { describe, it, expect } from 'vitest';
import {
  getNumerologyChakra,
  getAllNumerologyChakras,
  getChakraNumerology,
  getChakraByNumero,
  getElementByNumero,
  getChakraPosicaoByNumero,
  NUMERO_CHAKRA_MAP,
  type NumerologyChakraMapping,
  type ChakraName,
} from '@/lib/correlation/numerology-chakra';

describe('numerology-chakra', () => {
  // ─── NUMERO_CHAKRA_MAP: all 9 numbers ─────────────────────────────────
  describe('NUMERO_CHAKRA_MAP', () => {
    it('contains all 9 numbers (1-9)', () => {
      for (let i = 1; i <= 9; i++) {
        expect(NUMERO_CHAKRA_MAP[i]).toBeDefined();
      }
      expect(Object.keys(NUMERO_CHAKRA_MAP)).toHaveLength(9);
    });

    it('number 1 maps to Muladhara (Root Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[1];
      expect(mapping.chakra).toBe('Muladhara');
      expect(mapping.numero).toBe(1);
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.chakra_posicao).toBe('1º Chakra - Raiz');
      expect(mapping.cor).toBe('Vermelho');
      expect(mapping.sephirah).toBe('Kether');
      expect(mapping.orixa).toBe('Omolu');
    });

    it('number 2 maps to Svadhisthana (Sacral Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[2];
      expect(mapping.chakra).toBe('Svadhisthana');
      expect(mapping.numero).toBe(2);
      expect(mapping.elemento).toBe('Água');
      expect(mapping.chakra_posicao).toBe('2º Chakra - Sacral');
      expect(mapping.cor).toBe('Laranja');
      expect(mapping.sephirah).toBe('Chokmah');
      expect(mapping.orixa).toBe('Iemanjá');
    });

    it('number 3 maps to Manipura (Solar Plexus Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[3];
      expect(mapping.chakra).toBe('Manipura');
      expect(mapping.numero).toBe(3);
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.chakra_posicao).toBe('3º Chakra - Plexo Solar');
      expect(mapping.cor).toBe('Amarelo');
      expect(mapping.sephirah).toBe('Binah');
      expect(mapping.orixa).toBe('Ogum');
    });

    it('number 4 maps to Manipura (Solar Plexus Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[4];
      expect(mapping.chakra).toBe('Manipura');
      expect(mapping.numero).toBe(4);
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.chakra_posicao).toBe('3º Chakra - Plexo Solar');
      expect(mapping.cor).toBe('Amarelo');
      expect(mapping.sephirah).toBe('Chesed');
      expect(mapping.orixa).toBe('Iemanjá');
    });

    it('number 5 maps to Anahata (Heart Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[5];
      expect(mapping.chakra).toBe('Anahata');
      expect(mapping.numero).toBe(5);
      expect(mapping.elemento).toBe('Ar');
      expect(mapping.chakra_posicao).toBe('4º Chakra - Cardíaco');
      expect(mapping.cor).toBe('Verde');
      expect(mapping.sephirah).toBe('Geburah');
      expect(mapping.orixa).toBe('Oxum');
    });

    it('number 6 maps to Anahata (Heart Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[6];
      expect(mapping.chakra).toBe('Anahata');
      expect(mapping.numero).toBe(6);
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.chakra_posicao).toBe('4º Chakra - Cardíaco');
      expect(mapping.cor).toBe('Verde/Rosa');
      expect(mapping.sephirah).toBe('Tiphereth');
      expect(mapping.orixa).toBe('Xangô');
    });

    it('number 7 maps to Ajna (Third Eye Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[7];
      expect(mapping.chakra).toBe('Ajna');
      expect(mapping.numero).toBe(7);
      expect(mapping.elemento).toBe('Éter');
      expect(mapping.chakra_posicao).toBe('6º Chakra - Frontal');
      expect(mapping.cor).toBe('Índigo');
      expect(mapping.sephirah).toBe('Netzach');
      expect(mapping.orixa).toBe('Iansã');
    });

    it('number 8 maps to Vishuddha (Throat Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[8];
      expect(mapping.chakra).toBe('Vishuddha');
      expect(mapping.numero).toBe(8);
      expect(mapping.elemento).toBe('Éter');
      expect(mapping.chakra_posicao).toBe('5º Chakra - Laríngeo');
      expect(mapping.cor).toBe('Azul Claro');
      expect(mapping.sephirah).toBe('Hod');
      expect(mapping.orixa).toBe('Oxalá');
    });

    it('number 9 maps to Sahasrara (Crown Chakra)', () => {
      const mapping = NUMERO_CHAKRA_MAP[9];
      expect(mapping.chakra).toBe('Sahasrara');
      expect(mapping.numero).toBe(9);
      expect(mapping.elemento).toBe('Éter');
      expect(mapping.chakra_posicao).toBe('7º Chakra - Coronário');
      expect(mapping.cor).toBe('Violeta/Branco');
      expect(mapping.sephirah).toBe('Yesod');
      expect(mapping.orixa).toBe('Orunmilá');
    });

    it('each mapping has complete spiritual structure', () => {
      for (let i = 1; i <= 9; i++) {
        const mapping = NUMERO_CHAKRA_MAP[i];
        expect(mapping.numero).toBe(i);
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.chakra_posicao).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.cor).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
        expect(mapping.qualidade_energetica).toBeTruthy();
        expect(mapping.afirmacao).toBeTruthy();
      }
    });

    it('each mapping has valid element', () => {
      const validElements = ['Terra', 'Água', 'Fogo', 'Ar', 'Éter'];
      for (let i = 1; i <= 9; i++) {
        const mapping = NUMERO_CHAKRA_MAP[i];
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('each mapping has valid chakra name', () => {
      const validChakras: ChakraName[] = [
        'Muladhara',
        'Svadhisthana',
        'Manipura',
        'Anahata',
        'Vishuddha',
        'Ajna',
        'Sahasrara',
      ];
      for (let i = 1; i <= 9; i++) {
        const mapping = NUMERO_CHAKRA_MAP[i];
        expect(validChakras).toContain(mapping.chakra);
      }
    });
  });

  // ─── getNumerologyChakra: primary lookup function ──────────────────────
  describe('getNumerologyChakra', () => {
    it('returns correct mapping for number 1', () => {
      const result = getNumerologyChakra(1);
      expect(result.numero).toBe(1);
      expect(result.chakra).toBe('Muladhara');
      expect(result.orixa).toBe('Omolu');
    });

    it('returns correct mapping for number 5', () => {
      const result = getNumerologyChakra(5);
      expect(result.numero).toBe(5);
      expect(result.chakra).toBe('Anahata');
      expect(result.elemento).toBe('Ar');
    });

    it('returns correct mapping for number 9', () => {
      const result = getNumerologyChakra(9);
      expect(result.numero).toBe(9);
      expect(result.chakra).toBe('Sahasrara');
      expect(result.qualidade_energetica).toContain('Iluminado');
    });

    it('throws error for number 0', () => {
      expect(() => getNumerologyChakra(0)).toThrow('Número fora do intervalo válido (1-9)');
    });

    it('throws error for negative numbers', () => {
      expect(() => getNumerologyChakra(-1)).toThrow('Número fora do intervalo válido (1-9)');
    });

    it('throws error for numbers greater than 9', () => {
      expect(() => getNumerologyChakra(10)).toThrow('Número fora do intervalo válido (1-9)');
    });

    it('throws error for non-integer numbers', () => {
      expect(() => getNumerologyChakra(3.5)).toThrow('Número fora do intervalo válido (1-9)');
    });
  });

  // ─── getAllNumerologyChakras ───────────────────────────────────────────
  describe('getAllNumerologyChakras', () => {
    it('returns array of 9 mappings', () => {
      const all = getAllNumerologyChakras();
      expect(all).toHaveLength(9);
    });

    it('returns array sorted by numero ascending', () => {
      const all = getAllNumerologyChakras();
      for (let i = 0; i < all.length - 1; i++) {
        expect(all[i].numero).toBeLessThan(all[i + 1].numero);
      }
    });

    it('returns array containing all numbers 1-9', () => {
      const all = getAllNumerologyChakras();
      const numbers = all.map((m) => m.numero);
      for (let i = 1; i <= 9; i++) {
        expect(numbers).toContain(i);
      }
    });

    it('each returned mapping has complete structure', () => {
      const all = getAllNumerologyChakras();
      all.forEach((mapping) => {
        expect(mapping.numero).toBeTruthy();
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.afirmacao).toBeTruthy();
      });
    });
  });

  // ─── getChakraNumerology: reverse lookup by chakra ────────────────────
  describe('getChakraNumerology', () => {
    it('returns correct numbers for Muladhara', () => {
      const result = getChakraNumerology('Muladhara');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Muladhara');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(1);
    });

    it('returns correct numbers for Svadhisthana', () => {
      const result = getChakraNumerology('Svadhisthana');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Svadhisthana');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(2);
    });

    it('returns correct numbers for Manipura (3 and 4)', () => {
      const result = getChakraNumerology('Manipura');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Manipura');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(3);
      expect(numbers).toContain(4);
    });

    it('returns correct numbers for Anahata (5 and 6)', () => {
      const result = getChakraNumerology('Anahata');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Anahata');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(5);
      expect(numbers).toContain(6);
    });

    it('returns correct numbers for Ajna', () => {
      const result = getChakraNumerology('Ajna');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Ajna');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(7);
    });

    it('returns correct numbers for Vishuddha', () => {
      const result = getChakraNumerology('Vishuddha');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Vishuddha');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(8);
    });

    it('returns correct numbers for Sahasrara', () => {
      const result = getChakraNumerology('Sahasrara');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.chakra).toBe('Sahasrara');
      });
      const numbers = result.map((m) => m.numero);
      expect(numbers).toContain(9);
    });

    it('handles alternative chakra name formats', () => {
      const byPosition = getChakraNumerology('4º Cardíaco');
      expect(byPosition.length).toBeGreaterThan(0);
      expect(byPosition[0].chakra).toBe('Anahata');
    });

    it('returns empty array for unknown chakra', () => {
      const result = getChakraNumerology('UnknownChakra');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getChakraByNumero ─────────────────────────────────────────────────
  describe('getChakraByNumero', () => {
    it('returns correct chakra for number 1', () => {
      expect(getChakraByNumero(1)).toBe('Muladhara');
    });

    it('returns correct chakra for number 3', () => {
      expect(getChakraByNumero(3)).toBe('Manipura');
    });

    it('returns correct chakra for number 5', () => {
      expect(getChakraByNumero(5)).toBe('Anahata');
    });

    it('returns correct chakra for number 7', () => {
      expect(getChakraByNumero(7)).toBe('Ajna');
    });

    it('returns correct chakra for number 9', () => {
      expect(getChakraByNumero(9)).toBe('Sahasrara');
    });

    it('returns null for number 0', () => {
      expect(getChakraByNumero(0)).toBeNull();
    });

    it('returns null for numbers greater than 9', () => {
      expect(getChakraByNumero(10)).toBeNull();
    });
  });

  // ─── getElementByNumero ────────────────────────────────────────────────
  describe('getElementByNumero', () => {
    it('returns correct element for number 1 (Terra)', () => {
      expect(getElementByNumero(1)).toBe('Terra');
    });

    it('returns correct element for number 2 (Água)', () => {
      expect(getElementByNumero(2)).toBe('Água');
    });

    it('returns correct element for number 3 (Fogo)', () => {
      expect(getElementByNumero(3)).toBe('Fogo');
    });

    it('returns correct element for number 5 (Ar)', () => {
      expect(getElementByNumero(5)).toBe('Ar');
    });

    it('returns correct element for number 7 (Éter)', () => {
      expect(getElementByNumero(7)).toBe('Éter');
    });

    it('returns correct element for number 8 (Éter)', () => {
      expect(getElementByNumero(8)).toBe('Éter');
    });

    it('returns null for number 0', () => {
      expect(getElementByNumero(0)).toBeNull();
    });

    it('returns null for numbers greater than 9', () => {
      expect(getElementByNumero(10)).toBeNull();
    });
  });

  // ─── getChakraPosicaoByNumero ──────────────────────────────────────────
  describe('getChakraPosicaoByNumero', () => {
    it('returns correct position for number 1', () => {
      expect(getChakraPosicaoByNumero(1)).toBe('1º Chakra - Raiz');
    });

    it('returns correct position for number 2', () => {
      expect(getChakraPosicaoByNumero(2)).toBe('2º Chakra - Sacral');
    });

    it('returns correct position for number 3', () => {
      expect(getChakraPosicaoByNumero(3)).toBe('3º Chakra - Plexo Solar');
    });

    it('returns correct position for number 4', () => {
      expect(getChakraPosicaoByNumero(4)).toBe('3º Chakra - Plexo Solar');
    });

    it('returns correct position for number 5', () => {
      expect(getChakraPosicaoByNumero(5)).toBe('4º Chakra - Cardíaco');
    });

    it('returns correct position for number 6', () => {
      expect(getChakraPosicaoByNumero(6)).toBe('4º Chakra - Cardíaco');
    });

    it('returns correct position for number 7', () => {
      expect(getChakraPosicaoByNumero(7)).toBe('6º Chakra - Frontal');
    });

    it('returns correct position for number 8', () => {
      expect(getChakraPosicaoByNumero(8)).toBe('5º Chakra - Laríngeo');
    });

    it('returns correct position for number 9', () => {
      expect(getChakraPosicaoByNumero(9)).toBe('7º Chakra - Coronário');
    });

    it('returns null for number 0', () => {
      expect(getChakraPosicaoByNumero(0)).toBeNull();
    });

    it('returns null for numbers greater than 9', () => {
      expect(getChakraPosicaoByNumero(10)).toBeNull();
    });
  });

  // ─── Chakra element distribution ──────────────────────────────────────
  describe('Chakra element distribution', () => {
    it('numbers 1-2 are lower chakras (Terra, Água)', () => {
      expect(getElementByNumero(1)).toBe('Terra');
      expect(getElementByNumero(2)).toBe('Água');
    });

    it('numbers 3-4 are middle chakras (Fogo, Terra)', () => {
      expect(getElementByNumero(3)).toBe('Fogo');
      expect(getElementByNumero(4)).toBe('Terra');
    });

    it('numbers 5-6 are heart chakra range (Ar, Fogo)', () => {
      expect(getElementByNumero(5)).toBe('Ar');
      expect(getElementByNumero(6)).toBe('Fogo');
    });

    it('numbers 7-9 are upper chakras (Éter)', () => {
      expect(getElementByNumero(7)).toBe('Éter');
      expect(getElementByNumero(8)).toBe('Éter');
      expect(getElementByNumero(9)).toBe('Éter');
    });
  });
});
