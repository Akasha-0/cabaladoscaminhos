import { describe, it, expect } from 'vitest';
import {
  getPlanetElement,
  getElementPlanet,
  getAllPlanetElements,
  PLANET_ELEMENT_MAPPINGS,
  type PlanetElementMapping,
  type Elemento,
  type Planeta,
} from '@/lib/correlation/planet-element';

describe('planet-element', () => {
  // ─── PLANET_ELEMENT_MAPPINGS: all 7 planets ────────────────────────────────
  describe('PLANET_ELEMENT_MAPPINGS', () => {
    it('contains all 7 planets', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      planets.forEach((p) => {
        expect(PLANET_ELEMENT_MAPPINGS[p]).toBeDefined();
      });
      expect(Object.keys(PLANET_ELEMENT_MAPPINGS)).toHaveLength(7);
    });

    it('Sol maps to Fogo with correct properties', () => {
      const sol = PLANET_ELEMENT_MAPPINGS['Sol'];
      expect(sol.elemento).toBe('Fogo');
      expect(sol.orixa).toBe('Xangô');
      expect(sol.qualidades.temperatura).toBe('Quente');
      expect(sol.qualidades.umidade).toBe('Seco');
      expect(sol.qualidades.polaridade).toBe('Yang');
      expect(sol.dia_sagrado).toBe('Domingo');
      expect(sol.cores).toContain('Dourado');
      expect(sol.chakra).toBe('3º Plexo Solar');
      expect(sol.sephirah).toBe('Tiphereth');
    });

    it('Lua maps to Água with correct properties', () => {
      const lua = PLANET_ELEMENT_MAPPINGS['Lua'];
      expect(lua.elemento).toBe('Água');
      expect(lua.orixa).toBe('Iemanjá');
      expect(lua.qualidades.temperatura).toBe('Frio');
      expect(lua.qualidades.umidade).toBe('Úmido');
      expect(lua.qualidades.polaridade).toBe('Yin');
      expect(lua.dia_sagrado).toBe('Segunda-feira');
      expect(lua.cores).toContain('Prata');
      expect(lua.chakra).toBe('6º Frontal');
      expect(lua.sephirah).toBe('Yesod');
    });

    it('Mercúrio maps to Ar with correct properties', () => {
      const mercurio = PLANET_ELEMENT_MAPPINGS['Mercúrio'];
      expect(mercurio.elemento).toBe('Ar');
      expect(mercurio.orixa).toBe('Oxumaré');
      expect(mercurio.qualidades.temperatura).toBe('Neutro');
      expect(mercurio.qualidades.umidade).toBe('Seco');
      expect(mercurio.qualidades.polaridade).toBe('Equilibrado');
      expect(mercurio.dia_sagrado).toBe('Quarta-feira');
      expect(mercurio.cores).toContain('Amarelo');
      expect(mercurio.chakra).toBe('4º Cardíaco');
      expect(mercurio.sephirah).toBe('Hod');
    });

    it('Vênus maps to Água with correct properties', () => {
      const venus = PLANET_ELEMENT_MAPPINGS['Vênus'];
      expect(venus.elemento).toBe('Água');
      expect(venus.orixa).toBe('Oxum');
      expect(venus.qualidades.temperatura).toBe('Quente');
      expect(venus.qualidades.umidade).toBe('Úmido');
      expect(venus.qualidades.polaridade).toBe('Yin');
      expect(venus.dia_sagrado).toBe('Sexta-feira');
      expect(venus.cores).toContain('Rosa');
      expect(venus.chakra).toBe('4º Cardíaco');
      expect(venus.sephirah).toBe('Netzach');
    });

    it('Marte maps to Fogo with correct properties', () => {
      const marte = PLANET_ELEMENT_MAPPINGS['Marte'];
      expect(marte.elemento).toBe('Fogo');
      expect(marte.orixa).toBe('Xangô');
      expect(marte.qualidades.temperatura).toBe('Quente');
      expect(marte.qualidades.umidade).toBe('Seco');
      expect(marte.qualidades.polaridade).toBe('Yang');
      expect(marte.dia_sagrado).toBe('Terça-feira');
      expect(marte.cores).toContain('Vermelho');
      expect(marte.chakra).toBe('1º Básico');
      expect(marte.sephirah).toBe('Geburah');
    });

    it('Júpiter maps to Fogo with correct properties', () => {
      const jupiter = PLANET_ELEMENT_MAPPINGS['Júpiter'];
      expect(jupiter.elemento).toBe('Fogo');
      expect(jupiter.orixa).toBe('Oxalá');
      expect(jupiter.qualidades.temperatura).toBe('Quente');
      expect(jupiter.qualidades.umidade).toBe('Úmido');
      expect(jupiter.qualidades.polaridade).toBe('Yang');
      expect(jupiter.dia_sagrado).toBe('Domingo');
      expect(jupiter.cores).toContain('Branco');
      expect(jupiter.chakra).toBe('5º Laríngeo');
      expect(jupiter.sephirah).toBe('Chesed');
    });

    it('Saturno maps to Terra with correct properties', () => {
      const saturno = PLANET_ELEMENT_MAPPINGS['Saturno'];
      expect(saturno.elemento).toBe('Terra');
      expect(saturno.orixa).toBe('Omolu');
      expect(saturno.qualidades.temperatura).toBe('Frio');
      expect(saturno.qualidades.umidade).toBe('Seco');
      expect(saturno.qualidades.polaridade).toBe('Yin');
      expect(saturno.dia_sagrado).toBe('Segunda-feira');
      expect(saturno.cores).toContain('Preto');
      expect(saturno.chakra).toBe('1º Básico');
      expect(saturno.sephirah).toBe('Malkuth');
    });

    it('each planet has spiritual associations', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      planets.forEach((p) => {
        const mapping = PLANET_ELEMENT_MAPPINGS[p];
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('each planet has affinities', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      planets.forEach((p) => {
        const mapping = PLANET_ELEMENT_MAPPINGS[p];
        expect(mapping.afinidades.length).toBeGreaterThan(0);
      });
    });

    it('each planet has práticas espirituais', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      planets.forEach((p) => {
        const mapping = PLANET_ELEMENT_MAPPINGS[p];
        expect(mapping.praticas.ebos.length).toBeGreaterThan(0);
        expect(mapping.praticas.banhos.length).toBeGreaterThan(0);
        expect(mapping.praticas.defumacoes.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getPlanetElement: lookup function ────────────────────────────────────
  describe('getPlanetElement', () => {
    it('returns correct mapping for Sol', () => {
      const result = getPlanetElement('Sol');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Sol');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Lua', () => {
      const result = getPlanetElement('Lua');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Lua');
      expect(result!.elemento).toBe('Água');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns correct mapping for Mercúrio', () => {
      const result = getPlanetElement('Mercúrio');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.elemento).toBe('Ar');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Vênus', () => {
      const result = getPlanetElement('Vênus');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Vênus');
      expect(result!.elemento).toBe('Água');
      expect(result!.orixa).toBe('Oxum');
    });

    it('returns correct mapping for Marte', () => {
      const result = getPlanetElement('Marte');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Marte');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Júpiter', () => {
      const result = getPlanetElement('Júpiter');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.orixa).toBe('Oxalá');
    });

    it('returns correct mapping for Saturno', () => {
      const result = getPlanetElement('Saturno');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Saturno');
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Omolu');
    });

    it('handles case-insensitive input', () => {
      const lowerResult = getPlanetElement('sol');
      const upperResult = getPlanetElement('SOL');
      expect(lowerResult).not.toBeNull();
      expect(upperResult).not.toBeNull();
      expect(lowerResult!.elemento).toBe('Fogo');
      expect(upperResult!.elemento).toBe('Fogo');
    });

    it('returns null for unknown planet', () => {
      const result = getPlanetElement('Netuno');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getPlanetElement('');
      expect(result).toBeNull();
    });
  });

  // ─── getElementPlanet: reverse lookup ─────────────────────────────────────
  describe('getElementPlanet', () => {
    it('returns Sol for Fogo', () => {
      const result = getElementPlanet('Fogo');
      expect(result).toBe('Sol');
    });

    it('returns Lua for Água', () => {
      const result = getElementPlanet('Água');
      expect(result).toBe('Lua');
    });

    it('returns Mercúrio for Ar', () => {
      const result = getElementPlanet('Ar');
      expect(result).toBe('Mercúrio');
    });

    it('returns Saturno for Terra', () => {
      const result = getElementPlanet('Terra');
      expect(result).toBe('Saturno');
    });

    it('handles case-insensitive input', () => {
      const result = getElementPlanet('fogo');
      expect(result).toBe('Sol');
    });

    it('returns null for unknown element', () => {
      const result = getElementPlanet('Éter');
      expect(result).toBeNull();
    });
  });

  // ─── getAllPlanetElements: collection function ────────────────────────────
  describe('getAllPlanetElements', () => {
    it('returns all 7 planet-element mappings', () => {
      const result = getAllPlanetElements();
      expect(result).toHaveLength(7);
    });

    it('returns array with correct structure', () => {
      const result = getAllPlanetElements();
      result.forEach((mapping) => {
        expect(mapping.planeta).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.qualidades).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
      });
    });

    it('contains all 7 planets', () => {
      const result = getAllPlanetElements();
      const planetas = result.map((m) => m.planeta);
      expect(planetas).toContain('Sol');
      expect(planetas).toContain('Lua');
      expect(planetas).toContain('Mercúrio');
      expect(planetas).toContain('Vênus');
      expect(planetas).toContain('Marte');
      expect(planetas).toContain('Júpiter');
      expect(planetas).toContain('Saturno');
    });

    it('each mapping has complete data', () => {
      const result = getAllPlanetElements();
      result.forEach((mapping) => {
        expect(mapping.dia_sagrado).toBeTruthy();
        expect(mapping.cores.length).toBeGreaterThan(0);
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
        expect(mapping.afinidades.length).toBeGreaterThan(0);
        expect(mapping.praticas).toBeTruthy();
      });
    });
  });

  // ─── Integration: planet-element-orixa relationships ───────────────────────
  describe('planet-element-orixa integration', () => {
    it('planet-orixa matches element-orixa from element-planet correlation', () => {
      // Sol → Fogo → Xangô
      const sol = getPlanetElement('Sol');
      expect(sol!.orixa).toBe('Xangô');

      // Lua → Água → Iemanjá
      const lua = getPlanetElement('Lua');
      expect(lua!.orixa).toBe('Iemanjá');

      // Saturno → Terra → Omolu
      const saturno = getPlanetElement('Saturno');
      expect(saturno!.orixa).toBe('Omolu');
    });

    it('planet-chakra alignment with element-chakra', () => {
      // Sol (Fogo) → Plexo Solar (3º)
      const sol = getPlanetElement('Sol');
      expect(sol!.chakra).toBe('3º Plexo Solar');

      // Lua (Água) → Frontal (6º)
      const lua = getPlanetElement('Lua');
      expect(lua!.chakra).toBe('6º Frontal');

      // Saturno (Terra) → Básico (1º)
      const saturno = getPlanetElement('Saturno');
      expect(saturno!.chakra).toBe('1º Básico');
    });

    it('planet-sephirah alignment', () => {
      // Sol → Tiphereth
      const sol = getPlanetElement('Sol');
      expect(sol!.sephirah).toBe('Tiphereth');

      // Lua → Yesod
      const lua = getPlanetElement('Lua');
      expect(lua!.sephirah).toBe('Yesod');

      // Saturno → Malkuth
      const saturno = getPlanetElement('Saturno');
      expect(saturno!.sephirah).toBe('Malkuth');
    });

    it('multiple planets share same element', () => {
      // Fogo: Sol, Marte, Júpiter
      const sol = getPlanetElement('Sol');
      const marte = getPlanetElement('Marte');
      const jupiter = getPlanetElement('Júpiter');
      expect(sol!.elemento).toBe('Fogo');
      expect(marte!.elemento).toBe('Fogo');
      expect(jupiter!.elemento).toBe('Fogo');

      // Água: Lua, Vênus
      const lua = getPlanetElement('Lua');
      const venus = getPlanetElement('Vênus');
      expect(lua!.elemento).toBe('Água');
      expect(venus!.elemento).toBe('Água');
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports PlanetElementMapping type', () => {
      const mapping: PlanetElementMapping = {
        planeta: 'Sol',
        elemento: 'Fogo',
        qualidades: {
          temperatura: 'Quente',
          umidade: 'Seco',
          polaridade: 'Yang',
        },
        orixa: 'Xangô',
        dia_sagrado: 'Domingo',
        cores: ['Dourado'],
        chakra: '3º Plexo Solar',
        sephirah: 'Tiphereth',
        associacoes_espirituais: ['Teste'],
        afinidades: ['Teste'],
        praticas: {
          ebos: ['Teste'],
          banhos: ['Teste'],
          defumacoes: ['Teste'],
        },
      };
      expect(mapping.planeta).toBe('Sol');
    });

    it('exports Planeta type', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      expect(planets).toHaveLength(7);
    });

    it('exports Elemento type', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      expect(elements).toHaveLength(4);
    });
  });
});
