import { describe, it, expect } from 'vitest';
import {
  getChakraPlanet,
  getPlanetChakra,
  getAllChakraPlanets,
  CHAKRA_PLANET_MAPPINGS,
} from '@/lib/correlation/chakra-planet';

describe('Chakra-Planet Correlation', () => {
  describe('getChakraPlanet', () => {
    it('should return Muladhara (1º Básico) with Saturn planet', () => {
      const result = getChakraPlanet('Muladhara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.planeta).toBe('Saturno');
    });

    it('should return Svadhisthana (2º Sacro) with Jupiter planet', () => {
      const result = getChakraPlanet('Svadhisthana');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.planeta).toBe('Júpiter');
    });

    it('should return Manipura (3º Plexo Solar) with Mars planet', () => {
      const result = getChakraPlanet('Manipura');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.planeta).toBe('Marte');
    });

    it('should return Anahata (4º Cardíaco) with Venus planet', () => {
      const result = getChakraPlanet('Anahata');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.planeta).toBe('Vênus');
    });

    it('should return Vishuddha (5º Laríngeo) with Mercury planet', () => {
      const result = getChakraPlanet('Vishuddha');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.planeta).toBe('Mercúrio');
    });

    it('should return Ajna (6º Frontal) with Moon planet', () => {
      const result = getChakraPlanet('Ajna');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.planeta).toBe('Lua');
    });

    it('should return Sahasrara (7º Coronário) with Sun planet', () => {
      const result = getChakraPlanet('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.planeta).toBe('Sol');
    });

    it('should accept chakra number format as input', () => {
      const result = getChakraPlanet('1º Básico');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.planeta).toBe('Saturno');
    });

    it('should return null for unknown chakra', () => {
      const result = getChakraPlanet('UnknownChakra');
      expect(result).toBeNull();
    });
  });

  describe('getPlanetChakra', () => {
    it('should return Muladhara for Saturn', () => {
      const result = getPlanetChakra('Saturno');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should return Svadhisthana for Jupiter', () => {
      const result = getPlanetChakra('Júpiter');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.chakra).toBe('Svadhisthana');
    });

    it('should return Manipura for Mars', () => {
      const result = getPlanetChakra('Marte');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Marte');
      expect(result?.chakra).toBe('Manipura');
    });

    it('should return Anahata for Venus', () => {
      const result = getPlanetChakra('Vênus');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.chakra).toBe('Anahata');
    });

    it('should return Vishuddha for Mercury', () => {
      const result = getPlanetChakra('Mercúrio');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.chakra).toBe('Vishuddha');
    });

    it('should return Ajna for Moon', () => {
      const result = getPlanetChakra('Lua');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
      expect(result?.chakra).toBe('Ajna');
    });

    it('should return Sahasrara for Sun', () => {
      const result = getPlanetChakra('Sol');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.chakra).toBe('Sahasrara');
    });

    it('should normalize planet name variations', () => {
      const result = getPlanetChakra('sol');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
    });

    it('should return null for unknown planet', () => {
      const result = getPlanetChakra('Netuno');
      expect(result).toBeNull();
    });
  });

  describe('getAllChakraPlanets', () => {
    it('should return all 7 chakras', () => {
      const result = getAllChakraPlanets();
      expect(result).toHaveLength(7);
    });

    it('should contain all chakra names from Muladhara to Sahasrara', () => {
      const result = getAllChakraPlanets();
      const chakraNames = result.map(r => r.chakra);
      expect(chakraNames).toContain('Muladhara');
      expect(chakraNames).toContain('Svadhisthana');
      expect(chakraNames).toContain('Manipura');
      expect(chakraNames).toContain('Anahata');
      expect(chakraNames).toContain('Vishuddha');
      expect(chakraNames).toContain('Ajna');
      expect(chakraNames).toContain('Sahasrara');
    });

    it('should contain all 7 planets across all chakras', () => {
      const result = getAllChakraPlanets();
      const planets = result.map(r => r.planeta);
      expect(planets).toContain('Saturno');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Sol');
    });
  });

  describe('CHAKRA_PLANET_MAPPINGS constant', () => {
    it('should have all required properties for each chakra', () => {
      Object.values(CHAKRA_PLANET_MAPPINGS).forEach(mapping => {
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('chakra_numero');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('propriedades_astrologicas');
        expect(mapping.propriedades_astrologicas).toHaveProperty('signo_regente');
        expect(mapping.propriedades_astrologicas).toHaveProperty('dia_semana');
        expect(mapping.propriedades_astrologicas).toHaveProperty('natureza');
        expect(mapping.propriedades_astrologicas).toHaveProperty('exaltação');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping.significado_espiritual).toHaveProperty('qualidades');
        expect(mapping.significado_espiritual).toHaveProperty('lições_kármicas');
        expect(mapping.significado_espiritual).toHaveProperty('natureza_planetária');
        expect(mapping).toHaveProperty('prática_espiritual');
        expect(mapping.prática_espiritual).toHaveProperty('tipo');
        expect(mapping.prática_espiritual).toHaveProperty('descrição');
        expect(mapping.prática_espiritual).toHaveProperty('mudras');
        expect(Array.isArray(mapping.prática_espiritual.mudras)).toBe(true);
        expect(mapping.prática_espiritual).toHaveProperty('cores');
        expect(Array.isArray(mapping.prática_espiritual.cores)).toBe(true);
      });
    });

    it('should have correct planetary associations', () => {
      expect(CHAKRA_PLANET_MAPPINGS.Muladhara.planeta).toBe('Saturno');
      expect(CHAKRA_PLANET_MAPPINGS.Svadhisthana.planeta).toBe('Júpiter');
      expect(CHAKRA_PLANET_MAPPINGS.Manipura.planeta).toBe('Marte');
      expect(CHAKRA_PLANET_MAPPINGS.Anahata.planeta).toBe('Vênus');
      expect(CHAKRA_PLANET_MAPPINGS.Vishuddha.planeta).toBe('Mercúrio');
      expect(CHAKRA_PLANET_MAPPINGS.Ajna.planeta).toBe('Lua');
      expect(CHAKRA_PLANET_MAPPINGS.Sahasrara.planeta).toBe('Sol');
    });

    it('should have correct zodiac signs for each chakra', () => {
      expect(CHAKRA_PLANET_MAPPINGS.Muladhara.propriedades_astrologicas.signo_regente).toBe('Capricórnio');
      expect(CHAKRA_PLANET_MAPPINGS.Svadhisthana.propriedades_astrologicas.signo_regente).toBe('Sagitário');
      expect(CHAKRA_PLANET_MAPPINGS.Manipura.propriedades_astrologicas.signo_regente).toBe('Áries');
      expect(CHAKRA_PLANET_MAPPINGS.Anahata.propriedades_astrologicas.signo_regente).toBe('Touro');
      expect(CHAKRA_PLANET_MAPPINGS.Vishuddha.propriedades_astrologicas.signo_regente).toBe('Gêmeos');
      expect(CHAKRA_PLANET_MAPPINGS.Ajna.propriedades_astrologicas.signo_regente).toBe('Câncer');
      expect(CHAKRA_PLANET_MAPPINGS.Sahasrara.propriedades_astrologicas.signo_regente).toBe('Leão');
    });

    it('should have correct days of week for each chakra', () => {
      expect(CHAKRA_PLANET_MAPPINGS.Muladhara.propriedades_astrologicas.dia_semana).toBe('Sábado');
      expect(CHAKRA_PLANET_MAPPINGS.Svadhisthana.propriedades_astrologicas.dia_semana).toBe('Quinta-feira');
      expect(CHAKRA_PLANET_MAPPINGS.Manipura.propriedades_astrologicas.dia_semana).toBe('Terça-feira');
      expect(CHAKRA_PLANET_MAPPINGS.Anahata.propriedades_astrologicas.dia_semana).toBe('Sexta-feira');
      expect(CHAKRA_PLANET_MAPPINGS.Vishuddha.propriedades_astrologicas.dia_semana).toBe('Quarta-feira');
      expect(CHAKRA_PLANET_MAPPINGS.Ajna.propriedades_astrologicas.dia_semana).toBe('Segunda-feira');
      expect(CHAKRA_PLANET_MAPPINGS.Sahasrara.propriedades_astrologicas.dia_semana).toBe('Domingo');
    });
  });
});