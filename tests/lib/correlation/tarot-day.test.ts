import { describe, it, expect } from 'vitest';
import {
  getTarotDay,
  getDayTarot,
  getAllTarotDays,
  getAllArcanos,
  hasTarotDay,
  getArcanoByNumber,
  getDayByNumber,
  getDayByArcano,
  getElementByArcano,
  getSignificadoByArcano,
  getInterpretacaoByArcano,
  getDaysByElemento,
  getArcanosByElemento,
  TAROT_DAY_MAPPINGS,
  type TarotDayMapping,
} from '@/lib/correlation/tarot-day';

describe('tarot-day', () => {
  // ─── getTarotDay: valid arcanos ─────────────────────────────────────────────

  describe('getTarotDay', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotDay('O Sol');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
      expect(result?.numero_carta).toBe(19);
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.significado_espiritual).toBeDefined();
      expect(result?.interpretacao).toBeDefined();
    });

    it('returns mapping for A Sacerdotisa', () => {
      const result = getTarotDay('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.numero_carta).toBe(2);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for O Carro', () => {
      const result = getTarotDay('O Carro');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.numero_carta).toBe(7);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotDay('O Mago');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento_conexao).toBe('Ar');
    });

    it('returns mapping for A Roda da Fortuna', () => {
      const result = getTarotDay('A Roda da Fortuna');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.numero_carta).toBe(10);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotDay('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.numero_carta).toBe(3);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotDay('O Mundo');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sábado');
      expect(result?.numero_carta).toBe(21);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotDay('O Louco')).toBeNull();
      expect(getTarotDay('Enforcado')).toBeNull();
      expect(getTarotDay('inexistente')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotDay('')).toBeNull();
    });
  });

  // ─── getDayTarot ─────────────────────────────────────────────────────────────

  describe('getDayTarot', () => {
    it('returns arcano for Domingo', () => {
      expect(getDayTarot('Domingo')).toBe('O Sol');
    });

    it('returns arcano for Segunda-feira', () => {
      expect(getDayTarot('Segunda-feira')).toBe('A Sacerdotisa');
    });

    it('returns arcano for Terça-feira', () => {
      expect(getDayTarot('Terça-feira')).toBe('O Carro');
    });

    it('returns arcano for Quarta-feira', () => {
      expect(getDayTarot('Quarta-feira')).toBe('O Mago');
    });

    it('returns arcano for Quinta-feira', () => {
      expect(getDayTarot('Quinta-feira')).toBe('A Roda da Fortuna');
    });

    it('returns arcano for Sexta-feira', () => {
      expect(getDayTarot('Sexta-feira')).toBe('A Imperatriz');
    });

    it('returns arcano for Sábado', () => {
      expect(getDayTarot('Sábado')).toBe('O Mundo');
    });

    it('returns null for unknown day', () => {
      expect(getDayTarot('Dia Inválido')).toBeNull();
      expect(getDayTarot('segunda')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getDayTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotDays ───────────────────────────────────────────────────────

  describe('getAllTarotDays', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('returns all expected days', () => {
      const result = getAllTarotDays();
      const days = result.map(m => m.dia);
      expect(days.length).toBe(7);
      expect(days).toContain('Domingo');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sábado');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Terça-feira');
    });

    it('each mapping has required fields', () => {
      const result = getAllTarotDays();
      result.forEach(mapping => {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.dia).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.elemento_conexao).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.interpretacao).toBeDefined();
      });
    });

    it('returns a new array on each call', () => {
      const result1 = getAllTarotDays();
      const result2 = getAllTarotDays();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('contains all arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Sol');
      expect(result).toContain('A Sacerdotisa');
      expect(result).toContain('O Carro');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Roda da Fortuna');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
    });
  });

  // ─── hasTarotDay ─────────────────────────────────────────────────────────────

  describe('hasTarotDay', () => {
    it('returns true for existing arcanos', () => {
      expect(hasTarotDay('O Sol')).toBe(true);
      expect(hasTarotDay('A Sacerdotisa')).toBe(true);
      expect(hasTarotDay('O Mago')).toBe(true);
    });

    it('returns false for non-existing arcanos', () => {
      expect(hasTarotDay('O Louco')).toBe(false);
      expect(hasTarotDay('Enforcado')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotDay('')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns arcano for valid card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns arcano for valid card number 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
    });

    it('returns arcano for valid card number 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });

    it('returns arcano for valid card number 7', () => {
      expect(getArcanoByNumber(7)).toBe('O Carro');
    });

    it('returns arcano for valid card number 10', () => {
      expect(getArcanoByNumber(10)).toBe('A Roda da Fortuna');
    });

    it('returns arcano for valid card number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns arcano for valid card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card numbers', () => {
      expect(getArcanoByNumber(0)).toBeNull();
      expect(getArcanoByNumber(4)).toBeNull();
      expect(getArcanoByNumber(8)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getDayByNumber ─────────────────────────────────────────────────────────

  describe('getDayByNumber', () => {
    it('returns day for valid card number 1', () => {
      expect(getDayByNumber(1)).toBe('Quarta-feira');
    });

    it('returns day for valid card number 2', () => {
      expect(getDayByNumber(2)).toBe('Segunda-feira');
    });

    it('returns day for valid card number 3', () => {
      expect(getDayByNumber(3)).toBe('Sexta-feira');
    });

    it('returns day for valid card number 7', () => {
      expect(getDayByNumber(7)).toBe('Terça-feira');
    });

    it('returns day for valid card number 10', () => {
      expect(getDayByNumber(10)).toBe('Quinta-feira');
    });

    it('returns day for valid card number 19', () => {
      expect(getDayByNumber(19)).toBe('Domingo');
    });

    it('returns day for valid card number 21', () => {
      expect(getDayByNumber(21)).toBe('Sábado');
    });

    it('returns null for invalid card numbers', () => {
      expect(getDayByNumber(0)).toBeNull();
      expect(getDayByNumber(4)).toBeNull();
      expect(getDayByNumber(8)).toBeNull();
      expect(getDayByNumber(22)).toBeNull();
    });
  });

  // ─── getDayByArcano ─────────────────────────────────────────────────────────

  describe('getDayByArcano', () => {
    it('returns day for O Sol', () => {
      expect(getDayByArcano('O Sol')).toBe('Domingo');
    });

    it('returns day for A Sacerdotisa', () => {
      expect(getDayByArcano('A Sacerdotisa')).toBe('Segunda-feira');
    });

    it('returns day for O Carro', () => {
      expect(getDayByArcano('O Carro')).toBe('Terça-feira');
    });

    it('returns day for O Mago', () => {
      expect(getDayByArcano('O Mago')).toBe('Quarta-feira');
    });

    it('returns day for A Roda da Fortuna', () => {
      expect(getDayByArcano('A Roda da Fortuna')).toBe('Quinta-feira');
    });

    it('returns day for A Imperatriz', () => {
      expect(getDayByArcano('A Imperatriz')).toBe('Sexta-feira');
    });

    it('returns day for O Mundo', () => {
      expect(getDayByArcano('O Mundo')).toBe('Sábado');
    });

    it('returns null for unknown arcano', () => {
      expect(getDayByArcano('O Louco')).toBeNull();
    });
  });

  // ─── getElementByArcano ─────────────────────────────────────────────────────

  describe('getElementByArcano', () => {
    it('returns Fogo for O Sol', () => {
      expect(getElementByArcano('O Sol')).toBe('Fogo');
    });

    it('returns Água for A Sacerdotisa', () => {
      expect(getElementByArcano('A Sacerdotisa')).toBe('Água');
    });

    it('returns Fogo for O Carro', () => {
      expect(getElementByArcano('O Carro')).toBe('Fogo');
    });

    it('returns Ar for O Mago', () => {
      expect(getElementByArcano('O Mago')).toBe('Ar');
    });

    it('returns Fogo for A Roda da Fortuna', () => {
      expect(getElementByArcano('A Roda da Fortuna')).toBe('Fogo');
    });

    it('returns Terra for A Imperatriz', () => {
      expect(getElementByArcano('A Imperatriz')).toBe('Terra');
    });

    it('returns Terra for O Mundo', () => {
      expect(getElementByArcano('O Mundo')).toBe('Terra');
    });

    it('returns null for unknown arcano', () => {
      expect(getElementByArcano('O Louco')).toBeNull();
    });
  });

  // ─── getSignificadoByArcano ─────────────────────────────────────────────────

  describe('getSignificadoByArcano', () => {
    it('returns spiritual meaning for O Sol', () => {
      const result = getSignificadoByArcano('O Sol');
      expect(result).toBeDefined();
      expect(result).toContain('Vitalidade');
      expect(result).toContain('poder pessoal');
    });

    it('returns spiritual meaning for A Sacerdotisa', () => {
      const result = getSignificadoByArcano('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result).toContain('Intuição');
      expect(result).toContain('sabedoria');
    });

    it('returns null for unknown arcano', () => {
      expect(getSignificadoByArcano('O Louco')).toBeNull();
    });
  });

  // ─── getInterpretacaoByArcano ───────────────────────────────────────────────

  describe('getInterpretacaoByArcano', () => {
    it('returns interpretation for O Sol', () => {
      const result = getInterpretacaoByArcano('O Sol');
      expect(result).toBeDefined();
      expect(result).toContain('energia pessoal');
      expect(result).toContain('liderança');
    });

    it('returns interpretation for O Mago', () => {
      const result = getInterpretacaoByArcano('O Mago');
      expect(result).toBeDefined();
      expect(result).toContain('manifestar');
      expect(result).toContain('mente');
    });

    it('returns null for unknown arcano', () => {
      expect(getInterpretacaoByArcano('O Louco')).toBeNull();
    });
  });

  // ─── getDaysByElemento ─────────────────────────────────────────────────────

  describe('getDaysByElemento', () => {
    it('returns days for Fogo element', () => {
      const result = getDaysByElemento('Fogo');
      expect(result).toContain('Domingo');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quinta-feira');
    });

    it('returns days for Água element', () => {
      const result = getDaysByElemento('Água');
      expect(result).toContain('Segunda-feira');
    });

    it('returns days for Ar element', () => {
      const result = getDaysByElemento('Ar');
      expect(result).toContain('Quarta-feira');
    });

    it('returns days for Terra element', () => {
      const result = getDaysByElemento('Terra');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });

    it('returns empty array for unknown element', () => {
      expect(getDaysByElemento('Éter')).toEqual([]);
    });
  });

  // ─── getArcanosByElemento ──────────────────────────────────────────────────

  describe('getArcanosByElemento', () => {
    it('returns arcanos for Fogo element', () => {
      const result = getArcanosByElemento('Fogo');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Carro');
      expect(result).toContain('A Roda da Fortuna');
    });

    it('returns arcanos for Água element', () => {
      const result = getArcanosByElemento('Água');
      expect(result).toContain('A Sacerdotisa');
    });

    it('returns arcanos for Ar element', () => {
      const result = getArcanosByElemento('Ar');
      expect(result).toContain('O Mago');
    });

    it('returns arcanos for Terra element', () => {
      const result = getArcanosByElemento('Terra');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
    });

    it('returns empty array for unknown element', () => {
      expect(getArcanosByElemento('Éter')).toEqual([]);
    });
  });

  // ─── TAROT_DAY_MAPPINGS constant ─────────────────────────────────────────────

  describe('TAROT_DAY_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_DAY_MAPPINGS)).toBe(true);
    });

    it('has 7 mappings', () => {
      expect(Object.keys(TAROT_DAY_MAPPINGS).length).toBe(7);
    });

    it('contains all required arcano keys', () => {
      expect('O Sol' in TAROT_DAY_MAPPINGS).toBe(true);
      expect('A Sacerdotisa' in TAROT_DAY_MAPPINGS).toBe(true);
      expect('O Carro' in TAROT_DAY_MAPPINGS).toBe(true);
      expect('O Mago' in TAROT_DAY_MAPPINGS).toBe(true);
      expect('A Roda da Fortuna' in TAROT_DAY_MAPPINGS).toBe(true);
      expect('A Imperatriz' in TAROT_DAY_MAPPINGS).toBe(true);
      expect('O Mundo' in TAROT_DAY_MAPPINGS).toBe(true);
    });

    it('nested objects are frozen', () => {
      for (const mapping of Object.values(TAROT_DAY_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotDayMapping interface completeness', () => {
    it('each mapping has all required interface fields', () => {
      const allMappings = getAllTarotDays();
      for (const mapping of allMappings) {
        expect(mapping.arcano).toBeDefined();
        expect(typeof mapping.arcano).toBe('string');
        expect(mapping.numero_carta).toBeDefined();
        expect(typeof mapping.numero_carta).toBe('number');
        expect(mapping.dia).toBeDefined();
        expect(typeof mapping.dia).toBe('string');
        expect(mapping.elemento_conexao).toBeDefined();
        expect(typeof mapping.elemento_conexao).toBe('string');
        expect(mapping.significado_espiritual).toBeDefined();
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.interpretacao).toBeDefined();
        expect(typeof mapping.interpretacao).toBe('string');
      }
    });

    it('card numbers are within valid range (0-21)', () => {
      const allMappings = getAllTarotDays();
      for (const mapping of allMappings) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('elements are valid types', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra'];
      const allMappings = getAllTarotDays();
      for (const mapping of allMappings) {
        expect(validElements).toContain(mapping.elemento_conexao);
      }
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('maps contain expected element distribution', () => {
      const result = getAllTarotDays();
      const elements = result.map(m => m.elemento_conexao);
      const fogoCount = elements.filter(e => e === 'Fogo').length;
      const aguaCount = elements.filter(e => e === 'Água').length;
      const arCount = elements.filter(e => e === 'Ar').length;
      const terraCount = elements.filter(e => e === 'Terra').length;

      expect(fogoCount).toBe(3); // O Sol, O Carro, A Roda da Fortuna
      expect(aguaCount).toBe(1); // A Sacerdotisa
      expect(arCount).toBe(1);   // O Mago
      expect(terraCount).toBe(2); // A Imperatriz, O Mundo
    });
  });

  // ─── Day-Arcano consistency ─────────────────────────────────────────────────

  describe('Day-Arcano consistency', () => {
    it('getDayTarot and getTarotDay are inverse operations', () => {
      const arcano = 'O Sol';
      const mapping = getTarotDay(arcano);
      expect(mapping).not.toBeNull();
      const arcanoFromDay = getDayTarot(mapping!.dia);
      expect(arcanoFromDay).toBe(arcano);
    });

    it('each day maps to exactly one arcano', () => {
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      for (const day of days) {
        const arcano = getDayTarot(day);
        expect(arcano).toBeDefined();
        const dayFromArcano = getDayByArcano(arcano!);
        expect(dayFromArcano).toBe(day);
      }
    });

    it('getDayByNumber and getArcanoByNumber are consistent', () => {
      const allMappings = getAllTarotDays();
      for (const mapping of allMappings) {
        const dayFromNumber = getDayByNumber(mapping.numero_carta);
        const arcanoFromNumber = getArcanoByNumber(mapping.numero_carta);
        expect(dayFromNumber).toBe(mapping.dia);
        expect(arcanoFromNumber).toBe(mapping.arcano);
      }
    });
  });
});