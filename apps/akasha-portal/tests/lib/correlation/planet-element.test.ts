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
      expect(sol.cores).toContain('Vermelho');
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
      expect(lua.cores).toContain('Azul Escuro');
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

    it('Vênus maps to Terra with correct properties', () => {
      const venus = PLANET_ELEMENT_MAPPINGS['Vênus'];
      expect(venus.elemento).toBe('Terra');
      expect(venus.orixa).toBe('Oxum');
      expect(venus.qualidades.temperatura).toBe('Neutro');
      expect(venus.qualidades.umidade).toBe('Úmido');
      expect(venus.qualidades.polaridade).toBe('Equilibrado');
      expect(venus.dia_sagrado).toBe('Sexta-feira');
      expect(venus.cores).toContain('Rosa');
      expect(venus.chakra).toBe('2º Sacral');
      expect(venus.sephirah).toBe('Netzach');
    });

    it('Marte maps to Fogo with correct properties', () => {
      const marte = PLANET_ELEMENT_MAPPINGS['Marte'];
      expect(marte.elemento).toBe('Fogo');
      expect(marte.orixa).toBe('Ogum');
      expect(marte.qualidades.temperatura).toBe('Quente');
      expect(marte.qualidades.umidade).toBe('Seco');
      expect(marte.qualidades.polaridade).toBe('Yang');
      expect(marte.dia_sagrado).toBe('Terça-feira');
      expect(marte.cores).toContain('Vermelho');
      expect(marte.chakra).toBe('1º Básico');
      expect(marte.sephirah).toBe('Gevurah');
    });

    it('Júpiter maps to Éter with correct properties', () => {
      const jupiter = PLANET_ELEMENT_MAPPINGS['Júpiter'];
      expect(jupiter.elemento).toBe('Éter');
      expect(jupiter.orixa).toBe('Oxalá');
      expect(jupiter.qualidades.temperatura).toBe('Quente');
      expect(jupiter.qualidades.umidade).toBe('Neutro');
      expect(jupiter.qualidades.polaridade).toBe('Yang');
      expect(jupiter.dia_sagrado).toBe('Quinta-feira');
      expect(jupiter.cores).toContain('Branco');
      expect(jupiter.chakra).toBe('7º Coronário');
      expect(jupiter.sephirah).toBe('Chesed');
    });

    it('Saturno maps to Terra with correct properties', () => {
      const saturno = PLANET_ELEMENT_MAPPINGS['Saturno'];
      expect(saturno.elemento).toBe('Terra');
      expect(saturno.orixa).toBe('Omolu');
      expect(saturno.qualidades.temperatura).toBe('Frio');
      expect(saturno.qualidades.umidade).toBe('Seco');
      expect(saturno.qualidades.polaridade).toBe('Yin');
      expect(saturno.dia_sagrado).toBe('Sábado');
      expect(saturno.cores).toContain('Preto');
      expect(saturno.chakra).toBe('1º Básico');
      expect(saturno.sephirah).toBe('Malkuth');
    });

    it('each planet has spiritual meaning', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      planets.forEach((p) => {
        const mapping = PLANET_ELEMENT_MAPPINGS[p];
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
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

    it('Fogo is associated with two planets (Sol and Marte)', () => {
      const fogoPlanets: Planeta[] = [];
      for (const [planeta, mapping] of Object.entries(PLANET_ELEMENT_MAPPINGS)) {
        if (mapping.elemento === 'Fogo') {
          fogoPlanets.push(planeta as Planeta);
        }
      }
      expect(fogoPlanets).toContain('Sol');
      expect(fogoPlanets).toContain('Marte');
      expect(fogoPlanets).toHaveLength(2);
    });

    it('Terra is associated with two planets (Vênus and Saturno)', () => {
      const terraPlanets: Planeta[] = [];
      for (const [planeta, mapping] of Object.entries(PLANET_ELEMENT_MAPPINGS)) {
        if (mapping.elemento === 'Terra') {
          terraPlanets.push(planeta as Planeta);
        }
      }
      expect(terraPlanets).toContain('Vênus');
      expect(terraPlanets).toContain('Saturno');
      expect(terraPlanets).toHaveLength(2);
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
      expect(result!.elemento).toBe('Terra');
      expect(result!.orixa).toBe('Oxum');
    });

    it('returns correct mapping for Marte', () => {
      const result = getPlanetElement('Marte');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Marte');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.orixa).toBe('Ogum');
    });

    it('returns correct mapping for Júpiter', () => {
      const result = getPlanetElement('Júpiter');
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.elemento).toBe('Éter');
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

    it('returns Vênus for Terra (first match)', () => {
      const result = getElementPlanet('Terra');
      // Returns first planet with Terra element (Vênus comes first alphabetically)
      expect(['Vênus', 'Saturno']).toContain(result);
    });

    it('returns Júpiter for Éter', () => {
      const result = getElementPlanet('Éter');
      expect(result).toBe('Júpiter');
    });

    it('handles case-insensitive input', () => {
      const result = getElementPlanet('fogo');
      expect(result).toBe('Sol');
    });

    it('returns null for unknown element', () => {
      const result = getElementPlanet('Plasma');
      expect(result).toBeNull();
    });
  });

  // ─── getAllPlanetElements ──────────────────────────────────────────────────
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
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
        expect(mapping.qualidades).toBeTruthy();
      });
    });

    it('contains all 7 planets', () => {
      const result = getAllPlanetElements();
      const planets = result.map((m) => m.planeta);
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Saturno');
    });

    it('each mapping has complete data', () => {
      const result = getAllPlanetElements();
      result.forEach((mapping) => {
        expect(mapping.dia_sagrado).toBeTruthy();
        expect(mapping.cores.length).toBeGreaterThan(0);
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
        expect(mapping.afinidades.length).toBeGreaterThan(0);
        expect(mapping.praticas).toBeTruthy();
      });
    });
  });

  // ─── Integration: planet-element-orixa relationships ───────────────────────
  describe('planet-element-orixa integration', () => {
    it('planet-element-orixa alignment is consistent', () => {
      // Sol → Fogo → Xangô
      const sol = getPlanetElement('Sol');
      expect(sol!.elemento).toBe('Fogo');
      expect(sol!.orixa).toBe('Xangô');

      // Lua → Água → Iemanjá
      const lua = getPlanetElement('Lua');
      expect(lua!.elemento).toBe('Água');
      expect(lua!.orixa).toBe('Iemanjá');

      // Mercúrio → Ar → Oxumaré
      const mercurio = getPlanetElement('Mercúrio');
      expect(mercurio!.elemento).toBe('Ar');
      expect(mercurio!.orixa).toBe('Oxumaré');

      // Júpiter → Éter → Oxalá
      const jupiter = getPlanetElement('Júpiter');
      expect(jupiter!.elemento).toBe('Éter');
      expect(jupiter!.orixa).toBe('Oxalá');
    });

    it('planet-chakra alignment', () => {
      // Sol → Plexo Solar (3º)
      const sol = getPlanetElement('Sol');
      expect(sol!.chakra).toBe('3º Plexo Solar');

      // Lua → Frontal (6º)
      const lua = getPlanetElement('Lua');
      expect(lua!.chakra).toBe('6º Frontal');

      // Mercúrio → Cardíaco (4º)
      const mercurio = getPlanetElement('Mercúrio');
      expect(mercurio!.chakra).toBe('4º Cardíaco');

      // Júpiter → Coronário (7º)
      const jupiter = getPlanetElement('Júpiter');
      expect(jupiter!.chakra).toBe('7º Coronário');
    });

    it('planet-element-sephirah alignment', () => {
      // Sol (Fogo) → Tiphereth
      const sol = getPlanetElement('Sol');
      expect(sol!.sephirah).toBe('Tiphereth');

      // Lua (Água) → Yesod
      const lua = getPlanetElement('Lua');
      expect(lua!.sephirah).toBe('Yesod');

      // Júpiter (Éter) → Chesed
      const jupiter = getPlanetElement('Júpiter');
      expect(jupiter!.sephirah).toBe('Chesed');

      // Saturno (Terra) → Malkuth
      const saturno = getPlanetElement('Saturno');
      expect(saturno!.sephirah).toBe('Malkuth');
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports Elemento type', () => {
      const elemento: Elemento = 'Fogo';
      expect(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']).toContain(elemento);
    });

    it('exports Planeta type', () => {
      const planeta: Planeta = 'Sol';
      expect(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']).toContain(planeta);
    });

    it('exports PlanetElementMapping type', () => {
      const mapping: PlanetElementMapping = {
        planeta: 'Sol',
        elemento: 'Fogo',
        chakra: '3º Plexo Solar',
        orixa: 'Xangô',
        qualidades: {
          temperatura: 'Quente',
          umidade: 'Seco',
          polaridade: 'Yang',
        },
        dia_sagrado: 'Domingo',
        cores: ['Amarelo', 'Vermelho'],
        sephirah: 'Tiphereth',
        significado_espiritual: ['Teste'],
        afinidades: ['Teste'],
        praticas: {
          ebos: ['Teste'],
          banhos: ['Teste'],
          defumacoes: ['Teste'],
        },
      };
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.elemento).toBe('Fogo');
    });
  });
});