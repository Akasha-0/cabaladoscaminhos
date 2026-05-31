import { describe, it, expect } from 'vitest';
import {
  getPlanetOrixa,
  getOrixaPlanet,
  getAllPlanetOrixas,
  PLANET_ORIXA_MAPPINGS,
  type PlanetOrixaMapping,
  type Orixa,
  type Planeta,
} from '@/lib/correlation/planet-orixa';

describe('planet-orixa', () => {
  // ─── PLANET_ORIXA_MAPPINGS: all 7 planets ──────────────────────────────────
  describe('PLANET_ORIXA_MAPPINGS', () => {
    it('contains all 7 planets', () => {
      const mappings = getAllPlanetOrixas();
      expect(mappings).toHaveLength(7);
      
      const planetNames = mappings.map(m => m.planeta);
      expect(planetNames).toContain('Sol');
      expect(planetNames).toContain('Lua');
      expect(planetNames).toContain('Mercúrio');
      expect(planetNames).toContain('Vênus');
      expect(planetNames).toContain('Marte');
      expect(planetNames).toContain('Júpiter');
      expect(planetNames).toContain('Saturno');
    });

    it('Sol maps to Xangô with correct properties', () => {
      const mapping = getPlanetOrixa('Sol');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Xangô');
      expect(mapping!.elemento).toBe('Fogo');
      expect(mapping!.chakra).toBe('3º Plexo Solar');
      expect(mapping!.arquetipo).toBe('Rei Guerreira');
      expect(mapping!.cores).toContain('Vermelho');
    });

    it('Lua maps to Iemanjá with correct properties', () => {
      const mapping = getPlanetOrixa('Lua');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Iemanjá');
      expect(mapping!.elemento).toBe('Água');
      expect(mapping!.chakra).toBe('6º Frontal');
      expect(mapping!.arquetipo).toBe('Mãe Divina');
      expect(mapping!.cores).toContain('Azul Escuro');
    });

    it('Mercúrio maps to Oxumaré with correct properties', () => {
      const mapping = getPlanetOrixa('Mercúrio');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Oxumaré');
      expect(mapping!.elemento).toBe('Ar');
      expect(mapping!.chakra).toBe('4º Cardíaco');
      expect(mapping!.arquetipo).toBe('Serpente Arco-íris');
      expect(mapping!.cores).toContain('Arco-íris');
    });

    it('Vênus maps to Oxum with correct properties', () => {
      const mapping = getPlanetOrixa('Vênus');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Oxum');
      expect(mapping!.elemento).toBe('Terra');
      expect(mapping!.chakra).toBe('2º Sacral');
      expect(mapping!.arquetipo).toBe('Amante Divina');
      expect(mapping!.cores).toContain('Rosa');
    });

    it('Marte maps to Ogum with correct properties', () => {
      const mapping = getPlanetOrixa('Marte');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Ogum');
      expect(mapping!.elemento).toBe('Fogo');
      expect(mapping!.chakra).toBe('1º Básico');
      expect(mapping!.arquetipo).toBe('Guerreiro Protector');
      expect(mapping!.cores).toContain('Vermelho');
    });

    it('Júpiter maps to Oxalá with correct properties', () => {
      const mapping = getPlanetOrixa('Júpiter');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Oxalá');
      expect(mapping!.elemento).toBe('Éter');
      expect(mapping!.chakra).toBe('7º Coronário');
      expect(mapping!.arquetipo).toBe('Criador Pacífico');
      expect(mapping!.cores).toContain('Branco');
    });

    it('Saturno maps to Omolu with correct properties', () => {
      const mapping = getPlanetOrixa('Saturno');
      expect(mapping).not.toBeNull();
      expect(mapping!.orixa).toBe('Omolu');
      expect(mapping!.elemento).toBe('Terra');
      expect(mapping!.chakra).toBe('1º Básico');
      expect(mapping!.arquetipo).toBe('Mestre da Transformação');
      expect(mapping!.cores).toContain('Preto');
    });

    it('each planet has spiritual meaning', () => {
      const mappings = getAllPlanetOrixas();
      mappings.forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
        expect(Array.isArray(mapping.significado_espiritual)).toBe(true);
      });
    });

    it('each planet has práticas espirituais', () => {
      const mappings = getAllPlanetOrixas();
      mappings.forEach(mapping => {
        expect(mapping.ebos).toBeDefined();
        expect(mapping.banhos).toBeDefined();
        expect(mapping.defumacoes).toBeDefined();
        expect(Array.isArray(mapping.ebos)).toBe(true);
        expect(Array.isArray(mapping.banhos)).toBe(true);
        expect(Array.isArray(mapping.defumacoes)).toBe(true);
      });
    });

    it('each planet has affirmations', () => {
      const mappings = getAllPlanetOrixas();
      mappings.forEach(mapping => {
        expect(mapping.affirmacoes).toBeDefined();
        expect(Array.isArray(mapping.affirmacoes)).toBe(true);
        expect(mapping.affirmacoes.length).toBeGreaterThan(0);
      });
    });

    it('all planets have unique orixás', () => {
      const mappings = getAllPlanetOrixas();
      const orixas = mappings.map(m => m.orixa);
      const uniqueOrixas = new Set(orixas);
      expect(uniqueOrixas.size).toBe(orixas.length);
    });

    it('element mappings align with planet-element.ts', () => {
      // Sol and Marte both have Fogo
      expect(getPlanetOrixa('Sol')!.elemento).toBe('Fogo');
      expect(getPlanetOrixa('Marte')!.elemento).toBe('Fogo');
      
      // Lua has Água
      expect(getPlanetOrixa('Lua')!.elemento).toBe('Água');
      
      // Mercúrio has Ar
      expect(getPlanetOrixa('Mercúrio')!.elemento).toBe('Ar');
      
      // Vênus and Saturno both have Terra
      expect(getPlanetOrixa('Vênus')!.elemento).toBe('Terra');
      expect(getPlanetOrixa('Saturno')!.elemento).toBe('Terra');
      
      // Júpiter has Éter
      expect(getPlanetOrixa('Júpiter')!.elemento).toBe('Éter');
    });
  });

  // ─── getPlanetOrixa: lookup function ────────────────────────────────────
  describe('getPlanetOrixa', () => {
    it('returns correct mapping for Sol', () => {
      const result = getPlanetOrixa('Sol');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Sol');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Lua', () => {
      const result = getPlanetOrixa('Lua');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Lua');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns correct mapping for Mercúrio', () => {
      const result = getPlanetOrixa('Mercúrio');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Vênus', () => {
      const result = getPlanetOrixa('Vênus');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Vênus');
      expect(result!.orixa).toBe('Oxum');
    });

    it('returns correct mapping for Marte', () => {
      const result = getPlanetOrixa('Marte');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Marte');
      expect(result!.orixa).toBe('Ogum');
    });

    it('returns correct mapping for Júpiter', () => {
      const result = getPlanetOrixa('Júpiter');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.orixa).toBe('Oxalá');
    });

    it('returns correct mapping for Saturno', () => {
      const result = getPlanetOrixa('Saturno');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Saturno');
      expect(result!.orixa).toBe('Omolu');
    });

    it('is case-insensitive', () => {
      expect(getPlanetOrixa('sol')?.orixa).toBe('Xangô');
      expect(getPlanetOrixa('LUA')?.orixa).toBe('Iemanjá');
      expect(getPlanetOrixa('mercúrio')?.orixa).toBe('Oxumaré');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetOrixa('Netuno')).toBeNull();
      expect(getPlanetOrixa('Plutão')).toBeNull();
      expect(getPlanetOrixa('')).toBeNull();
    });

    it('returns PlanetOrixaMapping type', () => {
      const result = getPlanetOrixa('Sol');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('ebos');
      expect(result).toHaveProperty('banhos');
      expect(result).toHaveProperty('defumacoes');
      expect(result).toHaveProperty('affirmacoes');
    });
  });

  // ─── getOrixaPlanet: reverse lookup ──────────────────────────────────────
  describe('getOrixaPlanet', () => {
    it('returns Sol for Xangô', () => {
      expect(getOrixaPlanet('Xangô')).toBe('Sol');
    });

    it('returns Lua for Iemanjá', () => {
      expect(getOrixaPlanet('Iemanjá')).toBe('Lua');
    });

    it('returns Mercúrio for Oxumaré', () => {
      expect(getOrixaPlanet('Oxumaré')).toBe('Mercúrio');
    });

    it('returns Vênus for Oxum', () => {
      expect(getOrixaPlanet('Oxum')).toBe('Vênus');
    });

    it('returns Marte for Ogum', () => {
      expect(getOrixaPlanet('Ogum')).toBe('Marte');
    });

    it('returns Júpiter for Oxalá', () => {
      expect(getOrixaPlanet('Oxalá')).toBe('Júpiter');
    });

    it('returns Saturno for Omolu', () => {
      expect(getOrixaPlanet('Omolu')).toBe('Saturno');
    });

    it('is case-insensitive', () => {
      expect(getOrixaPlanet('xangô')).toBe('Sol');
      expect(getOrixaPlanet('IEMANJÁ')).toBe('Lua');
      expect(getOrixaPlanet('oxumaré')).toBe('Mercúrio');
    });

    it('returns null for unknown orixá', () => {
      expect(getOrixaPlanet('Exu')).toBeNull();
      expect(getOrixaPlanet('Nanã')).toBeNull();
      expect(getOrixaPlanet('')).toBeNull();
    });

    it('returns Planeta type', () => {
      const result = getOrixaPlanet('Xangô');
      expect(typeof result).toBe('string');
      expect(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']).toContain(result);
    });
  });

  // ─── getAllPlanetOrixas ──────────────────────────────────────────────────
  describe('getAllPlanetOrixas', () => {
    it('returns array with all 7 mappings', () => {
      const result = getAllPlanetOrixas();
      expect(result).toHaveLength(7);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns fresh array on each call', () => {
      const result1 = getAllPlanetOrixas();
      const result2 = getAllPlanetOrixas();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });

    it('all mappings have required properties', () => {
      const result = getAllPlanetOrixas();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('dia_sagrado');
        expect(mapping).toHaveProperty('cores');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('arquetipo');
        expect(mapping).toHaveProperty('qualidade');
        expect(mapping).toHaveProperty('ebos');
        expect(mapping).toHaveProperty('banhos');
        expect(mapping).toHaveProperty('defumacoes');
        expect(mapping).toHaveProperty('affirmacoes');
      });
    });

    it('all cores arrays are non-empty', () => {
      const result = getAllPlanetOrixas();
      result.forEach(mapping => {
        expect(mapping.cores.length).toBeGreaterThan(0);
      });
    });

    it('reverse lookup is consistent with forward lookup', () => {
      const mappings = getAllPlanetOrixas();
      mappings.forEach(mapping => {
        const reverseLookup = getOrixaPlanet(mapping.orixa);
        expect(reverseLookup).toBe(mapping.planeta);
      });
    });
  });

  // ─── Integration: planet-orixa relationships ────────────────────────────
  describe('planet-orixa integration', () => {
    it('Sol-Xangô: dias sagrados match', () => {
      const solMapping = getPlanetOrixa('Sol');
      const xangoMapping = PLANET_ORIXA_MAPPINGS['Sol'];
      expect(xangoMapping.dia_sagrado).toBe('Quarta-feira');
    });

    it('Lua-Iemanjá: sacred connection to water', () => {
      const luaMapping = getPlanetOrixa('Lua');
      expect(luaMapping!.elemento).toBe('Água');
      expect(luaMapping!.cores).toContain('Azul Escuro');
      expect(luaMapping!.cores).toContain('Branco');
    });

    it('Fogo element planets (Sol/Marte) have warrior archetypes', () => {
      const solMapping = getPlanetOrixa('Sol');
      const marteMapping = getPlanetOrixa('Marte');
      expect(solMapping!.elemento).toBe('Fogo');
      expect(marteMapping!.elemento).toBe('Fogo');
      expect(solMapping!.arquetipo).toContain('Guerreira');
      expect(marteMapping!.arquetipo).toContain('Guerreiro');
    });

    it('Terra element planets (Vênus/Saturno) have grounding practices', () => {
      const venusMapping = getPlanetOrixa('Vênus');
      const saturnoMapping = getPlanetOrixa('Saturno');
      expect(venusMapping!.elemento).toBe('Terra');
      expect(saturnoMapping!.elemento).toBe('Terra');
      expect(venusMapping!.cores).toContain('Verde');
      expect(saturnoMapping!.cores).toContain('Preto');
    });

    it('each orixá has culturally appropriate ebós', () => {
      const mappings = getAllPlanetOrixas();
      mappings.forEach(mapping => {
        expect(mapping.ebos.length).toBeGreaterThan(0);
        // Check that each ebo references the correct orixá
        const eboString = mapping.ebos.join(' ');
        expect(eboString).toMatch(new RegExp(mapping.orixa, 'i'));
      });
    });

    it('all planets have unique chakra positions', () => {
      const mappings = getAllPlanetOrixas();
      const chakras = mappings.map(m => m.chakra);
      const uniqueChakras = new Set(chakras);
      expect(uniqueChakras.size).toBe(chakras.length);
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('Planeta type is exported', () => {
      const planet: Planeta = 'Sol';
      expect(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']).toContain(planet);
    });

    it('Orixa type is exported', () => {
      const orixa: Orixa = 'Xangô';
      expect(['Xangô', 'Iemanjá', 'Oxumaré', 'Oxum', 'Ogum', 'Oxalá', 'Omolu']).toContain(orixa);
    });

    it('PlanetOrixaMapping interface is exported', () => {
      const mapping: PlanetOrixaMapping = PLANET_ORIXA_MAPPINGS['Sol'];
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.orixa).toBe('Xangô');
    });

    it('PLANET_ORIXA_MAPPINGS is frozen', () => {
      expect(Object.isFrozen(PLANET_ORIXA_MAPPINGS)).toBe(true);
    });
  });
});
