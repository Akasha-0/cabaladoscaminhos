import { describe, it, expect } from 'vitest';
import {
  getMoonPlanet,
  getPlanetMoon,
  getAllMoonPlanets,
  getElementMoonPlanet,
  getMeaningMoonPlanet,
  getPolarityMoonPlanet,
  getEnergyFlowMoonPlanet,
  getMoonPhasesByPlanet,
  getMoonPhasesByElement,
  getOrixaMoonPlanet,
  getChakraMoonPlanet,
  getColorMoonPlanet,
  MOON_PLANET_MAP,
  type MoonPlanetMapping,
  type FaseLua,
  type Planeta,
} from '@/lib/correlation/moon-planet';

describe('Moon-Planet Correlation', () => {
  describe('getMoonPlanet', () => {
    it('should return Plutão mapping for lua-nova', () => {
      const result = getMoonPlanet('lua-nova');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Plutão');
      expect(result?.planeta_nome).toBe('Plutão');
      expect(result?.elemento).toBe('água');
      expect(result?.orixa).toBe('Oxumaré');
      expect(result?.polaridade).toBe('Yin');
      expect(result?.fluxo_energetico).toBe('centripeto');
    });

    it('should return Vênus mapping for lua-crescente', () => {
      const result = getMoonPlanet('lua-crescente');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.planeta_nome).toBe('Vênus');
      expect(result?.elemento).toBe('água');
      expect(result?.orixa).toBe('Oxum');
      expect(result?.polaridade).toBe('Yang');
      expect(result?.fluxo_energetico).toBe('ascendente');
    });

    it('should return Júpiter mapping for quarto-crescente', () => {
      const result = getMoonPlanet('quarto-crescente');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.planeta_nome).toBe('Júpiter');
      expect(result?.elemento).toBe('fogo');
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.polaridade).toBe('Yang');
      expect(result?.fluxo_energetico).toBe('ascendente');
    });

    it('should return Lua mapping for lua-cheia', () => {
      const result = getMoonPlanet('lua-cheia');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
      expect(result?.planeta_nome).toBe('Lua');
      expect(result?.elemento).toBe('água');
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.polaridade).toBe('Equilibrado');
      expect(result?.fluxo_energetico).toBe('centrifugo');
    });

    it('should return Saturno mapping for quarto-minguante', () => {
      const result = getMoonPlanet('quarto-minguante');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.planeta_nome).toBe('Saturno');
      expect(result?.elemento).toBe('éter');
      expect(result?.orixa).toBe('Xangô');
      expect(result?.polaridade).toBe('Yin');
      expect(result?.fluxo_energetico).toBe('descendente');
    });

    it('should return Mercúrio mapping for lua-minguante', () => {
      const result = getMoonPlanet('lua-minguante');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.planeta_nome).toBe('Mercúrio');
      expect(result?.elemento).toBe('ar');
      expect(result?.orixa).toBe('Nanã');
      expect(result?.polaridade).toBe('Yin');
      expect(result?.fluxo_energetico).toBe('descendente');
    });

    it('should return Marte mapping for quarto-descrescente', () => {
      const result = getMoonPlanet('quarto-descrescente');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Marte');
      expect(result?.planeta_nome).toBe('Marte');
      expect(result?.elemento).toBe('fogo');
      expect(result?.orixa).toBe('Ogum');
      expect(result?.polaridade).toBe('Yang');
      expect(result?.fluxo_energetico).toBe('descendente');
    });

    it('should return Sol mapping for lua-velha', () => {
      const result = getMoonPlanet('lua-velha');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.planeta_nome).toBe('Sol');
      expect(result?.elemento).toBe('fogo');
      expect(result?.orixa).toBe('Omulu');
      expect(result?.polaridade).toBe('Equilibrado');
      expect(result?.fluxo_energetico).toBe('integrado');
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonPlanet('LUA-CHEIA');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
    });

    it('should handle input with extra whitespace', () => {
      const result = getMoonPlanet('  lua-cheia  ');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
    });

    it('should return null for unknown phase', () => {
      const result = getMoonPlanet('fase-desconhecida');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getMoonPlanet('');
      expect(result).toBeNull();
    });
  });

  describe('getPlanetMoon', () => {
    it('should return correct planet for lua-nova', () => {
      expect(getPlanetMoon('lua-nova')).toBe('Plutão');
    });

    it('should return correct planet for lua-cheia', () => {
      expect(getPlanetMoon('lua-cheia')).toBe('Lua');
    });

    it('should return correct planet for lua-velha', () => {
      expect(getPlanetMoon('lua-velha')).toBe('Sol');
    });

    it('should return null for unknown phase', () => {
      expect(getPlanetMoon('fase-desconhecida')).toBeNull();
    });

    it('should handle case-insensitive input', () => {
      expect(getPlanetMoon('QUARTO-CRESCENTE')).toBe('Júpiter');
    });
  });

  describe('getAllMoonPlanets', () => {
    it('should return all 8 moon phase mappings', () => {
      const result = getAllMoonPlanets();
      expect(result).toHaveLength(8);
    });

    it('should return all expected phases', () => {
      const result = getAllMoonPlanets();
      const phases = result.map(m => m.fase);
      expect(phases).toContain('Lua Nova');
      expect(phases).toContain('Lua Crescente');
      expect(phases).toContain('Quarto Crescente');
      expect(phases).toContain('Lua Cheia');
      expect(phases).toContain('Quarto Minguante');
      expect(phases).toContain('Lua Minguante');
      expect(phases).toContain('Quarto Descrescente');
      expect(phases).toContain('Lua Velha (Balsâmica)');
    });

    it('should return mapping objects with all required fields', () => {
      const result = getAllMoonPlanets();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('fase');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('planeta_nome');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('elementos_secundarios');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('qualidades');
        expect(mapping).toHaveProperty('praticas');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('polaridade');
        expect(mapping).toHaveProperty('fluxo_energetico');
        expect(mapping).toHaveProperty('cor');
      });
    });
  });

  describe('getElementMoonPlanet', () => {
    it('should return água for lua-nova', () => {
      expect(getElementMoonPlanet('lua-nova')).toBe('água');
    });

    it('should return água for lua-cheia', () => {
      expect(getElementMoonPlanet('lua-cheia')).toBe('água');
    });

    it('should return fogo for quarto-crescente', () => {
      expect(getElementMoonPlanet('quarto-crescente')).toBe('fogo');
    });

    it('should return null for unknown phase', () => {
      expect(getElementMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('getMeaningMoonPlanet', () => {
    it('should return spiritual meaning for lua-cheia', () => {
      const result = getMeaningMoonPlanet('lua-cheia');
      expect(result).not.toBeNull();
      expect(result).toContain('Culminação');
      expect(result).toContain('iluminação');
    });

    it('should return spiritual meaning for lua-nova', () => {
      const result = getMeaningMoonPlanet('lua-nova');
      expect(result).not.toBeNull();
      expect(result).toContain('transformação');
    });

    it('should return null for unknown phase', () => {
      expect(getMeaningMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('getPolarityMoonPlanet', () => {
    it('should return Yin for lua-nova', () => {
      expect(getPolarityMoonPlanet('lua-nova')).toBe('Yin');
    });

    it('should return Yang for lua-crescente', () => {
      expect(getPolarityMoonPlanet('lua-crescente')).toBe('Yang');
    });

    it('should return Equilibrado for lua-cheia', () => {
      expect(getPolarityMoonPlanet('lua-cheia')).toBe('Equilibrado');
    });

    it('should return null for unknown phase', () => {
      expect(getPolarityMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('getEnergyFlowMoonPlanet', () => {
    it('should return centripeto for lua-nova', () => {
      expect(getEnergyFlowMoonPlanet('lua-nova')).toBe('centripeto');
    });

    it('should return ascendente for lua-crescente', () => {
      expect(getEnergyFlowMoonPlanet('lua-crescente')).toBe('ascendente');
    });

    it('should return integrado for lua-velha', () => {
      expect(getEnergyFlowMoonPlanet('lua-velha')).toBe('integrado');
    });

    it('should return null for unknown phase', () => {
      expect(getEnergyFlowMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('getMoonPhasesByPlanet', () => {
    it('should return lua-cheia for Lua planet', () => {
      const result = getMoonPhasesByPlanet('Lua');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Cheia');
    });

    it('should return lua-nova for Plutão planet', () => {
      const result = getMoonPhasesByPlanet('Plutão');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Nova');
    });

    it('should handle case-insensitive planet names', () => {
      const result = getMoonPhasesByPlanet('VÊNUS');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Crescente');
    });

    it('should return empty array for unknown planet', () => {
      const result = getMoonPhasesByPlanet('Planeta Desconhecido');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMoonPhasesByElement', () => {
    it('should return multiple phases for água element', () => {
      const result = getMoonPhasesByElement('água');
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should return phases for fogo element', () => {
      const result = getMoonPhasesByElement('fogo');
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle case-insensitive element names', () => {
      const result = getMoonPhasesByElement('AR');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for unknown element', () => {
      const result = getMoonPhasesByElement('elemento-desconhecido');
      expect(result).toHaveLength(0);
    });
  });

  describe('getOrixaMoonPlanet', () => {
    it('should return Oxumaré for lua-nova', () => {
      expect(getOrixaMoonPlanet('lua-nova')).toBe('Oxumaré');
    });

    it('should return Iemanjá for lua-cheia', () => {
      expect(getOrixaMoonPlanet('lua-cheia')).toBe('Iemanjá');
    });

    it('should return Omulu for lua-velha', () => {
      expect(getOrixaMoonPlanet('lua-velha')).toBe('Omulu');
    });

    it('should return null for unknown phase', () => {
      expect(getOrixaMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('getChakraMoonPlanet', () => {
    it('should return 1º Básico for lua-nova', () => {
      expect(getChakraMoonPlanet('lua-nova')).toBe('1º Básico (Muladhara)');
    });

    it('should return 4º Cardíaco for lua-cheia', () => {
      expect(getChakraMoonPlanet('lua-cheia')).toBe('4º Cardíaco (Anahata)');
    });

    it('should return integration chakra for lua-velha', () => {
      expect(getChakraMoonPlanet('lua-velha')).toBe('Integração de Todos os Chakras');
    });

    it('should return null for unknown phase', () => {
      expect(getChakraMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('getColorMoonPlanet', () => {
    it('should return preto for lua-nova', () => {
      expect(getColorMoonPlanet('lua-nova')).toBe('preto');
    });

    it('should return branco for lua-cheia', () => {
      expect(getColorMoonPlanet('lua-cheia')).toBe('branco');
    });

    it('should return dourado for lua-velha', () => {
      expect(getColorMoonPlanet('lua-velha')).toBe('dourado');
    });

    it('should return null for unknown phase', () => {
      expect(getColorMoonPlanet('fase-desconhecida')).toBeNull();
    });
  });

  describe('MOON_PLANET_MAP structure', () => {
    it('should have all 8 lunar phases', () => {
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
      phases.forEach(fase => {
        expect(MOON_PLANET_MAP[fase]).toBeDefined();
      });
    });

    it('should have valid planet types', () => {
      const validPlanets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Netuno', 'Plutão'];
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(validPlanets).toContain(mapping.planeta);
      });
    });

    it('should have valid polarity values', () => {
      const validPolarities = ['Yang', 'Yin', 'Equilibrado'];
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(validPolarities).toContain(mapping.polaridade);
      });
    });

    it('should have valid energy flow values', () => {
      const validFlows = ['ascendente', 'descendente', 'centripeto', 'centrifugo', 'integrado'];
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(validFlows).toContain(mapping.fluxo_energetico);
      });
    });

    it('should have non-empty spiritual meanings', () => {
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('should have non-empty qualities arrays', () => {
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(mapping.qualidades.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty praticas arrays', () => {
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(mapping.praticas.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty secondary elements arrays', () => {
      Object.values(MOON_PLANET_MAP).forEach(mapping => {
        expect(mapping.elementos_secundarios.length).toBeGreaterThan(0);
      });
    });
  });
});
