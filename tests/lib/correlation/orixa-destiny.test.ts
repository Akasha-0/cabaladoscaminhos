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
    it('should return Oxalá mapping with creation destiny path', () => {
      const result = getOrixaDestiny('Oxalá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.caminho_destino).toBe('criacao');
      expect(result?.numero_jornada).toBe(1);
      expect(result?.elemento).toBe('éter');
    });

    it('should return Iemanjá mapping with love destiny path', () => {
      const result = getOrixaDestiny('Iemanjá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.caminho_destino).toBe('amor');
      expect(result?.caminho_secundario).toBe('ancestralidade');
      expect(result?.numero_jornada).toBe(2);
      expect(result?.elemento).toBe('água');
    });

    it('should return Oxum with abundance destiny path', () => {
      const result = getOrixaDestiny('Oxum');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('abundancia');
      expect(result?.caminho_secundario).toBe('amor');
      expect(result?.numero_jornada).toBe(3);
      expect(result?.elemento).toBe('água');
    });

    it('should return Ogum with war destiny path', () => {
      const result = getOrixaDestiny('Ogum');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('guerra');
      expect(result?.caminho_secundario).toBe('protecao');
      expect(result?.numero_jornada).toBe(4);
      expect(result?.elemento).toBe('terra');
    });

    it('should return Oxóssi with wisdom destiny path', () => {
      const result = getOrixaDestiny('Oxóssi');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('sabedoria');
      expect(result?.caminho_secundario).toBe('abundancia');
      expect(result?.numero_jornada).toBe(5);
      expect(result?.elemento).toBe('terra');
    });

    it('should return Xangô with justice destiny path', () => {
      const result = getOrixaDestiny('Xangô');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('justice');
      expect(result?.caminho_secundario).toBe('transformacao');
      expect(result?.numero_jornada).toBe(6);
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Iansã with transformation destiny path', () => {
      const result = getOrixaDestiny('Iansã');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.caminho_secundario).toBe('guerra');
      expect(result?.numero_jornada).toBe(7);
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Omolu with transformation destiny path', () => {
      const result = getOrixaDestiny('Omolu');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.caminho_secundario).toBe('ancestralidade');
      expect(result?.numero_jornada).toBe(8);
      expect(result?.elemento).toBe('terra');
    });

    it('should return Nanã with ancestry destiny path', () => {
      const result = getOrixaDestiny('Nanã');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('ancestralidade');
      expect(result?.caminho_secundario).toBe('transformacao');
      expect(result?.numero_jornada).toBe(9);
      expect(result?.elemento).toBe('água');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaDestiny('oxalá')?.orixa).toBe('Oxalá');
      expect(getOrixaDestiny('OXALÁ')?.orixa).toBe('Oxalá');
      expect(getOrixaDestiny('iEmAnJá')?.orixa).toBe('Iemanjá');
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaDestiny('UnknownOrixa')).toBeUndefined();
      expect(getOrixaDestiny('')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaDestiny('Oxalá');
      
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('caminho_destino');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('licao_central');
      expect(result).toHaveProperty('numero_jornada');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('tema_vida');
    });

    it('should return Oxalá with creation spiritual meaning', () => {
      const result = getOrixaDestiny('Oxalá');
      
      expect(result?.significado_espiritual).toContain('criação');
      expect(result?.licao_central).toContain('criação');
    });

    it('should return Iemanjá with love spiritual meaning', () => {
      const result = getOrixaDestiny('Iemanjá');
      
      expect(result?.significado_espiritual).toContain('amor');
      expect(result?.significado_espiritual).toContain('água');
      expect(result?.tema_vida).toContain('Fertilidade');
    });

    it('should return Xangô with justice spiritual meaning', () => {
      const result = getOrixaDestiny('Xangô');
      
      expect(result?.significado_espiritual).toContain('justiça');
      expect(result?.tema_vida).toContain('Justiça');
    });

    it('should trim whitespace from input', () => {
      expect(getOrixaDestiny('  Oxalá  ')?.orixa).toBe('Oxalá');
      expect(getOrixaDestiny('\tIemanjá\n')?.orixa).toBe('Iemanjá');
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of Orixá names', () => {
      const result = getAllOrixas();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all major Orixás', () => {
      const result = getAllOrixas();
      
      expect(result).toContain('Oxalá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Ogum');
      expect(result).toContain('Oxum');
      expect(result).toContain('Xangô');
      expect(result).toContain('Iansã');
      expect(result).toContain('Oxóssi');
      expect(result).toContain('Omolu');
      expect(result).toContain('Nanã');
    });

    it('should return unique Orixás', () => {
      const result = getAllOrixas();
      const unique = new Set(result);
      
      expect(unique.size).toBe(result.length);
    });
  });

  describe('getAllOrixaDestinies', () => {
    it('should return array of OrixaDestiny objects', () => {
      const result = getAllOrixaDestinies();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have all required properties in each object', () => {
      const result = getAllOrixaDestinies();
      
      result.forEach(destiny => {
        expect(destiny).toHaveProperty('orixa');
        expect(destiny).toHaveProperty('caminho_destino');
        expect(destiny).toHaveProperty('significado_espiritual');
        expect(destiny).toHaveProperty('licao_central');
        expect(destiny).toHaveProperty('numero_jornada');
        expect(destiny).toHaveProperty('elemento');
        expect(destiny).toHaveProperty('tema_vida');
      });
    });

    it('should return same count as getAllOrixas', () => {
      const allOrixas = getAllOrixas();
      const allDestinies = getAllOrixaDestinies();
      
      expect(allDestinies.length).toBe(allOrixas.length);
    });
  });

  describe('getOrixasByDestiny', () => {
    it('should return Orixás with transformation destiny', () => {
      const result = getOrixasByDestiny('transformacao');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Iansã')).toBe(true);
      expect(result.some(r => r.orixa === 'Omolu')).toBe(true);
    });

    it('should return Orixás with war destiny', () => {
      const result = getOrixasByDestiny('guerra');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Ogum')).toBe(true);
      expect(result.some(r => r.orixa === 'Iansã')).toBe(true);
    });

    it('should return Orixás with love destiny', () => {
      const result = getOrixasByDestiny('amor');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Iemanjá')).toBe(true);
      expect(result.some(r => r.orixa === 'Oxum')).toBe(true);
    });

    it('should return Orixás with creation destiny', () => {
      const result = getOrixasByDestiny('criacao');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Oxalá')).toBe(true);
    });

    it('should return Orixás with wisdom destiny', () => {
      const result = getOrixasByDestiny('sabedoria');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Oxóssi')).toBe(true);
    });

    it('should return Orixás with abundance destiny', () => {
      const result = getOrixasByDestiny('abundancia');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Oxum')).toBe(true);
      expect(result.some(r => r.orixa === 'Oxóssi')).toBe(true);
    });

    it('should include primary and secondary path matches', () => {
      const result = getOrixasByDestiny('ancestralidade');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Iemanjá')).toBe(true);
      expect(result.some(r => r.orixa === 'Nanã')).toBe(true);
      expect(result.some(r => r.orixa === 'Omolu')).toBe(true);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás with fire element', () => {
      const result = getOrixasByElement('fogo');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Xangô')).toBe(true);
      expect(result.some(r => r.orixa === 'Iansã')).toBe(true);
    });

    it('should return Orixás with water element', () => {
      const result = getOrixasByElement('água');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Iemanjá')).toBe(true);
      expect(result.some(r => r.orixa === 'Oxum')).toBe(true);
      expect(result.some(r => r.orixa === 'Nanã')).toBe(true);
    });

    it('should return Orixás with earth element', () => {
      const result = getOrixasByElement('terra');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Ogum')).toBe(true);
      expect(result.some(r => r.orixa === 'Oxóssi')).toBe(true);
      expect(result.some(r => r.orixa === 'Omolu')).toBe(true);
    });

    it('should return Orixás with éter element', () => {
      const result = getOrixasByElement('éter');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Oxalá')).toBe(true);
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

    it('should count transformation as most common path', () => {
      const result = getDestinyPathStats();
      
      expect(result['transformacao']).toBeGreaterThan(1);
    });

    it('should have valid number counts', () => {
      const result = getDestinyPathStats();
      
      Object.values(result).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Destiny correlation consistency', () => {
    it('should have sequential journey numbers from 1-9', () => {
      const allDestinies = getAllOrixaDestinies();
      const journeyNumbers = allDestinies.map(d => d.numero_jornada).sort((a, b) => a - b);
      
      expect(journeyNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should have consistent spiritual meanings', () => {
      const oxala = getOrixaDestiny('Oxalá');
      expect(oxala?.significado_espiritual).toContain('criação');
      expect(oxala?.tema_vida).toContain('Renovação');
      
      const xango = getOrixaDestiny('Xangô');
      expect(xango?.significado_espiritual).toContain('justiça');
      expect(xango?.tema_vida).toContain('Justiça');
    });

    it('should have meaningful life themes', () => {
      const allDestinies = getAllOrixaDestinies();
      
      allDestinies.forEach(destiny => {
        expect(destiny.tema_vida.length).toBeGreaterThan(5);
        expect(destiny.licao_central.length).toBeGreaterThan(5);
        expect(destiny.significado_espiritual.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Default exports', () => {
    it('should have all expected exports from default export', () => {
      const module = await import('@/lib/correlation/orixa-destiny');
      const defaultExport = module.default;
      
      expect(defaultExport).toHaveProperty('getOrixaDestiny');
      expect(defaultExport).toHaveProperty('getAllOrixas');
      expect(defaultExport).toHaveProperty('getAllOrixaDestinies');
      expect(defaultExport).toHaveProperty('getOrixasByDestiny');
      expect(defaultExport).toHaveProperty('getOrixasByElement');
      expect(defaultExport).toHaveProperty('getDestinyPathStats');
    });
  });
});
