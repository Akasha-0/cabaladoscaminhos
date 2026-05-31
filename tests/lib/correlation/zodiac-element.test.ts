import { describe, it, expect } from 'vitest';
import {
  getZodiacElement,
  getElementZodiac,
  getAllZodiacElements,
  getElementFromSigno,
  getChakraFromSigno,
  getSignificadoFromSigno,
  getSignosByElement,
  getAllSigns,
  ZODIAC_ELEMENT_MAP,
  TODOS_SIGNOS,
  type ZodiacElementMapping,
  type SignoZodiac,
} from '@/lib/correlation/zodiac-element';

describe('ZodiacElement Correlation', () => {
  describe('getZodiacElement', () => {
    it('returns mapping for valid sign names', () => {
      const aries = getZodiacElement('Áries');
      expect(aries).not.toBeNull();
      expect(aries?.signo).toBe('Áries');
      expect(aries?.elemento).toBe('Fogo');

      const touro = getZodiacElement('Touro');
      expect(touro).not.toBeNull();
      expect(touro?.signo).toBe('Touro');
      expect(touro?.elemento).toBe('Terra');
    });

    it('handles case variations', () => {
      expect(getZodiacElement('aries')?.signo).toBe('Áries');
      expect(getZodiacElement('ARIES')?.signo).toBe('Áries');
      expect(getZodiacElement('aRiEs')?.signo).toBe('Áries');
    });

    it('handles accent variations', () => {
      expect(getZodiacElement('Gemeos')?.signo).toBe('Gémeos');
      expect(getZodiacElement('GÉMEOS')?.signo).toBe('Gémeos');
      expect(getZodiacElement('Cancer')?.signo).toBe('Câncer');
    });

    it('returns null for invalid sign names', () => {
    it('returns null for invalid sign names', () => {
      expect(getZodiacElement('InvalidSign')).toBeNull();
      expect(getZodiacElement('')).toBeNull();
      expect(getZodiacElement('Leo')?.signo).toBe('Leão');
      expect(getZodiacElement('Escorpiao')?.signo).toBe('Escorpião');
      expect(getZodiacElement('Sagitario')?.signo).toBe('Sagitário');
      expect(getZodiacElement('Capricornio')?.signo).toBe('Capricórnio');
      expect(getZodiacElement('Aquario')?.signo).toBe('Aquário');
      expect(getZodiacElement('Peixes')?.signo).toBe('Peixes');
    });
    it('returns null for empty or whitespace input', () => {
      expect(getZodiacElement('')).toBeNull();
      expect(getZodiacElement('   ')).toBeNull();
    });

    it('returns complete mapping with all fields', () => {
      const mapping = getZodiacElement('Áries');
      expect(mapping).not.toBeNull();
      expect(mapping).toHaveProperty('signo');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('chakra');
      expect(mapping).toHaveProperty('chakraPt');
      expect(mapping).toHaveProperty('significado_espiritual');
    });
  });

  describe('getElementZodiac', () => {
    it('returns all fire signs', () => {
      const fogo = getElementZodiac('Fogo');
      expect(fogo).toHaveLength(3);
      const signosFogo = fogo.map((m) => m.signo);
      expect(signosFogo).toContain('Áries');
      expect(signosFogo).toContain('Leão');
      expect(signosFogo).toContain('Sagitário');
    });

    it('returns all earth signs', () => {
      const terra = getElementZodiac('Terra');
      expect(terra).toHaveLength(3);
      const signosTerra = terra.map((m) => m.signo);
      expect(signosTerra).toContain('Touro');
      expect(signosTerra).toContain('Virgem');
      expect(signosTerra).toContain('Capricórnio');
    });

    it('returns all air signs', () => {
      const ar = getElementZodiac('Ar');
      expect(ar).toHaveLength(3);
      const signosAr = ar.map((m) => m.signo);
      expect(signosAr).toContain('Gémeos');
      expect(signosAr).toContain('Libra');
      expect(signosAr).toContain('Aquário');
    });

    it('returns all water signs', () => {
      const agua = getElementZodiac('Água');
      expect(agua).toHaveLength(3);
      const signosAgua = agua.map((m) => m.signo);
      expect(signosAgua).toContain('Câncer');
      expect(signosAgua).toContain('Escorpião');
      expect(signosAgua).toContain('Peixes');
    });

    it('returns empty array for unknown element', () => {
      expect(getElementZodiac('UnknownElement')).toHaveLength(0);
    });
  });

  describe('getAllZodiacElements', () => {
    it('returns all 12 zodiac mappings', () => {
      const all = getAllZodiacElements();
      expect(all).toHaveLength(12);
    });

    it('contains all zodiac signs', () => {
      const all = getAllZodiacElements();
      const signos = all.map((m) => m.signo);
      
      expect(signos).toContain('Áries');
      expect(signos).toContain('Touro');
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Libra');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Aquário');
      expect(signos).toContain('Peixes');
    });

    it('each mapping has element field', () => {
      const all = getAllZodiacElements();
      all.forEach((mapping) => {
        expect(['Fogo', 'Terra', 'Ar', 'Água']).toContain(mapping.elemento);
      });
    });
  });

  describe('getElementFromSigno', () => {
    it('returns element for valid signs', () => {
      expect(getElementFromSigno('Áries')).toBe('Fogo');
      expect(getElementFromSigno('Touro')).toBe('Terra');
      expect(getElementFromSigno('Gémeos')).toBe('Ar');
      expect(getElementFromSigno('Câncer')).toBe('Água');
      expect(getElementFromSigno('Leão')).toBe('Fogo');
      expect(getElementFromSigno('Virgem')).toBe('Terra');
      expect(getElementFromSigno('Libra')).toBe('Ar');
      expect(getElementFromSigno('Escorpião')).toBe('Água');
      expect(getElementFromSigno('Sagitário')).toBe('Fogo');
      expect(getElementFromSigno('Capricórnio')).toBe('Terra');
      expect(getElementFromSigno('Aquário')).toBe('Ar');
      expect(getElementFromSigno('Peixes')).toBe('Água');
    });

    it('returns null for invalid sign', () => {
      expect(getElementFromSigno('Invalid')).toBeNull();
    });
  });

  describe('getChakraFromSigno', () => {
    it('returns chakra for valid signs', () => {
      expect(getChakraFromSigno('Áries')).toBe('Manipura');
      expect(getChakraFromSigno('Touro')).toBe('Muladhara');
      expect(getChakraFromSigno('Gémeos')).toBe('Vishuddha');
      expect(getChakraFromSigno('Câncer')).toBe('Anahata');
      expect(getChakraFromSigno('Leão')).toBe('Manipura');
      expect(getChakraFromSigno('Virgem')).toBe('Svadhisthana');
      expect(getChakraFromSigno('Libra')).toBe('Vishuddha');
      expect(getChakraFromSigno('Escorpião')).toBe('Svadhisthana');
      expect(getChakraFromSigno('Sagitário')).toBe('Ajna');
      expect(getChakraFromSigno('Capricórnio')).toBe('Muladhara');
      expect(getChakraFromSigno('Aquário')).toBe('Ajna');
      expect(getChakraFromSigno('Peixes')).toBe('Sahasrara');
    });

    it('returns null for invalid sign', () => {
      expect(getChakraFromSigno('Invalid')).toBeNull();
    });
  });

  describe('getSignificadoFromSigno', () => {
    it('returns spiritual meaning for valid signs', () => {
      const significado = getSignificadoFromSigno('Áries');
      expect(significado).not.toBeNull();
      expect(typeof significado).toBe('string');
      expect(significado!.length).toBeGreaterThan(0);
    });

    it('returns null for invalid sign', () => {
      expect(getSignificadoFromSigno('Invalid')).toBeNull();
    });

    it('returns non-empty spiritual meaning for all signs', () => {
      TODOS_SIGNOS.forEach((signo) => {
        const significado = getSignificadoFromSigno(signo);
        expect(significado).not.toBeNull();
        expect(significado!.length).toBeGreaterThan(10);
      });
    });
  });

  describe('getSignosByElement', () => {
    it('returns fire signs', () => {
      const signos = getSignosByElement('Fogo');
      expect(signos).toHaveLength(3);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Sagitário');
    });

    it('returns earth signs', () => {
      const signos = getSignosByElement('Terra');
      expect(signos).toHaveLength(3);
      expect(signos).toContain('Touro');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Capricórnio');
    });

    it('returns air signs', () => {
      const signos = getSignosByElement('Ar');
      expect(signos).toHaveLength(3);
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Libra');
      expect(signos).toContain('Aquário');
    });

    it('returns water signs', () => {
      const signos = getSignosByElement('Água');
      expect(signos).toHaveLength(3);
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Peixes');
    });

    it('returns empty array for unknown element', () => {
      expect(getSignosByElement('Unknown')).toHaveLength(0);
    });
  });

  describe('getAllSigns', () => {
    it('returns all 12 zodiac signs', () => {
      const signos = getAllSigns();
      expect(signos).toHaveLength(12);
    });

    it('contains all expected signs', () => {
      const signos = getAllSigns();
      expect(signos).toContain('Áries');
      expect(signos).toContain('Touro');
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Libra');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Aquário');
      expect(signos).toContain('Peixes');
    });
  });

  describe('ZODIAC_ELEMENT_MAP', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(ZODIAC_ELEMENT_MAP)).toBe(true);
    });

    it('has 12 entries', () => {
      expect(Object.keys(ZODIAC_ELEMENT_MAP)).toHaveLength(12);
    });

    it('each mapping is frozen', () => {
      Object.values(ZODIAC_ELEMENT_MAP).forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });

    it('contains all elements', () => {
      const elementos = new Set(Object.values(ZODIAC_ELEMENT_MAP).map((m) => m.elemento));
      expect(elementos).toContain('Fogo');
      expect(elementos).toContain('Terra');
      expect(elementos).toContain('Ar');
      expect(elementos).toContain('Água');
      expect(elementos.size).toBe(4);
    });
  });

  describe('TODOS_SIGNOS', () => {
    it('contains 12 signs', () => {
      expect(TODOS_SIGNOS).toHaveLength(12);
    });

    it('is a readonly array', () => {
      expect(Object.isExtensible(TODOS_SIGNOS)).toBe(false);
    });
  });

  describe('Element-Sign relationships', () => {
    it('fire signs are Áries, Leão, Sagitário', () => {
      const fogo = getElementZodiac('Fogo');
      const signosFogo = fogo.map((m) => m.signo);
      expect(signosFogo).toContain('Áries');
      expect(signosFogo).toContain('Leão');
      expect(signosFogo).toContain('Sagitário');
    });

    it('earth signs are Touro, Virgem, Capricórnio', () => {
      const terra = getElementZodiac('Terra');
      const signosTerra = terra.map((m) => m.signo);
      expect(signosTerra).toContain('Touro');
      expect(signosTerra).toContain('Virgem');
      expect(signosTerra).toContain('Capricórnio');
    });

    it('air signs are Gémeos, Libra, Aquário', () => {
      const ar = getElementZodiac('Ar');
      const signosAr = ar.map((m) => m.signo);
      expect(signosAr).toContain('Gémeos');
      expect(signosAr).toContain('Libra');
      expect(signosAr).toContain('Aquário');
    });

    it('water signs are Câncer, Escorpião, Peixes', () => {
      const agua = getElementZodiac('Água');
      const signosAgua = agua.map((m) => m.signo);
      expect(signosAgua).toContain('Câncer');
      expect(signosAgua).toContain('Escorpião');
      expect(signosAgua).toContain('Peixes');
    });

    it('each element has exactly 3 signs', () => {
      expect(getElementZodiac('Fogo')).toHaveLength(3);
      expect(getElementZodiac('Terra')).toHaveLength(3);
      expect(getElementZodiac('Ar')).toHaveLength(3);
      expect(getElementZodiac('Água')).toHaveLength(3);
    });
  });

  describe('Chakra assignments', () => {
    it('fire signs connect to Manipura or Ajna', () => {
      const fogo = getElementZodiac('Fogo');
      fogo.forEach((mapping) => {
        expect(['Manipura', 'Ajna']).toContain(mapping.chakra);
      });
    });

    it('earth signs connect to Muladhara or Svadhisthana', () => {
      const terra = getElementZodiac('Terra');
      terra.forEach((mapping) => {
        expect(['Muladhara', 'Svadhisthana']).toContain(mapping.chakra);
      });
    });

    it('air signs connect to Vishuddha or Ajna', () => {
      const ar = getElementZodiac('Ar');
      ar.forEach((mapping) => {
        expect(['Vishuddha', 'Ajna']).toContain(mapping.chakra);
      });
    });

    it('water signs connect to Svadhisthana, Anahata, or Sahasrara', () => {
      const agua = getElementZodiac('Água');
      agua.forEach((mapping) => {
        expect(['Svadhisthana', 'Anahata', 'Sahasrara']).toContain(mapping.chakra);
      });
    });

    it('all signs have chakraPt field', () => {
      getAllZodiacElements().forEach((mapping) => {
        expect(mapping.chakraPt).toBeTruthy();
        expect(typeof mapping.chakraPt).toBe('string');
      });
    });
  });

  describe('Spiritual meanings', () => {
    it('all signs have spiritual meaning', () => {
      getAllZodiacElements().forEach((mapping) => {
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(5);
      });
    });

    it('fire signs spiritual meanings relate to transformation and action', () => {
      const fogo = getElementZodiac('Fogo');
      fogo.forEach((mapping) => {
        const significado = mapping.significado_espiritual.toLowerCase();
        expect(
          significado.includes('criatividade') ||
          significado.includes('iniciativa') ||
          significado.includes('coragem') ||
          significado.includes('expansão') ||
          significado.includes('transformação') ||
          significado.includes('ação')
        ).toBe(true);
      });
    });

    it('earth signs spiritual meanings relate to stability and manifestation', () => {
      const terra = getElementZodiac('Terra');
      terra.forEach((mapping) => {
        const significado = mapping.significado_espiritual.toLowerCase();
        expect(
          significado.includes('estabilidade') ||
          significado.includes('prosperidade') ||
          significado.includes('disciplina') ||
          significado.includes('realização') ||
          significado.includes('serviço') ||
          significado.includes('terra')
        ).toBe(true);
      });
    });
  });
});