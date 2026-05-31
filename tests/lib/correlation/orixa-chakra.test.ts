/**
 * Orixá-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaChakra,
  getChakraOrixa,
  getAllOrixaChakras,
  getOrixasByChakra,
} from '@/lib/correlation/orixa-chakra';

describe('Orixá-Chakra Correlation', () => {
  describe('getOrixaChakra', () => {
    it('should return Oxalá mapping with Sahasrara (crown) chakra', () => {
      const result = getOrixaChakra('Oxalá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_numero).toBe('7º Coronário');
      expect(result?.elemento).toBe('éter');
      expect(result?.cores).toContain('Branco');
      expect(result?.significado_espiritual).toContain('Criador supremo');
    });

    it('should return Iemanjá mapping with Svadhisthana (sacral) chakra', () => {
      const result = getOrixaChakra('Iemanjá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_numero).toBe('2º Sacro');
      expect(result?.elemento).toBe('água');
    });

    it('should return Oxum mapping with Manipura (solar plexus) chakra', () => {
      const result = getOrixaChakra('Oxum');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe('3º Plexo Solar');
      expect(result?.elemento).toBe('água');
      expect(result?.cores).toContain('Amarelo-ouro');
    });

    it('should return Ogum mapping with Muladhara (root) chakra', () => {
      const result = getOrixaChakra('Ogum');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_numero).toBe('1º Básico');
      expect(result?.elemento).toBe('terra');
      expect(result?.cores).toContain('Verde');
    });

    it('should return Oxóssi mapping with Anahata (heart) chakra', () => {
      const result = getOrixaChakra('Oxóssi');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe('4º Cardíaco');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Xangô mapping with Manipura (solar plexus) chakra', () => {
      const result = getOrixaChakra('Xangô');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe('3º Plexo Solar');
      expect(result?.elemento).toBe('fogo');
      expect(result?.cores).toContain('Amarelo');
    });

    it('should return Iansã mapping with Vishuddha (throat) chakra', () => {
      const result = getOrixaChakra('Iansã');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_numero).toBe('5º Laríngeo');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Omolu mapping with Svadhisthana (sacral) chakra', () => {
      const result = getOrixaChakra('Omolu');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Nanã mapping with Ajna (third eye) chakra', () => {
      const result = getOrixaChakra('Nanã');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Nanã');
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_numero).toBe('6º Terceiro Olho');
      expect(result?.elemento).toBe('água');
      expect(result?.cores).toContain('Roxo');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaChakra('oxalá')).toBeDefined();
      expect(getOrixaChakra('OXALÁ')).toBeDefined();
      expect(getOrixaChakra('Iemanjá')).toBeDefined();
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaChakra('Exu')).toBeUndefined();
      expect(getOrixaChakra('Pombola')).toBeUndefined();
    });

    it('should include all required properties', () => {
      const result = getOrixaChakra('Oxalá');
      
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('chakra_numero');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('cores');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('praticas');
      expect(Array.isArray(result?.praticas)).toBe(true);
    });

    it('should include spiritual meaning about the orixá-chakra connection', () => {
      const result = getOrixaChakra('Oxalá');
      
      expect(result?.significado_espiritual).toContain('criador');
      expect(result?.significado_espiritual).toContain('coronário');
    });
  });

  describe('getChakraOrixa', () => {
    it('should return all chakra-to-orixá mappings', () => {
      const result = getChakraOrixa();
      
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should map Sahasrara to Oxalá', () => {
      const result = getChakraOrixa();
      
      expect(result['Sahasrara']).toBe('Oxalá');
    });

    it('should map Svadhisthana to Iemanjá', () => {
      const result = getChakraOrixa();
      
      expect(result['Svadhisthana']).toBe('Iemanjá');
    });

    it('should map Muladhara to Ogum', () => {
      const result = getChakraOrixa();
      
      expect(result['Muladhara']).toBe('Ogum');
    });

    it('should map Anahata to Oxóssi', () => {
      const result = getChakraOrixa();
      
      expect(result['Anahata']).toBe('Oxóssi');
    });

    it('should map Ajna to Nanã', () => {
      const result = getChakraOrixa();
      
      expect(result['Ajna']).toBe('Nanã');
    });
  });

  describe('getAllOrixaChakras', () => {
    it('should return all orixá-chakra mappings', () => {
      const result = getAllOrixaChakras();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(9);
    });

    it('should include all main orixás', () => {
      const result = getAllOrixaChakras();
      const orixas = result.map(m => m.orixa);
      
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Nanã');
    });

    it('each mapping should have valid chakra', () => {
      const result = getAllOrixaChakras();
      
      for (const mapping of result) {
        expect(['Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna', 'Sahasrara']).toContain(mapping.chakra);
      }
    });
  });

  describe('getOrixasByChakra', () => {
    it('should return Orixás by chakra name (Sanskrit)', () => {
      const result = getOrixasByChakra('Sahasrara');
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.orixa).toBe('Oxalá');
    });

    it('should return Orixás by chakra number', () => {
      const result = getOrixasByChakra('1');
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.orixa).toBe('Ogum');
    });

    it('should return Orixás by chakra number format 2º', () => {
      const result = getOrixasByChakra('2º');
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown chakra', () => {
      const result = getOrixasByChakra('unknown');
      
      expect(result).toEqual([]);
    });

    it('should return Orixás by Portuguese chakra name', () => {
      const result = getOrixasByChakra('coronario');
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Orixá-Chakra Element consistency', () => {
    it('water orixás should have water or earth element chakras', () => {
      const waterOrixas = ['Iemanjá', 'Oxum', 'Nanã'];
      
      for (const orixa of waterOrixas) {
        const result = getOrixaChakra(orixa);
        expect(result?.elemento).toBe('água');
      }
    });

    it('fire orixás should have fire or air related chakras', () => {
      const fireOrixas = ['Xangô', 'Iansã'];
      
      for (const orixa of fireOrixas) {
        const result = getOrixaChakra(orixa);
        expect(result?.elemento).toBe('fogo');
      }
    });

    it('earth orixás should have earth element', () => {
      const earthOrixas = ['Ogum', 'Oxóssi', 'Omolu'];
      
      for (const orixa of earthOrixas) {
        const result = getOrixaChakra(orixa);
        expect(result?.elemento).toBe('terra');
      }
    });

    it('éter orixá should have Sahasrara (crown) chakra', () => {
      const result = getOrixaChakra('Oxalá');
      
      expect(result?.chakra).toBe('Sahasrara');
    });
  });

  describe('Spiritual correlation integrity', () => {
    it('each orixá should have at least one practice defined', () => {
      const all = getAllOrixaChakras();
      
      for (const mapping of all) {
        expect(mapping.praticas.length).toBeGreaterThan(0);
      }
    });

    it('each orixá should have at least one color defined', () => {
      const all = getAllOrixaChakras();
      
      for (const mapping of all) {
        expect(mapping.cores.length).toBeGreaterThan(0);
      }
    });

    it('spiritual meaning should reference both orixá and chakra', () => {
      const oxala = getOrixaChakra('Oxalá');
      
      expect(oxala?.significado_espiritual).toContain('Oxalá');
      expect(oxala?.significado_espiritual).toContain('Sahasrara');
    });
  });
});