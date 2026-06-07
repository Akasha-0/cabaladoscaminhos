/**
 * Day-Zodiac Correlation Tests
 */
import { describe, it, expect } from 'vitest';
import {
  getDayZodiac,
  getZodiacByDay,
  getZodiacDay,
  getDayElement,
  getAllDays,
  getDayPlanet,
  getDaysBySigno,
  getDaysByElemento,
  getDaySignificado,
  getAllDayZodiacs,
} from '@/lib/correlation/day-zodiac';

describe('Day-Zodiac Correlation', () => {
  describe('getDayZodiac', () => {
    it('should return Sunday (Domingo) mapping with Sol/Leão', () => {
      const result = getDayZodiac('Domingo');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.signo).toBe('Leão');
      expect(result?.elemento).toBe('fogo');
      expect(result?.qualidade).toBe('fixed');
      expect(result?.indice).toBe(0);
    });

    it('should return Monday (Segunda-feira) mapping with Lua/Câncer', () => {
      const result = getDayZodiac('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.signo).toBe('Câncer');
      expect(result?.elemento).toBe('água');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.indice).toBe(1);
    });

    it('should return Tuesday (Terça-feira) mapping with Marte/Áries', () => {
      const result = getDayZodiac('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.signo).toBe('Áries');
      expect(result?.elemento).toBe('fogo');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.indice).toBe(2);
    });

    it('should return Wednesday (Quarta-feira) mapping with Mercúrio/Gêmeos', () => {
      const result = getDayZodiac('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.signo).toBe('Gêmeos');
      expect(result?.elemento).toBe('ar');
      expect(result?.qualidade).toBe('mutable');
      expect(result?.indice).toBe(3);
    });

    it('should return Thursday (Quinta-feira) mapping with Júpiter/Sagitário', () => {
      const result = getDayZodiac('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.signo).toBe('Sagitário');
      expect(result?.elemento).toBe('fogo');
      expect(result?.qualidade).toBe('mutable');
      expect(result?.indice).toBe(4);
    });

    it('should return Friday (Sexta-feira) mapping with Vênus/Touro', () => {
      const result = getDayZodiac('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.signo).toBe('Touro');
      expect(result?.elemento).toBe('terra');
      expect(result?.qualidade).toBe('fixed');
      expect(result?.indice).toBe(5);
    });

    it('should return Saturday (Sábado) mapping with Saturno/Capricórnio', () => {
      const result = getDayZodiac('Sábado');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.signo).toBe('Capricórnio');
      expect(result?.elemento).toBe('terra');
      expect(result?.qualidade).toBe('cardinal');
      expect(result?.indice).toBe(6);
    });

    it('should return undefined for invalid day', () => {
      const result = getDayZodiac('Quinta-feira-feira');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getDayZodiac('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDayZodiac('Domingo');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('signo');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('arcano');
    });
  });

  describe('getZodiacByDay', () => {
    it('should return Leão for Domingo', () => {
      expect(getZodiacByDay('Domingo')).toBe('Leão');
    });

    it('should return Câncer for Segunda-feira', () => {
      expect(getZodiacByDay('Segunda-feira')).toBe('Câncer');
    });

    it('should return Áries for Terça-feira', () => {
      expect(getZodiacByDay('Terça-feira')).toBe('Áries');
    });

    it('should return Gêmeos for Quarta-feira', () => {
      expect(getZodiacByDay('Quarta-feira')).toBe('Gêmeos');
    });

    it('should return Sagitário for Quinta-feira', () => {
      expect(getZodiacByDay('Quinta-feira')).toBe('Sagitário');
    });

    it('should return Touro for Sexta-feira', () => {
      expect(getZodiacByDay('Sexta-feira')).toBe('Touro');
    });

    it('should return Capricórnio for Sábado', () => {
      expect(getZodiacByDay('Sábado')).toBe('Capricórnio');
    });

    it('should return undefined for invalid day', () => {
      expect(getZodiacByDay('invalid')).toBeUndefined();
    });
    it('should return undefined for invalid day', () => {
      expect(getZodiacByDay('invalid')).toBeUndefined();
    });
  });
  describe('getZodiacDay', () => {
    it('should return Leão for Domingo', () => {
      expect(getZodiacDay('Domingo')).toBe('Leão');
    });
    it('should return Câncer for Segunda-feira', () => {
      expect(getZodiacDay('Segunda-feira')).toBe('Câncer');
    });
    it('should return Áries for Terça-feira', () => {
      expect(getZodiacDay('Terça-feira')).toBe('Áries');
    });
    it('should return Gêmeos for Quarta-feira', () => {
      expect(getZodiacDay('Quarta-feira')).toBe('Gêmeos');
    });
    it('should return Sagitário for Quinta-feira', () => {
      expect(getZodiacDay('Quinta-feira')).toBe('Sagitário');
    });
    it('should return Touro for Sexta-feira', () => {
      expect(getZodiacDay('Sexta-feira')).toBe('Touro');
    });
    it('should return Capricórnio for Sábado', () => {
      expect(getZodiacDay('Sábado')).toBe('Capricórnio');
    });
    it('should return undefined for invalid day', () => {
      expect(getZodiacDay('invalid')).toBeUndefined();
    });
    it('should be an alias for getZodiacByDay', () => {
      expect(getZodiacDay('Domingo')).toBe(getZodiacByDay('Domingo'));
      expect(getZodiacDay('Quarta-feira')).toBe(getZodiacByDay('Quarta-feira'));
    });
  });
  describe('getDayElement', () => {
    it('should return fogo for Domingo', () => {
      expect(getDayElement('Domingo')).toBe('fogo');
    });

    it('should return água for Segunda-feira', () => {
      expect(getDayElement('Segunda-feira')).toBe('água');
    });

    it('should return fogo for Terça-feira', () => {
      expect(getDayElement('Terça-feira')).toBe('fogo');
    });

    it('should return ar for Quarta-feira', () => {
      expect(getDayElement('Quarta-feira')).toBe('ar');
    });

    it('should return fogo for Quinta-feira', () => {
      expect(getDayElement('Quinta-feira')).toBe('fogo');
    });

    it('should return terra for Sexta-feira', () => {
      expect(getDayElement('Sexta-feira')).toBe('terra');
    });

    it('should return terra for Sábado', () => {
      expect(getDayElement('Sábado')).toBe('terra');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayElement('invalid')).toBeUndefined();
    });
  });

  describe('getAllDays', () => {
    it('should return array of 7 days', () => {
      const days = getAllDays();
      expect(days).toHaveLength(7);
    });

    it('should contain all days in Portuguese', () => {
      const days = getAllDays();
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  describe('getDayPlanet', () => {
    it('should return Sol for Domingo', () => {
      expect(getDayPlanet('Domingo')).toBe('Sol');
    });

    it('should return Lua for Segunda-feira', () => {
      expect(getDayPlanet('Segunda-feira')).toBe('Lua');
    });

    it('should return Marte for Terça-feira', () => {
      expect(getDayPlanet('Terça-feira')).toBe('Marte');
    });

    it('should return Mercurio for Quarta-feira', () => {
      expect(getDayPlanet('Quarta-feira')).toBe('Mercúrio');
    });

    it('should return Júpiter for Quinta-feira', () => {
      expect(getDayPlanet('Quinta-feira')).toBe('Júpiter');
    });

    it('should return Vênus for Sexta-feira', () => {
      expect(getDayPlanet('Sexta-feira')).toBe('Vênus');
    });

    it('should return Saturno for Sábado', () => {
      expect(getDayPlanet('Sábado')).toBe('Saturno');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayPlanet('invalid')).toBeUndefined();
    });
  });

  describe('getDaysBySigno', () => {
    it('should return Domingo for Leão', () => {
      const days = getDaysBySigno('Leão');
      expect(days).toContain('Domingo');
    });

    it('should return Segunda-feira for Câncer', () => {
      const days = getDaysBySigno('Câncer');
      expect(days).toContain('Segunda-feira');
    });

    it('should return array for case-insensitive search', () => {
      const days = getDaysBySigno('leão');
      expect(days).toContain('Domingo');
    });

    it('should return empty array for unknown sign', () => {
      const days = getDaysBySigno('Escorpião');
      expect(days).toHaveLength(0);
    });
  });

  describe('getDaysByElemento', () => {
    it('should return 3 days for fogo element (Domingo, Terça, Quinta)', () => {
      const days = getDaysByElemento('fogo');
      expect(days).toHaveLength(3);
      expect(days).toContain('Domingo');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quinta-feira');
    });

    it('should return 1 day for água element (Segunda-feira)', () => {
      const days = getDaysByElemento('água');
      expect(days).toHaveLength(1);
      expect(days).toContain('Segunda-feira');
    });

    it('should return 1 day for ar element (Quarta-feira)', () => {
      const days = getDaysByElemento('ar');
      expect(days).toHaveLength(1);
      expect(days).toContain('Quarta-feira');
    });

    it('should return 2 days for terra element (Sexta-feira, Sábado)', () => {
      const days = getDaysByElemento('terra');
      expect(days).toHaveLength(2);
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });

    it('should return empty array for unknown element', () => {
      const days = getDaysByElemento('éter');
      expect(days).toHaveLength(0);
    });
  });

  describe('getDaySignificado', () => {
    it('should return spiritual significance for Domingo', () => {
      const significado = getDaySignificado('Domingo');
      expect(significado).toBeDefined();
      expect(significado).toContain('poder pessoal');
    });

    it('should return spiritual significance for Segunda-feira', () => {
      const significado = getDaySignificado('Segunda-feira');
      expect(significado).toBeDefined();
      expect(significado).toContain('introspecção');
    });

    it('should return undefined for invalid day', () => {
      expect(getDaySignificado('invalid')).toBeUndefined();
    });
  });

  describe('getAllDayZodiacs', () => {
    it('should return array of 7 day zodiac mappings', () => {
      const all = getAllDayZodiacs();
      expect(all).toHaveLength(7);
    });

    it('should contain valid DayZodiac objects with all properties', () => {
      const all = getAllDayZodiacs();
      all.forEach(dz => {
        expect(dz).toHaveProperty('dia');
        expect(dz).toHaveProperty('planeta');
        expect(dz).toHaveProperty('signo');
        expect(dz).toHaveProperty('elemento');
        expect(dz).toHaveProperty('significado_espiritual');
        expect(dz).toHaveProperty('qualidade');
        expect(dz).toHaveProperty('cor');
        expect(dz).toHaveProperty('arcano');
      });
    });
  });

  describe('Quality and Arcano Correlations', () => {
    it('should have correct quality values for each day', () => {
      expect(getDayZodiac('Domingo')?.qualidade).toBe('fixed');
      expect(getDayZodiac('Segunda-feira')?.qualidade).toBe('cardinal');
      expect(getDayZodiac('Terça-feira')?.qualidade).toBe('cardinal');
      expect(getDayZodiac('Quarta-feira')?.qualidade).toBe('mutable');
      expect(getDayZodiac('Quinta-feira')?.qualidade).toBe('mutable');
      expect(getDayZodiac('Sexta-feira')?.qualidade).toBe('fixed');
      expect(getDayZodiac('Sábado')?.qualidade).toBe('cardinal');
    });

    it('should have correct arcano values for each day', () => {
      expect(getDayZodiac('Domingo')?.arcano).toBe('O Sol');
      expect(getDayZodiac('Segunda-feira')?.arcano).toBe('A Sacerdotisa');
      expect(getDayZodiac('Terça-feira')?.arcano).toBe('O Carro');
      expect(getDayZodiac('Quarta-feira')?.arcano).toBe('O Mago');
      expect(getDayZodiac('Quinta-feira')?.arcano).toBe('A Fortuna');
      expect(getDayZodiac('Sexta-feira')?.arcano).toBe('O Hierofante');
      expect(getDayZodiac('Sábado')?.arcano).toBe('O Mundo');
    });

    it('should have correct color values for each day', () => {
      expect(getDayZodiac('Domingo')?.cor).toBe('Dourado / Amarelo');
      expect(getDayZodiac('Segunda-feira')?.cor).toBe('Prata / Branco');
      expect(getDayZodiac('Terça-feira')?.cor).toBe('Vermelho / Laranja');
      expect(getDayZodiac('Quarta-feira')?.cor).toBe('Amarelo / Cinzento');
      expect(getDayZodiac('Quinta-feira')?.cor).toBe('Azul / Roxo');
      expect(getDayZodiac('Sexta-feira')?.cor).toBe('Verde / Rosa');
      expect(getDayZodiac('Sábado')?.cor).toBe('Preto / Azul Escuro');
    });
  });
});