/**
 * Orixá-Destiny Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaDestiny,
  getAllOrixas,
  getAllOrixaDestinies,
  getOrixasByDestiny,
  getOrixasByElement,
  getDestinyPathStats,
} from '@/lib/correlation/orixa-destiny';

describe('Orixá-Destiny Correlation', () => {
  describe('getOrixaDestiny', () => {
    it('should return Oxalá mapping with creation destiny', () => {
      const result = getOrixaDestiny('Oxalá');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('criacao');
      expect(result?.elemento).toBe('éter');
      expect(result?.numero_jornada).toBe(1);
    });

    it('should return Iemanjá mapping with love destiny', () => {
      const result = getOrixaDestiny('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('amor');
      expect(result?.elemento).toBe('água');
      expect(result?.numero_jornada).toBe(2);
    });

    it('should return Oxum mapping with abundance destiny', () => {
      const result = getOrixaDestiny('Oxum');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('abundancia');
      expect(result?.elemento).toBe('água');
      expect(result?.numero_jornada).toBe(3);
    });

    it('should return Ogum mapping with war destiny', () => {
      const result = getOrixaDestiny('Ogum');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('guerra');
      expect(result?.elemento).toBe('terra');
      expect(result?.numero_jornada).toBe(4);
    });

    it('should return Oxóssi mapping with wisdom destiny', () => {
      const result = getOrixaDestiny('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('sabedoria');
      expect(result?.elemento).toBe('terra');
      expect(result?.numero_jornada).toBe(5);
    });

    it('should return Xangô mapping with justice destiny', () => {
      const result = getOrixaDestiny('Xangô');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('justice');
      expect(result?.elemento).toBe('fogo');
      expect(result?.numero_jornada).toBe(6);
    });

    it('should return Iansã mapping with transformation destiny', () => {
      const result = getOrixaDestiny('Iansã');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.elemento).toBe('fogo');
      expect(result?.numero_jornada).toBe(7);
    });

    it('should return Omolu mapping with transformation and ancestry', () => {
      const result = getOrixaDestiny('Omolu');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.caminho_secundario).toBe('ancestralidade');
      expect(result?.numero_jornada).toBe(8);
    });

    it('should return Nanã mapping with ancestry destiny', () => {
      const result = getOrixaDestiny('Nanã');
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('ancestralidade');
      expect(result?.elemento).toBe('água');
      expect(result?.numero_jornada).toBe(9);
    });

    it('should be case-insensitive', () => {
      expect(getOrixaDestiny('oxalá')?.orixa).toBe('Oxalá');
      expect(getOrixaDestiny('IEMANJÁ')?.orixa).toBe('Iemanjá');
      expect(getOrixaDestiny('oxum')?.orixa).toBe('Oxum');
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaDestiny('Exu')).toBeUndefined();
      expect(getOrixaDestiny('Obá')).toBeUndefined();
    });

    it('should include spiritual meaning for each Orixá', () => {
      const oxala = getOrixaDestiny('Oxalá');
      expect(oxala?.significado_espiritual).toContain('criação');

      const iemanja = getOrixaDestiny('Iemanjá');
      expect(iemanja?.significado_espiritual).toContain('amor');

      const xango = getOrixaDestiny('Xangô');
      expect(xango?.significado_espiritual).toContain('justiça');
    });

    it('should include central lesson for each Orixá', () => {
      const result = getOrixaDestiny('Ogum');
      expect(result?.licao_central).toBeDefined();
      expect(result?.licao_central.length).toBeGreaterThan(10);
    });

    it('should include life theme for each Orixá', () => {
      const result = getOrixaDestiny('Oxóssi');
      expect(result?.tema_vida).toBeDefined();
      expect(result?.tema_vida.length).toBeGreaterThan(5);
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of all Orixá names', () => {
      const result = getAllOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all major Orixás', () => {
      const result = getAllOrixas();
      expect(result).toContain('Oxalá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Ogum');
      expect(result).toContain('Xangô');
    });

    it('should not contain duplicates', () => {
      const result = getAllOrixas();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('getAllOrixaDestinies', () => {
    it('should return array of all OrixaDestiny objects', () => {
      const result = getAllOrixaDestinies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(9);
    });

    it('should include all required properties in each entry', () => {
      const result = getAllOrixaDestinies();
      for (const entry of result) {
        expect(entry.orixa).toBeDefined();
        expect(entry.caminho_destino).toBeDefined();
        expect(entry.significado_espiritual).toBeDefined();
        expect(entry.licao_central).toBeDefined();
        expect(entry.numero_jornada).toBeDefined();
        expect(entry.elemento).toBeDefined();
        expect(entry.tema_vida).toBeDefined();
      }
    });

    it('should have unique journey numbers', () => {
      const result = getAllOrixaDestinies();
      const numbers = result.map(r => r.numero_jornada);
      const unique = new Set(numbers);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('getOrixasByDestiny', () => {
    it('should return Orixás with creation destiny', () => {
      const result = getOrixasByDestiny('criacao');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].caminho_destino).toBe('criacao');
    });

    it('should return Orixás with transformation destiny', () => {
      const result = getOrixasByDestiny('transformacao');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const paths = result.map(r => r.caminho_destino);
      expect(paths).toContain('transformacao');
    });

    it('should include secondary paths in results', () => {
      const result = getOrixasByDestiny('ancestralidade');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for non-existent destiny', () => {
      const result = getOrixasByDestiny('equilibrio' as any);
      expect(result).toHaveLength(0);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return water element Orixás', () => {
      const result = getOrixasByElement('água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'água')).toBe(true);
    });

    it('should return fire element Orixás', () => {
      const result = getOrixasByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'fogo')).toBe(true);
    });

    it('should return earth element Orixás', () => {
      const result = getOrixasByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'terra')).toBe(true);
    });
  });

  describe('getDestinyPathStats', () => {
    it('should return statistics for all destiny paths', () => {
      const result = getDestinyPathStats();
      expect(typeof result).toBe('object');
      expect(result.criacao).toBeDefined();
      expect(result.guerra).toBeDefined();
      expect(result.sabedoria).toBeDefined();
    });

    it('should count primary paths as full', () => {
      const result = getDestinyPathStats();
      // transformation appears as primary for Iansã and Omolu
      expect(result.transformacao).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Destiny correlation consistency', () => {
    it('should have consistent element mapping for each Orixá', () => {
      const all = getAllOrixaDestinies();
      for (const entry of all) {
        expect(['fogo', 'água', 'ar', 'terra', 'éter']).toContain(entry.elemento);
      }
    });

    it('should have journey numbers from 1 to 9', () => {
      const all = getAllOrixaDestinies();
      const numbers = all.map(a => a.numero_jornada).sort((a, b) => a - b);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should have spiritual meaning that describes the orixá role', () => {
      const oxala = getOrixaDestiny('Oxalá');
      expect(oxala?.significado_espiritual.toLowerCase()).toContain('pai');
      
      const iemanja = getOrixaDestiny('Iemanjá');
      expect(iemanja?.significado_espiritual.toLowerCase()).toContain('mãe');
    });
  });
});
