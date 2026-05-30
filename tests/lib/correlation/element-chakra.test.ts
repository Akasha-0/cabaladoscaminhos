import { describe, it, expect } from 'vitest';
import {
  getElementChakras,
  getAllElementMappings,
  getPrimaryChakra,
  getAllChakras,
  getEnergyType,
  getRegentOrixa,
  ELEMENT_CHAKRA_MAPPINGS,
  type ElementChakraMapping,
  type Elemento,
  type Chakra,
} from '@/lib/correlation/element-chakra';

describe('element-chakra', () => {
  // ─── ELEMENT_CHAKRA_MAPPINGS: all 5 elements ──────────────────────────────
  describe('ELEMENT_CHAKRA_MAPPINGS', () => {
    it('contains all 5 elements', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      elements.forEach((el) => {
        expect(ELEMENT_CHAKRA_MAPPINGS[el]).toBeDefined();
      });
      expect(Object.keys(ELEMENT_CHAKRA_MAPPINGS)).toHaveLength(5);
    });

    it('Fogo has correct chakras and orixás', () => {
      const fogo = ELEMENT_CHAKRA_MAPPINGS['Fogo'];
      expect(fogo.chakras_correspondentes.primario).toBe('2º Sacro');
      expect(fogo.chakras_correspondentes.secundarios).toContain('3º Plexo Solar');
      expect(fogo.orixa_regente).toBe('Iansã');
      expect(fogo.orixas_secundarios).toContain('Ogum');
      expect(fogo.orixas_secundarios).toContain('Xangô');
      expect(fogo.qualidade_energetica.tipo).toBe('Quente');
      expect(fogo.qualidade_energetica.polaridade).toBe('Yang');
    });

    it('Água has correct chakras and orixás', () => {
      const agua = ELEMENT_CHAKRA_MAPPINGS['Água'];
      expect(agua.chakras_correspondentes.primario).toBe('2º Sacro');
      expect(agua.chakras_correspondentes.secundarios).toContain('4º Cardíaco');
      expect(agua.chakras_correspondentes.secundarios).toContain('6º Frontal');
      expect(agua.orixa_regente).toBe('Oxum');
      expect(agua.orixas_secundarios).toContain('Iemanjá');
      expect(agua.qualidade_energetica.tipo).toBe('Frio');
      expect(agua.qualidade_energetica.polaridade).toBe('Yin');
    });

    it('Ar has correct chakras and orixás', () => {
      const ar = ELEMENT_CHAKRA_MAPPINGS['Ar'];
      expect(ar.chakras_correspondentes.primario).toBe('4º Cardíaco');
      expect(ar.chakras_correspondentes.secundarios).toContain('3º Plexo Solar');
      expect(ar.chakras_correspondentes.secundarios).toContain('5º Laríngeo');
      expect(ar.orixa_regente).toBe('Oxalá');
      expect(ar.orixas_secundarios).toContain('Oxóssi');
      expect(ar.qualidade_energetica.tipo).toBe('Neutro');
      expect(ar.qualidade_energetica.polaridade).toBe('Equilibrado');
    });

    it('Terra has correct chakras and orixás', () => {
      const terra = ELEMENT_CHAKRA_MAPPINGS['Terra'];
      expect(terra.chakras_correspondentes.primario).toBe('1º Básico');
      expect(terra.chakras_correspondentes.secundarios).toContain('2º Sacro');
      expect(terra.orixa_regente).toBe('Omolu');
      expect(terra.orixas_secundarios).toContain('Nanã');
      expect(terra.qualidade_energetica.tipo).toBe('Quente');
    });

    it('Éter has correct chakras and orixás', () => {
      const eter = ELEMENT_CHAKRA_MAPPINGS['Éter'];
      expect(eter.chakras_correspondentes.primario).toBe('7º Coronário');
      expect(eter.chakras_correspondentes.secundarios).toContain('6º Frontal');
      expect(eter.chakras_correspondentes.secundarios).toContain('5º Laríngeo');
      expect(eter.orixa_regente).toBe('Oxalá');
      expect(eter.qualidade_energetica.tipo).toBe('Neutro');
    });

    it('each element has pratica recommendations', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      elements.forEach((el) => {
        const mapping = ELEMENT_CHAKRA_MAPPINGS[el];
        expect(mapping.praticas_recomendadas.ebos.length).toBeGreaterThan(0);
        expect(mapping.praticas_recomendadas.banhos.length).toBeGreaterThan(0);
        expect(mapping.praticas_recomendadas.defumacoes.length).toBeGreaterThan(0);
        expect(mapping.praticas_recomendadas.mantras.length).toBeGreaterThan(0);
        expect(mapping.praticas_recomendadas.horarios_rituais.length).toBeGreaterThan(0);
      });
    });

    it('each element has sephirot and cardinal direction', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      elements.forEach((el) => {
        const mapping = ELEMENT_CHAKRA_MAPPINGS[el];
        expect(mapping.correspondencia_sefirot).toBeTruthy();
        expect(mapping.direcao_cardinal).toBeTruthy();
      });
    });
  });

  // ─── getElementChakras: lookup function ───────────────────────────────────
  describe('getElementChakras', () => {
    it('returns correct mapping for Fogo', () => {
      const result = getElementChakras('Fogo');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Fogo');
      expect(result!.chakras_correspondentes.primario).toBe('2º Sacro');
      expect(result!.orixa_regente).toBe('Iansã');
    });

    it('returns correct mapping for Água', () => {
      const result = getElementChakras('Água');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Água');
      expect(result!.chakras_correspondentes.primario).toBe('2º Sacro');
      expect(result!.orixa_regente).toBe('Oxum');
    });

    it('returns correct mapping for Ar', () => {
      const result = getElementChakras('Ar');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Ar');
      expect(result!.chakras_correspondentes.primario).toBe('4º Cardíaco');
      expect(result!.orixa_regente).toBe('Oxalá');
    });

    it('returns correct mapping for Terra', () => {
      const result = getElementChakras('Terra');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Terra');
      expect(result!.chakras_correspondentes.primario).toBe('1º Básico');
      expect(result!.orixa_regente).toBe('Omolu');
    });

    it('returns correct mapping for Éter', () => {
      const result = getElementChakras('Éter');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Éter');
      expect(result!.chakras_correspondentes.primario).toBe('7º Coronário');
      expect(result!.orixa_regente).toBe('Oxalá');
    });

    it('is case-insensitive', () => {
      expect(getElementChakras('fogo')?.elemento).toBe('Fogo');
      expect(getElementChakras('FOGO')?.elemento).toBe('Fogo');
      expect(getElementChakras('FoGo')?.elemento).toBe('Fogo');
      expect(getElementChakras('terra')?.elemento).toBe('Terra');
    });

    it('handles whitespace in input', () => {
      expect(getElementChakras('  Ar  ')?.elemento).toBe('Ar');
      expect(getElementChakras('\tÁgua\n')?.elemento).toBe('Água');
    });

    it('handles accented characters', () => {
      expect(getElementChakras('Agua')?.elemento).toBe('Água');
      expect(getElementChakras('Eter')?.elemento).toBe('Éter');
    });

    it('returns null for unknown elements', () => {
      expect(getElementChakras('unknown')).toBeNull();
      expect(getElementChakras('')).toBeNull();
      expect(getElementChakras('Espaço')).toBeNull();
    });
  });

  // ─── getAllElementMappings ────────────────────────────────────────────────
  describe('getAllElementMappings', () => {
    it('returns all 5 element mappings', () => {
      const all = getAllElementMappings();
      expect(all).toHaveLength(5);
    });

    it('returns array containing all elements', () => {
      const all = getAllElementMappings();
      const elements = all.map((m) => m.elemento);
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Água');
      expect(elements).toContain('Ar');
      expect(elements).toContain('Terra');
      expect(elements).toContain('Éter');
    });

    it('each mapping has complete structure', () => {
      const all = getAllElementMappings();
      all.forEach((mapping) => {
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.chakras_correspondentes.primario).toBeTruthy();
        expect(mapping.orixa_regente).toBeTruthy();
        expect(mapping.qualidade_energetica.tipo).toBeTruthy();
        expect(mapping.praticas_recomendadas.ebos).toBeTruthy();
      });
    });
  });

  // ─── getPrimaryChakra ──────────────────────────────────────────────────────
  describe('getPrimaryChakra', () => {
    it('returns correct primary chakra for each element', () => {
      expect(getPrimaryChakra('Fogo')).toBe('2º Sacro');
      expect(getPrimaryChakra('Água')).toBe('2º Sacro');
      expect(getPrimaryChakra('Ar')).toBe('4º Cardíaco');
      expect(getPrimaryChakra('Terra')).toBe('1º Básico');
      expect(getPrimaryChakra('Éter')).toBe('7º Coronário');
    });

    it('returns null for unknown elements', () => {
      expect(getPrimaryChakra('invalid')).toBeNull();
    });
  });

  // ─── getAllChakras ────────────────────────────────────────────────────────
  describe('getAllChakras', () => {
    it('returns primary plus secondary chakras', () => {
      const fogoChakras = getAllChakras('Fogo');
      expect(fogoChakras).not.toBeNull();
      expect(fogoChakras).toContain('2º Sacro');
      expect(fogoChakras).toContain('3º Plexo Solar');
    });

    it('returns array with primary first', () => {
      const aguaChakras = getAllChakras('Água');
      expect(aguaChakras![0]).toBe('2º Sacro');
      expect(aguaChakras).toHaveLength(3); // 1 primary + 2 secondary
    });

    it('returns null for unknown elements', () => {
      expect(getAllChakras('invalid')).toBeNull();
    });
  });

  // ─── getEnergyType ────────────────────────────────────────────────────────
  describe('getEnergyType', () => {
    it('returns correct energy type for each element', () => {
      expect(getEnergyType('Fogo')).toBe('Quente');
      expect(getEnergyType('Terra')).toBe('Quente');
      expect(getEnergyType('Água')).toBe('Frio');
      expect(getEnergyType('Ar')).toBe('Neutro');
      expect(getEnergyType('Éter')).toBe('Neutro');
    });

    it('returns null for unknown elements', () => {
      expect(getEnergyType('invalid')).toBeNull();
    });
  });

  // ─── getRegentOrixa ───────────────────────────────────────────────────────
  describe('getRegentOrixa', () => {
    it('returns correct regent orixá for each element', () => {
      expect(getRegentOrixa('Fogo')).toBe('Iansã');
      expect(getRegentOrixa('Água')).toBe('Oxum');
      expect(getRegentOrixa('Ar')).toBe('Oxalá');
      expect(getRegentOrixa('Terra')).toBe('Omolu');
      expect(getRegentOrixa('Éter')).toBe('Oxalá');
    });

    it('returns null for unknown elements', () => {
      expect(getRegentOrixa('invalid')).toBeNull();
    });
  });

  // ─── Integration: element-orixa-chakra relationships ───────────────────────
  describe('element-orixa-chakra integration', () => {
    it('Oxalá is regent of both Ar and Éter (dual spiritual authority)', () => {
      const arMapping = getElementChakras('Ar');
      const eterMapping = getElementChakras('Éter');
      expect(arMapping!.orixa_regente).toBe('Oxalá');
      expect(eterMapping!.orixa_regente).toBe('Oxalá');
    });

    it('Iansã rules Fogo element with transformative energy', () => {
      const fogoMapping = getElementChakras('Fogo');
      expect(fogoMapping!.orixa_regente).toBe('Iansã');
      expect(fogoMapping!.qualidade_energetica.tipo).toBe('Quente');
    });

    it('Terra element connects to Omolu and Muladhara (1º Básico)', () => {
      const terraMapping = getElementChakras('Terra');
      expect(terraMapping!.orixa_regente).toBe('Omolu');
      expect(terraMapping!.chakras_correspondentes.primario).toBe('1º Básico');
    });

    it('Água element flows through Sacro, Cardíaco, and Frontal chakras', () => {
      const aguaChakras = getAllChakras('Água');
      expect(aguaChakras).toContain('2º Sacro');
      expect(aguaChakras).toContain('4º Cardíaco');
      expect(aguaChakras).toContain('6º Frontal');
    });

    it('Éter element is the bridge between human and divine (Coronário + Frontal)', () => {
      const eterChakras = getAllChakras('Éter');
      expect(eterChakras).toContain('7º Coronário');
      expect(eterChakras).toContain('6º Frontal');
      expect(eterChakras).toContain('5º Laríngeo');
    });
  });

  // ─── Type exports ──────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('Elemento type accepts all valid elements', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      elements.forEach((el) => expect(getElementChakras(el)).toBeDefined());
    });

    it('Chakra type covers all 7 primary chakras', () => {
      const chakras: Chakra[] = [
        '1º Básico',
        '2º Sacro',
        '3º Plexo Solar',
        '4º Cardíaco',
        '5º Laríngeo',
        '6º Frontal',
        '7º Coronário',
      ];
      chakras.forEach((chakra) => expect(chakra).toBeTruthy());
    });
  });
});