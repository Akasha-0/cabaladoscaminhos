import { describe, it, expect } from 'vitest';
import {
  getChakraFrequency,
  getFrequencyChakra,
  getAllChakraFrequencies,
  getChakraByFrequency,
  getChakraSanskrit,
  getChakraMantram,
  getChakraElement,
  getChakraHealing,
  getChakraDirection,
  getChakrasByElement,
  isValidChakra,
  getAllChakraNumbers,
  getAllSolfeggioFrequencies,
  CHAKRA_FREQUENCY_MAP,
  type ChakraFrequency,
} from '@/lib/correlation/chakra-frequency';

describe('ChakraFrequency Correlation', () => {
  describe('getChakraFrequency', () => {
    it('should return correct frequency for chakra number', () => {
      expect(getChakraFrequency(1)).toBe(396);
      expect(getChakraFrequency(2)).toBe(417);
      expect(getChakraFrequency(3)).toBe(528);
      expect(getChakraFrequency(4)).toBe(639);
      expect(getChakraFrequency(5)).toBe(741);
      expect(getChakraFrequency(6)).toBe(852);
      expect(getChakraFrequency(7)).toBe(963);
    });

    it('should return correct frequency for Portuguese chakra names', () => {
      expect(getChakraFrequency('1º Básico')).toBe(396);
      expect(getChakraFrequency('2º Sacro')).toBe(417);
      expect(getChakraFrequency('3º Plexo Solar')).toBe(528);
      expect(getChakraFrequency('4º Cardíaco')).toBe(639);
      expect(getChakraFrequency('5º Laríngeo')).toBe(741);
      expect(getChakraFrequency('6º Frontal')).toBe(852);
      expect(getChakraFrequency('7º Coronário')).toBe(963);
    });

    it('should return correct frequency for Sanskrit chakra names', () => {
      expect(getChakraFrequency('Muladhara')).toBe(396);
      expect(getChakraFrequency('Svadhisthana')).toBe(417);
      expect(getChakraFrequency('Manipura')).toBe(528);
      expect(getChakraFrequency('Anahata')).toBe(639);
      expect(getChakraFrequency('Vishuddha')).toBe(741);
      expect(getChakraFrequency('Ajna')).toBe(852);
      expect(getChakraFrequency('Sahasrara')).toBe(963);
    });

    it('should return correct frequency for English chakra names', () => {
      expect(getChakraFrequency('Root')).toBe(396);
      expect(getChakraFrequency('Sacral')).toBe(417);
      expect(getChakraFrequency('Solar Plexus')).toBe(528);
      expect(getChakraFrequency('Heart')).toBe(639);
      expect(getChakraFrequency('Throat')).toBe(741);
      expect(getChakraFrequency('Third Eye')).toBe(852);
      expect(getChakraFrequency('Crown')).toBe(963);
    });

    it('should return null for invalid chakra input', () => {
      expect(getChakraFrequency(0)).toBeNull();
      expect(getChakraFrequency(8)).toBeNull();
      expect(getChakraFrequency('invalid')).toBeNull();
      expect(getChakraFrequency('Kundalini')).toBeNull();
      expect(getChakraFrequency('')).toBeNull();
    });

    it('should handle case-insensitive input', () => {
      expect(getChakraFrequency('MULADHARA')).toBe(396);
      expect(getChakraFrequency('anjA')).toBe(852);
      expect(getChakraFrequency('CROWN')).toBe(963);
    });
  });

  describe('getFrequencyChakra', () => {
    it('should return a lookup object', () => {
      const lookup = getFrequencyChakra();
      expect(typeof lookup).toBe('object');
      expect(lookup).not.toBeNull();
    });

    it('should contain all 7 frequencies', () => {
      const lookup = getFrequencyChakra();
      expect(lookup).toHaveProperty('396');
      expect(lookup).toHaveProperty('417');
      expect(lookup).toHaveProperty('528');
      expect(lookup).toHaveProperty('639');
      expect(lookup).toHaveProperty('741');
      expect(lookup).toHaveProperty('852');
      expect(lookup).toHaveProperty('963');
    });

    it('should return ChakraFrequency objects with correct chakra numbers', () => {
      const lookup = getFrequencyChakra();
      expect(lookup[396].chakra_numero).toBe(1);
      expect(lookup[417].chakra_numero).toBe(2);
      expect(lookup[528].chakra_numero).toBe(3);
      expect(lookup[639].chakra_numero).toBe(4);
      expect(lookup[741].chakra_numero).toBe(5);
      expect(lookup[852].chakra_numero).toBe(6);
      expect(lookup[963].chakra_numero).toBe(7);
    });
  });

  describe('getAllChakraFrequencies', () => {
    it('should return an array of 7 chakra mappings', () => {
      const result = getAllChakraFrequencies();
      expect(result).toHaveLength(7);
    });

    it('should return mappings sorted by chakra number', () => {
      const result = getAllChakraFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].chakra_numero).toBeLessThan(result[i + 1].chakra_numero);
      }
    });

    it('should have all expected properties in each mapping', () => {
      const result = getAllChakraFrequencies();
      for (const chakra of result) {
        expect(chakra).toHaveProperty('chakra_numero');
        expect(chakra).toHaveProperty('chakra');
        expect(chakra).toHaveProperty('chakra_sanskrit');
        expect(chakra).toHaveProperty('frequencia');
        expect(chakra).toHaveProperty('elemento');
        expect(chakra).toHaveProperty('qualidades_elementais');
        expect(chakra).toHaveProperty('direcao_energetica');
        expect(chakra).toHaveProperty('mantram');
        expect(chakra).toHaveProperty('propriedades_healing');
      }
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return correct ChakraFrequency for valid frequencies', () => {
      const result = getChakraByFrequency(396);
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('1º Básico');
      expect(result!.frequencia).toBe(396);
    });

    it('should return null for invalid frequency', () => {
      expect(getChakraByFrequency(100)).toBeNull();
      expect(getChakraByFrequency(0)).toBeNull();
      expect(getChakraByFrequency(999)).toBeNull();
    });
  });

  describe('getChakraSanskrit', () => {
    it('should return Sanskrit names for chakra numbers', () => {
      expect(getChakraSanskrit(1)).toBe('Muladhara');
      expect(getChakraSanskrit(2)).toBe('Svadhisthana');
      expect(getChakraSanskrit(3)).toBe('Manipura');
      expect(getChakraSanskrit(4)).toBe('Anahata');
      expect(getChakraSanskrit(5)).toBe('Vishuddha');
      expect(getChakraSanskrit(6)).toBe('Ajna');
      expect(getChakraSanskrit(7)).toBe('Sahasrara');
    });

    it('should return Sanskrit names for chakra names', () => {
      expect(getChakraSanskrit('1º Básico')).toBe('Muladhara');
      expect(getChakraSanskrit('Heart')).toBe('Anahata');
    });

    it('should return null for invalid chakra', () => {
      expect(getChakraSanskrit(0)).toBeNull();
      expect(getChakraSanskrit('invalid')).toBeNull();
    });
  });

  describe('getChakraMantram', () => {
    it('should return correct mantrams for chakra numbers', () => {
      expect(getChakraMantram(1)).toBe('LAM');
      expect(getChakraMantram(2)).toBe('VAM');
      expect(getChakraMantram(3)).toBe('RAM');
      expect(getChakraMantram(4)).toBe('YAM');
      expect(getChakraMantram(5)).toBe('HAM');
      expect(getChakraMantram(6)).toBe('OM');
      expect(getChakraMantram(7)).toBe('AUM / SILÊNCIO');
    });

    it('should return null for invalid chakra', () => {
      expect(getChakraMantram(0)).toBeNull();
      expect(getChakraMantram('invalid')).toBeNull();
    });
  });

  describe('getChakraElement', () => {
    it('should return correct elements for chakra numbers', () => {
      expect(getChakraElement(1)).toBe('Terra');
      expect(getChakraElement(2)).toBe('Água');
      expect(getChakraElement(3)).toBe('Fogo');
      expect(getChakraElement(4)).toBe('Ar');
      expect(getChakraElement(5)).toBe('Ar');
      expect(getChakraElement(6)).toBe('Éter');
      expect(getChakraElement(7)).toBe('Éter (Quintessência)');
    });

    it('should return null for invalid chakra', () => {
      expect(getChakraElement(0)).toBeNull();
      expect(getChakraElement('invalid')).toBeNull();
    });
  });

  describe('getChakraHealing', () => {
    it('should return healing properties for valid chakras', () => {
      const healing = getChakraHealing(1);
      expect(healing).not.toBeNull();
      expect(healing).toHaveProperty('fisico');
      expect(healing).toHaveProperty('emocional');
      expect(healing).toHaveProperty('mental_espiritual');
      expect(healing).toHaveProperty('pratica_recomendada');
    });

    it('should return null for invalid chakra', () => {
      expect(getChakraHealing(0)).toBeNull();
      expect(getChakraHealing('invalid')).toBeNull();
    });
  });

  describe('getChakraDirection', () => {
    it('should return energy direction for valid chakras', () => {
      expect(getChakraDirection(1)).toBe('Descendente e centrípeto');
      expect(getChakraDirection(2)).toBe('Ondulante e expansivo');
      expect(getChakraDirection(3)).toBe('Ascendente e radiante');
    });

    it('should return null for invalid chakra', () => {
      expect(getChakraDirection(0)).toBeNull();
      expect(getChakraDirection('invalid')).toBeNull();
    });
  });

  describe('getChakrasByElement', () => {
    it('should return correct chakras for Terra element', () => {
      const result = getChakrasByElement('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('1º Básico');
    });

    it('should return correct chakras for Água element', () => {
      const result = getChakrasByElement('Água');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('2º Sacro');
    });

    it('should return correct chakras for Fogo element', () => {
      const result = getChakrasByElement('Fogo');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('3º Plexo Solar');
    });

    it('should return correct chakras for Ar element (multiple)', () => {
      const result = getChakrasByElement('Ar');
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.chakra)).toContain('4º Cardíaco');
      expect(result.map((c) => c.chakra)).toContain('5º Laríngeo');
    });

    it('should return correct chakras for Éter element (multiple)', () => {
      const result = getChakrasByElement('Éter');
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.chakra)).toContain('6º Frontal');
      expect(result.map((c) => c.chakra)).toContain('7º Coronário');
    });

    it('should return empty array for unknown element', () => {
      expect(getChakrasByElement('unknown')).toHaveLength(0);
    });
  });

  describe('isValidChakra', () => {
    it('should return true for valid chakra numbers', () => {
      expect(isValidChakra(1)).toBe(true);
      expect(isValidChakra(4)).toBe(true);
      expect(isValidChakra(7)).toBe(true);
    });

    it('should return false for invalid chakra numbers', () => {
      expect(isValidChakra(0)).toBe(false);
      expect(isValidChakra(8)).toBe(false);
      expect(isValidChakra(-1)).toBe(false);
    });

    it('should return true for valid chakra names', () => {
      expect(isValidChakra('Muladhara')).toBe(true);
      expect(isValidChakra('Heart')).toBe(true);
      expect(isValidChakra('4º Cardíaco')).toBe(true);
    });

    it('should return false for invalid chakra names', () => {
      expect(isValidChakra('invalid')).toBe(false);
      expect(isValidChakra('')).toBe(false);
    });
  });

  describe('getAllChakraNumbers', () => {
    it('should return all 7 chakra numbers', () => {
      const result = getAllChakraNumbers();
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('getAllSolfeggioFrequencies', () => {
    it('should return all 7 Solfeggio frequencies in order', () => {
      const result = getAllSolfeggioFrequencies();
      expect(result).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });
  });

  describe('CHAKRA_FREQUENCY_MAP', () => {
    it('should contain 7 entries', () => {
      expect(Object.keys(CHAKRA_FREQUENCY_MAP)).toHaveLength(7);
    });

    it('should have correct chakra numbers as keys', () => {
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('1');
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('2');
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('3');
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('4');
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('5');
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('6');
      expect(CHAKRA_FREQUENCY_MAP).toHaveProperty('7');
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(CHAKRA_FREQUENCY_MAP)).toBe(true);
    });

    it('should have matching frequencies with frequency-chakra module', () => {
      const { FREQUENCY_CHAKRA_MAP } = require('@/lib/correlation/frequency-chakra');
      for (const [chakraNum, chakraData] of Object.entries(CHAKRA_FREQUENCY_MAP)) {
        const frequency = chakraData.frequencia;
        const expectedChakra = FREQUENCY_CHAKRA_MAP[frequency].chakra;
        expect(chakraData.chakra).toBe(expectedChakra);
      }
    });
  });

  describe('Type exports', () => {
    it('should export ChakraFrequency type', () => {
      const testMapping: ChakraFrequency = {
        chakra_numero: 1,
        chakra: '1º Básico',
        chakra_sanskrit: 'Muladhara',
        frequencia: 396,
        elemento: 'Terra',
        qualidades_elementais: ['Frio', 'Seco', 'Estável'],
        direcao_energetica: 'Descendente e centrípeto',
        mantram: 'LAM',
        propriedades_healing: {
          fisico: 'Test',
          emocional: 'Test',
          mental_espiritual: 'Test',
          pratica_recomendada: 'Test',
        },
      };
      expect(testMapping.chakra_numero).toBe(1);
    });
  });
});
