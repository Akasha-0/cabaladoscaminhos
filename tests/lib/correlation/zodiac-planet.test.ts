import { describe, it, expect } from 'vitest';
import {
  getZodiacPlanet,
  getPlanetZodiac,
  getAllZodiacPlanets,
  getPlanetFromZodiac,
  getElementFromZodiac,
  getSignificadoEspiritual,
  getOrixaFromZodiac,
  getChakraFromZodiac,
  getSignosByPlanet,
  getSignosByElement,
  getSignosByModalidade,
  getSignosByPolaridade,
  ZODIAC_PLANET_MAPPINGS,
  type ZodiacPlanetMapping,
  type Signo,
  type Planeta,
} from '@/lib/correlation/zodiac-planet';

describe('zodiac-planet', () => {
  // ─── ZODIAC_PLANET_MAPPINGS: all 12 signs ─────────────────────────────────

  describe('ZODIAC_PLANET_MAPPINGS', () => {
    it('should have exactly 12 zodiac signs', () => {
      expect(Object.keys(ZODIAC_PLANET_MAPPINGS).length).toBe(12);
    });

    it('should contain all standard zodiac signs', () => {
      const expectedSigns = [
        'Áries',
        'Touro',
        'Gémeos',
        'Câncer',
        'Leão',
        'Virgem',
        'Libra',
        'Escorpião',
        'Sagitário',
        'Capricórnio',
        'Aquário',
        'Peixes',
      ];
      expectedSigns.forEach(sign => {
        expect(ZODIAC_PLANET_MAPPINGS).toHaveProperty(sign);
      });
    });

    it('should map each sign to a valid planet', () => {
      const validPlanets = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(validPlanets).toContain(mapping.planeta);
      });
    });

    it('should have spiritual meaning for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should have spiritual lessons for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.licoes_espirituais).toBeDefined();
        expect(mapping.licoes_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('should have ritual practices for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais).toBeDefined();
        expect(mapping.praticas_rituais.ebos).toBeDefined();
        expect(mapping.praticas_rituais.banhos).toBeDefined();
        expect(mapping.praticas_rituais.defumacoes).toBeDefined();
        expect(mapping.praticas_rituais.mantras).toBeDefined();
        expect(mapping.praticas_rituais.cores).toBeDefined();
        expect(mapping.praticas_rituais.dias_favoraveis).toBeDefined();
      });
    });

    it('should have Cabala correspondence for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.correspondencia_cabala).toBeDefined();
        expect(mapping.correspondencia_cabala.sefira).toBeDefined();
        expect(mapping.correspondencia_cabala.caminho).toBeDefined();
        expect(mapping.correspondencia_cabala.arcanjo).toBeDefined();
        expect(mapping.correspondencia_cabala.vibração).toBeDefined();
      });
    });

    it('should have element, polarity, and modality for each sign', () => {
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água'];
      const validPolarities = ['Yang', 'Yin'];
      const validModalities = ['Cardinal', 'Fixo', 'Mutável'];

      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(validElements).toContain(mapping.elemento);
        expect(validPolarities).toContain(mapping.polaridade);
        expect(validModalities).toContain(mapping.modalidade);
      });
    });

    it('should have chakra and orixá for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.chakra_principal).toBeDefined();
        expect(mapping.orixa_associado).toBeDefined();
      });
    });
  });

  // ─── getZodiacPlanet: lookup by sign ─────────────────────────────────────

  describe('getZodiacPlanet', () => {
    it('should return mapping for valid signs', () => {
      const result = getZodiacPlanet('Áries');
      expect(result).toBeDefined();
      expect(result?.signo).toBe('Áries');
      expect(result?.planeta).toBe('Marte');
    });

    it('should return mapping for all 12 signs', () => {
      const signs = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach(sign => {
        const result = getZodiacPlanet(sign);
        expect(result).not.toBeNull();
        expect(result?.signo).toBe(sign);
      });
    });

    it('should return null for invalid sign', () => {
      expect(getZodiacPlanet('InvalidSign')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getZodiacPlanet('')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(getZodiacPlanet('áries')).toBeDefined();
      expect(getZodiacPlanet('ARIES')).toBeDefined();
      expect(getZodiacPlanet('aries')).toBeDefined();
    });

    it('should handle accent variations', () => {
      expect(getZodiacPlanet('Gêmeos')).toBeDefined();
      expect(getZodiacPlanet('Cancer')).toBeDefined();
      expect(getZodiacPlanet('Leao')).toBeDefined();
    });
  });

  // ─── getPlanetZodiac: lookup by planet ─────────────────────────────────────

  describe('getPlanetZodiac', () => {
    it('should return signs ruled by Sol', () => {
      const result = getPlanetZodiac('Sol');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Sol');
      });
    });

    it('should return signs ruled by Lua', () => {
      const result = getPlanetZodiac('Lua');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Lua');
      });
    });

    it('should return signs ruled by Marte', () => {
      const result = getPlanetZodiac('Marte');
      expect(result).toBeDefined();
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Marte');
      });
    });

    it('should return signs ruled by Vênus', () => {
      const result = getPlanetZodiac('Vênus');
      expect(result).toBeDefined();
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Vênus');
      });
    });

    it('should return signs ruled by Mercúrio', () => {
      const result = getPlanetZodiac('Mercúrio');
      expect(result).toBeDefined();
      expect(result.length).toBe(2); // Gêmeos and Virgem
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Mercúrio');
      });
    });

    it('should return signs ruled by Júpiter', () => {
      const result = getPlanetZodiac('Júpiter');
      expect(result).toBeDefined();
      expect(result.length).toBe(2); // Sagitário and Peixes
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Júpiter');
      });
    });

    it('should return signs ruled by Saturno', () => {
      const result = getPlanetZodiac('Saturno');
      expect(result).toBeDefined();
      expect(result.length).toBe(2); // Capricórnio and Aquário
      result.forEach(mapping => {
        expect(mapping.planeta).toBe('Saturno');
      });
    });

    it('should be case insensitive', () => {
      expect(getPlanetZodiac('sol').length).toBeGreaterThan(0);
      expect(getPlanetZodiac('LUA').length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid planet', () => {
      expect(getPlanetZodiac('Invalid')).toEqual([]);
    });
  });

  // ─── getAllZodiacPlanets ───────────────────────────────────────────────────

  describe('getAllZodiacPlanets', () => {
    it('should return all 12 zodiac mappings', () => {
      const result = getAllZodiacPlanets();
      expect(result).toBeDefined();
      expect(result.length).toBe(12);
    });

    it('should return array of complete mappings', () => {
      const result = getAllZodiacPlanets();
      result.forEach(mapping => {
        expect(mapping.signo).toBeDefined();
        expect(mapping.planeta).toBeDefined();
        expect(mapping.elemento).toBeDefined();
      });
    });

    it('should match ZODIAC_PLANET_MAPPINGS values', () => {
      const result = getAllZodiacPlanets();
      const expected = Object.values(ZODIAC_PLANET_MAPPINGS);
      expect(result).toEqual(expected);
    });
  });

  // ─── getPlanetFromZodiac ────────────────────────────────────────────────────

  describe('getPlanetFromZodiac', () => {
    it('should return planet for valid signs', () => {
      expect(getPlanetFromZodiac('Áries')).toBe('Marte');
      expect(getPlanetFromZodiac('Touro')).toBe('Vênus');
      expect(getPlanetFromZodiac('Leão')).toBe('Sol');
      expect(getPlanetFromZodiac('Câncer')).toBe('Lua');
    });

    it('should return null for invalid sign', () => {
      expect(getPlanetFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getElementFromZodiac ───────────────────────────────────────────────────

  describe('getElementFromZodiac', () => {
    it('should return element for valid signs', () => {
      expect(getElementFromZodiac('Áries')).toBe('Fogo');
      expect(getElementFromZodiac('Touro')).toBe('Terra');
      expect(getElementFromZodiac('Gémeos')).toBe('Ar');
      expect(getElementFromZodiac('Câncer')).toBe('Água');
    });

    it('should return null for invalid sign', () => {
      expect(getElementFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getSignificadoEspiritual ───────────────────────────────────────────────

  describe('getSignificadoEspiritual', () => {
    it('should return spiritual meaning for valid signs', () => {
      const result = getSignificadoEspiritual('Áries');
      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid sign', () => {
      expect(getSignificadoEspiritual('Invalid')).toBeNull();
    });
  });

  // ─── getOrixaFromZodiac ─────────────────────────────────────────────────────

  describe('getOrixaFromZodiac', () => {
    it('should return orixá for valid signs', () => {
      expect(getOrixaFromZodiac('Áries')).toBe('Ogum - orixá das batalhas, ferramentas e caminhos');
      expect(getOrixaFromZodiac('Touro')).toBe('Oxum - orixá das águas doces, amor e fertilidade');
      expect(getOrixaFromZodiac('Leão')).toBe('Oxalá - orixá Pai maior, luz e paz');
    });

    it('should return null for invalid sign', () => {
      expect(getOrixaFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getChakraFromZodiac ────────────────────────────────────────────────────

  describe('getChakraFromZodiac', () => {
    it('should return chakra for valid signs', () => {
      const result = getChakraFromZodiac('Áries');
      expect(result).toBeDefined();
      expect(result).toContain('Muladhara');
    });

    it('should return null for invalid sign', () => {
      expect(getChakraFromZodiac('Invalid')).toBeNull();
    });
  });

  // ─── getSignosByPlanet ─────────────────────────────────────────────────────

  describe('getSignosByPlanet', () => {
    it('should return all signs for each planet', () => {
      expect(getSignosByPlanet('Sol')).toContain('Leão');
      expect(getSignosByPlanet('Lua')).toContain('Câncer');
      expect(getSignosByPlanet('Marte')).toContain('Áries');
      expect(getSignosByPlanet('Marte')).toContain('Escorpião');
      expect(getSignosByPlanet('Vênus')).toContain('Touro');
      expect(getSignosByPlanet('Vênus')).toContain('Libra');
      expect(getSignosByPlanet('Mercúrio')).toContain('Gémeos');
      expect(getSignosByPlanet('Mercúrio')).toContain('Virgem');
      expect(getSignosByPlanet('Júpiter')).toContain('Sagitário');
      expect(getSignosByPlanet('Júpiter')).toContain('Peixes');
      expect(getSignosByPlanet('Saturno')).toContain('Capricórnio');
      expect(getSignosByPlanet('Saturno')).toContain('Aquário');
    });

    it('should return empty array for invalid planet', () => {
      expect(getSignosByPlanet('Invalid')).toEqual([]);
    });
  });

  // ─── getSignosByElement ────────────────────────────────────────────────────

  describe('getSignosByElement', () => {
    it('should return fire signs', () => {
      const result = getSignosByElement('Fogo');
      expect(result).toContain('Áries');
      expect(result).toContain('Leão');
      expect(result).toContain('Sagitário');
      expect(result.length).toBe(3);
    });

    it('should return earth signs', () => {
      const result = getSignosByElement('Terra');
      expect(result).toContain('Touro');
      expect(result).toContain('Virgem');
      expect(result).toContain('Capricórnio');
      expect(result.length).toBe(3);
    });

    it('should return air signs', () => {
      const result = getSignosByElement('Ar');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Libra');
      expect(result).toContain('Aquário');
      expect(result.length).toBe(3);
    });

    it('should return water signs', () => {
      const result = getSignosByElement('Água');
      expect(result).toContain('Câncer');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Peixes');
      expect(result.length).toBe(3);
    });

    it('should return empty array for invalid element', () => {
      expect(getSignosByElement('Invalid')).toEqual([]);
    });
  });

  // ─── getSignosByModalidade ─────────────────────────────────────────────────

  describe('getSignosByModalidade', () => {
    it('should return cardinal signs', () => {
      const result = getSignosByModalidade('Cardinal');
      expect(result).toContain('Áries');
      expect(result).toContain('Câncer');
      expect(result).toContain('Libra');
      expect(result).toContain('Capricórnio');
      expect(result.length).toBe(4);
    });

    it('should return fixed signs', () => {
      const result = getSignosByModalidade('Fixo');
      expect(result).toContain('Touro');
      expect(result).toContain('Leão');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Aquário');
      expect(result.length).toBe(4);
    });

    it('should return mutable signs', () => {
      const result = getSignosByModalidade('Mutável');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Virgem');
      expect(result).toContain('Sagitário');
      expect(result).toContain('Peixes');
      expect(result.length).toBe(4);
    });
  });

  // ─── getSignosByPolaridade ─────────────────────────────────────────────────

  describe('getSignosByPolaridade', () => {
    it('should return yang signs', () => {
      const result = getSignosByPolaridade('Yang');
      expect(result).toContain('Áries');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Leão');
      expect(result).toContain('Libra');
      expect(result).toContain('Sagitário');
      expect(result).toContain('Aquário');
      expect(result.length).toBe(6);
    });

    it('should return yin signs', () => {
      const result = getSignosByPolaridade('Yin');
      expect(result).toContain('Touro');
      expect(result).toContain('Câncer');
      expect(result).toContain('Virgem');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Capricórnio');
      expect(result).toContain('Peixes');
      expect(result.length).toBe(6);
    });
  });

  // ─── Integration: planet-element relationships ────────────────────────────

  describe('planet-element integration', () => {
    it('should have correct element for each ruling planet', () => {
      // Fire signs ruled by Mars (Aries) and Sun (Leo) and Jupiter (Sagittarius)
      expect(getElementFromZodiac('Áries')).toBe('Fogo');
      expect(getElementFromZodiac('Leão')).toBe('Fogo');
      expect(getElementFromZodiac('Sagitário')).toBe('Fogo');

      // Earth signs ruled by Venus (Taurus) and Mercury (Virgem) and Saturn (Capricorn)
      expect(getElementFromZodiac('Touro')).toBe('Terra');
      expect(getElementFromZodiac('Virgem')).toBe('Terra');
      expect(getElementFromZodiac('Capricórnio')).toBe('Terra');

      // Air signs ruled by Mercury (Gemini) and Venus (Libra) and Saturn (Aquarius)
      expect(getElementFromZodiac('Gémeos')).toBe('Ar');
      expect(getElementFromZodiac('Libra')).toBe('Ar');
      expect(getElementFromZodiac('Aquário')).toBe('Ar');

      // Water signs ruled by Moon (Cancer) and Mars (Scorpio) and Jupiter (Pisces)
      expect(getElementFromZodiac('Câncer')).toBe('Água');
      expect(getElementFromZodiac('Escorpião')).toBe('Água');
      expect(getElementFromZodiac('Peixes')).toBe('Água');
    });

    it('should have complementary polarities for dual-ruled planets', () => {
      // Mercury rules one Yang (Gemini) and one Yin (Virgo)
      const gemini = getZodiacPlanet('Gémeos');
      const virgo = getZodiacPlanet('Virgem');
      expect(gemini?.polaridade).toBe('Yang');
      expect(virgo?.polaridade).toBe('Yin');

      // Venus rules one Yin (Taurus) and one Yang (Libra)
      const taurus = getZodiacPlanet('Touro');
      const libra = getZodiacPlanet('Libra');
      expect(taurus?.polaridade).toBe('Yin');
      expect(libra?.polaridade).toBe('Yang');

      // Mars rules one Yang (Aries) and one Yin (Scorpio)
      const aries = getZodiacPlanet('Áries');
      const scorpio = getZodiacPlanet('Escorpião');
      expect(aries?.polaridade).toBe('Yang');
      expect(scorpio?.polaridade).toBe('Yin');

      // Jupiter rules one Yang (Sagittarius) and one Yin (Pisces)
      const sagittarius = getZodiacPlanet('Sagitário');
      const pisces = getZodiacPlanet('Peixes');
      expect(sagittarius?.polaridade).toBe('Yang');
      expect(pisces?.polaridade).toBe('Yin');

      // Saturn rules one Yin (Capricorn) and one Yang (Aquarius)
      const capricorn = getZodiacPlanet('Capricórnio');
      const aquarius = getZodiacPlanet('Aquário');
      expect(capricorn?.polaridade).toBe('Yin');
      expect(aquarius?.polaridade).toBe('Yang');
    });

    it('should have correct modality patterns', () => {
      // Cardinal: Aries, Cancer, Libra, Capricorn
      expect(getZodiacPlanet('Áries')?.modalidade).toBe('Cardinal');
      expect(getZodiacPlanet('Câncer')?.modalidade).toBe('Cardinal');
      expect(getZodiacPlanet('Libra')?.modalidade).toBe('Cardinal');
      expect(getZodiacPlanet('Capricórnio')?.modalidade).toBe('Cardinal');

      // Fixed: Taurus, Leo, Scorpio, Aquarius
      expect(getZodiacPlanet('Touro')?.modalidade).toBe('Fixo');
      expect(getZodiacPlanet('Leão')?.modalidade).toBe('Fixo');
      expect(getZodiacPlanet('Escorpião')?.modalidade).toBe('Fixo');
      expect(getZodiacPlanet('Aquário')?.modalidade).toBe('Fixo');

      // Mutable: Gemini, Virgo, Sagittarius, Pisces
      expect(getZodiacPlanet('Gémeos')?.modalidade).toBe('Mutável');
      expect(getZodiacPlanet('Virgem')?.modalidade).toBe('Mutável');
      expect(getZodiacPlanet('Sagitário')?.modalidade).toBe('Mutável');
      expect(getZodiacPlanet('Peixes')?.modalidade).toBe('Mutável');
    });
  });

  // ─── Type exports ──────────────────────────────────────────────────────────

  describe('type exports', () => {
    it('should export ZodiacPlanetMapping type', () => {
      const mapping: ZodiacPlanetMapping = {
        signo: 'Áries',
        planeta: 'Marte',
        elemento: 'Fogo',
        polaridade: 'Yang',
        modalidade: 'Cardinal',
        significado_espiritual: 'Test',
        licoes_espirituais: ['Test'],
        praticas_rituais: {
          ebos: ['Test'],
          banhos: ['Test'],
          defumacoes: ['Test'],
          mantras: ['Test'],
          cores: ['Test'],
          dias_favoraveis: ['Test'],
        },
        correspondencia_cabala: {
          sefira: 'Test',
          caminho: 'Test',
          arcanjo: 'Test',
          vibração: 'Test',
        },
        chakra_principal: 'Test',
        orixa_associado: 'Test',
      };
      expect(mapping.signo).toBe('Áries');
    });

    it('should export Signo type', () => {
      const signo: Signo = 'Áries';
      expect(signo).toBeDefined();
    });

    it('should export Planeta type', () => {
      const planeta: Planeta = 'Marte';
      expect(planeta).toBeDefined();
    });
  });

  // ─── Cabala correspondence integrity ──────────────────────────────────────

  describe('Cabala correspondence integrity', () => {
    it('should have sefira with path number for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.correspondencia_cabala.sefira).toMatch(/[A-Za-z]+/);
        expect(mapping.correspondencia_cabala.caminho).toMatch(/Camino \d+/);
      });
    });

    it('should have valid arcanjo for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.correspondencia_cabala.arcanjo).toBeDefined();
        expect(mapping.correspondencia_cabala.arcanjo.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Ritual practices integrity ────────────────────────────────────────────

  describe('Ritual practices integrity', () => {
    it('should have at least 2 ebos for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais.ebos.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 banhos for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais.banhos.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 defumacoes for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais.defumacoes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 mantras for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais.mantras.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 cores for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais.cores.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 favorable days for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_rituais.dias_favoraveis.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  // ─── Spiritual lessons integrity ───────────────────────────────────────────

  describe('Spiritual lessons integrity', () => {
    it('should have exactly 4 spiritual lessons for each sign', () => {
      Object.values(ZODIAC_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping.licoes_espirituais.length).toBe(4);
      });
    });
  });
});