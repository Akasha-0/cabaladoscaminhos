/**
 * Planet-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getPlanetChakra,
  getChakraPlanet,
  getAllPlanetChakras,
} from '@/lib/correlation/planet-chakra';

describe('Planet-Chakra Correlation', () => {
  describe('getPlanetChakra', () => {
    it('should return Sol mapping with Sahasrara (7º Coronário) as primary chakra', () => {
      const result = getPlanetChakra('Sol');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.chakra_primario).toBe('Sahasrara');
      expect(result?.chakra_secundario).toBe('Manipura');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
      expect(result?.elemento_alinhamento).toBe('Fogo');
    });

    it('should return Lua mapping with Muladhara (1º Básico) as primary chakra', () => {
      const result = getPlanetChakra('Lua');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.chakra_primario).toBe('Muladhara');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
      expect(result?.elemento_alinhamento).toBe('Água');
    });

    it('should return Marte mapping with Svadhisthana (2º Sacro) as primary chakra', () => {
      const result = getPlanetChakra('Marte');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.chakra_primario).toBe('Svadhisthana');
      expect(result?.chakra_secundario).toBe('Manipura');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
      expect(result?.elemento_alinhamento).toBe('Fogo');
    });

    it('should return Mercúrio mapping with Manipura (3º Plexo Solar) as primary chakra', () => {
      const result = getPlanetChakra('Mercúrio');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.chakra_primario).toBe('Manipura');
      expect(result?.chakra_secundario).toBe('Vishuddha');
      expect(result?.qualidade_energetica).toBe('Neutra / Volátil');
      expect(result?.elemento_alinhamento).toBe('Ar');
    });

    it('should return Júpiter mapping with Anahata (4º Cardíaco) as primary chakra', () => {
      const result = getPlanetChakra('Júpiter');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.chakra_primario).toBe('Anahata');
      expect(result?.chakra_secundario).toBe('Sahasrara');
      expect(result?.qualidade_energetica).toBe('Fria / Expansiva');
      expect(result?.elemento_alinhamento).toBe('Ar / Água');
    });

    it('should return Vênus mapping with Anahata (4º Cardíaco) as primary chakra', () => {
      const result = getPlanetChakra('Vênus');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.chakra_primario).toBe('Anahata');
      expect(result?.chakra_secundario).toBe('Sahasrara');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
      expect(result?.elemento_alinhamento).toBe('Água');
    });

    it('should return Saturno mapping with Muladhara (1º Básico) as primary chakra', () => {
      const result = getPlanetChakra('Saturno');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.chakra_primario).toBe('Muladhara');
      expect(result?.chakra_secundario).toBe('Anahata');
      expect(result?.qualidade_energetica).toBe('Quente / Densa');
      expect(result?.elemento_alinhamento).toBe('Terra');
    });

    it('should be case-insensitive', () => {
      expect(getPlanetChakra('sol')?.planeta).toBe('Sol');
      expect(getPlanetChakra('SOL')?.planeta).toBe('Sol');
      expect(getPlanetChakra('lua')?.planeta).toBe('Lua');
      expect(getPlanetChakra('júpiter')?.planeta).toBe('Júpiter');
      expect(getPlanetChakra('vénus')?.planeta).toBe('Vênus');
    });

    it('should return undefined for unknown planet', () => {
      expect(getPlanetChakra('Unknown Planet')).toBeUndefined();
      expect(getPlanetChakra('')).toBeUndefined();
      expect(getPlanetChakra('Netuno')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getPlanetChakra('Sol');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('chakra_primario');
      expect(result).toHaveProperty('chakra_secundario');
      expect(result).toHaveProperty('qualidade_energetica');
      expect(result).toHaveProperty('elemento_alinhamento');
      expect(result).toHaveProperty('praticas_espirituais');
      expect(result?.praticas_espirituais).toHaveProperty('tipo');
      expect(result?.praticas_espirituais).toHaveProperty('descricao');
      expect(result?.praticas_espirituais).toHaveProperty('frequencias');
      expect(result?.praticas_espirituais).toHaveProperty('mantras');
      expect(result?.praticas_espirituais).toHaveProperty('praticas');
    });

    it('should include spiritual practices with frequencies and mantras', () => {
      const result = getPlanetChakra('Sol');
      expect(result?.praticas_espirituais.frequencias).toContain('963 Hz (Conexão Divina)');
      expect(result?.praticas_espirituais.mantras).toContain('AUM');
      expect(result?.praticas_espirituais.praticas.length).toBeGreaterThan(0);
    });
  });

  describe('getChakraPlanet', () => {
    it('should return all seven chakras in the mapping', () => {
      const result = getChakraPlanet();
      expect(result).toHaveProperty('Muladhara');
      expect(result).toHaveProperty('Svadhisthana');
      expect(result).toHaveProperty('Manipura');
      expect(result).toHaveProperty('Anahata');
      expect(result).toHaveProperty('Vishuddha');
      expect(result).toHaveProperty('Ajna');
      expect(result).toHaveProperty('Sahasrara');
    });

    it('should associate Muladhara with Lua and Saturno', () => {
      const result = getChakraPlanet();
      expect(result.Muladhara).toContain('Lua');
      expect(result.Muladhara).toContain('Saturno');
    });

    it('should associate Svadhisthana with Marte', () => {
      const result = getChakraPlanet();
      expect(result.Svadhisthana).toContain('Marte');
    });

    it('should associate Manipura with Sol, Marte, and Mercúrio', () => {
      const result = getChakraPlanet();
      expect(result.Manipura).toContain('Sol');
      expect(result.Manipura).toContain('Marte');
      expect(result.Manipura).toContain('Mercúrio');
    });

    it('should associate Anahata with Júpiter, Vênus, and Saturno', () => {
      const result = getChakraPlanet();
      expect(result.Anahata).toContain('Júpiter');
      expect(result.Anahata).toContain('Vênus');
      expect(result.Anahata).toContain('Saturno');
    });

    it('should associate Vishuddha with Mercúrio', () => {
      const result = getChakraPlanet();
      expect(result.Vishuddha).toContain('Mercúrio');
    });

    it('should associate Ajna with Lua', () => {
      const result = getChakraPlanet();
      expect(result.Ajna).toContain('Lua');
    });

    it('should associate Sahasrara with Sol and Júpiter', () => {
      const result = getChakraPlanet();
      expect(result.Sahasrara).toContain('Sol');
      expect(result.Sahasrara).toContain('Júpiter');
    });
  });

  describe('getAllPlanetChakras', () => {
    it('should return an array of all planet-chakra mappings', () => {
      const result = getAllPlanetChakras();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return all 7 classical planets', () => {
      const result = getAllPlanetChakras();
      const planetNames = result.map((m) => m.planeta);
      expect(planetNames).toContain('Sol');
      expect(planetNames).toContain('Lua');
      expect(planetNames).toContain('Marte');
      expect(planetNames).toContain('Mercúrio');
      expect(planetNames).toContain('Júpiter');
      expect(planetNames).toContain('Vênus');
      expect(planetNames).toContain('Saturno');
      expect(result.length).toBe(7);
    });

    it('should return objects with complete structure', () => {
      const result = getAllPlanetChakras();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('chakra_primario');
        expect(mapping).toHaveProperty('chakra_secundario');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(mapping).toHaveProperty('elemento_alinhamento');
        expect(mapping).toHaveProperty('praticas_espirituais');
      }
    });
  });

  describe('Energetic quality consistency', () => {
    it('should align Sol with Quente / Radiante quality', () => {
      const result = getPlanetChakra('Sol');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
    });

    it('should align Lua with Fria / Receptiva quality', () => {
      const result = getPlanetChakra('Lua');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
    });

    it('should align Marte with Quente / Radiante quality', () => {
      const result = getPlanetChakra('Marte');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
    });

    it('should align Mercúrio with Neutra / Volátil quality', () => {
      const result = getPlanetChakra('Mercúrio');
      expect(result?.qualidade_energetica).toBe('Neutra / Volátil');
    });

    it('should align Júpiter with Fria / Expansiva quality', () => {
      const result = getPlanetChakra('Júpiter');
      expect(result?.qualidade_energetica).toBe('Fria / Expansiva');
    });

    it('should align Vênus with Fria / Receptiva quality', () => {
      const result = getPlanetChakra('Vênus');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
    });

    it('should align Saturno with Quente / Densa quality', () => {
      const result = getPlanetChakra('Saturno');
      expect(result?.qualidade_energetica).toBe('Quente / Densa');
    });
  });

  describe('Spiritual practices with Solfeggio frequencies', () => {
    it('should include Solfeggio frequencies for Sol', () => {
      const result = getPlanetChakra('Sol');
      expect(result?.praticas_espirituais.frequencias).toContain('963 Hz (Conexão Divina)');
      expect(result?.praticas_espirituais.frequencias).toContain('528 Hz (Transformação)');
    });

    it('should include Solfeggio frequencies for Lua', () => {
      const result = getPlanetChakra('Lua');
      expect(result?.praticas_espirituais.frequencias).toContain('396 Hz (Libertação)');
      expect(result?.praticas_espirituais.frequencias).toContain('852 Hz (Intuição)');
    });

    it('should include Solfeggio frequencies for Marte', () => {
      const result = getPlanetChakra('Marte');
      expect(result?.praticas_espirituais.frequencias).toContain('417 Hz (Facilitação)');
      expect(result?.praticas_espirituais.frequencias).toContain('528 Hz (Transformação)');
    });

    it('should include Solfeggio frequencies for Vênus', () => {
      const result = getPlanetChakra('Vênus');
      expect(result?.praticas_espirituais.frequencias).toContain('639 Hz (Harmonia)');
      expect(result?.praticas_espirituais.frequencias).toContain('963 Hz (Conexão Divina)');
    });
  });
});
