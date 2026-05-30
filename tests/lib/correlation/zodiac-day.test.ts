/**
 * Zodiac-Day Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getZodiacDay,
  getDayZodiac,
  getAllZodiacDays,
  getDiaFromZodiac,
  getElementoFromZodiac,
  getSignificadoFromZodiac,
  getPlanetaFromZodiac,
  getSignosByDia,
  getChakraFromZodiac,
  getOrixaFromZodiac,
  getAfirmacoesFromZodiac,
  getPraticasFromZodiac,
  getNumeroSagradoFromZodiac,
  getAllDays,
  ZODIAC_DAY_MAPPINGS,
  type ZodiacDayMapping,
  type Signo,
  type DiaSemana,
} from '@/lib/correlation/zodiac-day';

describe('zodiac-day', () => {
  // ─── ZODIAC_DAY_MAPPINGS: all 12 signs ────────────────────────────────────────

  describe('ZODIAC_DAY_MAPPINGS', () => {
    it('should have mappings for all 12 zodiac signs', () => {
      const expectedSigns: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
      ];
      expect(Object.keys(ZODIAC_DAY_MAPPINGS)).toHaveLength(12);
      expectedSigns.forEach(sign => {
        expect(ZODIAC_DAY_MAPPINGS).toHaveProperty(sign);
      });
    });

    it('should have correct day associations for each sign', () => {
      expect(ZODIAC_DAY_MAPPINGS['Áries'].dia).toBe('Terça-feira');
      expect(ZODIAC_DAY_MAPPINGS['Touro'].dia).toBe('Sexta-feira');
      expect(ZODIAC_DAY_MAPPINGS['Gémeos'].dia).toBe('Quarta-feira');
      expect(ZODIAC_DAY_MAPPINGS['Câncer'].dia).toBe('Segunda-feira');
      expect(ZODIAC_DAY_MAPPINGS['Leão'].dia).toBe('Domingo');
      expect(ZODIAC_DAY_MAPPINGS['Virgem'].dia).toBe('Quarta-feira');
      expect(ZODIAC_DAY_MAPPINGS['Libra'].dia).toBe('Sexta-feira');
      expect(ZODIAC_DAY_MAPPINGS['Escorpião'].dia).toBe('Terça-feira');
      expect(ZODIAC_DAY_MAPPINGS['Sagitário'].dia).toBe('Quinta-feira');
      expect(ZODIAC_DAY_MAPPINGS['Capricórnio'].dia).toBe('Sábado');
      expect(ZODIAC_DAY_MAPPINGS['Aquário'].dia).toBe('Sábado');
      expect(ZODIAC_DAY_MAPPINGS['Peixes'].dia).toBe('Quinta-feira');
    });

    it('should have element connections for each sign', () => {
      expect(ZODIAC_DAY_MAPPINGS['Áries'].elemento).toBe('Fogo');
      expect(ZODIAC_DAY_MAPPINGS['Touro'].elemento).toBe('Terra');
      expect(ZODIAC_DAY_MAPPINGS['Gémeos'].elemento).toBe('Ar');
      expect(ZODIAC_DAY_MAPPINGS['Câncer'].elemento).toBe('Água');
      expect(ZODIAC_DAY_MAPPINGS['Leão'].elemento).toBe('Fogo');
      expect(ZODIAC_DAY_MAPPINGS['Virgem'].elemento).toBe('Terra');
      expect(ZODIAC_DAY_MAPPINGS['Libra'].elemento).toBe('Ar');
      expect(ZODIAC_DAY_MAPPINGS['Escorpião'].elemento).toBe('Água');
      expect(ZODIAC_DAY_MAPPINGS['Sagitário'].elemento).toBe('Fogo');
      expect(ZODIAC_DAY_MAPPINGS['Capricórnio'].elemento).toBe('Terra');
      expect(ZODIAC_DAY_MAPPINGS['Aquário'].elemento).toBe('Ar');
      expect(ZODIAC_DAY_MAPPINGS['Peixes'].elemento).toBe('Água');
    });

    it('should have spiritual meaning for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('should have spiritual practices for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas_espirituais).toBeDefined();
        expect(Array.isArray(mapping.praticas_espirituais)).toBe(true);
        expect(mapping.praticas_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('should have affirmations for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.afirmacoes).toBeDefined();
        expect(Array.isArray(mapping.afirmacoes)).toBe(true);
        expect(mapping.afirmacoes.length).toBeGreaterThan(0);
      });
    });

    it('should have chakra association for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.chakra).toBeDefined();
        expect(typeof mapping.chakra).toBe('string');
      });
    });

    it('should have orixá association for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.orixa).toBeDefined();
        expect(typeof mapping.orixa).toBe('string');
      });
    });

    it('should have planeta regente for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.planeta_regente).toBeDefined();
        expect(typeof mapping.planeta_regente).toBe('string');
      });
    });

    it('should have element qualities for each sign', () => {
      Object.values(ZODIAC_DAY_MAPPINGS).forEach(mapping => {
        expect(mapping.qualidades_elementares).toBeDefined();
        expect(mapping.qualidades_elementares).toHaveProperty('quente');
        expect(mapping.qualidades_elementares).toHaveProperty('frio');
        expect(mapping.qualidades_elementares).toHaveProperty('seco');
        expect(mapping.qualidades_elementares).toHaveProperty('humido');
      });
    });
  });

  // ─── getZodiacDay: lookup by sign ────────────────────────────────────────────

  describe('getZodiacDay', () => {
    it('should return mapping for Áries', () => {
      const mapping = getZodiacDay('Áries');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Áries');
      expect(mapping?.dia).toBe('Terça-feira');
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return mapping for Leão', () => {
      const mapping = getZodiacDay('Leão');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Leão');
      expect(mapping?.dia).toBe('Domingo');
    });

    it('should return mapping for Peixes', () => {
      const mapping = getZodiacDay('Peixes');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Peixes');
      expect(mapping?.dia).toBe('Quinta-feira');
    });

    it('should be case-insensitive', () => {
      expect(getZodiacDay('aries')?.signo).toBe('Áries');
      expect(getZodiacDay('ARIES')?.signo).toBe('Áries');
      expect(getZodiacDay('leão')?.signo).toBe('Leão');
    });

    it('should handle accented characters', () => {
      expect(getZodiacDay('Gêmeos')?.signo).toBe('Gémeos');
      expect(getZodiacDay('Escorpião')?.signo).toBe('Escorpião');
      expect(getZodiacDay('Sagitário')?.signo).toBe('Sagitário');
    });

    it('should handle common variations', () => {
      expect(getZodiacDay('Cancer')?.signo).toBe('Câncer');
      expect(getZodiacDay('Touro')?.signo).toBe('Touro');
    });

    it('should return null for unknown sign', () => {
      expect(getZodiacDay('Unknown')).toBeNull();
      expect(getZodiacDay('Zodiac')).toBeNull();
      expect(getZodiacDay('')).toBeNull();
    });
  });

  // ─── getDayZodiac: lookup by day ─────────────────────────────────────────────

  describe('getDayZodiac', () => {
    it('should return signs for Domingo', () => {
      const mappings = getDayZodiac('Domingo');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Leão')).toBe(true);
    });

    it('should return signs for Segunda-feira', () => {
      const mappings = getDayZodiac('Segunda-feira');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Câncer')).toBe(true);
    });

    it('should return signs for Terça-feira', () => {
      const mappings = getDayZodiac('Terça-feira');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Áries')).toBe(true);
      expect(mappings.some(m => m.signo === 'Escorpião')).toBe(true);
    });

    it('should return signs for Quarta-feira', () => {
      const mappings = getDayZodiac('Quarta-feira');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Gémeos')).toBe(true);
      expect(mappings.some(m => m.signo === 'Virgem')).toBe(true);
    });

    it('should return signs for Quinta-feira', () => {
      const mappings = getDayZodiac('Quinta-feira');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Sagitário')).toBe(true);
      expect(mappings.some(m => m.signo === 'Peixes')).toBe(true);
    });

    it('should return signs for Sexta-feira', () => {
      const mappings = getDayZodiac('Sexta-feira');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Touro')).toBe(true);
      expect(mappings.some(m => m.signo === 'Libra')).toBe(true);
    });

    it('should return signs for Sábado', () => {
      const mappings = getDayZodiac('Sábado');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.some(m => m.signo === 'Capricórnio')).toBe(true);
      expect(mappings.some(m => m.signo === 'Aquário')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(getDayZodiac('domingo').length).toBeGreaterThan(0);
      expect(getDayZodiac('SEGUNDA-FEIRA').length).toBeGreaterThan(0);
    });

    it('should accept short forms', () => {
      const mappings = getDayZodiac('Quarta');
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown day', () => {
      expect(getDayZodiac('Dia')).toEqual([]);
      expect(getDayZodiac('Unknown')).toEqual([]);
    });
  });

  // ─── getAllZodiacDays ────────────────────────────────────────────────────────

  describe('getAllZodiacDays', () => {
    it('should return all 12 mappings', () => {
      const all = getAllZodiacDays();
      expect(all).toHaveLength(12);
    });

    it('should return array of ZodiacDayMapping', () => {
      const all = getAllZodiacDays();
      all.forEach(mapping => {
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('should contain all signs', () => {
      const all = getAllZodiacDays();
      const signs = all.map(m => m.signo);
      expect(signs).toContain('Áries');
      expect(signs).toContain('Leão');
      expect(signs).toContain('Peixes');
    });
  });

  // ─── getDiaFromZodiac ─────────────────────────────────────────────────────────

  describe('getDiaFromZodiac', () => {
    it('should return correct day for each sign', () => {
      expect(getDiaFromZodiac('Áries')).toBe('Terça-feira');
      expect(getDiaFromZodiac('Touro')).toBe('Sexta-feira');
      expect(getDiaFromZodiac('Gémeos')).toBe('Quarta-feira');
      expect(getDiaFromZodiac('Câncer')).toBe('Segunda-feira');
      expect(getDiaFromZodiac('Leão')).toBe('Domingo');
      expect(getDiaFromZodiac('Virgem')).toBe('Quarta-feira');
      expect(getDiaFromZodiac('Libra')).toBe('Sexta-feira');
      expect(getDiaFromZodiac('Escorpião')).toBe('Terça-feira');
      expect(getDiaFromZodiac('Sagitário')).toBe('Quinta-feira');
      expect(getDiaFromZodiac('Capricórnio')).toBe('Sábado');
      expect(getDiaFromZodiac('Aquário')).toBe('Sábado');
      expect(getDiaFromZodiac('Peixes')).toBe('Quinta-feira');
    });

    it('should return null for unknown sign', () => {
      expect(getDiaFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getElementoFromZodiac ───────────────────────────────────────────────────

  describe('getElementoFromZodiac', () => {
    it('should return fogo for fire signs', () => {
      expect(getElementoFromZodiac('Áries')).toBe('Fogo');
      expect(getElementoFromZodiac('Leão')).toBe('Fogo');
      expect(getElementoFromZodiac('Sagitário')).toBe('Fogo');
    });

    it('should return terra for earth signs', () => {
      expect(getElementoFromZodiac('Touro')).toBe('Terra');
      expect(getElementoFromZodiac('Virgem')).toBe('Terra');
      expect(getElementoFromZodiac('Capricórnio')).toBe('Terra');
    });

    it('should return ar for air signs', () => {
      expect(getElementoFromZodiac('Gémeos')).toBe('Ar');
      expect(getElementoFromZodiac('Libra')).toBe('Ar');
      expect(getElementoFromZodiac('Aquário')).toBe('Ar');
    });

    it('should return água for water signs', () => {
      expect(getElementoFromZodiac('Câncer')).toBe('Água');
      expect(getElementoFromZodiac('Escorpião')).toBe('Água');
      expect(getElementoFromZodiac('Peixes')).toBe('Água');
    });

    it('should return null for unknown sign', () => {
      expect(getElementoFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getSignificadoFromZodiac ────────────────────────────────────────────────

  describe('getSignificadoFromZodiac', () => {
    it('should return spiritual meaning for each sign', () => {
      expect(getSignificadoFromZodiac('Áries')).not.toBeNull();
      expect(getSignificadoFromZodiac('Leão')).not.toBeNull();
      expect(getSignificadoFromZodiac('Peixes')).not.toBeNull();
    });

    it('should return string with meaningful content', () => {
      const significado = getSignificadoFromZodiac('Áries');
      expect(significado).toBeDefined();
      expect(typeof significado).toBe('string');
      expect(significado!.length).toBeGreaterThan(20);
    });

    it('should return null for unknown sign', () => {
      expect(getSignificadoFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getPlanetaFromZodiac ─────────────────────────────────────────────────────

  describe('getPlanetaFromZodiac', () => {
    it('should return planet for each sign', () => {
      expect(getPlanetaFromZodiac('Áries')).toBe('Marte');
      expect(getPlanetaFromZodiac('Touro')).toBe('Vénus');
      expect(getPlanetaFromZodiac('Gémeos')).toBe('Mercúrio');
      expect(getPlanetaFromZodiac('Câncer')).toBe('Lua');
      expect(getPlanetaFromZodiac('Leão')).toBe('Sol');
      expect(getPlanetaFromZodiac('Virgem')).toBe('Mercúrio');
      expect(getPlanetaFromZodiac('Libra')).toBe('Vénus');
      expect(getPlanetaFromZodiac('Escorpião')).toBe('Plutão');
      expect(getPlanetaFromZodiac('Sagitário')).toBe('Júpiter');
      expect(getPlanetaFromZodiac('Capricórnio')).toBe('Saturno');
      expect(getPlanetaFromZodiac('Aquário')).toBe('Urano');
      expect(getPlanetaFromZodiac('Peixes')).toBe('Neptuno');
    });

    it('should return null for unknown sign', () => {
      expect(getPlanetaFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getSignosByDia ───────────────────────────────────────────────────────────

  describe('getSignosByDia', () => {
    it('should return signs for each day', () => {
      expect(getSignosByDia('Domingo')).toContain('Leão');
      expect(getSignosByDia('Segunda-feira')).toContain('Câncer');
      expect(getSignosByDia('Terça-feira')).toContain('Áries');
      expect(getSignosByDia('Terça-feira')).toContain('Escorpião');
      expect(getSignosByDia('Quarta-feira')).toContain('Gémeos');
      expect(getSignosByDia('Quarta-feira')).toContain('Virgem');
      expect(getSignosByDia('Quinta-feira')).toContain('Sagitário');
      expect(getSignosByDia('Quinta-feira')).toContain('Peixes');
      expect(getSignosByDia('Sexta-feira')).toContain('Touro');
      expect(getSignosByDia('Sexta-feira')).toContain('Libra');
      expect(getSignosByDia('Sábado')).toContain('Capricórnio');
      expect(getSignosByDia('Sábado')).toContain('Aquário');
    });

    it('should return empty array for unknown day', () => {
      expect(getSignosByDia('Unknown')).toEqual([]);
    });
  });

  // ─── getChakraFromZodiac ─────────────────────────────────────────────────────

  describe('getChakraFromZodiac', () => {
    it('should return chakra for each sign', () => {
      expect(getChakraFromZodiac('Áries')).toBe('Muladhara (Raiz)');
      expect(getChakraFromZodiac('Touro')).toBe('Svadhisthana (Sacro)');
      expect(getChakraFromZodiac('Gémeos')).toBe('Vishuddha (Garganta)');
      expect(getChakraFromZodiac('Câncer')).toBe('Anahata (Coração)');
      expect(getChakraFromZodiac('Leão')).toBe('Manipura (Plexo Solar)');
    });

    it('should return null for unknown sign', () => {
      expect(getChakraFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getOrixaFromZodiac ─────────────────────────────────────────────────────

  describe('getOrixaFromZodiac', () => {
    it('should return orixá for each sign', () => {
      expect(getOrixaFromZodiac('Áries')).toBe('Ogum');
      expect(getOrixaFromZodiac('Touro')).toBe('Oxum');
      expect(getOrixaFromZodiac('Câncer')).toBe('Iemanjá');
      expect(getOrixaFromZodiac('Leão')).toBe('Oxalá');
    });

    it('should return null for unknown sign', () => {
      expect(getOrixaFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getAfirmacoesFromZodiac ────────────────────────────────────────────────

  describe('getAfirmacoesFromZodiac', () => {
    it('should return affirmations array for each sign', () => {
      const afir = getAfirmacoesFromZodiac('Áries');
      expect(afir).not.toBeNull();
      expect(Array.isArray(afir)).toBe(true);
      expect(afir!.length).toBeGreaterThan(0);
    });

    it('should return null for unknown sign', () => {
      expect(getAfirmacoesFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getPraticasFromZodiac ─────────────────────────────────────────────────

  describe('getPraticasFromZodiac', () => {
    it('should return practices array for each sign', () => {
      const practices = getPraticasFromZodiac('Áries');
      expect(practices).not.toBeNull();
      expect(Array.isArray(practices)).toBe(true);
      expect(practices!.length).toBeGreaterThan(0);
    });

    it('should return null for unknown sign', () => {
      expect(getPraticasFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getNumeroSagradoFromZodiac ───────────────────────────────────────────

  describe('getNumeroSagradoFromZodiac', () => {
    it('should return sacred number for each sign', () => {
      expect(getNumeroSagradoFromZodiac('Áries')).toBe(9);
      expect(getNumeroSagradoFromZodiac('Touro')).toBe(6);
      expect(getNumeroSagradoFromZodiac('Gémeos')).toBe(5);
      expect(getNumeroSagradoFromZodiac('Câncer')).toBe(2);
      expect(getNumeroSagradoFromZodiac('Leão')).toBe(1);
    });

    it('should return null for unknown sign', () => {
      expect(getNumeroSagradoFromZodiac('Unknown')).toBeNull();
    });
  });

  // ─── getAllDays ─────────────────────────────────────────────────────────────

  describe('getAllDays', () => {
    it('should return all 7 days of the week', () => {
      const days = getAllDays();
      expect(days).toHaveLength(7);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  // ─── Type exports ────────────────────────────────────────────────────────────

  describe('type exports', () => {
    it('should export Signo type', () => {
      const signo: Signo = 'Áries';
      expect(signo).toBe('Áries');
    });

    it('should export DiaSemana type', () => {
      const dia: DiaSemana = 'Domingo';
      expect(dia).toBe('Domingo');
    });

    it('should export ZodiacDayMapping interface', () => {
      const mapping: ZodiacDayMapping = ZODIAC_DAY_MAPPINGS['Áries'];
      expect(mapping.signo).toBe('Áries');
      expect(mapping.dia).toBe('Terça-feira');
    });
  });

  // ─── Integration: day-element relationships ───────────────────────────────

  describe('day-element integration', () => {
    it('should have consistent element-day patterns', () => {
      // Domingo (Sun) - Fogo signs
      const domingoMapppings = getDayZodiac('Domingo');
      expect(domingoMapppings.every(m => m.elemento === 'Fogo')).toBe(true);

      // Segunda-feira (Moon) - Água signs
      const segundaMappings = getDayZodiac('Segunda-feira');
      expect(segundaMappings.every(m => m.elemento === 'Água')).toBe(true);

      // Sexta-feira (Venus) - mixed Terra and Ar
      const sextaMappings = getDayZodiac('Sexta-feira');
      expect(sextaMappings.some(m => m.elemento === 'Terra')).toBe(true);
      expect(sextaMappings.some(m => m.elemento === 'Ar')).toBe(true);
    });

    it('should link planeta_regente to day through traditional associations', () => {
      // Domingo - Sol rules Leão
      const domingoMappings = getDayZodiac('Domingo');
      expect(domingoMappings.some(m => m.planeta_regente === 'Sol')).toBe(true);

      // Segunda-feira - Lua rules Câncer
      const segundaMappings = getDayZodiac('Segunda-feira');
      expect(segundaMappings.some(m => m.planeta_regente === 'Lua')).toBe(true);

      // Terça-feira - Marte rules Áries and Escorpião
      const tercaMappings = getDayZodiac('Terça-feira');
      expect(tercaMappings.some(m => m.planeta_regente === 'Marte')).toBe(true);
    });
  });

  // ─── Default export ───────────────────────────────────────────────────────

  describe('default export', () => {
    it('should export all required functions', async () => {
      const module = await import('@/lib/correlation/zodiac-day');
      const def = module.default;

      expect(def.getZodiacDay).toBeDefined();
      expect(typeof def.getZodiacDay).toBe('function');
      expect(def.getDayZodiac).toBeDefined();
      expect(def.getAllZodiacDays).toBeDefined();
    });

    it('should have ZODIAC_DAY_MAPPINGS in default export', async () => {
      const module = await import('@/lib/correlation/zodiac-day');
      const def = module.default;

      expect(def.ZODIAC_DAY_MAPPINGS).toBeDefined();
      expect(Object.keys(def.ZODIAC_DAY_MAPPINGS)).toHaveLength(12);
    });
  });
});