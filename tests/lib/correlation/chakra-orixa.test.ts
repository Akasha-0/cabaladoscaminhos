/**
 * Chakra-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getChakraOrixa,
  getOrixaChakra,
  getAllChakraOrixas,
} from '@/lib/correlation/chakra-orixa';

describe('Chakra-Orixá Correlation', () => {
  describe('getChakraOrixa', () => {
    it('should return Muladhara (1º Básico) mapping with Omolu as primary Orixá', () => {
      const result = getChakraOrixa('Muladhara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_numero).toBe(1);
      expect(result?.chakra_nome_portugues).toBe('1º Básico');
      expect(result?.orixas.primario).toBe('Omolu');
      expect(result?.elemento).toBe('Terra');
    });

    it('should return Svadhisthana (2º Sacro) mapping with Iansã as primary Orixá', () => {
      const result = getChakraOrixa('Svadhisthana');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_numero).toBe(2);
      expect(result?.chakra_nome_portugues).toBe('2º Sacro');
      expect(result?.orixas.primario).toBe('Iansã');
      expect(result?.orixas.secundario).toBe('Xangô');
      expect(result?.elemento).toBe('Água');
    });

    it('should return Manipura (3º Plexo Solar) mapping with Xangô as primary Orixá', () => {
      const result = getChakraOrixa('Manipura');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.chakra_nome_portugues).toBe('3º Plexo Solar');
      expect(result?.orixas.primario).toBe('Xangô');
      expect(result?.orixas.secundario).toBe('Ogum');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return Anahata (4º Cardíaco) mapping with Oxum as primary Orixá', () => {
      const result = getChakraOrixa('Anahata');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.chakra_nome_portugues).toBe('4º Cardíaco');
      expect(result?.orixas.primario).toBe('Oxum');
      expect(result?.orixas.secundario).toBe('Oxóssi');
      expect(result?.elemento).toBe('Ar');
    });

    it('should return Vishuddha (5º Laríngeo) mapping with Ogum as primary Orixá', () => {
      const result = getChakraOrixa('Vishuddha');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_numero).toBe(5);
      expect(result?.chakra_nome_portugues).toBe('5º Laríngeo');
      expect(result?.orixas.primario).toBe('Ogum');
      expect(result?.orixas.secundario).toBeNull();
      expect(result?.elemento).toBe('Terra');
    });

    it('should return Ajna (6º Frontal) mapping with Iemanjá as primary Orixá', () => {
      const result = getChakraOrixa('Ajna');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.chakra_nome_portugues).toBe('6º Frontal');
      expect(result?.orixas.primario).toBe('Iemanjá');
      expect(result?.orixas.secundario).toBe('Nanã');
      expect(result?.elemento).toBe('Éter');
    });

    it('should return Sahasrara (7º Coronário) mapping with Oxalá as primary Orixá', () => {
      const result = getChakraOrixa('Sahasrara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.chakra_nome_portugues).toBe('7º Coronário');
      expect(result?.orixas.primario).toBe('Oxalá');
      expect(result?.orixas.secundario).toBe('Oxóssi');
      expect(result?.elemento).toBe('Éter');
    });

    it('should accept Portuguese chakra names', () => {
      const result = getChakraOrixa('1º Básico');
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.orixas.primario).toBe('Omolu');

      const result2 = getChakraOrixa('4º Cardíaco');
      expect(result2?.chakra).toBe('Anahata');
      expect(result2?.orixas.primario).toBe('Oxum');
    });

    it('should accept numeric chakra numbers', () => {
      const result = getChakraOrixa('1');
      expect(result?.chakra).toBe('Muladhara');

      const result7 = getChakraOrixa('7');
      expect(result7?.chakra).toBe('Sahasrara');
    });

    it('should return undefined for unknown chakra', () => {
      const result = getChakraOrixa('UnknownChakra');
      expect(result).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const result1 = getChakraOrixa('muladhara');
      const result2 = getChakraOrixa('MULADHARA');
      const result3 = getChakraOrixa('Muladhara');

      expect(result1?.chakra).toBe(result2?.chakra);
      expect(result2?.chakra).toBe(result3?.chakra);
    });

    it('should include spiritual practices with mantras and herbs', () => {
      const result = getChakraOrixa('Muladhara');
      expect(result?.praticas_espirituais).toBeDefined();
      expect(result?.praticas_espirituais.mantras).toContain('LAM (396 Hz)');
      expect(result?.praticas_espirituais.erivas).toContain('Canela-de-velho');
      expect(result?.praticas_espirituais.cores).toContain('Vermelho');
    });
  });

  describe('getOrixaChakra', () => {
    it('should return mapping with Omolu associated to Muladhara', () => {
      const result = getOrixaChakra();
      expect(result['Omolu']).toBe('Muladhara');
    });

    it('should return mapping with Oxalá associated to Sahasrara', () => {
      const result = getOrixaChakra();
      expect(result['Oxalá']).toBe('Sahasrara');
    });

    it('should include secondary Orixás when not primary elsewhere', () => {
      const result = getOrixaChakra();
      // Nanã is secondary to both Muladhara and Ajna
      // First secondary assignment wins: Nanã -> Muladhara (from first pass secondary)
      expect(result['Nanã']).toBe('Muladhara');
    });
    it('should prioritize primary Orixá associations', () => {
      const result = getOrixaChakra();
      // Xangô is primary to Manipura (3), secondary to Svadhisthana (2)
      // Primary takes precedence
      expect(result['Xangô']).toBe('Manipura');
      // Ogum is primary to Vishuddha (5), secondary to Manipura (3)
      // Primary takes precedence
      expect(result['Ogum']).toBe('Vishuddha');
    });

    it('should contain all Orixás from the system', () => {
      const result = getOrixaChakra();
      const expectedOrixas = [
        'Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Oxóssi',
        'Xangô', 'Iansã', 'Omolu', 'Nanã',
      ];

      for (const orixa of expectedOrixas) {
        expect(result[orixa]).toBeDefined();
      }

      // Should have at least 9 Orixás mapped
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('getAllChakraOrixas', () => {
    it('should return all 7 chakra mappings', () => {
      const result = getAllChakraOrixas();
      expect(result).toHaveLength(7);
    });

    it('should return arrays in correct order (1-7)', () => {
      const result = getAllChakraOrixas();
      expect(result[0].chakra_numero).toBe(1);
      expect(result[1].chakra_numero).toBe(2);
      expect(result[2].chakra_numero).toBe(3);
      expect(result[3].chakra_numero).toBe(4);
      expect(result[4].chakra_numero).toBe(5);
      expect(result[5].chakra_numero).toBe(6);
      expect(result[6].chakra_numero).toBe(7);
    });

    it('should contain all required properties for each mapping', () => {
      const result = getAllChakraOrixas();

      for (const mapping of result) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.chakra_nome_portugues).toBeDefined();
        expect(mapping.orixas).toBeDefined();
        expect(mapping.orixas.primario).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
        expect(mapping.praticas_espirituais.mantras).toBeDefined();
        expect(mapping.praticas_espirituais.erivas).toBeDefined();
        expect(mapping.praticas_espirituais.cores).toBeDefined();
      }
    });
  });

  describe('Element alignment consistency', () => {
    it('should have Terra element for Muladhara (1º)', () => {
      const result = getChakraOrixa('Muladhara');
      expect(result?.elemento).toBe('Terra');
    });

    it('should have Água element for Svadhisthana (2º)', () => {
      const result = getChakraOrixa('Svadhisthana');
      expect(result?.elemento).toBe('Água');
    });

    it('should have Fogo element for Manipura (3º)', () => {
      const result = getChakraOrixa('Manipura');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should have Ar element for Anahata (4º)', () => {
      const result = getChakraOrixa('Anahata');
      expect(result?.elemento).toBe('Ar');
    });

    it('should have Éter element for Ajna and Sahasrara (6º and 7º)', () => {
      const ajna = getChakraOrixa('Ajna');
      const sahasrara = getChakraOrixa('Sahasrara');

      expect(ajna?.elemento).toBe('Éter');
      expect(sahasrara?.elemento).toBe('Éter');
    });

    it('should have correct frequency mantras for each chakra', () => {
      const muladhara = getChakraOrixa('Muladhara');
      expect(muladhara?.praticas_espirituais.mantras).toContain('LAM (396 Hz)');

      const sahasrara = getChakraOrixa('Sahasrara');
      expect(sahasrara?.praticas_espirituais.mantras).toContain('AUM');
    });
  });

  describe('Chakra number format', () => {
    it('should accept 1 through 7 numeric input', () => {
      expect(getChakraOrixa('1')?.chakra).toBe('Muladhara');
      expect(getChakraOrixa('2')?.chakra).toBe('Svadhisthana');
      expect(getChakraOrixa('3')?.chakra).toBe('Manipura');
      expect(getChakraOrixa('4')?.chakra).toBe('Anahata');
      expect(getChakraOrixa('5')?.chakra).toBe('Vishuddha');
      expect(getChakraOrixa('6')?.chakra).toBe('Ajna');
      expect(getChakraOrixa('7')?.chakra).toBe('Sahasrara');
    });
  });
});