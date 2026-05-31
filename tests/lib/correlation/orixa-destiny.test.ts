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
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.caminho_destino).toBe('criacao');
      expect(result?.elemento).toBe('éter');
      expect(result?.numero_jornada).toBe(1);
    });

    it('should return Iemanjá mapping with love destiny', () => {
      const result = getOrixaDestiny('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.caminho_destino).toBe('amor');
      expect(result?.elemento).toBe('água');
      expect(result?.numero_jornada).toBe(2);
    });

    it('should return Oxum mapping with abundance destiny', () => {
      const result = getOrixaDestiny('Oxum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.caminho_destino).toBe('abundancia');
      expect(result?.elemento).toBe('água');
      expect(result?.numero_jornada).toBe(3);
    });

    it('should return Ogum mapping with war destiny', () => {
      const result = getOrixaDestiny('Ogum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
      expect(result?.caminho_destino).toBe('guerra');
      expect(result?.elemento).toBe('terra');
      expect(result?.numero_jornada).toBe(4);
    });

    it('should return Oxóssi mapping with wisdom destiny', () => {
      const result = getOrixaDestiny('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.caminho_destino).toBe('sabedoria');
      expect(result?.elemento).toBe('terra');
      expect(result?.numero_jornada).toBe(5);
    });

    it('should return Xangô mapping with justice destiny', () => {
      const result = getOrixaDestiny('Xangô');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.caminho_destino).toBe('justice');
      expect(result?.elemento).toBe('fogo');
      expect(result?.numero_jornada).toBe(6);
    });

    it('should return Iansã mapping with transformation destiny', () => {
      const result = getOrixaDestiny('Iansã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.elemento).toBe('fogo');
      expect(result?.numero_jornada).toBe(7);
    });

    it('should return Omolu mapping with transformation destiny', () => {
      const result = getOrixaDestiny('Omolu');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.elemento).toBe('terra');
      expect(result?.numero_jornada).toBe(8);
    });

    it('should return Nanã mapping with ancestry destiny', () => {
      const result = getOrixaDestiny('Nanã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Nanã');
      expect(result?.caminho_destino).toBe('ancestralidade');
      expect(result?.elemento).toBe('água');
      expect(result?.numero_jornada).toBe(9);
    });

    it('should be case-insensitive', () => {
      const upper = getOrixaDestiny('OXALÁ');
      const lower = getOrixaDestiny('oxalá');
      const mixed = getOrixaDestiny('Oxalá');
      
      expect(upper).toBeDefined();
      expect(lower).toBeDefined();
      expect(mixed).toBeDefined();
      expect(upper?.orixa).toBe(lower?.orixa);
      expect(lower?.orixa).toBe(mixed?.orixa);
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaDestiny('Desconhecido');
      expect(result).toBeUndefined();
    });

    it('should include spiritual meaning for Oxalá', () => {
      const result = getOrixaDestiny('Oxalá');
      expect(result?.significado_espiritual).toContain('criação');
      expect(result?.licao_central).toContain('criação consciente');
    });

    it('should include life theme for Iemanjá', () => {
      const result = getOrixaDestiny('Iemanjá');
      expect(result?.tema_vida).toContain('Fertilidade');
      expect(result?.tema_vida).toContain('cura emocional');
    });

    it('should include secondary destiny path when available', () => {
      const oxala = getOrixaDestiny('Oxalá');
      expect(oxala?.caminho_secundario).toBe('equilibrio');
      
      const iemanja = getOrixaDestiny('Iemanjá');
      expect(iemanja?.caminho_secundario).toBe('ancestralidade');
    });

    it('should return complete OrixaDestiny object with all required fields', () => {
      const result = getOrixaDestiny('Oxum');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('caminho_destino');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('licao_central');
      expect(result).toHaveProperty('numero_jornada');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('tema_vida');
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of all Orixá names', () => {
      const result = getAllOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all nine main Orixás', () => {
      const result = getAllOrixas();
      const orixas = ['Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Oxóssi', 'Xangô', 'Iansã', 'Omolu', 'Nanã'];
      orixas.forEach(orixa => {
        expect(result).toContain(orixa);
      });
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
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return objects with complete structure', () => {
      const result = getAllOrixaDestinies();
      result.forEach(item => {
        expect(item).toHaveProperty('orixa');
        expect(item).toHaveProperty('caminho_destino');
        expect(item).toHaveProperty('significado_espiritual');
        expect(item).toHaveProperty('licao_central');
        expect(item).toHaveProperty('numero_jornada');
        expect(item).toHaveProperty('elemento');
        expect(item).toHaveProperty('tema_vida');
      });
    });

    it('should match count of getAllOrixas', () => {
      const orixas = getAllOrixas();
      const destinies = getAllOrixaDestinies();
      expect(destinies.length).toBe(orixas.length);
    });
  });

  describe('getOrixasByDestiny', () => {
    it('should return Orixás with creation destiny', () => {
      const result = getOrixasByDestiny('criacao');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Oxalá')).toBe(true);
    it('should return Orixás with transformation destiny', () => {
      const result = getOrixasByDestiny('transformacao');
      expect(result.length).toBe(4);
      expect(result.some(r => r.orixa === 'Iansã')).toBe(true);
      expect(result.some(r => r.orixa === 'Omolu')).toBe(true);
      expect(result.some(r => r.orixa === 'Xangô')).toBe(true);
      expect(result.some(r => r.orixa === 'Nanã')).toBe(true);
    });
      const mainAncestral = result.filter(r => r.caminho_destino === 'ancestralidade');
      const secondaryAncestral = result.filter(r => r.caminho_secundario === 'ancestralidade');
      expect(mainAncestral.length + secondaryAncestral.length).toBeGreaterThan(0);
    });

    it('should return empty array for destiny path with no Orixás', () => {
      const result = getOrixasByDestiny('equilibrio');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás with água element', () => {
      const result = getOrixasByElement('água');
      expect(result.length).toBe(3);
      const orixas = result.map(r => r.orixa);
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Nanã');
    });

    it('should return Orixás with terra element', () => {
      const result = getOrixasByElement('terra');
      expect(result.length).toBe(3);
      const orixas = result.map(r => r.orixa);
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Omolu');
    });

    it('should return Orixás with fogo element', () => {
      const result = getOrixasByElement('fogo');
      expect(result.length).toBe(2);
      const orixas = result.map(r => r.orixa);
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
    });

    it('should return Orixás with éter element', () => {
      const result = getOrixasByElement('éter');
      expect(result.length).toBe(1);
      expect(result[0].orixa).toBe('Oxalá');
    });
  });

  describe('getDestinyPathStats', () => {
    it('should return record with all destiny paths', () => {
      const result = getDestinyPathStats();
      expect(result).toHaveProperty('criacao');
      expect(result).toHaveProperty('guerra');
      expect(result).toHaveProperty('sabedoria');
      expect(result).toHaveProperty('amor');
      expect(result).toHaveProperty('transformacao');
      expect(result).toHaveProperty('justice');
      expect(result).toHaveProperty('ancestralidade');
      expect(result).toHaveProperty('protecao');
      expect(result).toHaveProperty('abundancia');
      expect(result).toHaveProperty('equilibrio');
    });

    it('should count transformation path correctly', () => {
      const result = getDestinyPathStats();
      expect(result.transformacao).toBeGreaterThanOrEqual(2);
    });

    it('should have valid number values for all paths', () => {
      const result = getDestinyPathStats();
      Object.values(result).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Destiny correlation consistency', () => {
    it('should have sequential journey numbers 1-9', () => {
      const destinies = getAllOrixaDestinies();
      const numbers = destinies.map(d => d.numero_jornada).sort((a, b) => a - b);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should have each Orixá with unique journey number', () => {
      const destinies = getAllOrixaDestinies();
      const numbers = destinies.map(d => d.numero_jornada);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it('should include meaningful spiritual lesson for each Orixá', () => {
      const destinies = getAllOrixaDestinies();
      destinies.forEach(d => {
        expect(d.licao_central.length).toBeGreaterThan(10);
        expect(d.significado_espiritual.length).toBeGreaterThan(20);
      });
    });
  });
});