/**
 * Element-Day Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getElementDay,
  getDayElement,
  getAllElementDays,
  getElementChakra,
  getElementPractices,
  getElementAffirmation,
} from '@/lib/correlation/element-day';

describe('Element-Day Correlation', () => {
  describe('getElementDay', () => {
    it('should return fogo mapping for Domingo', () => {
      const result = getElementDay('fogo');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome).toBe('Fogo');
      expect(result?.dia).toBe('Domingo');
      expect(result?.indice).toBe(0);
    });

    it('should return água mapping for Segunda-feira', () => {
      const result = getElementDay('água');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
      expect(result?.elemento_nome).toBe('Água');
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.indice).toBe(1);
    });

    it('should return ar mapping for Quarta-feira', () => {
      const result = getElementDay('ar');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
      expect(result?.elemento_nome).toBe('Ar');
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.indice).toBe(3);
    });

    it('should return terra mapping for Sexta-feira', () => {
      const result = getElementDay('terra');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
      expect(result?.elemento_nome).toBe('Terra');
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.indice).toBe(5);
    });

    it('should return éter mapping for Sexta-feira', () => {
      const result = getElementDay('éter');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
      expect(result?.elemento_nome).toBe('Éter');
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.indice).toBe(5);
    });

    it('should include chakra connection for each element', () => {
      const elements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((elemento) => {
        const result = getElementDay(elemento);
        expect(result).toBeDefined();
        expect(result?.chakra).toBeDefined();
        expect(result?.chakra_descricao).toBeDefined();
      });
    });

    it('should include spiritual meaning for each element', () => {
      const elements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((elemento) => {
        const result = getElementDay(elemento);
        expect(result).toBeDefined();
        expect(result?.significado_espiritual).toBeDefined();
        expect(result?.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('should include properties with affirmations', () => {
      const result = getElementDay('fogo');
      expect(result?.propriedades).toBeDefined();
      expect(result?.propriedades.afirmacao).toBeDefined();
      expect(result?.propriedades.palavras_chave).toBeDefined();
      expect(result?.propriedades.desafios).toBeDefined();
    });

    it('should include spiritual practices for each element', () => {
      const elements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((elemento) => {
        const result = getElementDay(elemento);
        expect(result).toBeDefined();
        expect(result?.praticas).toBeDefined();
        expect(result?.praticas.length).toBeGreaterThan(0);
      });
    });

    it('should include planet and orixa associations', () => {
      const elements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((elemento) => {
        const result = getElementDay(elemento);
        expect(result).toBeDefined();
        expect(result?.planeta).toBeDefined();
        expect(result?.orixa).toBeDefined();
      });
    });

    it('should be case-insensitive', () => {
      expect(getElementDay('FOGO')?.elemento).toBe('fogo');
      expect(getElementDay('ÁGUA')?.elemento).toBe('água');
      expect(getElementDay('Ar')?.elemento).toBe('ar');
    });

    it('should handle accented characters', () => {
      expect(getElementDay('éter')?.elemento).toBe('éter');
      expect(getElementDay('ÉTER')?.elemento).toBe('éter');
    });

    it('should return undefined for unknown element', () => {
      expect(getElementDay('unknown')).toBeUndefined();
      expect(getElementDay('')).toBeUndefined();
    });
  });

  describe('getDayElement', () => {
    it('should return mapping of days to elements', () => {
      const result = getDayElement();
      expect(result).toBeDefined();
      expect(result['Domingo']).toBe('fogo');
      expect(result['Segunda-feira']).toBe('água');
      expect(result['Quarta-feira']).toBe('ar');
      expect(result['Sexta-feira']).toBe('terra');
    });

    it('should return a Record with all days', () => {
      const result = getDayElement();
      expect(Object.keys(result).length).toBe(4);
    });

    it('should map elemento to correct day', () => {
      const result = getDayElement();
      expect(result['Domingo']).toBe('fogo');
      expect(result['Segunda-feira']).toBe('água');
    });
  });

  describe('getAllElementDays', () => {
    it('should return all element-day mappings', () => {
      const result = getAllElementDays();
      expect(result).toBeDefined();
      expect(result.length).toBe(5);
    });

    it('should include all five elements', () => {
      const result = getAllElementDays();
      const elementos = result.map(r => r.elemento);
      expect(elementos).toContain('fogo');
      expect(elementos).toContain('água');
      expect(elementos).toContain('ar');
      expect(elementos).toContain('terra');
      expect(elementos).toContain('éter');
    });

    it('should have consistent day indices', () => {
      const result = getAllElementDays();
      result.forEach(mapping => {
        expect(mapping.indice).toBeGreaterThanOrEqual(0);
        expect(mapping.indice).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('getElementChakra', () => {
    it('should return chakra info for fogo', () => {
      const result = getElementChakra('fogo');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('3º - Plexo Solar');
    });

    it('should return chakra info for água', () => {
      const result = getElementChakra('água');
      expect(result).toBeDefined();
      expect(result?.chakra).toContain('6º');
    });

    it('should return undefined for unknown element', () => {
      expect(getElementChakra('unknown')).toBeUndefined();
    });
  });

  describe('getElementPractices', () => {
    it('should return practices for fogo', () => {
      const result = getElementPractices('fogo');
      expect(result).toBeDefined();
      expect(result?.length).toBeGreaterThan(0);
      expect(result).toContain('Exposição solar consciente (tomar sol com intenção sagrada)');
    });

    it('should return practices for água', () => {
      const result = getElementPractices('água');
      expect(result).toBeDefined();
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return undefined for unknown element', () => {
      expect(getElementPractices('unknown')).toBeUndefined();
    });
  });

  describe('getElementAffirmation', () => {
    it('should return affirmation for fogo', () => {
      const result = getElementAffirmation('fogo');
      expect(result).toBeDefined();
      expect(result).toContain('irradio');
    });

    it('should return affirmation for água', () => {
      const result = getElementAffirmation('água');
      expect(result).toBeDefined();
      expect(result).toContain('fluo');
    });

    it('should return undefined for unknown element', () => {
      expect(getElementAffirmation('unknown')).toBeUndefined();
    });
  });

  describe('Element correlation consistency', () => {
    it('should have fogo associated with Sol and Xangô', () => {
      const result = getElementDay('fogo');
      expect(result?.planeta).toBe('Sol');
      expect(result?.orixa).toBe('Xangô');
    });

    it('should have água associated with Lua and Iemanjá', () => {
      const result = getElementDay('água');
      expect(result?.planeta).toBe('Lua');
      expect(result?.orixa).toBe('Iemanjá');
    });

    it('should have ar associated with Mercúrio and Iansã', () => {
      const result = getElementDay('ar');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.orixa).toBe('Iansã');
    });

    it('should have terra associated with Vênus and Oxum', () => {
      const result = getElementDay('terra');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.orixa).toBe('Oxum');
    });

    it('should have éter associated with Sol and Oxalá', () => {
      const result = getElementDay('éter');
      expect(result?.planeta).toBe('Sol');
      expect(result?.orixa).toBe('Oxalá');
    });

    it('should have consistent qualities across elements', () => {
      const validQualities = ['cardinal', 'fixed', 'mutable'];
      const result = getAllElementDays();
      result.forEach(mapping => {
        expect(validQualities).toContain(mapping.qualidade);
      });
    });
  });
});