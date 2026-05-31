/**
 * Element-Sephirot Spiritual Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getElementSephirot,
  getSephirotElement,
  getAllElementSephiroths,
  getPrimarySephirot,
  getSecondarySephirot,
} from '@/lib/correlation/element-sephirot';

describe('Element-Sephirot Correlation', () => {
  describe('getElementSephirot', () => {
    it('should return fogo mapping with Geburah as primary sephirah', () => {
      const result = getElementSephirot('fogo');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome_portugues).toBe('Fogo');
      expect(result?.sephirah_principal).toBe('Geburah');
      expect(result?.sephirot_secundarios).toContain('Tiphereth');
    });

    it('should return água mapping with Chesed as primary sephirah', () => {
      const result = getElementSephirot('água');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
      expect(result?.elemento_nome_portugues).toBe('Água');
      expect(result?.sephirah_principal).toBe('Chesed');
      expect(result?.sephirot_secundarios).toContain('Netzach');
      expect(result?.sephirot_secundarios).toContain('Yesod');
    });

    it('should return ar mapping with Hod as primary sephirah', () => {
      const result = getElementSephirot('ar');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
      expect(result?.elemento_nome_portugues).toBe('Ar');
      expect(result?.sephirah_principal).toBe('Hod');
      expect(result?.sephirot_secundarios).toContain('Binah');
    });

    it('should return terra mapping with Malkuth as primary sephirah', () => {
      const result = getElementSephirot('terra');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
      expect(result?.elemento_nome_portugues).toBe('Terra');
      expect(result?.sephirah_principal).toBe('Malkuth');
      expect(result?.sephirot_secundarios).toHaveLength(0);
    });

    it('should return éter mapping with Kether as primary sephirah', () => {
      const result = getElementSephirot('éter');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
      expect(result?.elemento_nome_portugues).toBe('Éter');
      expect(result?.sephirah_principal).toBe('Kether');
      expect(result?.sephirot_secundarios).toContain('Chokmah');
    });

    it('should include chakra connection for each element', () => {
      expect(getElementSephirot('fogo')?.chakra).toBe('3º Plexo Solar');
      expect(getElementSephirot('fogo')?.chakra_numero).toBe(3);
      expect(getElementSephirot('água')?.chakra).toBe('2º Sacro');
      expect(getElementSephirot('água')?.chakra_numero).toBe(2);
      expect(getElementSephirot('ar')?.chakra).toBe('5º Laríngeo');
      expect(getElementSephirot('ar')?.chakra_numero).toBe(5);
      expect(getElementSephirot('terra')?.chakra).toBe('1º Básico');
      expect(getElementSephirot('terra')?.chakra_numero).toBe(1);
      expect(getElementSephirot('éter')?.chakra).toBe('7º Coronário');
      expect(getElementSephirot('éter')?.chakra_numero).toBe(7);
    });

    it('should include spiritual meaning for each element', () => {
      expect(getElementSephirot('fogo')?.significado_espiritual).toBeDefined();
      expect(getElementSephirot('fogo')?.significado_espiritual.length).toBeGreaterThan(0);
      expect(getElementSephirot('água')?.significado_espiritual).toBeDefined();
      expect(getElementSephirot('água')?.significado_espiritual.length).toBeGreaterThan(0);
      expect(getElementSephirot('ar')?.significado_espiritual).toBeDefined();
      expect(getElementSephirot('ar')?.significado_espiritual.length).toBeGreaterThan(0);
      expect(getElementSephirot('terra')?.significado_espiritual).toBeDefined();
      expect(getElementSephirot('terra')?.significado_espiritual.length).toBeGreaterThan(0);
      expect(getElementSephirot('éter')?.significado_espiritual).toBeDefined();
      expect(getElementSephirot('éter')?.significado_espiritual.length).toBeGreaterThan(0);
    });

    it('should include elemental qualities for each element', () => {
      expect(getElementSephirot('fogo')?.qualidades_elementais).toBeDefined();
      expect(getElementSephirot('fogo')?.qualidades_elementais.length).toBeGreaterThan(0);
      expect(getElementSephirot('fogo')?.qualidades_elementais).toContain('Coragem e determinação');

      expect(getElementSephirot('água')?.qualidades_elementais).toBeDefined();
      expect(getElementSephirot('água')?.qualidades_elementais.length).toBeGreaterThan(0);
      expect(getElementSephirot('água')?.qualidades_elementais).toContain('Intuição e sabedoria emocional');

      expect(getElementSephirot('terra')?.qualidades_elementais).toBeDefined();
      expect(getElementSephirot('terra')?.qualidades_elementais).toContain('Ancoramento e estabilidade');
    });

    it('should include spiritual practices for each element', () => {
      expect(getElementSephirot('fogo')?.praticas_espirituais).toBeDefined();
      expect(getElementSephirot('fogo')?.praticas_espirituais.length).toBeGreaterThan(0);
      expect(getElementSephirot('fogo')?.praticas_espirituais).toContain('Rituais de proteção (Geburah)');

      expect(getElementSephirot('éter')?.praticas_espirituais).toBeDefined();
      expect(getElementSephirot('éter')?.praticas_espirituais).toContain('Rituais de Kether (coroa)');
    });

    it('should include planetary associations', () => {
      expect(getElementSephirot('fogo')?.planetas).toBeDefined();
      expect(getElementSephirot('fogo')?.planetas).toContain('Sol');
      expect(getElementSephirot('fogo')?.planetas).toContain('Marte');

      expect(getElementSephirot('água')?.planetas).toBeDefined();
      expect(getElementSephirot('água')?.planetas).toContain('Lua');
      expect(getElementSephirot('água')?.planetas).toContain('Vênus');

      expect(getElementSephirot('terra')?.planetas).toBeDefined();
      expect(getElementSephirot('terra')?.planetas).toContain('Saturno');
    });

    it('should include sacred colors', () => {
      expect(getElementSephirot('fogo')?.cores).toBeDefined();
      expect(getElementSephirot('fogo')?.cores).toContain('Vermelho');
      expect(getElementSephirot('fogo')?.cores).toContain('Dourado');

      expect(getElementSephirot('água')?.cores).toBeDefined();
      expect(getElementSephirot('água')?.cores).toContain('Azul');
      expect(getElementSephirot('água')?.cores).toContain('Prata');

      expect(getElementSephirot('éter')?.cores).toBeDefined();
      expect(getElementSephirot('éter')?.cores).toContain('Branco');
      expect(getElementSephirot('éter')?.cores).toContain('Violeta');
    });

    it('should include path number for each element', () => {
      expect(getElementSephirot('fogo')?.numero_caminho).toBe(5);
      expect(getElementSephirot('água')?.numero_caminho).toBe(4);
      expect(getElementSephirot('ar')?.numero_caminho).toBe(8);
      expect(getElementSephirot('terra')?.numero_caminho).toBe(10);
      expect(getElementSephirot('éter')?.numero_caminho).toBe(11);
    });

    it('should be case-insensitive', () => {
      expect(getElementSephirot('FOGO')?.elemento).toBe('fogo');
      expect(getElementSephirot('Agua')?.elemento).toBe('água');
      expect(getElementSephirot('AR')?.elemento).toBe('ar');
      expect(getElementSephirot('Terra')?.elemento).toBe('terra');
      expect(getElementSephirot('ETER')?.elemento).toBe('éter');
    });

    it('should handle accented characters', () => {
      expect(getElementSephirot('águá')?.elemento).toBe('água');
      expect(getElementSephirot('fógó')?.elemento).toBe('fogo');
      expect(getElementSephirot('étér')?.elemento).toBe('éter');
    });

    it('should return undefined for unknown element', () => {
      expect(getElementSephirot('unknown')).toBeUndefined();
      expect(getElementSephirot('')).toBeUndefined();
      expect(getElementSephirot('fire')).toBeUndefined();
    });
  });

  describe('getSephirotElement', () => {
    it('should return mapping of all sephiroth to elements', () => {
      const result = getSephirotElement();
      
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(10);
    });

    it('should map éter sephiroth correctly', () => {
      const result = getSephirotElement();
      
      expect(result['Kether']).toBe('éter');
      expect(result['Chokmah']).toBe('éter');
    });

    it('should map ar sephiroth correctly', () => {
      const result = getSephirotElement();
      
      expect(result['Binah']).toBe('ar');
      expect(result['Hod']).toBe('ar');
    });

    it('should map fogo sephiroth correctly', () => {
      const result = getSephirotElement();
      
      expect(result['Geburah']).toBe('fogo');
      expect(result['Tiphereth']).toBe('fogo');
    });

    it('should map água sephiroth correctly', () => {
      const result = getSephirotElement();
      
      expect(result['Chesed']).toBe('água');
      expect(result['Netzach']).toBe('água');
      expect(result['Yesod']).toBe('água');
    });

    it('should map terra sephiroth correctly', () => {
      const result = getSephirotElement();
      
      expect(result['Malkuth']).toBe('terra');
    });

    it('should return a plain object', () => {
      const result = getSephirotElement();
      
      expect(typeof result).toBe('object');
      expect(Array.isArray(result)).toBe(false);
    });
  });

  describe('getAllElementSephiroths', () => {
    it('should return all element-sephirot mappings', () => {
      const result = getAllElementSephiroths();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return exactly 5 elements', () => {
      const result = getAllElementSephiroths();
      
      expect(result.length).toBe(5);
    });

    it('should include all five elements', () => {
      const result = getAllElementSephiroths();
      const elementos = result.map(m => m.elemento);
      
      expect(elementos).toContain('fogo');
      expect(elementos).toContain('água');
      expect(elementos).toContain('ar');
      expect(elementos).toContain('terra');
      expect(elementos).toContain('éter');
    });

    it('should have unique primary sephiroth for each element', () => {
      const result = getAllElementSephiroths();
      const primarySephiroth = result.map(m => m.sephirah_principal);
      const uniqueSet = new Set(primarySephiroth);
      
      expect(uniqueSet.size).toBe(primarySephiroth.length);
    });

    it('should include all required fields for each mapping', () => {
      const result = getAllElementSephiroths();
      
      result.forEach(mapping => {
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_nome_portugues).toBeDefined();
        expect(mapping.sephirah_principal).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.numero_caminho).toBeDefined();
        expect(mapping.qualidades_elementais).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
        expect(mapping.planetas).toBeDefined();
        expect(mapping.cores).toBeDefined();
      });
    });
  });

  describe('getPrimarySephirot', () => {
    it('should return primary sephirah for fogo', () => {
      const result = getPrimarySephirot('fogo');
      
      expect(result).toBe('Geburah');
    });

    it('should return primary sephirah for água', () => {
      const result = getPrimarySephirot('água');
      
      expect(result).toBe('Chesed');
    });

    it('should return primary sephirah for ar', () => {
      const result = getPrimarySephirot('ar');
      
      expect(result).toBe('Hod');
    });

    it('should return primary sephirah for terra', () => {
      const result = getPrimarySephirot('terra');
      
      expect(result).toBe('Malkuth');
    });

    it('should return primary sephirah for éter', () => {
      const result = getPrimarySephirot('éter');
      
      expect(result).toBe('Kether');
    });

    it('should return undefined for unknown element', () => {
      expect(getPrimarySephirot('unknown')).toBeUndefined();
    });
  });

  describe('getSecondarySephirot', () => {
    it('should return secondary sephiroth for fogo', () => {
      const result = getSecondarySephirot('fogo');
      
      expect(result).toEqual(['Tiphereth']);
    });

    it('should return secondary sephiroth for água', () => {
      const result = getSecondarySephirot('água');
      
      expect(result).toContain('Netzach');
      expect(result).toContain('Yesod');
    });

    it('should return secondary sephiroth for ar', () => {
      const result = getSecondarySephirot('ar');
      
      expect(result).toContain('Binah');
    });

    it('should return empty array for terra', () => {
      const result = getSecondarySephirot('terra');
      
      expect(result).toEqual([]);
    });

    it('should return secondary sephiroth for éter', () => {
      const result = getSecondarySephirot('éter');
      
      expect(result).toContain('Chokmah');
    });

    it('should return empty array for unknown element', () => {
      const result = getSecondarySephirot('unknown');
      
      expect(result).toEqual([]);
    });
  });

  describe('Element-Sephirot correlation consistency', () => {
    it('should maintain consistency between getElementSephirot and getSephirotElement', () => {
      const reverseMap = getSephirotElement();
      const allMappings = getAllElementSephiroths();
      
      allMappings.forEach(mapping => {
        const primaryFromReverse = reverseMap[mapping.sephirah_principal];
        expect(primaryFromReverse).toBe(mapping.elemento);
      });
    });

    it('should have chakra numbers correspond to element-chakra mappings', () => {
      const fogo = getElementSephirot('fogo');
      const água = getElementSephirot('água');
      const ar = getElementSephirot('ar');
      const terra = getElementSephirot('terra');
      const éter = getElementSephirot('éter');
      
      expect(fogo?.chakra_numero).toBe(3);
      expect(água?.chakra_numero).toBe(2);
      expect(ar?.chakra_numero).toBe(5);
      expect(terra?.chakra_numero).toBe(1);
      expect(éter?.chakra_numero).toBe(7);
    });

    it('should have path numbers that match sephirah mapping', () => {
      const fogo = getElementSephirot('fogo');
      const água = getElementSephirot('água');
      const ar = getElementSephirot('ar');
      const terra = getElementSephirot('terra');
      const éter = getElementSephirot('éter');
      
      // Geburah is path 5
      expect(fogo?.numero_caminho).toBe(5);
      // Chesed is path 4
      expect(água?.numero_caminho).toBe(4);
      // Hod is path 8
      expect(ar?.numero_caminho).toBe(8);
      // Malkuth is path 10
      expect(terra?.numero_caminho).toBe(10);
      // Kether is path 11
      expect(éter?.numero_caminho).toBe(11);
    });
  });
});