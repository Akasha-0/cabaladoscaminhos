import { describe, it, expect } from 'vitest';
import {
  getElementFrequency,
  getFrequencyElement,
  getAllElementFrequencies,
  getFrequencyByElement,
  getElementByFrequency,
  getChakraByElement,
  getHealingByElement,
  getQualidadesByElement,
  getOrixaByElement,
  getPlanetaByElement,
  getColorByElement,
  getDirectionByElement,
  getAllElementTypes,
  getAllFrequencies,
  ELEMENT_FREQUENCY_MAP,
} from '@/lib/correlation/element-frequency';

describe('ElementFrequency Correlation', () => {
  describe('getElementFrequency', () => {
    it('should return mapping for fogo', () => {
      const result = getElementFrequency('fogo');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome).toBe('Fogo');
      expect(result?.frequencia).toBe(528);
    });

    it('should return mapping for água with accent normalization', () => {
      const result = getElementFrequency('agua');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
      expect(result?.frequencia).toBe(417);
    });

    it('should return mapping for terra', () => {
      const result = getElementFrequency('terra');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
      expect(result?.frequencia).toBe(396);
    });

    it('should return mapping for ar', () => {
      const result = getElementFrequency('ar');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
      expect(result?.frequencia).toBe(741);
    });

    it('should return mapping for éter with accent normalization', () => {
      const result = getElementFrequency('eter');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
      expect(result?.frequencia).toBe(963);
    });

    it('should return undefined for invalid element', () => {
      const result = getElementFrequency('invalid');
      expect(result).toBeUndefined();
    });

    it('should handle case insensitive input', () => {
      const result = getElementFrequency('FOGO');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
    });
  });

  describe('getFrequencyElement', () => {
    it('should return correct element for each frequency', () => {
      const map = getFrequencyElement();
      expect(map[396]).toBe('terra');
      expect(map[417]).toBe('água');
      expect(map[528]).toBe('fogo');
      expect(map[741]).toBe('ar');
      expect(map[963]).toBe('éter');
    });

    it('should return undefined for unmapped frequency', () => {
      const map = getFrequencyElement();
      expect(map[999]).toBeUndefined();
    });
  });

  describe('getAllElementFrequencies', () => {
    it('should return all 5 elements', () => {
      const result = getAllElementFrequencies();
      expect(result).toHaveLength(5);
    });

    it('should contain all expected elements', () => {
      const result = getAllElementFrequencies();
      const elementos = result.map((e) => e.elemento);
      expect(elementos).toContain('fogo');
      expect(elementos).toContain('água');
      expect(elementos).toContain('terra');
      expect(elementos).toContain('ar');
      expect(elementos).toContain('éter');
    });

    it('should have correct frequency for each element', () => {
      const result = getAllElementFrequencies();
      const fogo = result.find((e) => e.elemento === 'fogo');
      const agua = result.find((e) => e.elemento === 'água');
      const terra = result.find((e) => e.elemento === 'terra');
      const ar = result.find((e) => e.elemento === 'ar');
      const eter = result.find((e) => e.elemento === 'éter');

      expect(fogo?.frequencia).toBe(528);
      expect(agua?.frequencia).toBe(417);
      expect(terra?.frequencia).toBe(396);
      expect(ar?.frequencia).toBe(741);
      expect(eter?.frequencia).toBe(963);
    });
  });

  describe('ELEMENT_FREQUENCY_MAP', () => {
    it('should have all 5 elements mapped', () => {
      expect(ELEMENT_FREQUENCY_MAP).toHaveProperty('fogo');
      expect(ELEMENT_FREQUENCY_MAP).toHaveProperty('água');
      expect(ELEMENT_FREQUENCY_MAP).toHaveProperty('terra');
      expect(ELEMENT_FREQUENCY_MAP).toHaveProperty('ar');
      expect(ELEMENT_FREQUENCY_MAP).toHaveProperty('éter');
    });

    it('should have required properties for each element', () => {
      for (const elemento of Object.values(ELEMENT_FREQUENCY_MAP)) {
        expect(elemento.elemento).toBeDefined();
        expect(elemento.elemento_nome).toBeDefined();
        expect(elemento.elemento_english).toBeDefined();
        expect(elemento.frequencia).toBeGreaterThan(0);
        expect(elemento.chakra).toBeDefined();
        expect(elemento.chakra_numero).toBeGreaterThan(0);
        expect(elemento.propriedades_healing).toBeDefined();
        expect(elemento.propriedades_healing.fisico).toBeDefined();
        expect(elemento.propriedades_healing.emocional).toBeDefined();
        expect(elemento.propriedades_healing.mental_espiritual).toBeDefined();
        expect(elemento.propriedades_healing.pratica_recomendada).toBeDefined();
        expect(elemento.qualidades).toBeDefined();
        expect(elemento.qualidades.forca).toBeDefined();
        expect(elemento.qualidades.desafio).toBeDefined();
        expect(elemento.qualidades.licao).toBeDefined();
        expect(elemento.qualidades.afirmacao).toBeDefined();
        expect(elemento.cor).toBeDefined();
        expect(elemento.direcao).toBeDefined();
        expect(elemento.orixa).toBeDefined();
        expect(elemento.planeta).toBeDefined();
        expect(elemento.oracao_sagrada).toBeDefined();
      }
    });

    it('should have unique frequencies for each element', () => {
      const frequencies = Object.values(ELEMENT_FREQUENCY_MAP).map((e) => e.frequencia);
      const uniqueFrequencies = new Set(frequencies);
      expect(uniqueFrequencies.size).toBe(frequencies.length);
    });
  });

  describe('getFrequencyByElement', () => {
    it('should return correct frequency for each element', () => {
      expect(getFrequencyByElement('fogo')).toBe(528);
      expect(getFrequencyByElement('água')).toBe(417);
      expect(getFrequencyByElement('terra')).toBe(396);
      expect(getFrequencyByElement('ar')).toBe(741);
      expect(getFrequencyByElement('éter')).toBe(963);
    });

    it('should return null for invalid element', () => {
      expect(getFrequencyByElement('invalid')).toBeNull();
    });
  });

  describe('getElementByFrequency', () => {
    it('should return correct element for each frequency', () => {
      expect(getElementByFrequency(396)).toBe('terra');
      expect(getElementByFrequency(417)).toBe('água');
      expect(getElementByFrequency(528)).toBe('fogo');
      expect(getElementByFrequency(741)).toBe('ar');
      expect(getElementByFrequency(963)).toBe('éter');
    });

    it('should return null for unmapped frequency', () => {
      expect(getElementByFrequency(999)).toBeNull();
    });
  });

  describe('getChakraByElement', () => {
    it('should return correct chakra for fogo', () => {
      expect(getChakraByElement('fogo')).toBe('3º Plexo Solar (Manipura)');
    });

    it('should return correct chakra for água', () => {
      expect(getChakraByElement('água')).toBe('2º Sacro (Svadhisthana)');
    });

    it('should return correct chakra for terra', () => {
      expect(getChakraByElement('terra')).toBe('1º Básico (Muladhara)');
    });

    it('should return correct chakra for ar', () => {
      expect(getChakraByElement('ar')).toBe('5º Laríngeo (Vishuddha)');
    });

    it('should return correct chakra for éter', () => {
      expect(getChakraByElement('éter')).toBe('7º Coronário (Sahasrara)');
    });

    it('should return null for invalid element', () => {
      expect(getChakraByElement('invalid')).toBeNull();
    });
  });

  describe('getHealingByElement', () => {
    it('should return healing properties for fogo', () => {
      const healing = getHealingByElement('fogo');
      expect(healing).toBeDefined();
      expect(healing?.fisico).toContain('metabolismo');
      expect(healing?.emocional).toContain('Transforma');
    });

    it('should return null for invalid element', () => {
      expect(getHealingByElement('invalid')).toBeNull();
    });
  });

  describe('getQualidadesByElement', () => {
    it('should return qualities for fogo', () => {
      const qualities = getQualidadesByElement('fogo');
      expect(qualities).toBeDefined();
      expect(qualities?.forca).toContain('Determinação');
      expect(qualities?.desafio).toContain('Impaciência');
      expect(qualities?.licao).toContain('Canalizar');
      expect(qualities?.afirmacao).toContain('transformo');
    });

    it('should return null for invalid element', () => {
      expect(getQualidadesByElement('invalid')).toBeNull();
    });
  });

  describe('getOrixaByElement', () => {
    it('should return correct Orixá for each element', () => {
      expect(getOrixaByElement('fogo')).toBe('Xangô');
      expect(getOrixaByElement('água')).toBe('Iemanjá');
      expect(getOrixaByElement('terra')).toBe('Oxóssi');
      expect(getOrixaByElement('ar')).toBe('Iansã');
      expect(getOrixaByElement('éter')).toBe('Oxalá');
    });

    it('should return null for invalid element', () => {
      expect(getOrixaByElement('invalid')).toBeNull();
    });
  });

  describe('getPlanetaByElement', () => {
    it('should return correct planet for each element', () => {
      expect(getPlanetaByElement('fogo')).toBe('Marte');
      expect(getPlanetaByElement('água')).toBe('Lua');
      expect(getPlanetaByElement('terra')).toBe('Saturno');
      expect(getPlanetaByElement('ar')).toBe('Mercúrio');
      expect(getPlanetaByElement('éter')).toBe('Sol');
    });

    it('should return null for invalid element', () => {
      expect(getPlanetaByElement('invalid')).toBeNull();
    });
  });

  describe('getColorByElement', () => {
    it('should return correct color for each element', () => {
      expect(getColorByElement('fogo')).toBe('Vermelho');
      expect(getColorByElement('água')).toBe('Azul');
      expect(getColorByElement('terra')).toBe('Verde');
      expect(getColorByElement('ar')).toBe('Amarelo');
      expect(getColorByElement('éter')).toBe('Branco-dourado');
    });

    it('should return null for invalid element', () => {
      expect(getColorByElement('invalid')).toBeNull();
    });
  });

  describe('getDirectionByElement', () => {
    it('should return correct direction for each element', () => {
      expect(getDirectionByElement('fogo')).toBe('Sul');
      expect(getDirectionByElement('água')).toBe('Oeste');
      expect(getDirectionByElement('terra')).toBe('Norte');
      expect(getDirectionByElement('ar')).toBe('Leste');
      expect(getDirectionByElement('éter')).toBe('Centro');
    });

    it('should return null for invalid element', () => {
      expect(getDirectionByElement('invalid')).toBeNull();
    });
  });

  describe('getAllElementTypes', () => {
    it('should return all 5 element types', () => {
      const result = getAllElementTypes();
      expect(result).toHaveLength(5);
      expect(result).toContain('fogo');
      expect(result).toContain('água');
      expect(result).toContain('terra');
      expect(result).toContain('ar');
      expect(result).toContain('éter');
    });
  });

  describe('getAllFrequencies', () => {
    it('should return all 5 mapped frequencies', () => {
      const result = getAllFrequencies();
      expect(result).toHaveLength(5);
      expect(result).toContain(396);
      expect(result).toContain(417);
      expect(result).toContain(528);
      expect(result).toContain(741);
      expect(result).toContain(963);
    });
  });

  describe('spiritual consistency', () => {
    it('should align frequencies with chakra numbers', () => {
      for (const elemento of getAllElementFrequencies()) {
        const chakraNum = elemento.chakra_numero;
        const frequency = elemento.frequencia;
        
        // Each element maps to a specific frequency and chakra
        if (elemento.elemento === 'terra') {
          expect(chakraNum).toBe(1);
          expect(frequency).toBe(396);
        } else if (elemento.elemento === 'água') {
          expect(chakraNum).toBe(2);
          expect(frequency).toBe(417);
        } else if (elemento.elemento === 'fogo') {
          expect(chakraNum).toBe(3);
          expect(frequency).toBe(528);
        } else if (elemento.elemento === 'ar') {
          expect(chakraNum).toBe(5);
          expect(frequency).toBe(741);
        } else if (elemento.elemento === 'éter') {
          expect(chakraNum).toBe(7);
          expect(frequency).toBe(963);
        }
      }
    });

    it('should have consistent Orixá-element correlations', () => {
      // These should match the correlations in element-orixa.ts
      const fogo = getElementFrequency('fogo');
      expect(fogo?.orixa).toBe('Xangô');
      
      const agua = getElementFrequency('água');
      expect(agua?.orixa).toBe('Iemanjá');
      
      const terra = getElementFrequency('terra');
      expect(terra?.orixa).toBe('Oxóssi');
    });
  });
});