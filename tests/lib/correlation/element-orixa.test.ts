/**
 * Element-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getElementOrixa,
  getOrixaElement,
  getAllElementOrixas,
  getElementoQualidade,
  getOrixasPorElemento,
} from '@/lib/correlation/element-orixa';

describe('Element-Orixá Correlation', () => {
  describe('getElementOrixa', () => {
    it('should return fogo mapping with Xangô as primary orixá', () => {
      const result = getElementOrixa('fogo');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome_portugues).toBe('Fogo');
      expect(result?.orixa_principal).toBe('Xangô');
      expect(result?.orixas_secundarios).toContain('Iansã');
      expect(result?.orixas_secundarios).toContain('Ogum');
    });

    it('should return água mapping with Iemanjá as primary orixá', () => {
      const result = getElementOrixa('água');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
      expect(result?.elemento_nome_portugues).toBe('Água');
      expect(result?.orixa_principal).toBe('Iemanjá');
      expect(result?.orixas_secundarios).toContain('Oxum');
      expect(result?.orixas_secundarios).toContain('Nanã');
    });

    it('should return ar mapping with Xangô as primary orixá', () => {
      const result = getElementOrixa('ar');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
      expect(result?.orixa_principal).toBe('Xangô');
      expect(result?.qualidades_espirituais).toContain('Comunicação e expressão');
    });

    it('should return terra mapping with Oxóssi as primary orixá', () => {
      const result = getElementOrixa('terra');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
      expect(result?.orixa_principal).toBe('Oxóssi');
      expect(result?.orixas_secundarios).toContain('Ogum');
      expect(result?.orixas_secundarios).toContain('Omolu');
    });

    it('should return éter mapping with Oxalá as primary orixá', () => {
      const result = getElementOrixa('éter');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
      expect(result?.orixa_principal).toBe('Oxalá');
      expect(result?.orixas_secundarios).toContain('Iemanjá');
    });

    it('should include spiritual qualities for each element', () => {
      const result = getElementOrixa('fogo');
      
      expect(result?.qualidades_espirituais).toBeDefined();
      expect(result?.qualidades_espirituais.length).toBeGreaterThan(0);
      expect(result?.qualidades_espirituais).toContain('Paixão e propósito');
    });

    it('should include sacred practices for each element', () => {
      const result = getElementOrixa('água');
      
      expect(result?.praticas_sagradas).toBeDefined();
      expect(result?.praticas_sagradas.length).toBeGreaterThan(0);
      expect(result?.praticas_sagradas).toContain('Oferendas na praia (Iemanjá)');
    });

    it('should include planetary associations', () => {
      const result = getElementOrixa('terra');
      
      expect(result?.associacoes_planetarias).toBeDefined();
      expect(result?.associacoes_planetarias.length).toBeGreaterThan(0);
    });

    it('should include cardinal direction for each element', () => {
      expect(getElementOrixa('fogo')?.direcao_cardinal).toBe('Sul');
      expect(getElementOrixa('água')?.direcao_cardinal).toBe('Oeste');
      expect(getElementOrixa('ar')?.direcao_cardinal).toBe('Leste');
      expect(getElementOrixa('terra')?.direcao_cardinal).toBe('Norte');
      expect(getElementOrixa('éter')?.direcao_cardinal).toBe('Centro');
    });

    it('should include seasonal associations', () => {
      expect(getElementOrixa('fogo')?.estacao).toBe('Verão');
      expect(getElementOrixa('água')?.estacao).toBe('Inverno');
      expect(getElementOrixa('ar')?.estacao).toBe('Primavera');
      expect(getElementOrixa('terra')?.estacao).toBe('Outono');
      expect(getElementOrixa('éter')?.estacao).toBe('Todas');
    });

    it('should include time of day associations', () => {
      expect(getElementOrixa('fogo')?.momento_dia).toBe('Meio-dia');
      expect(getElementOrixa('água')?.momento_dia).toBe('Noite');
      expect(getElementOrixa('ar')?.momento_dia).toBe('Manhã');
      expect(getElementOrixa('terra')?.momento_dia).toBe('Entardecer');
    });

    it('should be case-insensitive', () => {
      expect(getElementOrixa('FOGO')).toBeDefined();
      expect(getElementOrixa('Água')).toBeDefined();
      expect(getElementOrixa('AR')).toBeDefined();
    });

    it('should handle accented characters', () => {
      expect(getElementOrixa('agua')).toBeDefined();
      expect(getElementOrixa('eter')).toBeDefined();
    });

    it('should return undefined for unknown element', () => {
      expect(getElementOrixa('unknown')).toBeUndefined();
      expect(getElementOrixa('')).toBeUndefined();
      expect(getElementOrixa('metal')).toBeUndefined();
    });
  });

  describe('getOrixaElement', () => {
    it('should return complete Orixá to element mapping', () => {
      const result = getOrixaElement();
      
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should map Oxalá to éter', () => {
      const result = getOrixaElement();
      
      expect(result['Oxalá']).toBe('éter');
    });

    it('should map Xangô to fogo', () => {
      const result = getOrixaElement();
      
      expect(result['Xangô']).toBe('fogo');
    });

    it('should map Iansã to fogo', () => {
      const result = getOrixaElement();
      
      expect(result['Iansã']).toBe('fogo');
    });

    it('should map Iemanjá to água', () => {
      const result = getOrixaElement();
      
      expect(result['Iemanjá']).toBe('água');
    });

    it('should map Oxum to água', () => {
      const result = getOrixaElement();
      
      expect(result['Oxum']).toBe('água');
    });

    it('should map Nanã to água', () => {
      const result = getOrixaElement();
      
      expect(result['Nanã']).toBe('água');
    });

    it('should map Ogum to terra', () => {
      const result = getOrixaElement();
      
      expect(result['Ogum']).toBe('terra');
    });

    it('should map Oxóssi to terra', () => {
      const result = getOrixaElement();
      
      expect(result['Oxóssi']).toBe('terra');
    });

    it('should map Omolu to terra', () => {
      const result = getOrixaElement();
      
      expect(result['Omolu']).toBe('terra');
    });

    it('should return consistent mapping with getElementOrixa', () => {
      const toElement = getOrixaElement();
      const toOrixa = getElementOrixa('fogo');
      
      // Fire element maps to Xangô (primary) and Iansã (secondary)
      expect(toOrixa?.orixa_principal).toBe('Xangô');
      expect(toElement['Xangô']).toBe('fogo');
    });
  });

  describe('getAllElementOrixas', () => {
    it('should return array of all element mappings', () => {
      const result = getAllElementOrixas();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
    });

    it('should include all five elements', () => {
      const result = getAllElementOrixas();
      const elementos = result.map(r => r.elemento);
      
      expect(elementos).toContain('fogo');
      expect(elementos).toContain('água');
      expect(elementos).toContain('ar');
      expect(elementos).toContain('terra');
      expect(elementos).toContain('éter');
    });

    it('should return complete mapping objects', () => {
      const result = getAllElementOrixas();
      
      for (const mapping of result) {
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_nome_portugues).toBeDefined();
        expect(mapping.orixa_principal).toBeDefined();
        expect(mapping.orixas_secundarios).toBeDefined();
        expect(Array.isArray(mapping.orixas_secundarios)).toBe(true);
        expect(mapping.qualidades_espirituais).toBeDefined();
        expect(Array.isArray(mapping.qualidades_espirituais)).toBe(true);
        expect(mapping.praticas_sagradas).toBeDefined();
        expect(Array.isArray(mapping.praticas_sagradas)).toBe(true);
      }
    });

    it('should not have duplicate elements', () => {
      const result = getAllElementOrixas();
      const elementos = result.map(r => r.elemento);
      const unique = new Set(elementos);
      
      expect(unique.size).toBe(elementos.length);
    });
  });

  describe('getElementoQualidade', () => {
    it('should return qualidade for fogo element', () => {
      const result = getElementoQualidade('fogo');
      
      expect(result).toBeDefined();
      expect(result?.forca).toBeDefined();
      expect(result?.desafio).toBeDefined();
      expect(result?.licao).toBeDefined();
      expect(result?.afirmacao).toBeDefined();
    });

    it('should return qualidade for água element', () => {
      const result = getElementoQualidade('água');
      
      expect(result).toBeDefined();
      expect(result?.forca).toContain('Intuição');
      expect(result?.afirmacao).toContain('fluo');
    });

    it('should return qualidade for ar element', () => {
      const result = getElementoQualidade('ar');
      
      expect(result).toBeDefined();
      expect(result?.forca).toContain('Comunicação');
    });

    it('should return qualidade for terra element', () => {
      const result = getElementoQualidade('terra');
      
      expect(result).toBeDefined();
      expect(result?.forca).toContain('Paciência');
      expect(result?.afirmacao).toContain('abundante');
    });

    it('should return qualidade for éter element', () => {
      const result = getElementoQualidade('éter');
      
      expect(result).toBeDefined();
      expect(result?.forca).toContain('Sabedoria');
    });

    it('should return undefined for unknown element', () => {
      expect(getElementoQualidade('unknown')).toBeUndefined();
    });
  });

  describe('getOrixasPorElemento', () => {
    it('should return primary and secondary orixás for fogo', () => {
      const result = getOrixasPorElemento('fogo');
      
      expect(result).toBeDefined();
      expect(result?.principal).toBe('Xangô');
      expect(result?.secundarios).toContain('Iansã');
      expect(result?.secundarios).toContain('Ogum');
    });

    it('should return primary and secondary orixás for água', () => {
      const result = getOrixasPorElemento('água');
      
      expect(result).toBeDefined();
      expect(result?.principal).toBe('Iemanjá');
      expect(result?.secundarios).toContain('Oxum');
      expect(result?.secundarios).toContain('Nanã');
    });

    it('should return primary and secondary orixás for terra', () => {
      const result = getOrixasPorElemento('terra');
      
      expect(result).toBeDefined();
      expect(result?.principal).toBe('Oxóssi');
      expect(result?.secundarios).toContain('Ogum');
      expect(result?.secundarios).toContain('Omolu');
    });

    it('should return primary and secondary orixás for ar', () => {
      const result = getOrixasPorElemento('ar');
      
      expect(result).toBeDefined();
      expect(result?.principal).toBe('Xangô');
      expect(result?.secundarios).toContain('Iansã');
      expect(result?.secundarios).toContain('Oxalá');
    });

    it('should return primary and secondary orixás for éter', () => {
      const result = getOrixasPorElemento('éter');
      
      expect(result).toBeDefined();
      expect(result?.principal).toBe('Oxalá');
      expect(result?.secundarios).toContain('Iemanjá');
    });

    it('should return undefined for unknown element', () => {
      expect(getOrixasPorElemento('unknown')).toBeUndefined();
    });
  });

  describe('Element correlation consistency', () => {
    it('should have consistent element to orixá relationships', () => {
      const allMappings = getAllElementOrixas();
      
      // Each primary orixá should be unique
      const primaryOrixas = allMappings.map(m => m.orixa_principal);
      const uniquePrimary = new Set(primaryOrixas);
      
      expect(uniquePrimary.size).toBeGreaterThanOrEqual(4);
    });

    it('should have consistent secondary orixá distribution', () => {
      const allMappings = getAllElementOrixas();
      
      // Fire element should have Iansã as secondary
      const fogoMapping = allMappings.find(m => m.elemento === 'fogo');
      expect(fogoMapping?.orixas_secundarios).toContain('Iansã');
      
      // Water element should have Oxum and Nanã as secondary
      const aguaMapping = allMappings.find(m => m.elemento === 'água');
      expect(aguaMapping?.orixas_secundarios).toContain('Oxum');
      expect(aguaMapping?.orixas_secundarios).toContain('Nanã');
    });

    it('should have matching cardinal directions', () => {
      expect(getElementOrixa('fogo')?.direcao_cardinal).toBe('Sul');
      expect(getElementOrixa('terra')?.direcao_cardinal).toBe('Norte');
    });

    it('should have matching seasonal associations', () => {
      // Fire = Summer
      expect(getElementOrixa('fogo')?.estacao).toBe('Verão');
      // Water = Winter
      expect(getElementOrixa('água')?.estacao).toBe('Inverno');
    });

    it('should have matching time of day associations', () => {
      // Fire = Midday
      expect(getElementOrixa('fogo')?.momento_dia).toBe('Meio-dia');
      // Water = Night
      expect(getElementOrixa('água')?.momento_dia).toBe('Noite');
    });
  });
});