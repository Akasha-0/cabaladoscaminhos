import { describe, it, expect } from 'vitest';
import {
  getZodiacSigno,
  getSignoElemento,
  getSignoModalidade,
  getSignoNatureza,
  getSignoPlaneta,
  getSignoCaracteristicas,
  getSignoSignificado,
  getSignosByElemento,
  getSignosByModalidade,
  getSignosByPlaneta,
  getSignosYang,
  getSignosYin,
  getAllSignos,
  ZODIAC_SIGNO_MAPPINGS,
} from '@/lib/correlation/zodiac-signo';

describe('correlation/zodiac-signo', () => {
  describe('getZodiacSigno', () => {
    it('returns correct mapping for Áries', () => {
      const result = getZodiacSigno('Áries');
      expect(result).toBeDefined();
      expect(result?.signo).toBe('Áries');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.modalidade).toBe('Cardinal');
      expect(result?.planeta_regente).toBe('Marte');
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getZodiacSigno('Escorpião');
      expect(result).toBeDefined();
      expect(result?.signo).toBe('Escorpião');
      expect(result?.elemento).toBe('Água');
      expect(result?.modalidade).toBe('Fixed');
      expect(result?.planeta_regente).toBe('Plutão');
    });

    it('returns correct mapping for all 12 signs', () => {
      const signs = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const result = getZodiacSigno(signo);
        expect(result).not.toBeNull();
        expect(result?.signo).toBe(signo);
      });
    });

    it('handles case-insensitive input', () => {
      expect(getZodiacSigno('ARIES')?.elemento).toBe('Fogo');
      expect(getZodiacSigno('aries')?.elemento).toBe('Fogo');
      expect(getZodiacSigno('LEÃO')?.elemento).toBe('Fogo');
    });

    it('handles accent variations', () => {
      expect(getZodiacSigno('Gemeos')?.elemento).toBe('Ar');
      expect(getZodiacSigno('gemeos')?.elemento).toBe('Ar');
      expect(getZodiacSigno('Cancer')?.elemento).toBe('Água');
    });

    it('returns null for unknown sign', () => {
      expect(getZodiacSigno('Unknown')).toBeNull();
      expect(getZodiacSigno('')).toBeNull();
    });
  });

  describe('getSignoElemento', () => {
    it('returns correct element for each sign', () => {
      expect(getSignoElemento('Áries')).toBe('Fogo');
      expect(getSignoElemento('Touro')).toBe('Terra');
      expect(getSignoElemento('Gémeos')).toBe('Ar');
      expect(getSignoElemento('Câncer')).toBe('Água');
      expect(getSignoElemento('Leão')).toBe('Fogo');
      expect(getSignoElemento('Virgem')).toBe('Terra');
      expect(getSignoElemento('Libra')).toBe('Ar');
      expect(getSignoElemento('Escorpião')).toBe('Água');
      expect(getSignoElemento('Sagitário')).toBe('Fogo');
      expect(getSignoElemento('Capricórnio')).toBe('Terra');
      expect(getSignoElemento('Aquário')).toBe('Ar');
      expect(getSignoElemento('Peixes')).toBe('Água');
    });

    it('returns null for unknown sign', () => {
      expect(getSignoElemento('Unknown')).toBeNull();
    });
  });

  describe('getSignoModalidade', () => {
    it('returns correct modality for each sign', () => {
      expect(getSignoModalidade('Áries')).toBe('Cardinal');
      expect(getSignoModalidade('Touro')).toBe('Fixed');
      expect(getSignoModalidade('Gémeos')).toBe('Mutable');
      expect(getSignoModalidade('Câncer')).toBe('Cardinal');
      expect(getSignoModalidade('Leão')).toBe('Fixed');
      expect(getSignoModalidade('Virgem')).toBe('Mutable');
      expect(getSignoModalidade('Libra')).toBe('Cardinal');
      expect(getSignoModalidade('Escorpião')).toBe('Fixed');
      expect(getSignoModalidade('Sagitário')).toBe('Mutable');
      expect(getSignoModalidade('Capricórnio')).toBe('Cardinal');
      expect(getSignoModalidade('Aquário')).toBe('Fixed');
      expect(getSignoModalidade('Peixes')).toBe('Mutable');
    });

    it('returns null for unknown sign', () => {
      expect(getSignoModalidade('Unknown')).toBeNull();
    });
  });

  describe('getSignoNatureza', () => {
    it('returns correct nature (polarity) for each sign', () => {
      // Yang signs: Áries, Gémeos, Leão, Libra, Sagitário, Aquário
      expect(getSignoNatureza('Áries')).toBe('Yang');
      expect(getSignoNatureza('Gémeos')).toBe('Yang');
      expect(getSignoNatureza('Leão')).toBe('Yang');
      expect(getSignoNatureza('Libra')).toBe('Yang');
      expect(getSignoNatureza('Sagitário')).toBe('Yang');
      expect(getSignoNatureza('Aquário')).toBe('Yang');

      // Yin signs: Touro, Câncer, Virgem, Escorpião, Capricórnio, Peixes
      expect(getSignoNatureza('Touro')).toBe('Yin');
      expect(getSignoNatureza('Câncer')).toBe('Yin');
      expect(getSignoNatureza('Virgem')).toBe('Yin');
      expect(getSignoNatureza('Escorpião')).toBe('Yin');
      expect(getSignoNatureza('Capricórnio')).toBe('Yin');
      expect(getSignoNatureza('Peixes')).toBe('Yin');
    });
  });

  describe('getSignoPlaneta', () => {
    it('returns correct planetary ruler for each sign', () => {
      expect(getSignoPlaneta('Áries')).toBe('Marte');
      expect(getSignoPlaneta('Touro')).toBe('Vénus');
      expect(getSignoPlaneta('Gémeos')).toBe('Mercúrio');
      expect(getSignoPlaneta('Câncer')).toBe('Lua');
      expect(getSignoPlaneta('Leão')).toBe('Sol');
      expect(getSignoPlaneta('Virgem')).toBe('Mercúrio');
      expect(getSignoPlaneta('Libra')).toBe('Vénus');
      expect(getSignoPlaneta('Escorpião')).toBe('Plutão');
      expect(getSignoPlaneta('Sagitário')).toBe('Júpiter');
      expect(getSignoPlaneta('Capricórnio')).toBe('Saturno');
      expect(getSignoPlaneta('Aquário')).toBe('Urano');
      expect(getSignoPlaneta('Peixes')).toBe('Neptuno');
    });
  });

  describe('getSignoCaracteristicas', () => {
    it('returns array of characteristics for each sign', () => {
      const aries = getSignoCaracteristicas('Áries');
      expect(aries).toBeDefined();
      expect(Array.isArray(aries)).toBe(true);
      expect(aries?.length).toBeGreaterThan(0);
      expect(aries).toContain('Pioneiro');
      expect(aries).toContain('Corajoso');
    });

    it('returns null for unknown sign', () => {
      expect(getSignoCaracteristicas('Unknown')).toBeNull();
    });
  });

  describe('getSignoSignificado', () => {
    it('returns spiritual meaning for each sign', () => {
      const significado = getSignoSignificado('Áries');
      expect(significado).toBeDefined();
      expect(typeof significado).toBe('string');
      expect(significado!.length).toBeGreaterThan(0);
    });

    it('returns null for unknown sign', () => {
      expect(getSignoSignificado('Unknown')).toBeNull();
    });
  });

  describe('getSignosByElemento', () => {
    it('returns all fire signs', () => {
      const fireSigns = getSignosByElemento('Fogo');
      expect(fireSigns).toContain('Áries');
      expect(fireSigns).toContain('Leão');
      expect(fireSigns).toContain('Sagitário');
      expect(fireSigns.length).toBe(3);
    });

    it('returns all earth signs', () => {
      const earthSigns = getSignosByElemento('Terra');
      expect(earthSigns).toContain('Touro');
      expect(earthSigns).toContain('Virgem');
      expect(earthSigns).toContain('Capricórnio');
      expect(earthSigns.length).toBe(3);
    });

    it('returns all air signs', () => {
      const airSigns = getSignosByElemento('Ar');
      expect(airSigns).toContain('Gémeos');
      expect(airSigns).toContain('Libra');
      expect(airSigns).toContain('Aquário');
      expect(airSigns.length).toBe(3);
    });

    it('returns all water signs', () => {
      const waterSigns = getSignosByElemento('Água');
      expect(waterSigns).toContain('Câncer');
      expect(waterSigns).toContain('Escorpião');
      expect(waterSigns).toContain('Peixes');
      expect(waterSigns.length).toBe(3);
    });

    it('returns empty array for unknown element', () => {
      expect(getSignosByElemento('Unknown')).toEqual([]);
    });
  });

  describe('getSignosByModalidade', () => {
    it('returns all cardinal signs', () => {
      const cardinalSigns = getSignosByModalidade('Cardinal');
      expect(cardinalSigns).toContain('Áries');
      expect(cardinalSigns).toContain('Câncer');
      expect(cardinalSigns).toContain('Libra');
      expect(cardinalSigns).toContain('Capricórnio');
      expect(cardinalSigns.length).toBe(4);
    });

    it('returns all fixed signs', () => {
      const fixedSigns = getSignosByModalidade('Fixed');
      expect(fixedSigns).toContain('Touro');
      expect(fixedSigns).toContain('Leão');
      expect(fixedSigns).toContain('Escorpião');
      expect(fixedSigns).toContain('Aquário');
      expect(fixedSigns.length).toBe(4);
    });

    it('returns all mutable signs', () => {
      const mutableSigns = getSignosByModalidade('Mutable');
      expect(mutableSigns).toContain('Gémeos');
      expect(mutableSigns).toContain('Virgem');
      expect(mutableSigns).toContain('Sagitário');
      expect(mutableSigns).toContain('Peixes');
      expect(mutableSigns.length).toBe(4);
    });
  });

  describe('getSignosByPlaneta', () => {
    it('returns signs ruled by Mercúrio', () => {
      const mercurio = getSignosByPlaneta('Mercúrio');
      expect(mercurio).toContain('Gémeos');
      expect(mercurio).toContain('Virgem');
      expect(mercurio.length).toBe(2);
    });

    it('returns signs ruled by Vénus', () => {
      const venus = getSignosByPlaneta('Vénus');
      expect(venus).toContain('Touro');
      expect(venus).toContain('Libra');
      expect(venus.length).toBe(2);
    });
  });

  describe('getSignosYang / getSignosYin', () => {
    it('returns 6 Yang signs', () => {
      const yangSigns = getSignosYang();
      expect(yangSigns.length).toBe(6);
      expect(yangSigns).toContain('Áries');
      expect(yangSigns).toContain('Gémeos');
      expect(yangSigns).toContain('Leão');
      expect(yangSigns).toContain('Libra');
      expect(yangSigns).toContain('Sagitário');
      expect(yangSigns).toContain('Aquário');
    });

    it('returns 6 Yin signs', () => {
      const yinSigns = getSignosYin();
      expect(yinSigns.length).toBe(6);
      expect(yinSigns).toContain('Touro');
      expect(yinSigns).toContain('Câncer');
      expect(yinSigns).toContain('Virgem');
      expect(yinSigns).toContain('Escorpião');
      expect(yinSigns).toContain('Capricórnio');
      expect(yinSigns).toContain('Peixes');
    });
  });

  describe('getAllSignos', () => {
    it('returns all 12 signs', () => {
      const allSignos = getAllSignos();
      expect(allSignos.length).toBe(12);
    });

    it('contains complete information for each sign', () => {
      const allSignos = getAllSignos();
      allSignos.forEach((signo) => {
        expect(signo.signo).toBeDefined();
        expect(signo.elemento).toBeDefined();
        expect(signo.modalidade).toBeDefined();
        expect(signo.natureza).toBeDefined();
        expect(signo.planeta_regente).toBeDefined();
        expect(signo.caracteristicas).toBeDefined();
        expect(signo.significado_espiritual).toBeDefined();
      });
    });
  });

  describe('ZODIAC_SIGNO_MAPPINGS', () => {
    it('contains all 12 zodiac signs', () => {
      const keys = Object.keys(ZODIAC_SIGNO_MAPPINGS);
      expect(keys.length).toBe(12);
    });

    it('each mapping has correct structure', () => {
      Object.values(ZODIAC_SIGNO_MAPPINGS).forEach((mapping) => {
        expect(typeof mapping.signo).toBe('string');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.modalidade).toBe('string');
        expect(typeof mapping.natureza).toBe('string');
        expect(typeof mapping.planeta_regente).toBe('string');
        expect(Array.isArray(mapping.caracteristicas)).toBe(true);
        expect(typeof mapping.significado_espiritual).toBe('string');
      });
    });

    it('element distribution is balanced (3 per element)', () => {
      const elements: Record<string, number> = {};
      Object.values(ZODIAC_SIGNO_MAPPINGS).forEach((mapping) => {
        elements[mapping.elemento] = (elements[mapping.elemento] || 0) + 1;
      });
      expect(elements['Fogo']).toBe(3);
      expect(elements['Terra']).toBe(3);
      expect(elements['Ar']).toBe(3);
      expect(elements['Água']).toBe(3);
    });

    it('modality distribution is balanced (4 per modality)', () => {
      const modalities: Record<string, number> = {};
      Object.values(ZODIAC_SIGNO_MAPPINGS).forEach((mapping) => {
        modalities[mapping.modalidade] = (modalities[mapping.modalidade] || 0) + 1;
      });
      expect(modalities['Cardinal']).toBe(4);
      expect(modalities['Fixed']).toBe(4);
      expect(modalities['Mutable']).toBe(4);
    });

    it('nature distribution is balanced (6 Yang, 6 Yin)', () => {
      const natures: Record<string, number> = {};
      Object.values(ZODIAC_SIGNO_MAPPINGS).forEach((mapping) => {
        natures[mapping.natureza] = (natures[mapping.natureza] || 0) + 1;
      });
      expect(natures['Yang']).toBe(6);
      expect(natures['Yin']).toBe(6);
    });
  });
});