/**
 * Day-Tarot Correlation Tests
 */
import { describe, it, expect } from 'vitest';
import {
  getDayTarot,
  getArcanoByDay,
  getTarotDay,
  getCardNumberByDay,
  getElementByDay,
  getAllDays,
  getDayPlanet,
  getDaysByArcano,
  getDaysByElemento,
  getDaySignificado,
  getDayMystere,
  getDayKeywords,
  getDayQuality,
  getDayColor,
  getAllDayTarots,
  getArcanoByNumber,
  getDayByNumber,
} from '@/lib/correlation/day-tarot';

describe('Day-Tarot Correlation', () => {
  describe('getDayTarot', () => {
    it('should return Sunday (Domingo) mapping with O Sol', () => {
      const result = getDayTarot('Domingo');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
    });

    it('should return Monday (Segunda-feira) mapping with A Sacerdotisa', () => {
      const result = getDayTarot('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
    });

    it('should return Tuesday (Terça-feira) mapping with O Carro', () => {
      const result = getDayTarot('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.arcano).toBe('O Carro');
      expect(result?.numero_carta).toBe(7);
    });

    it('should return Wednesday (Quarta-feira) mapping with O Mago', () => {
      const result = getDayTarot('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
    });

    it('should return Thursday (Quinta-feira) mapping with A Roda da Fortuna', () => {
      const result = getDayTarot('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.arcano).toBe('A Roda da Fortuna');
      expect(result?.numero_carta).toBe(10);
    });

    it('should return Friday (Sexta-feira) mapping with A Imperatriz', () => {
      const result = getDayTarot('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
    });

    it('should return Saturday (Sábado) mapping with O Mundo', () => {
      const result = getDayTarot('Sábado');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sábado');
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.numero_carta).toBe(21);
    });

    it('should return undefined for invalid day', () => {
      expect(getDayTarot('InvalidDay')).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(getDayTarot('')).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDayTarot('Domingo');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('arcano');
      expect(result).toHaveProperty('numero_carta');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('palavras_chave');
      expect(result).toHaveProperty('mystere');
    });
  });

  describe('getArcanoByDay', () => {
    it('should return O Sol for Domingo', () => {
      expect(getArcanoByDay('Domingo')).toBe('O Sol');
    });

    it('should return A Sacerdotisa for Segunda-feira', () => {
      expect(getArcanoByDay('Segunda-feira')).toBe('A Sacerdotisa');
    });

    it('should return O Carro for Terça-feira', () => {
      expect(getArcanoByDay('Terça-feira')).toBe('O Carro');
    });

    it('should return O Mago for Quarta-feira', () => {
      expect(getArcanoByDay('Quarta-feira')).toBe('O Mago');
    });

    it('should return A Roda da Fortuna for Quinta-feira', () => {
      expect(getArcanoByDay('Quinta-feira')).toBe('A Roda da Fortuna');
    });

    it('should return A Imperatriz for Sexta-feira', () => {
      expect(getArcanoByDay('Sexta-feira')).toBe('A Imperatriz');
    });

    it('should return O Mundo for Sábado', () => {
      expect(getArcanoByDay('Sábado')).toBe('O Mundo');
    });

    it('should return undefined for invalid day', () => {
      expect(getArcanoByDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getTarotDay', () => {
    it('should return Domingo for O Sol', () => {
      expect(getTarotDay('O Sol')).toBe('Domingo');
    });

    it('should return Segunda-feira for A Sacerdotisa', () => {
      expect(getTarotDay('A Sacerdotisa')).toBe('Segunda-feira');
    });

    it('should return Terça-feira for O Carro', () => {
      expect(getTarotDay('O Carro')).toBe('Terça-feira');
    });

    it('should return Quarta-feira for O Mago', () => {
      expect(getTarotDay('O Mago')).toBe('Quarta-feira');
    });

    it('should return Quinta-feira for A Roda da Fortuna', () => {
      expect(getTarotDay('A Roda da Fortuna')).toBe('Quinta-feira');
    });

    it('should return Sexta-feira for A Imperatriz', () => {
      expect(getTarotDay('A Imperatriz')).toBe('Sexta-feira');
    });

    it('should return Sábado for O Mundo', () => {
      expect(getTarotDay('O Mundo')).toBe('Sábado');
    });

    it('should return undefined for invalid arcano', () => {
      expect(getTarotDay('InvalidArcano')).toBeUndefined();
    });
  });

  describe('getCardNumberByDay', () => {
    it('should return 19 for Domingo', () => {
      expect(getCardNumberByDay('Domingo')).toBe(19);
    });

    it('should return 2 for Segunda-feira', () => {
      expect(getCardNumberByDay('Segunda-feira')).toBe(2);
    });

    it('should return 7 for Terça-feira', () => {
      expect(getCardNumberByDay('Terça-feira')).toBe(7);
    });

    it('should return 1 for Quarta-feira', () => {
      expect(getCardNumberByDay('Quarta-feira')).toBe(1);
    });

    it('should return 10 for Quinta-feira', () => {
      expect(getCardNumberByDay('Quinta-feira')).toBe(10);
    });

    it('should return 3 for Sexta-feira', () => {
      expect(getCardNumberByDay('Sexta-feira')).toBe(3);
    });

    it('should return 21 for Sábado', () => {
      expect(getCardNumberByDay('Sábado')).toBe(21);
    });

    it('should return undefined for invalid day', () => {
      expect(getCardNumberByDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getElementByDay', () => {
    it('should return fogo for Domingo', () => {
      expect(getElementByDay('Domingo')).toBe('fogo');
    });

    it('should return água for Segunda-feira', () => {
      expect(getElementByDay('Segunda-feira')).toBe('água');
    });

    it('should return fogo for Terça-feira', () => {
      expect(getElementByDay('Terça-feira')).toBe('fogo');
    });

    it('should return ar for Quarta-feira', () => {
      expect(getElementByDay('Quarta-feira')).toBe('ar');
    });

    it('should return fogo for Quinta-feira', () => {
      expect(getElementByDay('Quinta-feira')).toBe('fogo');
    });

    it('should return terra for Sexta-feira', () => {
      expect(getElementByDay('Sexta-feira')).toBe('terra');
    });

    it('should return terra for Sábado', () => {
      expect(getElementByDay('Sábado')).toBe('terra');
    });

    it('should return undefined for invalid day', () => {
      expect(getElementByDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getAllDays', () => {
    it('should return array of 7 day names', () => {
      const result = getAllDays();
      expect(result).toHaveLength(7);
    });

    it('should include all Portuguese day names', () => {
      const result = getAllDays();
      expect(result).toContain('Domingo');
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quarta-feira');
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });

    it('should return array in correct order', () => {
      const result = getAllDays();
      expect(result[0]).toBe('Domingo');
      expect(result[1]).toBe('Segunda-feira');
      expect(result[6]).toBe('Sábado');
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

    it('should return Mercúrio for Quarta-feira', () => {
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
      expect(getDayPlanet('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDaysByArcano', () => {
    it('should return [Domingo] for O Sol', () => {
      expect(getDaysByArcano('O Sol')).toEqual(['Domingo']);
    });

    it('should return [Segunda-feira] for A Sacerdotisa', () => {
      expect(getDaysByArcano('A Sacerdotisa')).toEqual(['Segunda-feira']);
    });

    it('should return empty array for invalid arcano', () => {
      expect(getDaysByArcano('InvalidArcano')).toEqual([]);
    });
  });

  describe('getDaysByElemento', () => {
    it('should return days with fogo element', () => {
      const result = getDaysByElemento('fogo');
      expect(result).toContain('Domingo');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quinta-feira');
    });

    it('should return days with água element', () => {
      const result = getDaysByElemento('água');
      expect(result).toContain('Segunda-feira');
    });

    it('should return days with ar element', () => {
      const result = getDaysByElemento('ar');
      expect(result).toContain('Quarta-feira');
    });

    it('should return days with terra element', () => {
      const result = getDaysByElemento('terra');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });

    it('should return empty array for invalid element', () => {
      expect(getDaysByElemento('invalid')).toEqual([]);
    });
  });

  describe('getDaySignificado', () => {
    it('should return spiritual meaning for Domingo', () => {
      const result = getDaySignificado('Domingo');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('vital');
    });

    it('should return spiritual meaning for Segunda-feira', () => {
      const result = getDaySignificado('Segunda-feira');
      expect(result).toBeDefined();
      expect(result).toContain('introspecção');
    });

    it('should return undefined for invalid day', () => {
      expect(getDaySignificado('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDayMystere', () => {
    it('should return mystere for Domingo', () => {
      const result = getDayMystere('Domingo');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayMystere('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDayKeywords', () => {
    it('should return keywords array for Domingo', () => {
      const result = getDayKeywords('Domingo');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('vitalidade');
      expect(result).toContain('brilho');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayKeywords('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDayQuality', () => {
    it('should return fixed for Domingo', () => {
      expect(getDayQuality('Domingo')).toBe('fixed');
    });

    it('should return cardinal for Segunda-feira', () => {
      expect(getDayQuality('Segunda-feira')).toBe('cardinal');
    });

    it('should return mutable for Quarta-feira', () => {
      expect(getDayQuality('Quarta-feira')).toBe('mutable');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayQuality('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDayColor', () => {
    it('should return color for Domingo', () => {
      const result = getDayColor('Domingo');
      expect(result).toBeDefined();
      expect(result).toContain('Dourado');
    });

    it('should return color for Segunda-feira', () => {
      const result = getDayColor('Segunda-feira');
      expect(result).toBeDefined();
      expect(result).toContain('Prata');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayColor('InvalidDay')).toBeUndefined();
    });
  });

  describe('getAllDayTarots', () => {
    it('should return array of 7 DayTarot objects', () => {
      const result = getAllDayTarots();
      expect(result).toHaveLength(7);
    });

    it('should include all required properties for each entry', () => {
      const result = getAllDayTarots();
      result.forEach((item) => {
        expect(item).toHaveProperty('dia');
        expect(item).toHaveProperty('indice');
        expect(item).toHaveProperty('arcano');
        expect(item).toHaveProperty('numero_carta');
        expect(item).toHaveProperty('elemento');
      });
    });

    it('should have correct arcano for each day', () => {
      const result = getAllDayTarots();
      const domingo = result.find((r) => r.dia === 'Domingo');
      expect(domingo?.arcano).toBe('O Sol');
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Sol for 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return A Sacerdotisa for 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
    });

    it('should return undefined for invalid number', () => {
      expect(getArcanoByNumber(99)).toBeUndefined();
    });
  });

  describe('getDayByNumber', () => {
    it('should return Domingo for 19', () => {
      expect(getDayByNumber(19)).toBe('Domingo');
    });

    it('should return Segunda-feira for 2', () => {
      expect(getDayByNumber(2)).toBe('Segunda-feira');
    });

    it('should return undefined for invalid number', () => {
      expect(getDayByNumber(99)).toBeUndefined();
    });
  });

  describe('Element Connections', () => {
    it('should have fogo days (Domingo, Terça-feira, Quinta-feira)', () => {
      const fogoDays = getDaysByElemento('fogo');
      expect(fogoDays).toHaveLength(3);
    });

    it('should have água day (Segunda-feira)', () => {
      const aguaDays = getDaysByElemento('água');
      expect(aguaDays).toHaveLength(1);
    });

    it('should have ar day (Quarta-feira)', () => {
      const arDays = getDaysByElemento('ar');
      expect(arDays).toHaveLength(1);
    });

    it('should have terra days (Sexta-feira, Sábado)', () => {
      const terraDays = getDaysByElemento('terra');
      expect(terraDays).toHaveLength(2);
    });
  });

  describe('Quality and Planet Correlations', () => {
    it('should have correct quality values for each day', () => {
      expect(getDayQuality('Domingo')).toBe('fixed');
      expect(getDayQuality('Segunda-feira')).toBe('cardinal');
      expect(getDayQuality('Terça-feira')).toBe('cardinal');
      expect(getDayQuality('Quarta-feira')).toBe('mutable');
      expect(getDayQuality('Quinta-feira')).toBe('mutable');
      expect(getDayQuality('Sexta-feira')).toBe('fixed');
      expect(getDayQuality('Sábado')).toBe('cardinal');
    });

    it('should have correct planet correlations', () => {
      expect(getDayPlanet('Domingo')).toBe('Sol');
      expect(getDayPlanet('Segunda-feira')).toBe('Lua');
      expect(getDayPlanet('Terça-feira')).toBe('Marte');
      expect(getDayPlanet('Quarta-feira')).toBe('Mercúrio');
      expect(getDayPlanet('Quinta-feira')).toBe('Júpiter');
      expect(getDayPlanet('Sexta-feira')).toBe('Vênus');
      expect(getDayPlanet('Sábado')).toBe('Saturno');
    });
  });
});