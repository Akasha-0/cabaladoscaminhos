/**
 * Tarot-Day Correlation Tests
 */
import { describe, it, expect } from 'vitest';
import {
  getTarotDay,
  getDayByArcano,
  getArcanoByDay,
  getCardNumberByArcano,
  getElementByArcano,
  getAllArcanos,
  getPlanetByArcano,
  getArcanosByDay,
  getArcanosByElemento,
  getArcanoSignificado,
  getArcanoMystere,
  getArcanoKeywords,
  getArcanoQuality,
  getArcanoColor,
  getAllTarotDays,
  getArcanoByNumber,
  getDayByNumber,
} from '@/lib/correlation/tarot-day';

describe('Tarot-Day Correlation', () => {
  describe('getTarotDay', () => {
    it('should return tarot day mapping for O Sol', () => {
      const result = getTarotDay('O Sol');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.dia).toBe('Domingo');
      expect(result?.elemento).toBe('fogo');
      expect(result?.planeta).toBe('Sol');
    });

    it('should return tarot day mapping for A Sacerdotisa', () => {
      const result = getTarotDay('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.elemento).toBe('água');
      expect(result?.planeta).toBe('Lua');
    });

    it('should return tarot day mapping for O Carro', () => {
      const result = getTarotDay('O Carro');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Carro');
      expect(result?.numero_carta).toBe(7);
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.elemento).toBe('fogo');
      expect(result?.planeta).toBe('Marte');
    });

    it('should return tarot day mapping for O Mago', () => {
      const result = getTarotDay('O Mago');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.elemento).toBe('ar');
      expect(result?.planeta).toBe('Mercúrio');
    });

    it('should return tarot day mapping for A Roda da Fortuna', () => {
      const result = getTarotDay('A Roda da Fortuna');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Roda da Fortuna');
      expect(result?.numero_carta).toBe(10);
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.elemento).toBe('fogo');
      expect(result?.planeta).toBe('Júpiter');
    });

    it('should return tarot day mapping for A Imperatriz', () => {
      const result = getTarotDay('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.elemento).toBe('terra');
      expect(result?.planeta).toBe('Vênus');
    });

    it('should return tarot day mapping for O Mundo', () => {
      const result = getTarotDay('O Mundo');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.numero_carta).toBe(21);
      expect(result?.dia).toBe('Sábado');
      expect(result?.elemento).toBe('terra');
      expect(result?.planeta).toBe('Saturno');
    });

    it('should return undefined for invalid arcano', () => {
      expect(getTarotDay('O Louco')).toBeUndefined();
      expect(getTarotDay('A Torre')).toBeUndefined();
      expect(getTarotDay('')).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getTarotDay('O Sol');
      expect(result).toHaveProperty('arcano');
      expect(result).toHaveProperty('numero_carta');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('palavras_chave');
      expect(result).toHaveProperty('mystere');
    });

    it('should have valid day indices (0-6)', () => {
      const arcanos = ['O Sol', 'A Sacerdotisa', 'O Carro', 'O Mago', 'A Roda da Fortuna', 'A Imperatriz', 'O Mundo'];
      for (const arcano of arcanos) {
        const result = getTarotDay(arcano);
        expect(result?.indice).toBeGreaterThanOrEqual(0);
        expect(result?.indice).toBeLessThanOrEqual(6);
      }
    });

    it('should have palavras_chave as non-empty array', () => {
      const arcanos = ['O Sol', 'A Sacerdotisa', 'O Carro', 'O Mago', 'A Roda da Fortuna', 'A Imperatriz', 'O Mundo'];
      for (const arcano of arcanos) {
        const result = getTarotDay(arcano);
        expect(result?.palavras_chave).toBeInstanceOf(Array);
        expect(result?.palavras_chave.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getDayByArcano', () => {
    it('should return day name for valid arcanos', () => {
      expect(getDayByArcano('O Sol')).toBe('Domingo');
      expect(getDayByArcano('A Sacerdotisa')).toBe('Segunda-feira');
      expect(getDayByArcano('O Carro')).toBe('Terça-feira');
      expect(getDayByArcano('O Mago')).toBe('Quarta-feira');
      expect(getDayByArcano('A Roda da Fortuna')).toBe('Quinta-feira');
      expect(getDayByArcano('A Imperatriz')).toBe('Sexta-feira');
      expect(getDayByArcano('O Mundo')).toBe('Sábado');
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getDayByArcano('O Louco')).toBeUndefined();
      expect(getDayByArcano('A Torre')).toBeUndefined();
    });
  });

  describe('getArcanoByDay', () => {
    it('should return arcano for valid days', () => {
      expect(getArcanoByDay('Domingo')).toBe('O Sol');
      expect(getArcanoByDay('Segunda-feira')).toBe('A Sacerdotisa');
      expect(getArcanoByDay('Terça-feira')).toBe('O Carro');
      expect(getArcanoByDay('Quarta-feira')).toBe('O Mago');
      expect(getArcanoByDay('Quinta-feira')).toBe('A Roda da Fortuna');
      expect(getArcanoByDay('Sexta-feira')).toBe('A Imperatriz');
      expect(getArcanoByDay('Sábado')).toBe('O Mundo');
    });

    it('should return undefined for invalid days', () => {
      expect(getArcanoByDay('Dia Inválido')).toBeUndefined();
      expect(getArcanoByDay('')).toBeUndefined();
    });
  });

  describe('getCardNumberByArcano', () => {
    it('should return card number for valid arcanos', () => {
      expect(getCardNumberByArcano('O Sol')).toBe(19);
      expect(getCardNumberByArcano('A Sacerdotisa')).toBe(2);
      expect(getCardNumberByArcano('O Carro')).toBe(7);
      expect(getCardNumberByArcano('O Mago')).toBe(1);
      expect(getCardNumberByArcano('A Roda da Fortuna')).toBe(10);
      expect(getCardNumberByArcano('A Imperatriz')).toBe(3);
      expect(getCardNumberByArcano('O Mundo')).toBe(21);
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getCardNumberByArcano('O Louco')).toBeUndefined();
    });
  });

  describe('getElementByArcano', () => {
    it('should return element for valid arcanos', () => {
      expect(getElementByArcano('O Sol')).toBe('fogo');
      expect(getElementByArcano('A Sacerdotisa')).toBe('água');
      expect(getElementByArcano('O Carro')).toBe('fogo');
      expect(getElementByArcano('O Mago')).toBe('ar');
      expect(getElementByArcano('A Roda da Fortuna')).toBe('fogo');
      expect(getElementByArcano('A Imperatriz')).toBe('terra');
      expect(getElementByArcano('O Mundo')).toBe('terra');
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getElementByArcano('O Louco')).toBeUndefined();
    });
  });

  describe('getAllArcanos', () => {
    it('should return all mapped arcanos', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Sol');
      expect(result).toContain('A Sacerdotisa');
      expect(result).toContain('O Carro');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Roda da Fortuna');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
      expect(result.length).toBe(7);
    });

    it('should return arcanos as strings', () => {
      const result = getAllArcanos();
      expect(result.every(a => typeof a === 'string')).toBe(true);
    });
  });

  describe('getPlanetByArcano', () => {
    it('should return planet for valid arcanos', () => {
      expect(getPlanetByArcano('O Sol')).toBe('Sol');
      expect(getPlanetByArcano('A Sacerdotisa')).toBe('Lua');
      expect(getPlanetByArcano('O Carro')).toBe('Marte');
      expect(getPlanetByArcano('O Mago')).toBe('Mercúrio');
      expect(getPlanetByArcano('A Roda da Fortuna')).toBe('Júpiter');
      expect(getPlanetByArcano('A Imperatriz')).toBe('Vênus');
      expect(getPlanetByArcano('O Mundo')).toBe('Saturno');
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getPlanetByArcano('O Louco')).toBeUndefined();
    });
  });

  describe('getArcanosByDay', () => {
    it('should return arcano for valid days', () => {
      expect(getArcanosByDay('Domingo')).toContain('O Sol');
      expect(getArcanosByDay('Segunda-feira')).toContain('A Sacerdotisa');
      expect(getArcanosByDay('Terça-feira')).toContain('O Carro');
      expect(getArcanosByDay('Quarta-feira')).toContain('O Mago');
      expect(getArcanosByDay('Quinta-feira')).toContain('A Roda da Fortuna');
      expect(getArcanosByDay('Sexta-feira')).toContain('A Imperatriz');
      expect(getArcanosByDay('Sábado')).toContain('O Mundo');
    });

    it('should return empty array for invalid days', () => {
      expect(getArcanosByDay('Dia Inválido')).toEqual([]);
    });
  });

  describe('getArcanosByElemento', () => {
    it('should return arcanos for fogo element', () => {
      const result = getArcanosByElemento('fogo');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Carro');
      expect(result).toContain('A Roda da Fortuna');
    });

    it('should return arcanos for água element', () => {
      const result = getArcanosByElemento('água');
      expect(result).toContain('A Sacerdotisa');
    });

    it('should return arcanos for ar element', () => {
      const result = getArcanosByElemento('ar');
      expect(result).toContain('O Mago');
    });

    it('should return arcanos for terra element', () => {
      const result = getArcanosByElemento('terra');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
    });

    it('should return empty array for invalid elements', () => {
      expect(getArcanosByElemento('éter')).toEqual([]);
    });
  });

  describe('getArcanoSignificado', () => {
    it('should return spiritual meaning for valid arcanos', () => {
      const significado = getArcanoSignificado('O Sol');
      expect(significado).toBeDefined();
      expect(typeof significado).toBe('string');
      expect(significado.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getArcanoSignificado('O Louco')).toBeUndefined();
    });
  });

  describe('getArcanoMystere', () => {
    it('should return mystere for valid arcanos', () => {
      const mystere = getArcanoMystere('O Sol');
      expect(mystere).toBeDefined();
      expect(typeof mystere).toBe('string');
      expect(mystere.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getArcanoMystere('O Louco')).toBeUndefined();
    });
  });

  describe('getArcanoKeywords', () => {
    it('should return keywords for valid arcanos', () => {
      const keywords = getArcanoKeywords('O Sol');
      expect(keywords).toBeInstanceOf(Array);
      expect(keywords.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getArcanoKeywords('O Louco')).toBeUndefined();
    });
  });

  describe('getArcanoQuality', () => {
    it('should return quality for valid arcanos', () => {
      expect(getArcanoQuality('O Sol')).toBe('fixed');
      expect(getArcanoQuality('A Sacerdotisa')).toBe('cardinal');
      expect(getArcanoQuality('O Mago')).toBe('mutable');
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getArcanoQuality('O Louco')).toBeUndefined();
    });
  });

  describe('getArcanoColor', () => {
    it('should return color for valid arcanos', () => {
      const color = getArcanoColor('O Sol');
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid arcanos', () => {
      expect(getArcanoColor('O Louco')).toBeUndefined();
    });
  });

  describe('getAllTarotDays', () => {
    it('should return all correlation objects', () => {
      const result = getAllTarotDays();
      expect(result.length).toBe(7);
    });

    it('should have valid structure for each correlation', () => {
      const result = getAllTarotDays();
      for (const item of result) {
        expect(item).toHaveProperty('arcano');
        expect(item).toHaveProperty('numero_carta');
        expect(item).toHaveProperty('dia');
        expect(item).toHaveProperty('elemento');
        expect(item).toHaveProperty('planeta');
      }
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano for valid card numbers', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
      expect(getArcanoByNumber(7)).toBe('O Carro');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(10)).toBe('A Roda da Fortuna');
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return undefined for invalid card numbers', () => {
      expect(getArcanoByNumber(0)).toBeUndefined();
      expect(getArcanoByNumber(4)).toBeUndefined();
      expect(getArcanoByNumber(22)).toBeUndefined();
    });
  });

  describe('getDayByNumber', () => {
    it('should return day for valid card numbers', () => {
      expect(getDayByNumber(19)).toBe('Domingo');
      expect(getDayByNumber(2)).toBe('Segunda-feira');
      expect(getDayByNumber(7)).toBe('Terça-feira');
      expect(getDayByNumber(1)).toBe('Quarta-feira');
      expect(getDayByNumber(10)).toBe('Quinta-feira');
      expect(getDayByNumber(3)).toBe('Sexta-feira');
      expect(getDayByNumber(21)).toBe('Sábado');
    });

    it('should return undefined for invalid card numbers', () => {
      expect(getDayByNumber(0)).toBeUndefined();
      expect(getDayByNumber(4)).toBeUndefined();
      expect(getDayByNumber(22)).toBeUndefined();
    });
  });

  describe('Element Connections', () => {
    it('should have correct element distribution', () => {
      const fogo = getArcanosByElemento('fogo');
      const agua = getArcanosByElemento('água');
      const ar = getArcanosByElemento('ar');
      const terra = getArcanosByElemento('terra');

      expect(fogo.length).toBe(3);
      expect(agua.length).toBe(1);
      expect(ar.length).toBe(1);
      expect(terra.length).toBe(2);
    });
  });

  describe('Quality and Planet Correlations', () => {
    it('should have correct quality distribution', () => {
      const arcanos = getAllArcanos();
      const cardinal = arcanos.filter(a => getArcanoQuality(a) === 'cardinal');
      const fixed = arcanos.filter(a => getArcanoQuality(a) === 'fixed');
      const mutable = arcanos.filter(a => getArcanoQuality(a) === 'mutable');

      expect(cardinal.length).toBe(3);
      expect(fixed.length).toBe(2);
      expect(mutable.length).toBe(2);
    });

    it('should have correct planet distribution', () => {
      const planets = getAllArcanos().map(a => getPlanetByArcano(a));
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Saturno');
    });
  });
});
