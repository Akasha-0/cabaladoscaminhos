import { describe, it, expect } from 'vitest';
import {
  getMoonPlanet,
  getPlanetMoon,
  getAllMoonPlanets,
  getAvailableMoonPhases,
  getSpiritualPractices,
  getElementConnection,
  getArchangel,
  getSefira,
  getMoonByPlanet,
  getPlanetDetails,
  getAvailablePlanets,
  MOON_PLANET_MAPPINGS,
  type MoonPlanetMapping,
  type Planeta,
  type FaseLua,
} from '@/lib/correlation/moon-planet';

describe('Moon-Planet Correlation', () => {
  describe('getMoonPlanet', () => {
    it('should return Saturno mapping for lua-nova', () => {
      const result = getMoonPlanet('lua-nova');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.nome_fase).toBe('Lua Nova');
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('should return Júpiter mapping for lua-crescente', () => {
      const result = getMoonPlanet('lua-crescente');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.nome_fase).toBe('Lua Crescente');
    });

    it('should return Marte mapping for quarto-crescente', () => {
      const result = getMoonPlanet('quarto-crescente');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.nome_fase).toBe('Quarto Crescente');
    });

    it('should return Lua mapping for lua-cheia', () => {
      const result = getMoonPlanet('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.nome_fase).toBe('Lua Cheia');
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('should return Vênus mapping for quarto-minguante', () => {
      const result = getMoonPlanet('quarto-minguante');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.nome_fase).toBe('Quarto Minguante');
    });

    it('should return Mercúrio mapping for lua-minguante', () => {
      const result = getMoonPlanet('lua-minguante');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.nome_fase).toBe('Lua Minguante');
    });

    it('should return Sol mapping for quarto-descrescente', () => {
      const result = getMoonPlanet('quarto-descrescente');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.nome_fase).toBe('Quarto Descrescente');
    });

    it('should return Netuno mapping for lua-velha', () => {
      const result = getMoonPlanet('lua-velha');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Netuno');
      expect(result?.nome_fase).toBe('Lua Velha');
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonPlanet('LUA-NOVA');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
    });

    it('should handle input with extra whitespace', () => {
      const result = getMoonPlanet('  lua-nova  ');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
    });

    it('should return null for unknown phase', () => {
      const result = getMoonPlanet('fase-inventada');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getMoonPlanet('');
      expect(result).toBeNull();
    });
  });

  describe('getPlanetMoon', () => {
    it('should return Saturno for lua-nova', () => {
      expect(getPlanetMoon('lua-nova')).toBe('Saturno');
    });

    it('should return Lua for lua-cheia', () => {
      expect(getPlanetMoon('lua-cheia')).toBe('Lua');
    });

    it('should return Marte for quarto-crescente', () => {
      expect(getPlanetMoon('quarto-crescente')).toBe('Marte');
    });

    it('should return Júpiter for lua-crescente', () => {
      expect(getPlanetMoon('lua-crescente')).toBe('Júpiter');
    });

    it('should return Sol for quarto-descrescente', () => {
      expect(getPlanetMoon('quarto-descrescente')).toBe('Sol');
    });

    it('should return Netuno for lua-velha', () => {
      expect(getPlanetMoon('lua-velha')).toBe('Netuno');
    });

    it('should return null for unknown phase', () => {
      expect(getPlanetMoon('fase-desconhecida')).toBeNull();
    });
  });

  describe('getAllMoonPlanets', () => {
    it('should return all 8 moon phases', () => {
      const result = getAllMoonPlanets();
      expect(result).toHaveLength(8);
    });

    it('should contain all lunar phases', () => {
      const result = getAllMoonPlanets();
      const phases = result.map((r) => r.fase);
      expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('quarto-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('quarto-minguante');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
    });

    it('should return complete mappings with planet details', () => {
      const result = getAllMoonPlanets();
      result.forEach((mapping) => {
        expect(mapping.planeta).toBeDefined();
        expect(mapping.planeta_detalhes).toBeDefined();
        expect(mapping.planeta_detalhes.simbolo).toBeDefined();
        expect(mapping.planeta_detalhes.qualidade).toBeDefined();
        expect(mapping.elemento_conexao).toBeDefined();
        expect(mapping.qualidades_espirituais).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
      });
    });

    it('should return mappings with spiritual practices', () => {
      const result = getAllMoonPlanets();
      result.forEach((mapping) => {
        expect(mapping.praticas_espirituais.meditacao).toBeDefined();
        expect(mapping.praticas_espirituais.ritual).toBeDefined();
        expect(mapping.praticas_espirituais.cores).toBeDefined();
        expect(mapping.praticas_espirituais.cristais).toBeDefined();
        expect(mapping.praticas_espirituais.aromas).toBeDefined();
        expect(mapping.praticas_espirituais.mantras).toBeDefined();
      });
    });

    it('should return mappings with archangel and sefira', () => {
      const result = getAllMoonPlanets();
      result.forEach((mapping) => {
        expect(mapping.archote_correspondente).toBeDefined();
        expect(mapping.sefira_correspondente).toBeDefined();
      });
    });
  });

  describe('getAvailableMoonPhases', () => {
    it('should return all 8 phase identifiers', () => {
      const result = getAvailableMoonPhases();
      expect(result).toHaveLength(8);
    });

    it('should return FaseLua type values', () => {
      const result = getAvailableMoonPhases();
      expect(result).toContain('lua-nova');
      expect(result).toContain('lua-cheia');
    });
  });

  describe('getSpiritualPractices', () => {
    it('should return spiritual practices for lua-nova', () => {
      const result = getSpiritualPractices('lua-nova');
      expect(result).toBeDefined();
      expect(result?.meditacao).toBeDefined();
      expect(result?.ritual).toBeDefined();
      expect(result?.cores).toContain('Preto');
      expect(result?.cristais).toContain('Obsidiana');
      expect(result?.mantras).toBeDefined();
    });

    it('should return crystals for lua-cheia', () => {
      const result = getSpiritualPractices('lua-cheia');
      expect(result?.cristais).toContain('Selenita');
      expect(result?.cristais).toContain('Quartzo lunar');
    });

    it('should return mantras for lua-velha', () => {
      const result = getSpiritualPractices('lua-velha');
      expect(result?.mantras).toBeDefined();
      expect(result?.mantras.length).toBeGreaterThan(0);
    });

    it('should return null for unknown phase', () => {
      expect(getSpiritualPractices('fase-invalida')).toBeNull();
    });
  });

  describe('getElementConnection', () => {
    it('should return Terra for lua-nova', () => {
      expect(getElementConnection('lua-nova')).toBe('Terra');
    });

    it('should return Água for lua-cheia', () => {
      expect(getElementConnection('lua-cheia')).toBe('Água');
    });

    it('should return Fogo for quarto-crescente', () => {
      expect(getElementConnection('quarto-crescente')).toBe('Fogo');
    });

    it('should return Ar for quarto-minguante', () => {
      expect(getElementConnection('quarto-minguante')).toBe('Ar');
    });

    it('should return Éter for lua-minguante', () => {
      expect(getElementConnection('lua-minguante')).toBe('Éter');
    });

    it('should return null for unknown phase', () => {
      expect(getElementConnection('fase-desconhecida')).toBeNull();
    });
  });

  describe('getArchangel', () => {
    it('should return Tzadkiel for lua-nova', () => {
      expect(getArchangel('lua-nova')).toBe('Tzadkiel');
    });

    it('should return Gabriel for lua-cheia', () => {
      expect(getArchangel('lua-cheia')).toBe('Gabriel');
    });

    it('should return Michael for lua-minguante', () => {
      expect(getArchangel('lua-minguante')).toBe('Michael');
    });

    it('should return null for unknown phase', () => {
      expect(getArchangel('fase-desconhecida')).toBeNull();
    });
  });

  describe('getSefira', () => {
    it('should return Binah for lua-nova', () => {
      expect(getSefira('lua-nova')).toBe('Binah (Compreensão)');
    });

    it('should return Yesod for lua-cheia', () => {
      expect(getSefira('lua-cheia')).toBe('Yesod (Fundação)');
    });

    it('should return Tiferet for lua-minguante', () => {
      expect(getSefira('lua-minguante')).toBe('Tiferet (Beleza/Harmonia)');
    });

    it('should return null for unknown phase', () => {
      expect(getSefira('fase-desconhecida')).toBeNull();
    });
  });

  describe('getMoonByPlanet', () => {
    it('should return all phases with Lua as planet', () => {
      const result = getMoonByPlanet('Lua');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.planeta).toBe('Lua');
      });
    });

    it('should be case-insensitive', () => {
      const result = getMoonByPlanet('saturno');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.planeta).toBe('Saturno');
      });
    });

    it('should return empty array for unknown planet', () => {
      const result = getMoonByPlanet('PlanetaFalso');
      expect(result).toEqual([]);
    });
  });

  describe('getPlanetDetails', () => {
    it('should return planet details for lua-nova', () => {
      const result = getPlanetDetails('lua-nova');
      expect(result).toBeDefined();
      expect(result?.simbolo).toBe('♄');
      expect(result?.qualidade).toBe('Limitação e estrutura');
      expect(result?.dia_semana).toBe('Sábado');
      expect(result?.metal).toBe('Chumbo');
    });

    it('should return details with simbolo for lua-cheia', () => {
      const result = getPlanetDetails('lua-cheia');
      expect(result?.simbolo).toBe('☾');
      expect(result?.metal).toBe('Prata');
    });

    it('should return null for unknown phase', () => {
      expect(getPlanetDetails('fase-invalida')).toBeNull();
    });
  });

  describe('getAvailablePlanets', () => {
    it('should return all unique planets', () => {
      const result = getAvailablePlanets();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Saturno');
      expect(result).toContain('Lua');
      expect(result).toContain('Sol');
    });

    it('should not have duplicates', () => {
      const result = getAvailablePlanets();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('MOON_PLANET_MAPPINGS structure', () => {
    it('should have all 8 phases mapped', () => {
      const phases: FaseLua[] = [
        'lua-nova',
        'lua-crescente',
        'quarto-crescente',
        'lua-cheia',
        'quarto-minguante',
        'lua-minguante',
        'quarto-descrescente',
        'lua-velha',
      ];
      phases.forEach((fase) => {
        expect(MOON_PLANET_MAPPINGS[fase]).toBeDefined();
      });
    });

    it('should have consistent planet symbols', () => {
      const symbols: Record<string, Planeta> = {
        '♄': 'Saturno',
        '♃': 'Júpiter',
        '♂': 'Marte',
        '☾': 'Lua',
        '♀': 'Vênus',
        '☿': 'Mercúrio',
        '☉': 'Sol',
        '♆': 'Netuno',
      };
      Object.values(MOON_PLANET_MAPPINGS).forEach((mapping) => {
        const expected = symbols[mapping.planeta_detalhes.simbolo];
        expect(mapping.planeta).toBe(expected);
      });
    });

    it('should have all phases with spiritual qualities', () => {
      Object.values(MOON_PLANET_MAPPINGS).forEach((mapping) => {
        expect(mapping.qualidades_espirituais.energia).toBeDefined();
        expect(mapping.qualidades_espirituais.dominio).toBeDefined();
        expect(mapping.qualidades_espirituais.missao).toBeDefined();
        expect(mapping.qualidades_espirituais.lição).toBeDefined();
      });
    });
  });
});