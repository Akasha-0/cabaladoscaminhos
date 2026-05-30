import { describe, it, expect } from 'vitest';
import {
  getElementPlanet,
  getPlanetElement,
  getAllElementPlanets,
  ELEMENT_PLANET_MAPPINGS,
  type ElementPlanetMapping,
  type Elemento,
  type Planeta,
} from '@/lib/correlation/element-planet';

describe('element-planet', () => {
  // ─── ELEMENT_PLANET_MAPPINGS: all 4 elements ────────────────────────────────
  describe('ELEMENT_PLANET_MAPPINGS', () => {
    it('contains all 4 elements', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        expect(ELEMENT_PLANET_MAPPINGS[el]).toBeDefined();
      });
      expect(Object.keys(ELEMENT_PLANET_MAPPINGS)).toHaveLength(4);
    });

    it('Fogo maps to Sol with correct properties', () => {
      const fogo = ELEMENT_PLANET_MAPPINGS['Fogo'];
      expect(fogo.planeta).toBe('Sol');
      expect(fogo.orixa).toBe('Xangô');
      expect(fogo.qualidades.temperatura).toBe('Quente');
      expect(fogo.qualidades.umidade).toBe('Seco');
      expect(fogo.qualidades.polaridade).toBe('Yang');
      expect(fogo.dia_sagrado).toContain('Quarta-feira');
      expect(fogo.cores).toContain('Vermelho');
      expect(fogo.chakra).toBe('3º Plexo Solar');
      expect(fogo.sephirah).toBe('Tiphereth');
    });

    it('Água maps to Lua with correct properties', () => {
      const agua = ELEMENT_PLANET_MAPPINGS['Água'];
      expect(agua.planeta).toBe('Lua');
      expect(agua.orixa).toBe('Iemanjá');
      expect(agua.qualidades.temperatura).toBe('Frio');
      expect(agua.qualidades.umidade).toBe('Úmido');
      expect(agua.qualidades.polaridade).toBe('Yin');
      expect(agua.dia_sagrado).toBe('Segunda-feira');
      expect(agua.cores).toContain('Azul Escuro');
      expect(agua.chakra).toBe('6º Frontal');
      expect(agua.sephirah).toBe('Yesod');
    });

    it('Ar maps to Mercúrio with correct properties', () => {
      const ar = ELEMENT_PLANET_MAPPINGS['Ar'];
      expect(ar.planeta).toBe('Mercúrio');
      expect(ar.orixa).toBe('Oxumaré');
      expect(ar.qualidades.temperatura).toBe('Neutro');
      expect(ar.qualidades.umidade).toBe('Seco');
      expect(ar.qualidades.polaridade).toBe('Equilibrado');
      expect(ar.dia_sagrado).toBe('Quarta-feira');
      expect(ar.cores).toContain('Amarelo');
      expect(ar.chakra).toBe('4º Cardíaco');
      expect(ar.sephirah).toBe('Hod');
    });

    it('Terra maps to Saturno with correct properties', () => {
      const terra = ELEMENT_PLANET_MAPPINGS['Terra'];
      expect(terra.planeta).toBe('Saturno');
      expect(terra.orixa).toBe('Omolu');
      expect(terra.qualidades.temperatura).toBe('Frio');
      expect(terra.qualidades.umidade).toBe('Seco');
      expect(terra.qualidades.polaridade).toBe('Yin');
      expect(terra.dia_sagrado).toBe('Segunda-feira');
      expect(terra.cores).toContain('Preto');
      expect(terra.chakra).toBe('1º Básico');
      expect(terra.sephirah).toBe('Malkuth');
    });

    it('each element has spiritual associations', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_PLANET_MAPPINGS[el];
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('each element has affinities', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_PLANET_MAPPINGS[el];
        expect(mapping.afinidades.length).toBeGreaterThan(0);
      });
    });

    it('each element has práticas espirituais', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_PLANET_MAPPINGS[el];
        expect(mapping.praticas.ebos.length).toBeGreaterThan(0);
        expect(mapping.praticas.banhos.length).toBeGreaterThan(0);
        expect(mapping.praticas.defumacoes.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getElementPlanet: lookup function ────────────────────────────────────
  describe('getElementPlanet', () => {
    it('returns correct mapping for Fogo', () => {
      const result = getElementPlanet('Fogo');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Fogo');
      expect(result!.planeta).toBe('Sol');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Água', () => {
      const result = getElementPlanet('Água');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Água');
      expect(result!.planeta).toBe('Lua');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns correct mapping for Ar', () => {
      const result = getElementPlanet('Ar');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Ar');
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Terra', () => {
      const result = getElementPlanet('Terra');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Terra');
      expect(result!.planeta).toBe('Saturno');
      expect(result!.orixa).toBe('Omolu');
    });

    it('handles case-insensitive input', () => {
      const lowerResult = getElementPlanet('fogo');
      const upperResult = getElementPlanet('FOGO');
      expect(lowerResult).not.toBeNull();
      expect(upperResult).not.toBeNull();
      expect(lowerResult!.planeta).toBe('Sol');
      expect(upperResult!.planeta).toBe('Sol');
    });

    it('returns null for unknown element', () => {
      const result = getElementPlanet('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getElementPlanet('');
      expect(result).toBeNull();
    });
  });

  // ─── getPlanetElement: reverse lookup ─────────────────────────────────────
  describe('getPlanetElement', () => {
    it('returns Fogo for Sol', () => {
      const result = getPlanetElement('Sol');
      expect(result).toBe('Fogo');
    });

    it('returns Água for Lua', () => {
      const result = getPlanetElement('Lua');
      expect(result).toBe('Água');
    });

    it('returns Ar for Mercúrio', () => {
      const result = getPlanetElement('Mercúrio');
      expect(result).toBe('Ar');
    });

    it('returns Terra for Saturno', () => {
      const result = getPlanetElement('Saturno');
      expect(result).toBe('Terra');
    });

    it('handles case-insensitive input', () => {
      const result = getPlanetElement('sol');
      expect(result).toBe('Fogo');
    });

    it('returns null for unknown planet', () => {
      const result = getPlanetElement('Netuno');
      expect(result).toBeNull();
    });
  });

  // ─── getAllElementPlanets: collection function ────────────────────────────
  describe('getAllElementPlanets', () => {
    it('returns all 4 element-planet mappings', () => {
      const result = getAllElementPlanets();
      expect(result).toHaveLength(4);
    });

    it('returns array with correct structure', () => {
      const result = getAllElementPlanets();
      result.forEach((mapping) => {
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.planeta).toBeTruthy();
        expect(mapping.qualidades).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
      });
    });

    it('contains all 4 elements', () => {
      const result = getAllElementPlanets();
      const elementos = result.map((m) => m.elemento);
      expect(elementos).toContain('Fogo');
      expect(elementos).toContain('Água');
      expect(elementos).toContain('Ar');
      expect(elementos).toContain('Terra');
    });

    it('each mapping has complete data', () => {
      const result = getAllElementPlanets();
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

  // ─── Integration: element-planet-orixa relationships ───────────────────────
  describe('element-planet-orixa integration', () => {
    it('element-orixa matches planet-orixa from planet-orixa correlation', () => {
      // Fogo-Sol → Xangô (matches planet-orixa.ts)
      const fogo = getElementPlanet('Fogo');
      expect(fogo!.orixa).toBe('Xangô');

      // Água-Lua → Iemanjá (matches planet-orixa.ts)
      const agua = getElementPlanet('Água');
      expect(agua!.orixa).toBe('Iemanjá');
    });

    it('element-chakra alignment with planet-chakra', () => {
      // Fogo (Sol) → Plexo Solar (3º)
      const fogo = getElementPlanet('Fogo');
      expect(fogo!.chakra).toBe('3º Plexo Solar');

      // Água (Lua) → Frontal (6º)
      const agua = getElementPlanet('Água');
      expect(agua!.chakra).toBe('6º Frontal');

      // Terra (Saturno) → Básico (1º)
      const terra = getElementPlanet('Terra');
      expect(terra!.chakra).toBe('1º Básico');
    });

    it('element-sephirah alignment', () => {
      // Fogo → Tiphereth (Sol is the heart of the Tree)
      const fogo = getElementPlanet('Fogo');
      expect(fogo!.sephirah).toBe('Tiphereth');

      // Água → Yesod (Moon is Foundation of Moon)
      const agua = getElementPlanet('Água');
      expect(agua!.sephirah).toBe('Yesod');

      // Terra → Malkuth (Saturn is the Kingdom)
      const terra = getElementPlanet('Terra');
      expect(terra!.sephirah).toBe('Malkuth');
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports ElementPlanetMapping type', () => {
      const mapping: ElementPlanetMapping = {
        elemento: 'Fogo',
        planeta: 'Sol',
        qualidades: {
          temperatura: 'Quente',
          umidade: 'Seco',
          polaridade: 'Yang',
        },
        orixa: 'Xangô',
        dia_sagrado: 'Quarta-feira',
        cores: ['Vermelho'],
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
      expect(mapping.elemento).toBe('Fogo');
    });

    it('exports Elemento type', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      expect(elements).toHaveLength(4);
    });

    it('exports Planeta type', () => {
      const planets: Planeta[] = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Saturno');
    });
  });
});