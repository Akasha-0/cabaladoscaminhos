/**
 * Number Mysticism Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getNumberMysticism,
  getAllNumberMysticism,
  getNumbersByElement,
  getNumbersByOrixa,
  getNumbersBySephirah,
  getNumbersByPlaneta,
} from '@/lib/correlation/number-mysticism';
import type { NumberMysticism } from '@/lib/correlation/number-mysticism';

describe('Number Mysticism Correlation', () => {
  describe('getNumberMysticism', () => {
    it('should return correct mapping for number 1 (Kether/Exu)', () => {
      const result = getNumberMysticism(1);
      expect(result.numero).toBe(1);
      expect(result.significado).toContain('Iniciador');
      expect(result.sephirah_correspondente).toBe('Kether');
      expect(result.orixa_associado).toContain('Exu');
      expect(result.elemento).toBe('Fogo');
      expect(result.planeta_regente).toBe('Sol');
      expect(result.energia_caracteristica).toContain('pioneirismo');
    });

    it('should return correct mapping for number 2 (Chokmah/Ibeji)', () => {
      const result = getNumberMysticism(2);
      expect(result.numero).toBe(2);
      expect(result.significado).toContain('Diplomata');
      expect(result.sephirah_correspondente).toBe('Chokmah');
      expect(result.orixa_associado).toContain('Ibeji');
      expect(result.elemento).toBe('Água');
      expect(result.planeta_regente).toBe('Lua');
    });

    it('should return correct mapping for number 3 (Binah/Ogum)', () => {
      const result = getNumberMysticism(3);
      expect(result.numero).toBe(3);
      expect(result.significado).toContain('Comunicador');
      expect(result.sephirah_correspondente).toBe('Binah');
      expect(result.orixa_associado).toContain('Ogum');
      expect(result.elemento).toBe('Fogo');
      expect(result.planeta_regente).toBe('Marte');
    });

    it('should return correct mapping for number 4 (Chesed/Iemanjá)', () => {
      const result = getNumberMysticism(4);
      expect(result.numero).toBe(4);
      expect(result.significado).toContain('Construtor');
      expect(result.sephirah_correspondente).toBe('Chesed');
      expect(result.orixa_associado).toContain('Iemanjá');
      expect(result.elemento).toBe('Terra');
      expect(result.planeta_regente).toBe('Júpiter');
    });

    it('should return correct mapping for number 5 (Geburah/Oxum)', () => {
      const result = getNumberMysticism(5);
      expect(result.numero).toBe(5);
      expect(result.significado).toContain('Viajante');
      expect(result.sephirah_correspondente).toBe('Geburah');
      expect(result.orixa_associado).toContain('Oxum');
      expect(result.elemento).toBe('Água');
      expect(result.planeta_regente).toBe('Vênus');
    });

    it('should return correct mapping for number 6 (Tiphereth/Xangô)', () => {
      const result = getNumberMysticism(6);
      expect(result.numero).toBe(6);
      expect(result.significado).toContain('Conciliador');
      expect(result.sephirah_correspondente).toBe('Tiphereth');
      expect(result.orixa_associado).toContain('Xangô');
      expect(result.elemento).toBe('Fogo');
      expect(result.planeta_regente).toBe('Sol');
    });

    it('should return correct mapping for number 7 (Netzach/Iansã)', () => {
      const result = getNumberMysticism(7);
      expect(result.numero).toBe(7);
      expect(result.significado).toContain('Filósofo');
      expect(result.sephirah_correspondente).toBe('Netzach');
      expect(result.orixa_associado).toContain('Iansã');
      expect(result.elemento).toBe('Ar');
      expect(result.planeta_regente).toBe('Urano');
    });

    it('should return correct mapping for number 8 (Hod/Oxalá)', () => {
      const result = getNumberMysticism(8);
      expect(result.numero).toBe(8);
      expect(result.significado).toContain('Executivo');
      expect(result.sephirah_correspondente).toBe('Hod');
      expect(result.orixa_associado).toContain('Oxalá');
      expect(result.elemento).toBe('Ar');
      expect(result.planeta_regente).toBe('Saturno');
    });

    it('should return correct mapping for number 9 (Yesod/Ossá)', () => {
      const result = getNumberMysticism(9);
      expect(result.numero).toBe(9);
      expect(result.significado).toContain('Sábio');
      expect(result.sephirah_correspondente).toBe('Yesod');
      expect(result.orixa_associado).toContain('Ossá');
      expect(result.elemento).toBe('Água');
      expect(result.planeta_regente).toBe('Netuno');
    });

    it('should return correct mapping for number 10 (Malkuth/Ofun)', () => {
      const result = getNumberMysticism(10);
      expect(result.numero).toBe(10);
      expect(result.significado).toContain('Renovador');
      expect(result.sephirah_correspondente).toBe('Malkuth');
      expect(result.orixa_associado).toContain('Ofun');
      expect(result.elemento).toBe('Terra');
      expect(result.planeta_regente).toBe('Plutão');
    });

    it('should return correct mapping for number 11 (Master Number/Alafia)', () => {
      const result = getNumberMysticism(11);
      expect(result.numero).toBe(11);
      expect(result.significado).toContain('Canalizador');
      expect(result.sephirah_correspondente).toContain('Kether');
      expect(result.orixa_associado).toContain('Alafia');
      expect(result.elemento).toBe('Éter');
      expect(result.planeta_regente).toBe('Netuno');
    });

    it('should return correct mapping for number 12 (Ejilsebora)', () => {
      const result = getNumberMysticism(12);
      expect(result.numero).toBe(12);
      expect(result.significado).toContain('Justiça');
      expect(result.sephirah_correspondente).toBe('Geburah');
      expect(result.orixa_associado).toContain('Ejilsebora');
      expect(result.elemento).toBe('Fogo');
      expect(result.planeta_regente).toBe('Marte');
    });

    it('should return correct mapping for number 13 (Olobón)', () => {
      const result = getNumberMysticism(13);
      expect(result.numero).toBe(13);
      expect(result.significado).toContain('Evolução');
      expect(result.sephirah_correspondente).toBe('Malkuth');
      expect(result.orixa_associado).toContain('Olobón');
      expect(result.elemento).toBe('Terra');
      expect(result.planeta_regente).toBe('Saturno');
    });

    it('should throw error for number 0', () => {
      expect(() => getNumberMysticism(0)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for negative numbers', () => {
      expect(() => getNumberMysticism(-1)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for number greater than 13', () => {
      expect(() => getNumberMysticism(14)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for very large numbers', () => {
      expect(() => getNumberMysticism(100)).toThrow('Número fora do intervalo válido');
    });
  });

  describe('getAllNumberMysticism', () => {
    it('should return all 13 number mappings', () => {
      const result = getAllNumberMysticism();
      expect(result).toHaveLength(13);
    });

    it('should return mappings sorted by numero', () => {
      const result = getAllNumberMysticism();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('should include all required interface properties for each entry', () => {
      const result = getAllNumberMysticism();
      result.forEach((mysticism: NumberMysticism) => {
        expect(mysticism.numero).toBeDefined();
        expect(mysticism.significado).toBeDefined();
        expect(mysticism.sephirah_correspondente).toBeDefined();
        expect(mysticism.orixa_associado).toBeDefined();
        expect(mysticism.elemento).toBeDefined();
        expect(mysticism.planeta_regente).toBeDefined();
        expect(mysticism.energia_caracteristica).toBeDefined();
      });
    });

    it('should cover all basic elements (Fogo, Água, Terra, Ar, Éter)', () => {
      const result = getAllNumberMysticism();
      const elementos = result.map((m) => m.elemento);
      expect(elementos).toContain('Fogo');
      expect(elementos).toContain('Água');
      expect(elementos).toContain('Terra');
      expect(elementos).toContain('Ar');
      expect(elementos).toContain('Éter');
    });

    it('should have valid planet values for all numbers', () => {
      const result = getAllNumberMysticism();
      const planetasValidos = [
        'Sol', 'Lua', 'Marte', 'Júpiter', 'Vênus', 'Saturno',
        'Urano', 'Netuno', 'Plutão'
      ];
      result.forEach((m) => {
        expect(planetasValidos).toContain(m.planeta_regente);
      });
    });
  });

  describe('getNumbersByElement', () => {
    it('should return numbers with Fogo element', () => {
      const result = getNumbersByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.elemento).toBe('Fogo');
      });
      expect(result.map((m) => m.numero)).toContain(1);
      expect(result.map((m) => m.numero)).toContain(3);
      expect(result.map((m) => m.numero)).toContain(6);
    });

    it('should return numbers with Água element', () => {
      const result = getNumbersByElement('Água');
      result.forEach((m) => {
        expect(m.elemento).toBe('Água');
      });
      expect(result.map((m) => m.numero)).toContain(2);
      expect(result.map((m) => m.numero)).toContain(5);
      expect(result.map((m) => m.numero)).toContain(9);
    });

    it('should return numbers with Terra element', () => {
      const result = getNumbersByElement('Terra');
      result.forEach((m) => {
        expect(m.elemento).toBe('Terra');
      });
      expect(result.map((m) => m.numero)).toContain(4);
      expect(result.map((m) => m.numero)).toContain(10);
      expect(result.map((m) => m.numero)).toContain(13);
    });

    it('should return numbers with Ar element', () => {
      const result = getNumbersByElement('Ar');
      result.forEach((m) => {
        expect(m.elemento).toBe('Ar');
      });
      expect(result.map((m) => m.numero)).toContain(7);
      expect(result.map((m) => m.numero)).toContain(8);
    });

    it('should return numbers with Éter element', () => {
      const result = getNumbersByElement('Éter');
      result.forEach((m) => {
        expect(m.elemento).toBe('Éter');
      });
      expect(result.map((m) => m.numero)).toContain(11);
    });

    it('should return empty array for non-existent element', () => {
      const result = getNumbersByElement('inexistente');
      expect(result).toHaveLength(0);
    });

    it('should be case-insensitive', () => {
      const result1 = getNumbersByElement('fogo');
      const result2 = getNumbersByElement('FOGO');
      const result3 = getNumbersByElement('Fogo');
      expect(result1).toHaveLength(result2.length);
      expect(result2).toHaveLength(result3.length);
    });
  });

  describe('getNumbersByOrixa', () => {
    it('should return numbers associated with Oxalá', () => {
      const result = getNumbersByOrixa('Oxalá');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.orixa_associado).toContain('Oxalá');
      });
      expect(result.map((m) => m.numero)).toContain(8);
      expect(result.map((m) => m.numero)).toContain(10);
    });

    it('should return numbers associated with Xangô', () => {
      const result = getNumbersByOrixa('Xangô');
      result.forEach((m) => {
        expect(m.orixa_associado).toContain('Xangô');
      });
      expect(result.map((m) => m.numero)).toContain(6);
      expect(result.map((m) => m.numero)).toContain(12);
    });

    it('should return numbers associated with Iemanjá', () => {
      const result = getNumbersByOrixa('Iemanjá');
      result.forEach((m) => {
        expect(m.orixa_associado).toContain('Iemanjá');
      });
      expect(result.map((m) => m.numero)).toContain(4);
    });

    it('should return empty array for non-existent Orixá', () => {
      const result = getNumbersByOrixa('Iemanja');
      expect(result).toHaveLength(0);
    });

    it('should be case-insensitive', () => {
      const result1 = getNumbersByOrixa('exu');
      const result2 = getNumbersByOrixa('EXU');
      expect(result1).toHaveLength(result2.length);
    });
  });

  describe('getNumbersBySephirah', () => {
    it('should return numbers for Kether sephirah', () => {
      const result = getNumbersBySephirah('Kether');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.sephirah_correspondente).toContain('Kether');
      });
      expect(result.map((m) => m.numero)).toContain(1);
      expect(result.map((m) => m.numero)).toContain(11);
    });

    it('should return numbers for Tiphereth sephirah', () => {
      const result = getNumbersBySephirah('Tiphereth');
      result.forEach((m) => {
        expect(m.sephirah_correspondente).toContain('Tiphereth');
      });
      expect(result.map((m) => m.numero)).toContain(6);
      expect(result.map((m) => m.numero)).toContain(11);
    });

    it('should return numbers for Malkuth sephirah', () => {
      const result = getNumbersBySephirah('Malkuth');
      result.forEach((m) => {
        expect(m.sephirah_correspondente).toContain('Malkuth');
      });
      expect(result.map((m) => m.numero)).toContain(10);
      expect(result.map((m) => m.numero)).toContain(13);
    });

    it('should return empty array for non-existent Sephirah', () => {
      const result = getNumbersBySephirah('inexistente');
      expect(result).toHaveLength(0);
    });
  });

  describe('getNumbersByPlaneta', () => {
    it('should return numbers ruled by Sol', () => {
      const result = getNumbersByPlaneta('Sol');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.planeta_regente).toContain('Sol');
      });
      expect(result.map((m) => m.numero)).toContain(1);
      expect(result.map((m) => m.numero)).toContain(6);
    });

    it('should return numbers ruled by Saturno', () => {
      const result = getNumbersByPlaneta('Saturno');
      result.forEach((m) => {
        expect(m.planeta_regente).toContain('Saturno');
      });
      expect(result.map((m) => m.numero)).toContain(8);
      expect(result.map((m) => m.numero)).toContain(13);
    });

    it('should return numbers ruled by Marte', () => {
      const result = getNumbersByPlaneta('Marte');
      result.forEach((m) => {
        expect(m.planeta_regente).toContain('Marte');
      });
      expect(result.map((m) => m.numero)).toContain(3);
      expect(result.map((m) => m.numero)).toContain(12);
    });

    it('should return empty array for non-existent planet', () => {
      const result = getNumbersByPlaneta('Nibiru');
      expect(result).toHaveLength(0);
    });
  });

  describe('Interface completeness', () => {
    it('should have all required fields in NumberMysticism interface', () => {
      const sample = getNumberMysticism(1);
      
      // Required fields per spec
      expect(sample).toHaveProperty('numero');
      expect(sample).toHaveProperty('significado');
      expect(sample).toHaveProperty('sephirah_correspondente');
      expect(sample).toHaveProperty('orixa_associado');
      expect(sample).toHaveProperty('elemento');
      expect(sample).toHaveProperty('planeta_regente');
      expect(sample).toHaveProperty('energia_caracteristica');
    });

    it('should have non-empty strings for all text fields', () => {
      const allMappings = getAllNumberMysticism();
      allMappings.forEach((m: NumberMysticism) => {
        expect(typeof m.numero).toBe('number');
        expect(typeof m.significado).toBe('string');
        expect(m.significado.length).toBeGreaterThan(0);
        expect(typeof m.sephirah_correspondente).toBe('string');
        expect(m.sephirah_correspondente.length).toBeGreaterThan(0);
        expect(typeof m.orixa_associado).toBe('string');
        expect(m.orixa_associado.length).toBeGreaterThan(0);
        expect(typeof m.elemento).toBe('string');
        expect(m.elemento.length).toBeGreaterThan(0);
        expect(typeof m.planeta_regente).toBe('string');
        expect(m.planeta_regente.length).toBeGreaterThan(0);
        expect(typeof m.energia_caracteristica).toBe('string');
        expect(m.energia_caracteristica.length).toBeGreaterThan(0);
      });
    });
  });
});