/**
 * Element-Chakra Spiritual Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getElementChakra,
  getChakraElement,
  getAllElementChakras,
  getChakrasPorElemento,
} from '@/lib/correlation/element-chakra';

describe('Element-Chakra Spiritual Correlation', () => {
  describe('getElementChakra', () => {
    it('should return terra mapping with Muladhara as primary chakra', () => {
      const result = getElementChakra('terra');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
      expect(result?.elemento_nome_portugues).toBe('Terra');
      expect(result?.chakra_primario).toBe('Muladhara');
      expect(result?.chakra_secundario).toBeNull();
      expect(result?.chakra_numero_primario).toBe('1º Básico (Raiz)');
    });

    it('should return água mapping with Svadhisthana as primary and Anahata as secondary', () => {
      const result = getElementChakra('água');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
      expect(result?.elemento_nome_portugues).toBe('Água');
      expect(result?.chakra_primario).toBe('Svadhisthana');
      expect(result?.chakra_secundario).toBe('Anahata');
      expect(result?.chakra_numero_primario).toBe('2º Sacral (Esplênico)');
      expect(result?.chakra_numero_secundario).toBe('4º Cardíaco (Coração)');
    });

    it('should return fogo mapping with Manipura as primary chakra', () => {
      const result = getElementChakra('fogo');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome_portugues).toBe('Fogo');
      expect(result?.chakra_primario).toBe('Manipura');
      expect(result?.chakra_secundario).toBeNull();
      expect(result?.chakra_numero_primario).toBe('3º Plexo Solar');
    });

    it('should return ar mapping with Vishuddha as primary and Ajna as secondary', () => {
      const result = getElementChakra('ar');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
      expect(result?.elemento_nome_portugues).toBe('Ar');
      expect(result?.chakra_primario).toBe('Vishuddha');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.chakra_numero_primario).toBe('5º Laríngeo (Garganta)');
      expect(result?.chakra_numero_secundario).toBe('6º Terceiro Olho (Frontal)');
    });

    it('should return éter mapping with Ajna as primary and Sahasrara as secondary', () => {
      const result = getElementChakra('éter');
      
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
      expect(result?.elemento_nome_portugues).toBe('Éter');
      expect(result?.chakra_primario).toBe('Ajna');
      expect(result?.chakra_secundario).toBe('Sahasrara');
      expect(result?.chakra_numero_primario).toBe('6º Terceiro Olho (Frontal)');
      expect(result?.chakra_numero_secundario).toBe('7º Coronário (Plexo Superior)');
    });

    it('should include planetary connections for each element', () => {
      const terra = getElementChakra('terra');
      expect(terra?.conexao_planetaria.planeta_primario).toBe('Lua');
      expect(terra?.conexao_planetaria.planeta_secundario).toBe('Saturno');

      const agua = getElementChakra('água');
      expect(agua?.conexao_planetaria.planeta_primario).toBe('Marte');
      expect(agua?.conexao_planetaria.planeta_secundario).toBe('Vênus');

      const fogo = getElementChakra('fogo');
      expect(fogo?.conexao_planetaria.planeta_primario).toBe('Mercúrio');
      expect(fogo?.conexao_planetaria.planeta_secundario).toBe('Sol');

      const ar = getElementChakra('ar');
      expect(ar?.conexao_planetaria.planeta_primario).toBe('Mercúrio');
      expect(ar?.conexao_planetaria.planeta_secundario).toBe('Lua');

      const eter = getElementChakra('éter');
      expect(eter?.conexao_planetaria.planeta_primario).toBe('Lua');
      expect(eter?.conexao_planetaria.planeta_secundario).toBe('Sol');
    });

    it('should include spiritual meaning for each element', () => {
      const fogo = getElementChakra('fogo');
      expect(fogo?.significado_espiritual.qualidade).toBeDefined();
      expect(fogo?.significado_espiritual.licao).toBeDefined();
      expect(fogo?.significado_espiritual.pratica).toBeDefined();
      expect(fogo?.significado_espiritual.qualidade).toContain('Transformação');
    });

    it('should include mantras for each element', () => {
      const terra = getElementChakra('terra');
      expect(terra?.mantras).toBeDefined();
      expect(terra?.mantras.length).toBeGreaterThan(0);
      expect(terra?.mantras).toContain('LAM (396 Hz)');

      const agua = getElementChakra('água');
      expect(agua?.mantras).toContain('VAM (417 Hz)');
      expect(agua?.mantras).toContain('RAM (528 Hz)');

      const fogo = getElementChakra('fogo');
      expect(fogo?.mantras).toContain('RAM (528 Hz)');

      const ar = getElementChakra('ar');
      expect(ar?.mantras).toContain('HAM (741 Hz)');
      expect(ar?.mantras).toContain('OM (852 Hz)');

      const eter = getElementChakra('éter');
      expect(eter?.mantras).toContain('OM (852 Hz)');
      expect(eter?.mantras).toContain('AUM (963 Hz)');
    });

    it('should be case-insensitive', () => {
      expect(getElementChakra('TERRA')).toBeDefined();
      expect(getElementChakra('ÁGUA')).toBeDefined();
      expect(getElementChakra('FOGO')).toBeDefined();
      expect(getElementChakra('Ar')).toBeDefined();
      expect(getElementChakra('ÉTER')).toBeDefined();
    });

    it('should handle accented characters', () => {
      expect(getElementChakra('agua')).toBeDefined();
      expect(getElementChakra('agua')?.elemento).toBe('água');
      expect(getElementChakra('eter')).toBeDefined();
      expect(getElementChakra('eter')?.elemento).toBe('éter');
    });

    it('should handle alternative element names', () => {
      expect(getElementChakra('ether')).toBeDefined();
      expect(getElementChakra('akasha')).toBeDefined();
    });

    it('should return undefined for unknown element', () => {
      expect(getElementChakra('unknown')).toBeUndefined();
      expect(getElementChakra('')).toBeUndefined();
      expect(getElementChakra('metal')).toBeUndefined();
      expect(getElementChakra('água')).toBeDefined();
    });
  });

  describe('getChakraElement', () => {
    it('should return complete chakra to element mapping', () => {
      const result = getChakraElement();
      
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBe(7);
    });

    it('should map Muladhara to terra', () => {
      const result = getChakraElement();
      
      expect(result['Muladhara']).toBe('terra');
    });

    it('should map Svadhisthana to água', () => {
      const result = getChakraElement();
      
      expect(result['Svadhisthana']).toBe('água');
    });

    it('should map Manipura to fogo', () => {
      const result = getChakraElement();
      
      expect(result['Manipura']).toBe('fogo');
    });

    it('should map Anahata to ar', () => {
      const result = getChakraElement();
      
      expect(result['Anahata']).toBe('ar');
    });

    it('should map Vishuddha to ar', () => {
      const result = getChakraElement();
      
      expect(result['Vishuddha']).toBe('ar');
    });

    it('should map Ajna to éter', () => {
      const result = getChakraElement();
      
      expect(result['Ajna']).toBe('éter');
    });

    it('should map Sahasrara to éter', () => {
      const result = getChakraElement();
      
      expect(result['Sahasrara']).toBe('éter');
    });

    it('should be consistent with getElementChakra primary mappings', () => {
      const toElement = getChakraElement();
      
      // Terra -> Muladhara
      const terra = getElementChakra('terra');
      expect(toElement[terra!.chakra_primario]).toBe('terra');
      
      // Água -> Svadhisthana
      const agua = getElementChakra('água');
      expect(toElement[agua!.chakra_primario]).toBe('água');
      
      // Fogo -> Manipura
      const fogo = getElementChakra('fogo');
      expect(toElement[fogo!.chakra_primario]).toBe('fogo');
      
      // Ar -> Vishuddha
      const ar = getElementChakra('ar');
      expect(toElement[ar!.chakra_primario]).toBe('ar');
      
      // Éter -> Ajna
      const eter = getElementChakra('éter');
      expect(toElement[eter!.chakra_primario]).toBe('éter');
    });
  });

  describe('getAllElementChakras', () => {
    it('should return array of all element mappings', () => {
      const result = getAllElementChakras();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
    });

    it('should include all five elements', () => {
      const result = getAllElementChakras();
      const elementos = result.map(r => r.elemento);
      
      expect(elementos).toContain('terra');
      expect(elementos).toContain('água');
      expect(elementos).toContain('fogo');
      expect(elementos).toContain('ar');
      expect(elementos).toContain('éter');
    });

    it('should return complete mapping objects', () => {
      const result = getAllElementChakras();
      
      for (const mapping of result) {
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_nome_portugues).toBeDefined();
        expect(mapping.chakra_primario).toBeDefined();
        expect(mapping.chakra_numero_primario).toBeDefined();
        expect(mapping.conexao_planetaria).toBeDefined();
        expect(mapping.conexao_planetaria.planeta_primario).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.qualidade).toBeDefined();
        expect(mapping.significado_espiritual.licao).toBeDefined();
        expect(mapping.significado_espiritual.pratica).toBeDefined();
        expect(mapping.mantras).toBeDefined();
        expect(Array.isArray(mapping.mantras)).toBe(true);
      }
    });

    it('should not have duplicate elements', () => {
      const result = getAllElementChakras();
      const elementos = result.map(r => r.elemento);
      const unique = new Set(elementos);
      
      expect(unique.size).toBe(elementos.length);
    });
  });

  describe('getChakrasPorElemento', () => {
    it('should return primary and secondary chakras for terra', () => {
      const result = getChakrasPorElemento('terra');
      
      expect(result).toBeDefined();
      expect(result?.primario).toBe('Muladhara');
      expect(result?.secundario).toBeNull();
    });

    it('should return primary and secondary chakras for água', () => {
      const result = getChakrasPorElemento('água');
      
      expect(result).toBeDefined();
      expect(result?.primario).toBe('Svadhisthana');
      expect(result?.secundario).toBe('Anahata');
    });

    it('should return primary and secondary chakras for fogo', () => {
      const result = getChakrasPorElemento('fogo');
      
      expect(result).toBeDefined();
      expect(result?.primario).toBe('Manipura');
      expect(result?.secundario).toBeNull();
    });

    it('should return primary and secondary chakras for ar', () => {
      const result = getChakrasPorElemento('ar');
      
      expect(result).toBeDefined();
      expect(result?.primario).toBe('Vishuddha');
      expect(result?.secundario).toBe('Ajna');
    });

    it('should return primary and secondary chakras for éter', () => {
      const result = getChakrasPorElemento('éter');
      
      expect(result).toBeDefined();
      expect(result?.primario).toBe('Ajna');
      expect(result?.secundario).toBe('Sahasrara');
    });

    it('should return undefined for unknown element', () => {
      expect(getChakrasPorElemento('unknown')).toBeUndefined();
      expect(getChakrasPorElemento('')).toBeUndefined();
    });
  });

  describe('Element-Chakra correlation consistency', () => {
    it('should have correct chakra numbers matching chakra-element.ts', () => {
      const terra = getElementChakra('terra');
      expect(terra?.chakra_numero_primario).toContain('1º');
      
      const agua = getElementChakra('água');
      expect(agua?.chakra_numero_primario).toContain('2º');
      expect(agua?.chakra_numero_secundario).toContain('4º');
      
      const fogo = getElementChakra('fogo');
      expect(fogo?.chakra_numero_primario).toContain('3º');
      
      const ar = getElementChakra('ar');
      expect(ar?.chakra_numero_primario).toContain('5º');
      expect(ar?.chakra_numero_secundario).toContain('6º');
      
      const eter = getElementChakra('éter');
      expect(eter?.chakra_numero_primario).toContain('6º');
      expect(eter?.chakra_numero_secundario).toContain('7º');
    });

    it('should have consistent planet connections across elements', () => {
      // All elements should have at least one planetary connection
      const allElements = getAllElementChakras();
      for (const element of allElements) {
        expect(element.conexao_planetaria.planeta_primario).toBeDefined();
      }
    });

    it('should cover all 7 chakras across elements', () => {
      const toChakra = getChakraElement();
      const chakraValues = Object.values(toChakra);
      
      const uniqueChakras = new Set(chakraValues);
      // Since one element can map to multiple chakras (primary + secondary),
      // we need to check the full chakra coverage through getAllElementChakras
      const allChakras = new Set<string>();
      for (const element of getAllElementChakras()) {
        allChakras.add(element.chakra_primario);
        if (element.chakra_secundario) {
          allChakras.add(element.chakra_secundario);
        }
      }
      
      expect(allChakras.size).toBe(7);
      expect(allChakras.has('Muladhara')).toBe(true);
      expect(allChakras.has('Svadhisthana')).toBe(true);
      expect(allChakras.has('Manipura')).toBe(true);
      expect(allChakras.has('Anahata')).toBe(true);
      expect(allChakras.has('Vishuddha')).toBe(true);
      expect(allChakras.has('Ajna')).toBe(true);
      expect(allChakras.has('Sahasrara')).toBe(true);
    });

    it('should have mantras matching corresponding chakra frequencies', () => {
      // Terra (Muladhara) - LAM
      const terra = getElementChakra('terra');
      expect(terra?.mantras.some(m => m.includes('LAM'))).toBe(true);
      
      // Água (Svadhisthana) - VAM
      const agua = getElementChakra('água');
      expect(agua?.mantras.some(m => m.includes('VAM'))).toBe(true);
      
      // Fogo (Manipura) - RAM
      const fogo = getElementChakra('fogo');
      expect(fogo?.mantras.some(m => m.includes('RAM'))).toBe(true);
      
      // Ar (Vishuddha) - HAM
      const ar = getElementChakra('ar');
      expect(ar?.mantras.some(m => m.includes('HAM'))).toBe(true);
      
      // Éter (Ajna/Sahasrara) - OM/AUM
      const eter = getElementChakra('éter');
      expect(eter?.mantras.some(m => m.includes('OM') || m.includes('AUM'))).toBe(true);
    });
  });
});
