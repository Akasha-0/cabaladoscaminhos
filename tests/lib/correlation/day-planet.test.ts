/**
 * Day-Planet Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDayPlanet,
  getPlanetDay,
  getAllDays,
  getDaysByPlaneta,
  getAllDayPlanets,
  getDaySpiritualMeaning,
  getPlanetProperties,
  getPlanetSymbol,
  getElementByDay,
  getPlanetaryHours,
  getDayPractices,
} from '@/lib/correlation/day-planet';

describe('Day-Planet Correlation', () => {
  describe('getDayPlanet', () => {
    it('should return Sunday (Domingo) mapping with Sol', () => {
      const result = getDayPlanet('Domingo');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
      expect(result?.planeta).toBe('Sol');
      expect(result?.indice).toBe(0);
    });

    it('should return Monday (Segunda-feira) mapping with Lua', () => {
      const result = getDayPlanet('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.planeta).toBe('Lua');
      expect(result?.indice).toBe(1);
    });

    it('should return Tuesday (Terça-feira) mapping with Marte', () => {
      const result = getDayPlanet('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.planeta).toBe('Marte');
      expect(result?.indice).toBe(2);
    });

    it('should return Wednesday (Quarta-feira) mapping with Mercúrio', () => {
      const result = getDayPlanet('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.indice).toBe(3);
    });

    it('should return Thursday (Quinta-feira) mapping with Júpiter', () => {
      const result = getDayPlanet('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.indice).toBe(4);
    });

    it('should return Friday (Sexta-feira) mapping with Vênus', () => {
      const result = getDayPlanet('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.indice).toBe(5);
    });

    it('should return Saturday (Sábado) mapping with Saturno', () => {
      const result = getDayPlanet('Sábado');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sábado');
      expect(result?.planeta).toBe('Saturno');
      expect(result?.indice).toBe(6);
    });

    it('should return undefined for invalid day', () => {
      const result = getDayPlanet('InvalidDay');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getDayPlanet('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDayPlanet('Domingo');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('simbolo');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('direcao');
      expect(result).toHaveProperty('estacao');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('signo');
      expect(result).toHaveProperty('propriedades');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('horas_planetarias');
      expect(result).toHaveProperty('praticas_espirituais');
    });

    it('should have valid planet values', () => {
      const validPlanets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
      const allDays = getAllDays();
      allDays.forEach(dia => {
        const result = getDayPlanet(dia);
        expect(validPlanets).toContain(result?.planeta);
      });
    });

    it('should have valid element values', () => {
      const validElements = ['fogo', 'água', 'ar', 'terra'];
      const allDays = getAllDays();
      allDays.forEach(dia => {
        const result = getDayPlanet(dia);
        expect(validElements).toContain(result?.elemento);
      });
    });

    it('should have valid quality values', () => {
      const validQualities = ['cardinal', 'fixed', 'mutable'];
      const allDays = getAllDays();
      allDays.forEach(dia => {
        const result = getDayPlanet(dia);
        expect(validQualities).toContain(result?.qualidade);
      });
    });

    it('should have properties with forta, palavras_chave, and desafios', () => {
      const result = getDayPlanet('Domingo');
      expect(result?.propriedades).toHaveProperty('forta');
      expect(result?.propriedades).toHaveProperty('palavras_chave');
      expect(result?.propriedades).toHaveProperty('desafios');
      expect(Array.isArray(result?.propriedades.palavras_chave)).toBe(true);
      expect(Array.isArray(result?.propriedades.desafios)).toBe(true);
    });

    it('should have planetary hours with inicio, horas_favoraveis, and horas_desafio', () => {
      const result = getDayPlanet('Domingo');
      expect(result?.horas_planetarias).toHaveProperty('inicio');
      expect(result?.horas_planetarias).toHaveProperty('horas_favoraveis');
      expect(result?.horas_planetarias).toHaveProperty('horas_desafio');
      expect(Array.isArray(result?.horas_planetarias.horas_favoraveis)).toBe(true);
      expect(Array.isArray(result?.horas_planetarias.horas_desafio)).toBe(true);
    });

    it('should have espiritual meaning as non-empty string', () => {
      const allDays = getAllDays();
      allDays.forEach(dia => {
        const result = getDayPlanet(dia);
        expect(typeof result?.significado_espiritual).toBe('string');
        expect(result?.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should have espiritual practices as non-empty array', () => {
      const allDays = getAllDays();
      allDays.forEach(dia => {
        const result = getDayPlanet(dia);
        expect(Array.isArray(result?.praticas_espirituais)).toBe(true);
        expect(result?.praticas_espirituais.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPlanetDay', () => {
    it('should return Sol for Domingo', () => {
      expect(getPlanetDay('Domingo')).toBe('Sol');
    });

    it('should return Lua for Segunda-feira', () => {
      expect(getPlanetDay('Segunda-feira')).toBe('Lua');
    });

    it('should return Marte for Terça-feira', () => {
      expect(getPlanetDay('Terça-feira')).toBe('Marte');
    });

    it('should return Mercúrio for Quarta-feira', () => {
      expect(getPlanetDay('Quarta-feira')).toBe('Mercúrio');
    });

    it('should return Júpiter for Quinta-feira', () => {
      expect(getPlanetDay('Quinta-feira')).toBe('Júpiter');
    });

    it('should return Vênus for Sexta-feira', () => {
      expect(getPlanetDay('Sexta-feira')).toBe('Vênus');
    });

    it('should return Saturno for Sábado', () => {
      expect(getPlanetDay('Sábado')).toBe('Saturno');
    });

    it('should return undefined for invalid day', () => {
      expect(getPlanetDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getAllDays', () => {
    it('should return all 7 days of the week', () => {
      const days = getAllDays();
      expect(days).toHaveLength(7);
    });

    it('should include all Portuguese day names', () => {
      const days = getAllDays();
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });

    it('should return array of strings', () => {
      const days = getAllDays();
      days.forEach(dia => {
        expect(typeof dia).toBe('string');
      });
    });
  });

  describe('getDaysByPlaneta', () => {
    it('should return Domingo for Sol', () => {
      expect(getDaysByPlaneta('Sol')).toContain('Domingo');
    });

    it('should return Segunda-feira for Lua', () => {
      expect(getDaysByPlaneta('Lua')).toContain('Segunda-feira');
    });

    it('should return Terça-feira for Marte', () => {
      expect(getDaysByPlaneta('Marte')).toContain('Terça-feira');
    });

    it('should return Quarta-feira for Mercúrio', () => {
      expect(getDaysByPlaneta('Mercúrio')).toContain('Quarta-feira');
    });

    it('should return Quinta-feira for Júpiter', () => {
      expect(getDaysByPlaneta('Júpiter')).toContain('Quinta-feira');
    });

    it('should return Sexta-feira for Vênus', () => {
      expect(getDaysByPlaneta('Vênus')).toContain('Sexta-feira');
    });

    it('should return Sábado for Saturno', () => {
      expect(getDaysByPlaneta('Saturno')).toContain('Sábado');
    });

    it('should return empty array for non-existent planet', () => {
      expect(getDaysByPlaneta('Plutão')).toEqual([]);
    });

    it('should return array of strings', () => {
      const days = getDaysByPlaneta('Sol');
      expect(Array.isArray(days)).toBe(true);
      days.forEach(dia => {
        expect(typeof dia).toBe('string');
      });
    });
  });

  describe('getAllDayPlanets', () => {
    it('should return all 7 day-planet mappings', () => {
      const results = getAllDayPlanets();
      expect(results).toHaveLength(7);
    });

    it('should return array of DayPlanet objects', () => {
      const results = getAllDayPlanets();
      results.forEach(result => {
        expect(result).toHaveProperty('dia');
        expect(result).toHaveProperty('planeta');
        expect(result).toHaveProperty('elemento');
      });
    });

    it('should include all required properties in each mapping', () => {
      const results = getAllDayPlanets();
      results.forEach(result => {
        expect(result).toHaveProperty('dia');
        expect(result).toHaveProperty('indice');
        expect(result).toHaveProperty('planeta');
        expect(result).toHaveProperty('simbolo');
        expect(result).toHaveProperty('elemento');
        expect(result).toHaveProperty('qualidade');
        expect(result).toHaveProperty('cor');
        expect(result).toHaveProperty('direcao');
        expect(result).toHaveProperty('estacao');
        expect(result).toHaveProperty('chakra');
        expect(result).toHaveProperty('signo');
        expect(result).toHaveProperty('propriedades');
        expect(result).toHaveProperty('significado_espiritual');
        expect(result).toHaveProperty('horas_planetarias');
        expect(result).toHaveProperty('praticas_espirituais');
      });
    });
  });

  describe('getDaySpiritualMeaning', () => {
    it('should return spiritual meaning for valid day', () => {
      const meaning = getDaySpiritualMeaning('Domingo');
      expect(typeof meaning).toBe('string');
      expect(meaning.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDaySpiritualMeaning('InvalidDay')).toBeUndefined();
    });

    it('should return different meanings for different days', () => {
      const domingo = getDaySpiritualMeaning('Domingo');
      const sabado = getDaySpiritualMeaning('Sábado');
      expect(domingo).not.toBe(sabado);
    });
  });

  describe('getPlanetProperties', () => {
    it('should return properties for valid day', () => {
      const props = getPlanetProperties('Domingo');
      expect(props).toBeDefined();
      expect(props).toHaveProperty('forta');
      expect(props).toHaveProperty('palavras_chave');
      expect(props).toHaveProperty('desafios');
    });

    it('should return undefined for invalid day', () => {
      expect(getPlanetProperties('InvalidDay')).toBeUndefined();
    });

    it('should return arrays for palavras_chave and desafios', () => {
      const props = getPlanetProperties('Segunda-feira');
      expect(Array.isArray(props?.palavras_chave)).toBe(true);
      expect(Array.isArray(props?.desafios)).toBe(true);
    });
  });

  describe('getPlanetSymbol', () => {
    it('should return symbol for valid day', () => {
      expect(getPlanetSymbol('Domingo')).toBe('☉');
      expect(getPlanetSymbol('Segunda-feira')).toBe('☽');
      expect(getPlanetSymbol('Terça-feira')).toBe('♂');
      expect(getPlanetSymbol('Quarta-feira')).toBe('☿');
      expect(getPlanetSymbol('Quinta-feira')).toBe('♃');
      expect(getPlanetSymbol('Sexta-feira')).toBe('♀');
      expect(getPlanetSymbol('Sábado')).toBe('♄');
    });

    it('should return undefined for invalid day', () => {
      expect(getPlanetSymbol('InvalidDay')).toBeUndefined();
    });
  });

  describe('getElementByDay', () => {
    it('should return fire for Domingo', () => {
      expect(getElementByDay('Domingo')).toBe('fogo');
    });

    it('should return water for Segunda-feira', () => {
      expect(getElementByDay('Segunda-feira')).toBe('água');
    });

    it('should return fire for Terça-feira', () => {
      expect(getElementByDay('Terça-feira')).toBe('fogo');
    });

    it('should return air for Quarta-feira', () => {
      expect(getElementByDay('Quarta-feira')).toBe('ar');
    });

    it('should return fire for Quinta-feira', () => {
      expect(getElementByDay('Quinta-feira')).toBe('fogo');
    });

    it('should return earth for Sexta-feira', () => {
      expect(getElementByDay('Sexta-feira')).toBe('terra');
    });

    it('should return earth for Sábado', () => {
      expect(getElementByDay('Sábado')).toBe('terra');
    });

    it('should return undefined for invalid day', () => {
      expect(getElementByDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getPlanetaryHours', () => {
    it('should return planetary hours for valid day', () => {
      const hours = getPlanetaryHours('Domingo');
      expect(hours).toBeDefined();
      expect(hours).toHaveProperty('inicio');
      expect(hours).toHaveProperty('horas_favoraveis');
      expect(hours).toHaveProperty('horas_desafio');
    });

    it('should return undefined for invalid day', () => {
      expect(getPlanetaryHours('InvalidDay')).toBeUndefined();
    });

    it('should have inicio matching the day planet', () => {
      expect(getPlanetaryHours('Domingo')?.inicio).toBe('Sol');
      expect(getPlanetaryHours('Segunda-feira')?.inicio).toBe('Lua');
      expect(getPlanetaryHours('Terça-feira')?.inicio).toBe('Marte');
      expect(getPlanetaryHours('Quarta-feira')?.inicio).toBe('Mercúrio');
      expect(getPlanetaryHours('Quinta-feira')?.inicio).toBe('Júpiter');
      expect(getPlanetaryHours('Sexta-feira')?.inicio).toBe('Vênus');
      expect(getPlanetaryHours('Sábado')?.inicio).toBe('Saturno');
    });
  });

  describe('getDayPractices', () => {
    it('should return practices for valid day', () => {
      const practices = getDayPractices('Domingo');
      expect(Array.isArray(practices)).toBe(true);
      expect(practices.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDayPractices('InvalidDay')).toBeUndefined();
    });

    it('should return array of strings', () => {
      const practices = getDayPractices('Segunda-feira');
      practices?.forEach(practice => {
        expect(typeof practice).toBe('string');
      });
    });
  });
});
