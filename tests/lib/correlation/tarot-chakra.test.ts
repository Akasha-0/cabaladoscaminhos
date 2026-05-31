import { describe, it, expect } from 'vitest';
import {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  getArcanoByNumber,
  getChakraByNumber,
  getChakraNumeroByArcano,
  getElementByArcano,
  TAROT_CHAKRA_MAPPINGS,
  type TarotChakraMapping,
} from '@/lib/correlation/tarot-chakra';

describe('tarot-chakra', () => {
  // ─── getTarotChakra: valid arcanos ─────────────────────────────────────────

  describe('getTarotChakra', () => {
    it('returns mapping for O Louco (0) - Sahasrara', () => {
      const result = getTarotChakra('O Louco');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_pt).toBe('7º Coronário');
      expect(result?.numero_carta).toBe(0);
      expect(result?.numero_chakra).toBe(7);
      expect(result?.elemento_conexao).toBe('Éter');
      expect(result?.significado_espiritual).toBeDefined();
    });

    it('returns mapping for O Mago (1) - Muladhara', () => {
      const result = getTarotChakra('O Mago');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_pt).toBe('1º Básico');
      expect(result?.numero_carta).toBe(1);
      expect(result?.numero_chakra).toBe(1);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns mapping for A Sacerdotisa (2) - Ajna', () => {
      const result = getTarotChakra('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_pt).toBe('6º Frontal');
      expect(result?.numero_carta).toBe(2);
      expect(result?.numero_chakra).toBe(6);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for A Imperatriz (3) - Anahata', () => {
      const result = getTarotChakra('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_pt).toBe('4º Cardíaco');
      expect(result?.numero_carta).toBe(3);
      expect(result?.numero_chakra).toBe(4);
      expect(result?.elemento_conexao).toBe('Ar');
    });

    it('returns mapping for O Imperador (4) - Manipura', () => {
      const result = getTarotChakra('O Imperador');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_pt).toBe('3º Plexo Solar');
      expect(result?.numero_carta).toBe(4);
      expect(result?.numero_chakra).toBe(3);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for O Hierofante (5) - Vishuddha', () => {
      const result = getTarotChakra('O Hierofante');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_pt).toBe('5º Laríngeo');
      expect(result?.numero_carta).toBe(5);
      expect(result?.numero_chakra).toBe(5);
      expect(result?.elemento_conexao).toBe('Éter');
    });

    it('returns mapping for O Enamorado (6) - Anahata', () => {
      const result = getTarotChakra('O Enamorado');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.numero_carta).toBe(6);
      expect(result?.numero_chakra).toBe(4);
    });

    it('returns mapping for O Carro (7) - Vishuddha', () => {
      const result = getTarotChakra('O Carro');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.numero_carta).toBe(7);
      expect(result?.numero_chakra).toBe(5);
    });

    it('returns mapping for A Justiça (8) - Svadhisthana', () => {
      const result = getTarotChakra('A Justiça');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.numero_carta).toBe(8);
      expect(result?.numero_chakra).toBe(2);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for O Eremita (9) - Ajna', () => {
      const result = getTarotChakra('O Eremita');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.numero_carta).toBe(9);
      expect(result?.numero_chakra).toBe(6);
    });

    it('returns mapping for A Roda da Fortuna (10) - Manipura', () => {
      const result = getTarotChakra('A Roda da Fortuna');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.numero_carta).toBe(10);
      expect(result?.numero_chakra).toBe(3);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for A Força (11) - Muladhara', () => {
      const result = getTarotChakra('A Força');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.numero_carta).toBe(11);
      expect(result?.numero_chakra).toBe(1);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for O Enforcado (12) - Ajna', () => {
      const result = getTarotChakra('O Enforcado');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.numero_carta).toBe(12);
      expect(result?.numero_chakra).toBe(6);
    });

    it('returns mapping for A Morte (13) - Svadhisthana', () => {
      const result = getTarotChakra('A Morte');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.numero_carta).toBe(13);
      expect(result?.numero_chakra).toBe(2);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for A Temperança (14) - Sahasrara', () => {
      const result = getTarotChakra('A Temperança');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.numero_carta).toBe(14);
      expect(result?.numero_chakra).toBe(7);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for O Diabo (15) - Muladhara', () => {
      const result = getTarotChakra('O Diabo');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.numero_carta).toBe(15);
      expect(result?.numero_chakra).toBe(1);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns mapping for A Torre (16) - Svadhisthana', () => {
      const result = getTarotChakra('A Torre');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.numero_carta).toBe(16);
      expect(result?.numero_chakra).toBe(2);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for A Estrela (17) - Anahata', () => {
      const result = getTarotChakra('A Estrela');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.numero_carta).toBe(17);
      expect(result?.numero_chakra).toBe(4);
      expect(result?.elemento_conexao).toBe('Ar');
    });

    it('returns mapping for A Lua (18) - Svadhisthana', () => {
      const result = getTarotChakra('A Lua');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.numero_carta).toBe(18);
      expect(result?.numero_chakra).toBe(2);
      expect(result?.elemento_conexao).toBe('Água');
    });

    it('returns mapping for O Sol (19) - Manipura', () => {
      const result = getTarotChakra('O Sol');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.numero_carta).toBe(19);
      expect(result?.numero_chakra).toBe(3);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for O Julgamento (20) - Sahasrara', () => {
      const result = getTarotChakra('O Julgamento');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.numero_carta).toBe(20);
      expect(result?.numero_chakra).toBe(7);
      expect(result?.elemento_conexao).toBe('Fogo');
    });

    it('returns mapping for O Mundo (21) - Sahasrara', () => {
      const result = getTarotChakra('O Mundo');
      expect(result).toBeDefined();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.numero_carta).toBe(21);
      expect(result?.numero_chakra).toBe(7);
      expect(result?.elemento_conexao).toBe('Terra');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotChakra('Inexistente')).toBeNull();
      expect(getTarotChakra('Carta Fantasma')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotChakra('')).toBeNull();
    });
  });

  // ─── getChakraTarot ─────────────────────────────────────────────────────────

  describe('getChakraTarot', () => {
    it('returns arcano for Sahasrara (7º Coronário)', () => {
      expect(getChakraTarot('Sahasrara')).toBe('O Louco');
      expect(getChakraTarot('7º Coronário')).toBe('O Louco');
      expect(getChakraTarot('7')).toBe('O Louco');
    });

    it('returns arcano for Muladhara (1º Básico)', () => {
      expect(getChakraTarot('Muladhara')).toBe('O Mago');
      expect(getChakraTarot('1º Básico')).toBe('O Mago');
      expect(getChakraTarot('1')).toBe('O Mago');
    });

    it('returns arcano for Ajna (6º Frontal)', () => {
      expect(getChakraTarot('Ajna')).toBe('A Sacerdotisa');
      expect(getChakraTarot('6º Frontal')).toBe('A Sacerdotisa');
      expect(getChakraTarot('6')).toBe('A Sacerdotisa');
    });

    it('returns arcano for Anahata (4º Cardíaco)', () => {
      expect(getChakraTarot('Anahata')).toBe('A Imperatriz');
      expect(getChakraTarot('4º Cardíaco')).toBe('A Imperatriz');
      expect(getChakraTarot('4')).toBe('A Imperatriz');
    });

    it('returns arcano for Manipura (3º Plexo Solar)', () => {
      expect(getChakraTarot('Manipura')).toBe('O Imperador');
      expect(getChakraTarot('3º Plexo Solar')).toBe('O Imperador');
      expect(getChakraTarot('3')).toBe('O Imperador');
    });

    it('returns arcano for Vishuddha (5º Laríngeo)', () => {
      expect(getChakraTarot('Vishuddha')).toBe('O Hierofante');
      expect(getChakraTarot('5º Laríngeo')).toBe('O Hierofante');
      expect(getChakraTarot('5')).toBe('O Hierofante');
    });

    it('returns arcano for Svadhisthana (2º Sacro)', () => {
      expect(getChakraTarot('Svadhisthana')).toBe('A Justiça');
      expect(getChakraTarot('2º Sacro')).toBe('A Justiça');
      expect(getChakraTarot('2')).toBe('A Justiça');
    });

    it('returns null for unknown chakra', () => {
      expect(getChakraTarot('Chakra Inexistente')).toBeNull();
      expect(getChakraTarot('8')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getChakraTarot('')).toBeNull();
    });

    it('handles case-insensitive input', () => {
      expect(getChakraTarot('sahasrara')).toBe('O Louco');
      expect(getChakraTarot('MULADHARA')).toBe('O Mago');
      expect(getChakraTarot('aJnA')).toBe('A Sacerdotisa');
    });
  });

  // ─── getAllTarotChakras ─────────────────────────────────────────────────────

  describe('getAllTarotChakras', () => {
    it('returns array of all 22 mappings', () => {
      const result = getAllTarotChakras();
      expect(result).toHaveLength(22);
    });

    it('returns sorted by card number (0-21)', () => {
      const result = getAllTarotChakras();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero_carta).toBeLessThan(result[i + 1].numero_carta);
      }
    });

    it('contains O Louco (0) first', () => {
      const result = getAllTarotChakras();
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
    });

    it('contains O Mundo (21) last', () => {
      const result = getAllTarotChakras();
      expect(result[result.length - 1].arcano).toBe('O Mundo');
      expect(result[result.length - 1].numero_carta).toBe(21);
    });

    it('every mapping has all required fields', () => {
      const result = getAllTarotChakras();
      result.forEach(mapping => {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_pt).toBeDefined();
        expect(mapping.numero_chakra).toBeDefined();
        expect(mapping.elemento_conexao).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
      });
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of all 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(22);
    });

    it('contains O Louco', () => {
      expect(getAllArcanos()).toContain('O Louco');
    });

    it('contains O Mago', () => {
      expect(getAllArcanos()).toContain('O Mago');
    });

    it('contains O Mundo', () => {
      expect(getAllArcanos()).toContain('O Mundo');
    });

    it('does not contain duplicates', () => {
      const result = getAllArcanos();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── hasTarotChakra ─────────────────────────────────────────────────────────

  describe('hasTarotChakra', () => {
    it('returns true for O Louco', () => {
      expect(hasTarotChakra('O Louco')).toBe(true);
    });

    it('returns true for O Mago', () => {
      expect(hasTarotChakra('O Mago')).toBe(true);
    });

    it('returns true for O Mundo', () => {
      expect(hasTarotChakra('O Mundo')).toBe(true);
    });

    it('returns false for unknown arcano', () => {
      expect(hasTarotChakra('Inexistente')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotChakra('')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for card number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns A Sacerdotisa for card number 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
    });

    it('returns O Mundo for card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for out of range number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  // ─── getChakraByNumber ──────────────────────────────────────────────────────

  describe('getChakraByNumber', () => {
    it('returns Sahasrara for card number 0', () => {
      expect(getChakraByNumber(0)).toBe('Sahasrara');
    });

    it('returns Muladhara for card number 1', () => {
      expect(getChakraByNumber(1)).toBe('Muladhara');
    });

    it('returns Ajna for card number 2', () => {
      expect(getChakraByNumber(2)).toBe('Ajna');
    });

    it('returns Sahasrara for card number 21', () => {
      expect(getChakraByNumber(21)).toBe('Sahasrara');
    });

    it('returns null for out of range number', () => {
      expect(getChakraByNumber(-1)).toBeNull();
      expect(getChakraByNumber(22)).toBeNull();
    });
  });

  // ─── getChakraNumeroByArcano ─────────────────────────────────────────────────

  describe('getChakraNumeroByArcano', () => {
    it('returns 7 for O Louco (Sahasrara)', () => {
      expect(getChakraNumeroByArcano('O Louco')).toBe(7);
    });

    it('returns 1 for O Mago (Muladhara)', () => {
      expect(getChakraNumeroByArcano('O Mago')).toBe(1);
    });

    it('returns 6 for A Sacerdotisa (Ajna)', () => {
      expect(getChakraNumeroByArcano('A Sacerdotisa')).toBe(6);
    });

    it('returns 4 for A Imperatriz (Anahata)', () => {
      expect(getChakraNumeroByArcano('A Imperatriz')).toBe(4);
    });

    it('returns 3 for O Imperador (Manipura)', () => {
      expect(getChakraNumeroByArcano('O Imperador')).toBe(3);
    });

    it('returns 5 for O Hierofante (Vishuddha)', () => {
      expect(getChakraNumeroByArcano('O Hierofante')).toBe(5);
    });

    it('returns 2 for A Justiça (Svadhisthana)', () => {
      expect(getChakraNumeroByArcano('A Justiça')).toBe(2);
    });

    it('returns null for unknown arcano', () => {
      expect(getChakraNumeroByArcano('Inexistente')).toBeNull();
    });
  });

  // ─── getElementByArcano ─────────────────────────────────────────────────────

  describe('getElementByArcano', () => {
    it('returns Éter for O Louco', () => {
      expect(getElementByArcano('O Louco')).toBe('Éter');
    });

    it('returns Terra for O Mago', () => {
      expect(getElementByArcano('O Mago')).toBe('Terra');
    });

    it('returns Água for A Sacerdotisa', () => {
      expect(getElementByArcano('A Sacerdotisa')).toBe('Água');
    });

    it('returns Ar for A Imperatriz', () => {
      expect(getElementByArcano('A Imperatriz')).toBe('Ar');
    });

    it('returns Fogo for O Imperador', () => {
      expect(getElementByArcano('O Imperador')).toBe('Fogo');
    });

    it('returns Éter for O Hierofante', () => {
      expect(getElementByArcano('O Hierofante')).toBe('Éter');
    });

    it('returns Água for A Justiça', () => {
      expect(getElementByArcano('A Justiça')).toBe('Água');
    });

    it('returns null for unknown arcano', () => {
      expect(getElementByArcano('Inexistente')).toBeNull();
    });
  });

  // ─── TAROT_CHAKRA_MAPPINGS constant ─────────────────────────────────────────

  describe('TAROT_CHAKRA_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_CHAKRA_MAPPINGS)).toBe(true);
    });

    it('contains 22 mappings', () => {
      expect(Object.keys(TAROT_CHAKRA_MAPPINGS)).toHaveLength(22);
    });

    it('has O Louco as first key', () => {
      const keys = Object.keys(TAROT_CHAKRA_MAPPINGS);
      expect(keys[0]).toBe('O Louco');
    });

    it('has O Mundo as last key', () => {
      const keys = Object.keys(TAROT_CHAKRA_MAPPINGS);
      expect(keys[keys.length - 1]).toBe('O Mundo');
    });

    it('each mapping is a frozen object', () => {
      Object.values(TAROT_CHAKRA_MAPPINGS).forEach(mapping => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });
  });

  // ─── TarotChakraMapping interface completeness ──────────────────────────────

  describe('TarotChakraMapping interface completeness', () => {
    it('has all required fields for O Louco', () => {
      const mapping = TAROT_CHAKRA_MAPPINGS['O Louco'];
      expect(mapping.arcano).toBe('O Louco');
      expect(mapping.numero_carta).toBe(0);
      expect(mapping.chakra).toBe('Sahasrara');
      expect(mapping.chakra_pt).toBe('7º Coronário');
      expect(mapping.numero_chakra).toBe(7);
      expect(mapping.elemento_conexao).toBe('Éter');
      expect(mapping.significado_espiritual).toBeDefined();
    });

    it('has all required fields for O Mago', () => {
      const mapping = TAROT_CHAKRA_MAPPINGS['O Mago'];
      expect(mapping.arcano).toBe('O Mago');
      expect(mapping.numero_carta).toBe(1);
      expect(mapping.chakra).toBe('Muladhara');
      expect(mapping.chakra_pt).toBe('1º Básico');
      expect(mapping.numero_chakra).toBe(1);
      expect(mapping.elemento_conexao).toBe('Terra');
      expect(mapping.significado_espiritual).toBeDefined();
    });

    it('has all required fields for O Mundo', () => {
      const mapping = TAROT_CHAKRA_MAPPINGS['O Mundo'];
      expect(mapping.arcano).toBe('O Mundo');
      expect(mapping.numero_carta).toBe(21);
      expect(mapping.chakra).toBe('Sahasrara');
      expect(mapping.chakra_pt).toBe('7º Coronário');
      expect(mapping.numero_chakra).toBe(7);
      expect(mapping.elemento_conexao).toBe('Terra');
      expect(mapping.significado_espiritual).toBeDefined();
    });
  });

  // ─── Chakra coverage ───────────────────────────────────────────────────────

  describe('chakra coverage', () => {
    it('covers all 7 chakras', () => {
      const chakras = new Set<string>();
      Object.values(TAROT_CHAKRA_MAPPINGS).forEach(mapping => {
        chakras.add(mapping.chakra);
      });
      expect(chakras.size).toBe(7);
    });

    it('includes Muladhara (1º Básico)', () => {
      const hasMuladhara = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Muladhara'
      );
      expect(hasMuladhara).toBe(true);
    });

    it('includes Svadhisthana (2º Sacro)', () => {
      const hasSvadhisthana = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Svadhisthana'
      );
      expect(hasSvadhisthana).toBe(true);
    });

    it('includes Manipura (3º Plexo Solar)', () => {
      const hasManipura = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Manipura'
      );
      expect(hasManipura).toBe(true);
    });

    it('includes Anahata (4º Cardíaco)', () => {
      const hasAnahata = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Anahata'
      );
      expect(hasAnahata).toBe(true);
    });

    it('includes Vishuddha (5º Laríngeo)', () => {
      const hasVishuddha = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Vishuddha'
      );
      expect(hasVishuddha).toBe(true);
    });

    it('includes Ajna (6º Frontal)', () => {
      const hasAjna = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Ajna'
      );
      expect(hasAjna).toBe(true);
    });

    it('includes Sahasrara (7º Coronário)', () => {
      const hasSahasrara = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.chakra === 'Sahasrara'
      );
      expect(hasSahasrara).toBe(true);
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('element distribution', () => {
    it('contains Fogo element', () => {
      const hasFogo = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.elemento_conexao === 'Fogo'
      );
      expect(hasFogo).toBe(true);
    });

    it('contains Água element', () => {
      const hasAgua = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.elemento_conexao === 'Água'
      );
      expect(hasAgua).toBe(true);
    });

    it('contains Ar element', () => {
      const hasAr = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.elemento_conexao === 'Ar'
      );
      expect(hasAr).toBe(true);
    });

    it('contains Terra element', () => {
      const hasTerra = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.elemento_conexao === 'Terra'
      );
      expect(hasTerra).toBe(true);
    });

    it('contains Éter element', () => {
      const hasEter = Object.values(TAROT_CHAKRA_MAPPINGS).some(
        m => m.elemento_conexao === 'Éter'
      );
      expect(hasEter).toBe(true);
    });
  });

  // ─── Arcano-Chakra consistency ─────────────────────────────────────────────

  describe('arcano-chakra consistency', () => {
    it('O Louco maps to Sahasrara (coronário)', () => {
      const mapping = getTarotChakra('O Louco');
      expect(mapping?.chakra).toBe('Sahasrara');
      expect(mapping?.numero_chakra).toBe(7);
    });

    it('O Mago maps to Muladhara (básico)', () => {
      const mapping = getTarotChakra('O Mago');
      expect(mapping?.chakra).toBe('Muladhara');
      expect(mapping?.numero_chakra).toBe(1);
    });

    it('A Sacerdotisa maps to Ajna (frontal)', () => {
      const mapping = getTarotChakra('A Sacerdotisa');
      expect(mapping?.chakra).toBe('Ajna');
      expect(mapping?.numero_chakra).toBe(6);
    });

    it('A Imperatriz maps to Anahata (cardíaco)', () => {
      const mapping = getTarotChakra('A Imperatriz');
      expect(mapping?.chakra).toBe('Anahata');
      expect(mapping?.numero_chakra).toBe(4);
    });

    it('O Imperador maps to Manipura (plexo solar)', () => {
      const mapping = getTarotChakra('O Imperador');
      expect(mapping?.chakra).toBe('Manipura');
      expect(mapping?.numero_chakra).toBe(3);
    });

    it('O Hierofante maps to Vishuddha (laríngeo)', () => {
      const mapping = getTarotChakra('O Hierofante');
      expect(mapping?.chakra).toBe('Vishuddha');
      expect(mapping?.numero_chakra).toBe(5);
    });

    it('A Justiça maps to Svadhisthana (sacro)', () => {
      const mapping = getTarotChakra('A Justiça');
      expect(mapping?.chakra).toBe('Svadhisthana');
      expect(mapping?.numero_chakra).toBe(2);
    });

    it('O Mundo maps to Sahasrara (coronário)', () => {
      const mapping = getTarotChakra('O Mundo');
      expect(mapping?.chakra).toBe('Sahasrara');
      expect(mapping?.numero_chakra).toBe(7);
    });
  });

  // ─── Reverse mapping consistency ───────────────────────────────────────────

  describe('reverse mapping consistency', () => {
    it('Sahasrara returns first arcano (O Louco)', () => {
      const arcano = getChakraTarot('Sahasrara');
      expect(arcano).toBe('O Louco');
    });

    it('Muladhara returns O Mago', () => {
      const arcano = getChakraTarot('Muladhara');
      expect(arcano).toBe('O Mago');
    });

    it('Ajna returns A Sacerdotisa', () => {
      const arcano = getChakraTarot('Ajna');
      expect(arcano).toBe('A Sacerdotisa');
    });

    it('Anahata returns A Imperatriz', () => {
      const arcano = getChakraTarot('Anahata');
      expect(arcano).toBe('A Imperatriz');
    });

    it('Manipura returns O Imperador', () => {
      const arcano = getChakraTarot('Manipura');
      expect(arcano).toBe('O Imperador');
    });

    it('Vishuddha returns O Hierofante', () => {
      const arcano = getChakraTarot('Vishuddha');
      expect(arcano).toBe('O Hierofante');
    });

    it('Svadhisthana returns A Justiça', () => {
      const arcano = getChakraTarot('Svadhisthana');
      expect(arcano).toBe('A Justiça');
    });
  });
});