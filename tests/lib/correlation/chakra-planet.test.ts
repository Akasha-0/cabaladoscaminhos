/**
 * Chakra-Planet Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getChakraPlanet,
  getPlanetChakra,
  getAllChakraPlanets,
} from '@/lib/correlation/chakra-planet';

describe('Chakra-Planet Correlation', () => {
  describe('getChakraPlanet', () => {
    it('should return Muladhara mapping with Lua as primary planet', () => {
      const result = getChakraPlanet('Muladhara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_numero).toBe('1º Básico (Raiz)');
      expect(result?.planeta_primario).toBe('Lua');
      expect(result?.planeta_secundario).toBe('Saturno');
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
    });

    it('should return Svadhisthana mapping with Marte as primary planet', () => {
      const result = getChakraPlanet('Svadhisthana');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_numero).toBe('2º Sacral (Esplênico)');
      expect(result?.planeta_primario).toBe('Marte');
      expect(result?.planeta_secundario).toBeNull();
      expect(result?.elemento_conexao).toBe('Água');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
    });

    it('should return Manipura mapping with Mercúrio as primary planet', () => {
      const result = getChakraPlanet('Manipura');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_numero).toBe('3º Plexo Solar');
      expect(result?.planeta_primario).toBe('Mercúrio');
      expect(result?.planeta_secundario).toBe('Sol');
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.qualidade_energetica).toBe('Neutra / Equilibrada');
    });

    it('should return Anahata mapping with Vênus as primary planet', () => {
      const result = getChakraPlanet('Anahata');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_numero).toBe('4º Cardíaco (Coração)');
      expect(result?.planeta_primario).toBe('Vênus');
      expect(result?.planeta_secundario).toBe('Júpiter');
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.qualidade_energetica).toBe('Mista / Dinâmica');
    });

    it('should return Vishuddha mapping with Mercúrio as primary planet', () => {
      const result = getChakraPlanet('Vishuddha');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_numero).toBe('5º Laríngeo (Garganta)');
      expect(result?.planeta_primario).toBe('Mercúrio');
      expect(result?.planeta_secundario).toBeNull();
      expect(result?.elemento_conexao).toBe('Éter');
      expect(result?.qualidade_energetica).toBe('Neutra / Equilibrada');
    });

    it('should return Ajna mapping with Lua as primary planet', () => {
      const result = getChakraPlanet('Ajna');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_numero).toBe('6º Terceiro Olho (Frontal)');
      expect(result?.planeta_primario).toBe('Lua');
      expect(result?.planeta_secundario).toBeNull();
      expect(result?.elemento_conexao).toBe('Éter');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
    });

    it('should return Sahasrara mapping with Sol as primary planet', () => {
      const result = getChakraPlanet('Sahasrara');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_numero).toBe('7º Coronário (Plexo Superior)');
      expect(result?.planeta_primario).toBe('Sol');
      expect(result?.planeta_secundario).toBeNull();
      expect(result?.elemento_conexao).toBe('Éter / Luz');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
    });

    it('should be case-insensitive', () => {
      const result1 = getChakraPlanet('MULADHARA');
      const result2 = getChakraPlanet('muladhara');
      const result3 = getChakraPlanet('Muladhara');
      expect(result1?.chakra).toBe(result2?.chakra);
      expect(result2?.chakra).toBe(result3?.chakra);
    });

    it('should accept chakra by number', () => {
      const result1 = getChakraPlanet('1');
      const result2 = getChakraPlanet('1º');
      const result3 = getChakraPlanet('1º básico');
      expect(result1?.chakra).toBe('Muladhara');
      expect(result2?.chakra).toBe('Muladhara');
      expect(result3?.chakra).toBe('Muladhara');
    });

    it('should accept chakra by name in Portuguese', () => {
      expect(getChakraPlanet('Raiz')?.chakra).toBe('Muladhara');
      expect(getChakraPlanet('Básico')?.chakra).toBe('Muladhara');
      expect(getChakraPlanet('Sacral')?.chakra).toBe('Svadhisthana');
      expect(getChakraPlanet('Plexo Solar')?.chakra).toBe('Manipura');
      expect(getChakraPlanet('Coração')?.chakra).toBe('Anahata');
      expect(getChakraPlanet('Cardíaco')?.chakra).toBe('Anahata');
      expect(getChakraPlanet('Garganta')?.chakra).toBe('Vishuddha');
      expect(getChakraPlanet('Laríngeo')?.chakra).toBe('Vishuddha');
      expect(getChakraPlanet('Terceiro Olho')?.chakra).toBe('Ajna');
      expect(getChakraPlanet('Coronário')?.chakra).toBe('Sahasrara');
    });

    it('should accept chakra by English names', () => {
      expect(getChakraPlanet('root')?.chakra).toBe('Muladhara');
      expect(getChakraPlanet('sacral')?.chakra).toBe('Svadhisthana');
      expect(getChakraPlanet('solar')?.chakra).toBe('Manipura');
      expect(getChakraPlanet('heart')?.chakra).toBe('Anahata');
      expect(getChakraPlanet('throat')?.chakra).toBe('Vishuddha');
      expect(getChakraPlanet('third')?.chakra).toBe('Ajna');
      expect(getChakraPlanet('crown')?.chakra).toBe('Sahasrara');
    });

    it('should return null for unknown chakra', () => {
      expect(getChakraPlanet('unknown')).toBeNull();
      expect(getChakraPlanet('')).toBeNull();
      expect(getChakraPlanet('xyz')).toBeNull();
    });

    it('should include spiritual practices with frequencies and mantras', () => {
      const result = getChakraPlanet('Sahasrara');
      expect(result?.praticas_espirituais).toBeDefined();
      expect(result?.praticas_espirituais.tipo).toBe('Iluminação e propósito divino');
      expect(result?.praticas_espirituais.descricao).toContain('energia solar');
      expect(result?.praticas_espirituais.frequencias).toContain('963 Hz (Conexão Divina)');
      expect(result?.praticas_espirituais.mantras).toContain('AUM');
      expect(result?.praticas_espirituais.praticas.length).toBeGreaterThan(0);
    });
  });

  describe('getPlanetChakra', () => {
    it('should return all seven chakras in the mapping', () => {
      const result = getPlanetChakra();
      expect(result).toHaveProperty('Muladhara');
      expect(result).toHaveProperty('Svadhisthana');
      expect(result).toHaveProperty('Manipura');
      expect(result).toHaveProperty('Anahata');
      expect(result).toHaveProperty('Vishuddha');
      expect(result).toHaveProperty('Ajna');
      expect(result).toHaveProperty('Sahasrara');
    });

    it('should associate Muladhara with Lua', () => {
      const result = getPlanetChakra();
      expect(result.Muladhara).toBe('Lua');
    });

    it('should associate Svadhisthana with Marte', () => {
      const result = getPlanetChakra();
      expect(result.Svadhisthana).toBe('Marte');
    });

    it('should associate Manipura with Mercúrio', () => {
      const result = getPlanetChakra();
      expect(result.Manipura).toBe('Mercúrio');
    });

    it('should associate Anahata with Vênus', () => {
      const result = getPlanetChakra();
      expect(result.Anahata).toBe('Vênus');
    });

    it('should associate Vishuddha with Mercúrio', () => {
      const result = getPlanetChakra();
      expect(result.Vishuddha).toBe('Mercúrio');
    });

    it('should associate Ajna with Lua', () => {
      const result = getPlanetChakra();
      expect(result.Ajna).toBe('Lua');
    });

    it('should associate Sahasrara with Sol', () => {
      const result = getPlanetChakra();
      expect(result.Sahasrara).toBe('Sol');
    });
  });

  describe('getAllChakraPlanets', () => {
    it('should return an array of all chakra-planet mappings', () => {
      const result = getAllChakraPlanets();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('should return all 7 chakra-planet mappings with primary planets', () => {
      const result = getAllChakraPlanets();
      const planets = result.map(r => r.planeta_primario);
      // 7 mappings with 5 unique primary planets: Lua, Marte, Mercúrio, Vênus, Sol
      // Lua and Mercúrio appear twice as primary planets
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Vênus');
      expect(result.length).toBe(7);
    });

    it('should return mappings with all required properties', () => {
      const result = getAllChakraPlanets();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('chakra_numero');
        expect(mapping).toHaveProperty('planeta_primario');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('praticas_espirituais');
        expect(mapping.praticas_espirituais).toHaveProperty('tipo');
        expect(mapping.praticas_espirituais).toHaveProperty('descricao');
        expect(mapping.praticas_espirituais).toHaveProperty('frequencias');
        expect(mapping.praticas_espirituais).toHaveProperty('mantras');
        expect(mapping.praticas_espirituais).toHaveProperty('praticas');
      }
    });

    it('should include all 7 primary elements', () => {
      const result = getAllChakraPlanets();
      const elements = result.map(r => r.elemento_conexao);
      expect(elements).toContain('Terra');
      expect(elements).toContain('Água');
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Ar');
      expect(elements).toContain('Éter');
    });
  });

  describe('Energetic quality consistency', () => {
    it('should have Fria / Receptiva for Muladhara (Lua/Saturno)', () => {
      const result = getChakraPlanet('Muladhara');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
    });

    it('should have Quente / Radiante for Svadhisthana (Marte)', () => {
      const result = getChakraPlanet('Svadhisthana');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
    });

    it('should have Neutra / Equilibrada for Manipura (Mercúrio)', () => {
      const result = getChakraPlanet('Manipura');
      expect(result?.qualidade_energetica).toBe('Neutra / Equilibrada');
    });

    it('should have Mista / Dinâmica for Anahata (Vênus/Júpiter)', () => {
      const result = getChakraPlanet('Anahata');
      expect(result?.qualidade_energetica).toBe('Mista / Dinâmica');
    });

    it('should have Quente / Radiante for Sahasrara (Sol)', () => {
      const result = getChakraPlanet('Sahasrara');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
    });
  });

  describe('Spiritual practices with Solfeggio frequencies', () => {
    it('should include 396 Hz for Muladhara (libertação)', () => {
      const result = getChakraPlanet('Muladhara');
      expect(result?.praticas_espirituais.frequencias).toContain('396 Hz (Libertação)');
    });

    it('should include 417 Hz for Svadhisthana (facilitação)', () => {
      const result = getChakraPlanet('Svadhisthana');
      expect(result?.praticas_espirituais.frequencias).toContain('417 Hz (Facilitação)');
    });

    it('should include 528 Hz for Manipura (transformação)', () => {
      const result = getChakraPlanet('Manipura');
      expect(result?.praticas_espirituais.frequencias).toContain('528 Hz (Transformação)');
    });

    it('should include 639 Hz for Anahata (harmonia)', () => {
      const result = getChakraPlanet('Anahata');
      expect(result?.praticas_espirituais.frequencias).toContain('639 Hz (Harmonia)');
    });

    it('should include 741 Hz for Vishuddha (expressão)', () => {
      const result = getChakraPlanet('Vishuddha');
      expect(result?.praticas_espirituais.frequencias).toContain('741 Hz (Expressão)');
    });

    it('should include 852 Hz for Ajna (intuição)', () => {
      const result = getChakraPlanet('Ajna');
      expect(result?.praticas_espirituais.frequencias).toContain('852 Hz (Intuição)');
    });

    it('should include 963 Hz for Sahasrara (conexão divina)', () => {
      const result = getChakraPlanet('Sahasrara');
      expect(result?.praticas_espirituais.frequencias).toContain('963 Hz (Conexão Divina)');
    });
  });

  describe('Chakra numbers', () => {
    it('should have correct number format for each chakra', () => {
      expect(getChakraPlanet('1')?.chakra_numero).toBe('1º Básico (Raiz)');
      expect(getChakraPlanet('2')?.chakra_numero).toBe('2º Sacral (Esplênico)');
      expect(getChakraPlanet('3')?.chakra_numero).toBe('3º Plexo Solar');
      expect(getChakraPlanet('4')?.chakra_numero).toBe('4º Cardíaco (Coração)');
      expect(getChakraPlanet('5')?.chakra_numero).toBe('5º Laríngeo (Garganta)');
      expect(getChakraPlanet('6')?.chakra_numero).toBe('6º Terceiro Olho (Frontal)');
      expect(getChakraPlanet('7')?.chakra_numero).toBe('7º Coronário (Plexo Superior)');
    });
  });
});