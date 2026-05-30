import { describe, it, expect } from 'vitest';
import {
  getNumerologyPlanet,
  getAllNumerologyPlanets,
  getPlanetNumerology,
  getPlanetByNumero,
  getElementByNumero,
  getNumerologyByPlanet,
  NUMERO_PLANETA_MAP,
  type NumerologyPlanetMapping,
  type Planeta,
} from '@/lib/correlation/numerology-planet';

describe('numerology-planet', () => {
  // ─── NUMERO_PLANETA_MAP: all 13 numbers ──────────────────────────────
  describe('NUMERO_PLANETA_MAP', () => {
    it('contains all 13 numbers (1-13)', () => {
      for (let i = 1; i <= 13; i++) {
        expect(NUMERO_PLANETA_MAP[i]).toBeDefined();
        expect(NUMERO_PLANETA_MAP[i].numero).toBe(i);
      }
    });

    it('number 1 maps to Sol (Fogo, Oxalá)', () => {
      const mapping = NUMERO_PLANETA_MAP[1];
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.orixa).toBe('Oxalá');
      expect(mapping.area_vida).toBe('Identidade e Propósito');
    });

    it('number 2 maps to Lua (Água, Iemanjá)', () => {
      const mapping = NUMERO_PLANETA_MAP[2];
      expect(mapping.planeta).toBe('Lua');
      expect(mapping.elemento).toBe('Água');
      expect(mapping.orixa).toBe('Iemanjá');
      expect(mapping.area_vida).toBe('Emocionalidade e Intuição');
    });

    it('number 3 maps to Júpiter (Fogo, Oxum)', () => {
      const mapping = NUMERO_PLANETA_MAP[3];
      expect(mapping.planeta).toBe('Júpiter');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.orixa).toBe('Oxum');
      expect(mapping.area_vida).toBe('Abundância e Conhecimento');
    });

    it('number 4 maps to Saturno (Terra, Xangô)', () => {
      const mapping = NUMERO_PLANETA_MAP[4];
      expect(mapping.planeta).toBe('Saturno');
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.orixa).toBe('Xangô');
      expect(mapping.area_vida).toBe('Estrutura e Realização');
    });

    it('number 5 maps to Mercúrio (Ar, Ogum)', () => {
      const mapping = NUMERO_PLANETA_MAP[5];
      expect(mapping.planeta).toBe('Mercúrio');
      expect(mapping.elemento).toBe('Ar');
      expect(mapping.orixa).toBe('Ogum');
      expect(mapping.area_vida).toBe('Comunicação e Liberdade');
    });

    it('number 6 maps to Vênus (Água, Oxum)', () => {
      const mapping = NUMERO_PLANETA_MAP[6];
      expect(mapping.planeta).toBe('Vênus');
      expect(mapping.elemento).toBe('Água');
      expect(mapping.orixa).toBe('Oxum');
      expect(mapping.area_vida).toBe('Amor e Harmonia');
    });

    it('number 7 maps to Netuno (Água, Iansã)', () => {
      const mapping = NUMERO_PLANETA_MAP[7];
      expect(mapping.planeta).toBe('Netuno');
      expect(mapping.elemento).toBe('Água');
      expect(mapping.orixa).toBe('Iansã');
      expect(mapping.area_vida).toBe('Espiritualidade e Sabedoria');
    });

    it('number 8 maps to Saturno (Terra, Oxalá)', () => {
      const mapping = NUMERO_PLANETA_MAP[8];
      expect(mapping.planeta).toBe('Saturno');
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.orixa).toBe('Oxalá');
      expect(mapping.area_vida).toBe('Autoridade e Poder');
    });

    it('number 9 maps to Marte (Fogo, Ogum)', () => {
      const mapping = NUMERO_PLANETA_MAP[9];
      expect(mapping.planeta).toBe('Marte');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.orixa).toBe('Ogum');
      expect(mapping.area_vida).toBe('Ação e Transformação');
    });

    it('number 10 maps to Lua (Água, Iemanjá)', () => {
      const mapping = NUMERO_PLANETA_MAP[10];
      expect(mapping.planeta).toBe('Lua');
      expect(mapping.elemento).toBe('Água');
      expect(mapping.orixa).toBe('Iemanjá');
      expect(mapping.area_vida).toBe('Renovação e Ciclos');
    });

    it('number 11 maps to Netuno (Éter, Master Number)', () => {
      const mapping = NUMERO_PLANETA_MAP[11];
      expect(mapping.planeta).toBe('Netuno');
      expect(mapping.elemento).toBe('Éter');
      expect(mapping.orixa).toBe('Alafia');
      expect(mapping.area_vida).toBe('Iluminação e Canalização');
    });

    it('number 12 maps to Júpiter (Fogo, Xangô)', () => {
      const mapping = NUMERO_PLANETA_MAP[12];
      expect(mapping.planeta).toBe('Júpiter');
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.orixa).toBe('Xangô');
      expect(mapping.area_vida).toBe('Serviço Sagrado e Fé');
    });

    it('number 13 maps to Saturno (Terra, Nanã)', () => {
      const mapping = NUMERO_PLANETA_MAP[13];
      expect(mapping.planeta).toBe('Saturno');
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.orixa).toBe('Nanã');
      expect(mapping.area_vida).toBe('Evolução e Renascimento');
    });

    it('each mapping has complete spiritual structure', () => {
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMERO_PLANETA_MAP[i];
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(mapping).toHaveProperty('area_vida');
        expect(mapping).toHaveProperty('orixa');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('each mapping has valid energy quality type', () => {
      const validTypes = ['Yang (Expressivo)', 'Yin (Receptivo)', 'Neutro (Equilibrado)'];
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMERO_PLANETA_MAP[i];
        expect(validTypes).toContain(mapping.qualidade_energetica.tipo);
        expect(typeof mapping.qualidade_energetica.vibração).toBe('string');
      }
    });

    it('each mapping has valid element', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMERO_PLANETA_MAP[i];
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── getNumerologyPlanet: primary lookup function ───────────────────────
  describe('getNumerologyPlanet', () => {
    it('returns correct mapping for valid numbers 1-13', () => {
      for (let i = 1; i <= 13; i++) {
        const result = getNumerologyPlanet(i);
        expect(result.numero).toBe(i);
        expect(result).toHaveProperty('planeta');
        expect(result).toHaveProperty('elemento');
      }
    });

    it('throws error for number less than 1', () => {
      expect(() => getNumerologyPlanet(0)).toThrow('Número fora do intervalo válido (1-13)');
      expect(() => getNumerologyPlanet(-1)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('throws error for number greater than 13', () => {
      expect(() => getNumerologyPlanet(14)).toThrow('Número fora do intervalo válido (1-13)');
      expect(() => getNumerologyPlanet(100)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('throws error for non-integer numbers', () => {
      expect(() => getNumerologyPlanet(1.5)).toThrow('Número fora do intervalo válido (1-13)');
      expect(() => getNumerologyPlanet(3.7)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('returns correct planet for number 1 (Sol)', () => {
      const result = getNumerologyPlanet(1);
      expect(result.planeta).toBe('Sol');
    });

    it('returns correct planet for number 9 (Marte)', () => {
      const result = getNumerologyPlanet(9);
      expect(result.planeta).toBe('Marte');
    });
  });

  // ─── getAllNumerologyPlanets ─────────────────────────────────────────────
  describe('getAllNumerologyPlanets', () => {
    it('returns array with exactly 13 entries', () => {
      const result = getAllNumerologyPlanets();
      expect(result).toHaveLength(13);
    });

    it('returns entries sorted by numero ascending', () => {
      const result = getAllNumerologyPlanets();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('returns entries with complete structure', () => {
      const result = getAllNumerologyPlanets();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(mapping).toHaveProperty('area_vida');
        expect(mapping).toHaveProperty('orixa');
      });
    });
  });

  // ─── getPlanetNumerology: reverse lookup by planet ─────────────────────
  describe('getPlanetNumerology', () => {
    it('returns record with planet keys', () => {
      const result = getPlanetNumerology();
      expect(result).toHaveProperty('Sol');
      expect(result).toHaveProperty('Lua');
      expect(result).toHaveProperty('Marte');
      expect(result).toHaveProperty('Mercúrio');
      expect(result).toHaveProperty('Júpiter');
      expect(result).toHaveProperty('Vênus');
      expect(result).toHaveProperty('Saturno');
      expect(result).toHaveProperty('Netuno');
    });

    it('Sol maps to number 1', () => {
      const result = getPlanetNumerology();
      expect(result.Sol).toContain(1);
    });

    it('Lua maps to numbers 2 and 10', () => {
      const result = getPlanetNumerology();
      expect(result.Lua).toContain(2);
      expect(result.Lua).toContain(10);
    });

    it('Saturno maps to numbers 4, 8, and 13', () => {
      const result = getPlanetNumerology();
      expect(result.Saturno).toContain(4);
      expect(result.Saturno).toContain(8);
      expect(result.Saturno).toContain(13);
    });

    it('each planet has at least one number', () => {
      const result = getPlanetNumerology();
      Object.values(result).forEach((numbers) => {
        expect(numbers.length).toBeGreaterThan(0);
      });
    });

    it('numbers are not duplicated within a planet', () => {
      const result = getPlanetNumerology();
      Object.values(result).forEach((numbers) => {
        const unique = new Set(numbers);
        expect(unique.size).toBe(numbers.length);
      });
    });
  });

  // ─── getPlanetByNumero ───────────────────────────────────────────────────
  describe('getPlanetByNumero', () => {
    it('returns correct planet for valid numbers', () => {
      expect(getPlanetByNumero(1)).toBe('Sol');
      expect(getPlanetByNumero(2)).toBe('Lua');
      expect(getPlanetByNumero(3)).toBe('Júpiter');
      expect(getPlanetByNumero(4)).toBe('Saturno');
      expect(getPlanetByNumero(5)).toBe('Mercúrio');
      expect(getPlanetByNumero(6)).toBe('Vênus');
      expect(getPlanetByNumero(7)).toBe('Netuno');
      expect(getPlanetByNumero(8)).toBe('Saturno');
      expect(getPlanetByNumero(9)).toBe('Marte');
      expect(getPlanetByNumero(10)).toBe('Lua');
      expect(getPlanetByNumero(11)).toBe('Netuno');
      expect(getPlanetByNumero(12)).toBe('Júpiter');
      expect(getPlanetByNumero(13)).toBe('Saturno');
    });

    it('returns null for invalid numbers', () => {
      expect(getPlanetByNumero(0)).toBeNull();
      expect(getPlanetByNumero(14)).toBeNull();
      expect(getPlanetByNumero(-1)).toBeNull();
    });
  });

  // ─── getElementByNumero ─────────────────────────────────────────────────
  describe('getElementByNumero', () => {
    it('returns correct element for valid numbers', () => {
      expect(getElementByNumero(1)).toBe('Fogo');
      expect(getElementByNumero(2)).toBe('Água');
      expect(getElementByNumero(3)).toBe('Fogo');
      expect(getElementByNumero(4)).toBe('Terra');
      expect(getElementByNumero(5)).toBe('Ar');
      expect(getElementByNumero(6)).toBe('Água');
      expect(getElementByNumero(7)).toBe('Água');
      expect(getElementByNumero(8)).toBe('Terra');
      expect(getElementByNumero(9)).toBe('Fogo');
      expect(getElementByNumero(10)).toBe('Água');
      expect(getElementByNumero(11)).toBe('Éter');
      expect(getElementByNumero(12)).toBe('Fogo');
      expect(getElementByNumero(13)).toBe('Terra');
    });

    it('returns null for invalid numbers', () => {
      expect(getElementByNumero(0)).toBeNull();
      expect(getElementByNumero(14)).toBeNull();
    });
  });

  // ─── getNumerologyByPlanet: filter by planet ───────────────────────────
  describe('getNumerologyByPlanet', () => {
    it('returns all numbers for Sol', () => {
      const result = getNumerologyByPlanet('Sol');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns all numbers for Lua', () => {
      const result = getNumerologyByPlanet('Lua');
      expect(result).toHaveLength(2);
      expect(result.map((m) => m.numero)).toContain(2);
      expect(result.map((m) => m.numero)).toContain(10);
    });

    it('returns all numbers for Saturno', () => {
      const result = getNumerologyByPlanet('Saturno');
      expect(result).toHaveLength(3);
      expect(result.map((m) => m.numero)).toContain(4);
      expect(result.map((m) => m.numero)).toContain(8);
      expect(result.map((m) => m.numero)).toContain(13);
    });

    it('handles case-insensitive planet names', () => {
      expect(getNumerologyByPlanet('sol').length).toBeGreaterThan(0);
      expect(getNumerologyByPlanet('SOL').length).toBeGreaterThan(0);
      expect(getNumerologyByPlanet('lua').length).toBeGreaterThan(0);
    });

    it('handles accented planet names', () => {
      expect(getNumerologyByPlanet('Júpiter').length).toBeGreaterThan(0);
      expect(getNumerologyByPlanet('Mercúrio').length).toBeGreaterThan(0);
      expect(getNumerologyByPlanet('Vênus').length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown planet', () => {
      expect(getNumerologyByPlanet('Plutão')).toHaveLength(0);
      expect(getNumerologyByPlanet('Urano')).toHaveLength(0);
      expect(getNumerologyByPlanet('invalid')).toHaveLength(0);
    });
  });

  // ─── Planet distribution analysis ───────────────────────────────────────
  describe('planet distribution', () => {
    it('Sol appears exactly once', () => {
      const result = getPlanetNumerology();
      expect(result.Sol).toHaveLength(1);
    });

    it('Lua appears exactly twice (numbers 2 and 10)', () => {
      const result = getPlanetNumerology();
      expect(result.Lua).toHaveLength(2);
    });

    it('Saturno appears exactly three times (numbers 4, 8, 13)', () => {
      const result = getPlanetNumerology();
      expect(result.Saturno).toHaveLength(3);
    });

    it('Júpiter appears exactly twice (numbers 3 and 12)', () => {
      const result = getPlanetNumerology();
      expect(result.Júpiter).toHaveLength(2);
    });

    it('Netuno appears exactly twice (numbers 7 and 11)', () => {
      const result = getPlanetNumerology();
      expect(result.Netuno).toHaveLength(2);
    });

    it('total of all planet mappings equals 13', () => {
      const result = getPlanetNumerology();
      const total = Object.values(result).reduce((sum, nums) => sum + nums.length, 0);
      expect(total).toBe(13);
    });
  });

  // ─── Element distribution analysis ───────────────────────────────────────
  describe('element distribution', () => {
    it('Fogo appears for numbers 1, 3, 9, 12', () => {
      const fogo = getAllNumerologyPlanets().filter((m) => m.elemento === 'Fogo');
      expect(fogo.map((m) => m.numero)).toEqual(expect.arrayContaining([1, 3, 9, 12]));
    });

    it('Água appears for numbers 2, 6, 7, 10', () => {
      const agua = getAllNumerologyPlanets().filter((m) => m.elemento === 'Água');
      expect(agua.map((m) => m.numero)).toEqual(expect.arrayContaining([2, 6, 7, 10]));
    });

    it('Terra appears for numbers 4, 8, 13', () => {
      const terra = getAllNumerologyPlanets().filter((m) => m.elemento === 'Terra');
      expect(terra.map((m) => m.numero)).toEqual(expect.arrayContaining([4, 8, 13]));
    });

    it('Éter appears only for number 11 (master number)', () => {
      const eter = getAllNumerologyPlanets().filter((m) => m.elemento === 'Éter');
      expect(eter).toHaveLength(1);
      expect(eter[0].numero).toBe(11);
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('Planeta type is exported', () => {
      const planeta: Planeta = 'Sol';
      expect(['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno']).toContain(planeta);
    });

    it('NumerologyPlanetMapping interface is exported', () => {
      const mapping: NumerologyPlanetMapping = {
        numero: 1,
        planeta: 'Sol',
        elemento: 'Fogo',
        significado_espiritual: 'Test',
        qualidade_energetica: {
          tipo: 'Yang (Expressivo)',
          vibração: 'Test',
        },
        area_vida: 'Test',
        orixa: 'Oxalá',
      };
      expect(mapping.numero).toBe(1);
    });
  });

  // ─── Default export ──────────────────────────────────────────────────────
  describe('default export', () => {
    it('exports required functions', async () => {
      const module = await import('@/lib/correlation/numerology-planet');
      expect(module.default).toBeDefined();
      expect(typeof module.default.getNumerologyPlanet).toBe('function');
      expect(typeof module.default.getPlanetNumerology).toBe('function');
      expect(typeof module.default.getAllNumerologyPlanets).toBe('function');
    });
  });
});
