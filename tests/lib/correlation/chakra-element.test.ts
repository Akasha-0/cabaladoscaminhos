import { describe, it, expect } from 'vitest';
import {
  getChakraElement,
  getElementChakras,
  getAllChakraElements,
  CHAKRA_ELEMENT_MAPPINGS,
} from '@/lib/correlation/chakra-element';

describe('Chakra-Element Correlation', () => {
  describe('getChakraElement', () => {
    it('should return Muladhara (1º Básico) with Terra element', () => {
      const result = getChakraElement('Muladhara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.elemento_primario).toBe('Terra');
      expect(result?.elemento_secundario).toBeNull();
    });

    it('should return Svadhisthana (2º Sacro) with Água element', () => {
      const result = getChakraElement('Svadhisthana');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.elemento_primario).toBe('Água');
      expect(result?.elemento_secundario).toBeNull();
    });

    it('should return Manipura (3º Plexo Solar) with Fogo element', () => {
      const result = getChakraElement('Manipura');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.elemento_primario).toBe('Fogo');
      expect(result?.elemento_secundario).toBeNull();
    });

    it('should return Anahata (4º Cardíaco) with Ar and Água elements', () => {
      const result = getChakraElement('Anahata');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.elemento_primario).toBe('Ar');
      expect(result?.elemento_secundario).toBe('Água');
    });

    it('should return Vishuddha (5º Laríngeo) with Ar element', () => {
      const result = getChakraElement('Vishuddha');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.elemento_primario).toBe('Ar');
      expect(result?.elemento_secundario).toBeNull();
    });

    it('should return Ajna (6º Frontal) with Éter and Ar elements', () => {
      const result = getChakraElement('Ajna');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.elemento_primario).toBe('Éter');
      expect(result?.elemento_secundario).toBe('Ar');
    });

    it('should return Sahasrara (7º Coronário) with Éter element', () => {
      const result = getChakraElement('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.elemento_primario).toBe('Éter');
      expect(result?.elemento_secundario).toBeNull();
    });

    it('should accept chakra number format as input', () => {
      const result = getChakraElement('1º Básico');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should return null for unknown chakra', () => {
      const result = getChakraElement('UnknownChakra');
      expect(result).toBeNull();
    });
  });

  describe('getElementChakras', () => {
    it('should return all chakras with Terra element', () => {
      const result = getElementChakras('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('Muladhara');
    });

    it('should return all chakras with Água element', () => {
      const result = getElementChakras('Água');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const chakras = result.map(r => r.chakra);
      expect(chakras).toContain('Svadhisthana');
      expect(chakras).toContain('Anahata');
    });

    it('should return all chakras with Fogo element', () => {
      const result = getElementChakras('Fogo');
      expect(result).toHaveLength(1);
      expect(result[0].chakra).toBe('Manipura');
    });

    it('should return all chakras with Ar element', () => {
      const result = getElementChakras('Ar');
      expect(result.length).toBeGreaterThanOrEqual(3);
      const chakras = result.map(r => r.chakra);
      expect(chakras).toContain('Anahata');
      expect(chakras).toContain('Vishuddha');
      expect(chakras).toContain('Ajna');
    });

    it('should return all chakras with Éter element', () => {
      const result = getElementChakras('Éter');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const chakras = result.map(r => r.chakra);
      expect(chakras).toContain('Ajna');
      expect(chakras).toContain('Sahasrara');
    });

    it('should normalize element name variations', () => {
      const result = getElementChakras('agua');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getAllChakraElements', () => {
    it('should return all 7 chakras', () => {
      const result = getAllChakraElements();
      expect(result).toHaveLength(7);
    });

    it('should contain all chakra names from Muladhara to Sahasrara', () => {
      const result = getAllChakraElements();
      const chakraNames = result.map(r => r.chakra);
      expect(chakraNames).toContain('Muladhara');
      expect(chakraNames).toContain('Svadhisthana');
      expect(chakraNames).toContain('Manipura');
      expect(chakraNames).toContain('Anahata');
      expect(chakraNames).toContain('Vishuddha');
      expect(chakraNames).toContain('Ajna');
      expect(chakraNames).toContain('Sahasrara');
    });

    it('should contain all 5 elements across all chakras', () => {
      const result = getAllChakraElements();
      const elements = new Set(
        result.flatMap(r => [r.elemento_primario, r.elemento_secundario].filter(Boolean))
      );
      expect(elements.size).toBe(5);
      expect(elements.has('Terra')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
      expect(elements.has('Éter')).toBe(true);
    });
  });

  describe('CHAKRA_ELEMENT_MAPPINGS constant', () => {
    it('should have all required properties for each chakra', () => {
      Object.values(CHAKRA_ELEMENT_MAPPINGS).forEach(mapping => {
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('chakra_numero');
        expect(mapping).toHaveProperty('elemento_primario');
        expect(mapping).toHaveProperty('propriedades_elementais');
        expect(mapping.propriedades_elementais).toHaveProperty('qualidade');
        expect(mapping.propriedades_elementais).toHaveProperty('direcao');
        expect(mapping.propriedades_elementais).toHaveProperty('estacao');
        expect(mapping).toHaveProperty('pratica_espiritual');
        expect(mapping.pratica_espiritual).toHaveProperty('tipo');
        expect(mapping.pratica_espiritual).toHaveProperty('descricao');
        expect(mapping.pratica_espiritual).toHaveProperty('mantras');
        expect(Array.isArray(mapping.pratica_espiritual.mantras)).toBe(true);
      });
    });

    it('should have correct directions for each chakra', () => {
      expect(CHAKRA_ELEMENT_MAPPINGS.Muladhara.propriedades_elementais.direcao).toBe('Norte');
      expect(CHAKRA_ELEMENT_MAPPINGS.Svadhisthana.propriedades_elementais.direcao).toBe('Oeste');
      expect(CHAKRA_ELEMENT_MAPPINGS.Manipura.propriedades_elementais.direcao).toBe('Oeste');
      expect(CHAKRA_ELEMENT_MAPPINGS.Anahata.propriedades_elementais.direcao).toBe('Sul');
      expect(CHAKRA_ELEMENT_MAPPINGS.Vishuddha.propriedades_elementais.direcao).toBe('Leste');
      expect(CHAKRA_ELEMENT_MAPPINGS.Ajna.propriedades_elementais.direcao).toBe('Leste');
      expect(CHAKRA_ELEMENT_MAPPINGS.Sahasrara.propriedades_elementais.direcao).toBe('Centro / Zênite');
    });

    it('should have correct mantras for each chakra', () => {
      expect(CHAKRA_ELEMENT_MAPPINGS.Muladhara.pratica_espiritual.mantras).toContain('LAM (396 Hz)');
      expect(CHAKRA_ELEMENT_MAPPINGS.Svadhisthana.pratica_espiritual.mantras).toContain('VAM (417 Hz)');
      expect(CHAKRA_ELEMENT_MAPPINGS.Manipura.pratica_espiritual.mantras).toContain('RAM (528 Hz)');
      expect(CHAKRA_ELEMENT_MAPPINGS.Anahata.pratica_espiritual.mantras).toContain('YAM (639 Hz)');
      expect(CHAKRA_ELEMENT_MAPPINGS.Vishuddha.pratica_espiritual.mantras).toContain('HAM (741 Hz)');
      expect(CHAKRA_ELEMENT_MAPPINGS.Ajna.pratica_espiritual.mantras).toContain('OM (852 Hz)');
      expect(CHAKRA_ELEMENT_MAPPINGS.Sahasrara.pratica_espiritual.mantras).toContain('AUM (963 Hz)');
    });
  });
});