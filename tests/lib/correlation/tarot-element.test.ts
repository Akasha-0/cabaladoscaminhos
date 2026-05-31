/**
 * Tests for Tarot-Element Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and elements
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotElement,
  getElementFromArcano,
  getArcanoByElement,
  getAllTarotElements,
  getAllArcanos,
  getAllElements,
  getSignificadoFromArcano,
  getOrixaFromArcano,
  getSephirahFromArcano,
  getChakraFromArcano,
  getNumeroCartaFromArcano,
  hasTarotElement,
  getArcanoByNumero,
  TAROT_ELEMENT_MAP,
  TODOS_ARCANOS,
  type TarotElementMapping,
  type Elemento,
} from '@/lib/correlation/tarot-element';

describe('tarot-element', () => {
  // ─── getTarotElement: valid arcano names ─────────────────────────────────────

  describe('getTarotElement', () => {
    it('returns mapping for "O Sol"', () => {
      const result = getTarotElement('O Sol');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for "A Lua"', () => {
      const result = getTarotElement('A Lua');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.numero_carta).toBe(18);
      expect(result?.elemento).toBe('Água');
    });

    it('returns mapping for "O Mago"', () => {
      const result = getTarotElement('O Mago');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for "A Imperatriz"', () => {
      const result = getTarotElement('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
      expect(result?.elemento).toBe('Terra');
    });

    it('returns mapping for "O Louco"', () => {
      const result = getTarotElement('O Louco');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
      expect(result?.elemento).toBe('Éter');
    });

    it('returns mapping for "O Mundo"', () => {
      const result = getTarotElement('O Mundo');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.numero_carta).toBe(21);
      expect(result?.elemento).toBe('Éter');
    });

    it('returns mapping for "A Morte"', () => {
      const result = getTarotElement('A Morte');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Morte');
      expect(result?.numero_carta).toBe(13);
      expect(result?.elemento).toBe('Água');
    });

    it('returns mapping for "A Torre"', () => {
      const result = getTarotElement('A Torre');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Torre');
      expect(result?.numero_carta).toBe(16);
      expect(result?.elemento).toBe('Fogo');
    });

    // ─── Case-insensitive lookup ───────────────────────────────────────────────

    it('handles lowercase input', () => {
      const result = getTarotElement('o sol');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
    });

    it('handles mixed case input', () => {
      const result = getTarotElement('O SOL');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
    });

    it('handles trimmed input', () => {
      const result = getTarotElement('  O Sol  ');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
    });

    // ─── Alternative names ──────────────────────────────────────────────────────

    it('resolves "hierofante" to "O Papa"', () => {
      const result = getTarotElement('hierofante');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Papa');
    });

    it('resolves "amante" to "O Enamorado"', () => {
      const result = getTarotElement('amante');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Enamorado');
    });

    it('resolves "juízo" to "O Julgamento"', () => {
      const result = getTarotElement('juízo');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Julgamento');
    });

    // ─── Invalid input ──────────────────────────────────────────────────────────

    it('returns null for unknown arcano', () => {
      const result = getTarotElement('Unknown Card');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getTarotElement('');
      expect(result).toBeNull();
    });

    it('returns null for whitespace only', () => {
      const result = getTarotElement('   ');
      expect(result).toBeNull();
    });
  });

  // ─── getElementFromArcano ────────────────────────────────────────────────────

  describe('getElementFromArcano', () => {
    it('returns "Fogo" for "O Sol"', () => {
      expect(getElementFromArcano('O Sol')).toBe('Fogo');
    });

    it('returns "Água" for "A Lua"', () => {
      expect(getElementFromArcano('A Lua')).toBe('Água');
    });

    it('returns "Ar" for "O Mago"', () => {
      expect(getElementFromArcano('O Mago')).toBe('Ar');
    });

    it('returns "Terra" for "A Imperatriz"', () => {
      expect(getElementFromArcano('A Imperatriz')).toBe('Terra');
    });

    it('returns "Éter" for "O Louco"', () => {
      expect(getElementFromArcano('O Louco')).toBe('Éter');
    });

    it('returns null for unknown arcano', () => {
      expect(getElementFromArcano('Unknown')).toBeNull();
    });
  });

  // ─── getArcanoByElement ──────────────────────────────────────────────────────

  describe('getArcanoByElement', () => {
    it('returns all Fogo arcano', () => {
      const result = getArcanoByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'Fogo')).toBe(true);
    });

    it('returns all Água arcano', () => {
      const result = getArcanoByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'Água')).toBe(true);
    });

    it('returns all Ar arcano', () => {
      const result = getArcanoByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'Ar')).toBe(true);
    });

    it('returns all Terra arcano', () => {
      const result = getArcanoByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'Terra')).toBe(true);
    });

    it('returns all Éter arcano', () => {
      const result = getArcanoByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'Éter')).toBe(true);
    });

    it('handles lowercase element input', () => {
      const result = getArcanoByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown element', () => {
      const result = getArcanoByElement('UnknownElement');
      expect(result).toEqual([]);
    });
  });

  // ─── getAllTarotElements ──────────────────────────────────────────────────────

  describe('getAllTarotElements', () => {
    it('returns all 22 arcano mappings', () => {
      const result = getAllTarotElements();
      expect(result.length).toBe(22);
    });

    it('returns mappings sorted by card number', () => {
      const result = getAllTarotElements();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_carta).toBeGreaterThan(result[i - 1].numero_carta);
      }
    });

    it('includes all required fields', () => {
      const result = getAllTarotElements();
      for (const mapping of result) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.arquétipo).toBeDefined();
        expect(mapping.orixá).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.lição_espiritual).toBeDefined();
        expect(mapping.qualidades).toBeDefined();
        expect(mapping.afirmação).toBeDefined();
        expect(mapping.cores).toBeDefined();
        expect(mapping.dia_sagrado).toBeDefined();
      }
    });
  });

  // ─── getAllArcanos ────────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns all 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result.length).toBe(22);
    });

    it('includes "O Sol"', () => {
      expect(getAllArcanos()).toContain('O Sol');
    });

    it('includes "A Lua"', () => {
      expect(getAllArcanos()).toContain('A Lua');
    });

    it('includes "O Louco"', () => {
      expect(getAllArcanos()).toContain('O Louco');
    });
  });

  // ─── getAllElements ───────────────────────────────────────────────────────────

  describe('getAllElements', () => {
    it('returns all 5 elements', () => {
      const result = getAllElements();
      expect(result.length).toBe(5);
    });

    it('includes Fogo', () => {
      expect(getAllElements()).toContain('Fogo');
    });

    it('includes Água', () => {
      expect(getAllElements()).toContain('Água');
    });

    it('includes Ar', () => {
      expect(getAllElements()).toContain('Ar');
    });

    it('includes Terra', () => {
      expect(getAllElements()).toContain('Terra');
    });

    it('includes Éter', () => {
      expect(getAllElements()).toContain('Éter');
    });
  });

  // ─── getSignificadoFromArcano ────────────────────────────────────────────────

  describe('getSignificadoFromArcano', () => {
    it('returns spiritual meaning for "O Sol"', () => {
      const result = getSignificadoFromArcano('O Sol');
      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(10);
    });

    it('returns null for unknown arcano', () => {
      expect(getSignificadoFromArcano('Unknown')).toBeNull();
    });
  });

  // ─── getOrixaFromArcano ───────────────────────────────────────────────────────

  describe('getOrixaFromArcano', () => {
    it('returns orixá for "O Sol"', () => {
      const result = getOrixaFromArcano('O Sol');
      expect(result).toBe('Oxumarê');
    });

    it('returns orixá for "A Lua"', () => {
      const result = getOrixaFromArcano('A Lua');
      expect(result).toBe('Iemanjá');
    });

    it('returns null for unknown arcano', () => {
      expect(getOrixaFromArcano('Unknown')).toBeNull();
    });
  });

  // ─── getSephirahFromArcano ────────────────────────────────────────────────────

  describe('getSephirahFromArcano', () => {
    it('returns sephirah for "O Sol"', () => {
      const result = getSephirahFromArcano('O Sol');
      expect(result).toBe('Tiphereth');
    });

    it('returns sephirah for "O Louco"', () => {
      const result = getSephirahFromArcano('O Louco');
      expect(result).toBe('Kether');
    });

    it('returns null for unknown arcano', () => {
      expect(getSephirahFromArcano('Unknown')).toBeNull();
    });
  });

  // ─── getChakraFromArcano ──────────────────────────────────────────────────────

  describe('getChakraFromArcano', () => {
    it('returns chakra for "O Sol"', () => {
      const result = getChakraFromArcano('O Sol');
      expect(result).toBe('Solar');
    });

    it('returns chakra for "A Lua"', () => {
      const result = getChakraFromArcano('A Lua');
      expect(result).toBe('Ajna');
    });

    it('returns null for unknown arcano', () => {
      expect(getChakraFromArcano('Unknown')).toBeNull();
    });
  });

  // ─── getNumeroCartaFromArcano ────────────────────────────────────────────────

  describe('getNumeroCartaFromArcano', () => {
    it('returns card number 19 for "O Sol"', () => {
      expect(getNumeroCartaFromArcano('O Sol')).toBe(19);
    });

    it('returns card number 0 for "O Louco"', () => {
      expect(getNumeroCartaFromArcano('O Louco')).toBe(0);
    });

    it('returns card number 21 for "O Mundo"', () => {
      expect(getNumeroCartaFromArcano('O Mundo')).toBe(21);
    });

    it('returns null for unknown arcano', () => {
      expect(getNumeroCartaFromArcano('Unknown')).toBeNull();
    });
  });

  // ─── hasTarotElement ──────────────────────────────────────────────────────────

  describe('hasTarotElement', () => {
    it('returns true for known arcano', () => {
      expect(hasTarotElement('O Sol')).toBe(true);
    });

    it('returns true for lowercase arcano', () => {
      expect(hasTarotElement('o sol')).toBe(true);
    });

    it('returns false for unknown arcano', () => {
      expect(hasTarotElement('Unknown Card')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotElement('')).toBe(false);
    });
  });

  // ─── getArcanoByNumero ────────────────────────────────────────────────────────

  describe('getArcanoByNumero', () => {
    it('returns "O Louco" for card number 0', () => {
      expect(getArcanoByNumero(0)).toBe('O Louco');
    });

    it('returns "O Mago" for card number 1', () => {
      expect(getArcanoByNumero(1)).toBe('O Mago');
    });

    it('returns "O Sol" for card number 19', () => {
      expect(getArcanoByNumero(19)).toBe('O Sol');
    });

    it('returns "O Mundo" for card number 21', () => {
      expect(getArcanoByNumero(21)).toBe('O Mundo');
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByNumero(99)).toBeNull();
    });

    it('returns null for negative card number', () => {
      expect(getArcanoByNumero(-1)).toBeNull();
    });
  });

  // ─── TAROT_ELEMENT_MAP constant ───────────────────────────────────────────────

  describe('TAROT_ELEMENT_MAP', () => {
    it('is defined', () => {
      expect(TAROT_ELEMENT_MAP).toBeDefined();
    });

    it('has 22 entries', () => {
      expect(Object.keys(TAROT_ELEMENT_MAP).length).toBe(22);
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TAROT_ELEMENT_MAP)).toBe(true);
    });

    it('contains "O Sol" entry', () => {
      expect(TAROT_ELEMENT_MAP['O Sol']).toBeDefined();
      expect(TAROT_ELEMENT_MAP['O Sol'].elemento).toBe('Fogo');
    });

    it('contains "A Lua" entry', () => {
      expect(TAROT_ELEMENT_MAP['A Lua']).toBeDefined();
      expect(TAROT_ELEMENT_MAP['A Lua'].elemento).toBe('Água');
    });

    it('contains "O Louco" entry', () => {
      expect(TAROT_ELEMENT_MAP['O Louco']).toBeDefined();
      expect(TAROT_ELEMENT_MAP['O Louco'].elemento).toBe('Éter');
    });
  });

  // ─── TODOS_ARCANOS constant ───────────────────────────────────────────────────

  describe('TODOS_ARCANOS', () => {
    it('is defined', () => {
      expect(TODOS_ARCANOS).toBeDefined();
    });

    it('has 22 entries', () => {
      expect(TODOS_ARCANOS.length).toBe(22);
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS)).toBe(true);
    });

    it('includes "O Sol"', () => {
      expect(TODOS_ARCANOS).toContain('O Sol');
    });

    it('includes "A Lua"', () => {
      expect(TODOS_ARCANOS).toContain('A Lua');
    });

    it('includes all Major Arcana cards', () => {
      expect(TODOS_ARCANOS).toContain('O Louco');
      expect(TODOS_ARCANOS).toContain('O Mago');
      expect(TODOS_ARCANOS).toContain('A Sacerdotisa');
      expect(TODOS_ARCANOS).toContain('A Imperatriz');
      expect(TODOS_ARCANOS).toContain('O Imperador');
      expect(TODOS_ARCANOS).toContain('O Papa');
      expect(TODOS_ARCANOS).toContain('O Enamorado');
      expect(TODOS_ARCANOS).toContain('O Carro');
      expect(TODOS_ARCANOS).toContain('A Justiça');
      expect(TODOS_ARCANOS).toContain('O Eremita');
      expect(TODOS_ARCANOS).toContain('A Roda da Fortuna');
      expect(TODOS_ARCANOS).toContain('A Força');
      expect(TODOS_ARCANOS).toContain('O Enforcado');
      expect(TODOS_ARCANOS).toContain('A Morte');
      expect(TODOS_ARCANOS).toContain('A Temperança');
      expect(TODOS_ARCANOS).toContain('O Diabo');
      expect(TODOS_ARCANOS).toContain('A Torre');
      expect(TODOS_ARCANOS).toContain('A Estrela');
      expect(TODOS_ARCANOS).toContain('A Lua');
      expect(TODOS_ARCANOS).toContain('O Sol');
      expect(TODOS_ARCANOS).toContain('O Julgamento');
      expect(TODOS_ARCANOS).toContain('O Mundo');
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('Fogo has multiple arcano', () => {
      const fogo = getArcanoByElement('Fogo');
      expect(fogo.length).toBeGreaterThan(1);
    });

    it('Água has multiple arcano', () => {
      const agua = getArcanoByElement('Água');
      expect(agua.length).toBeGreaterThan(1);
    });

    it('Ar has multiple arcano', () => {
      const ar = getArcanoByElement('Ar');
      expect(ar.length).toBeGreaterThan(1);
    });

    it('Terra has multiple arcano', () => {
      const terra = getArcanoByElement('Terra');
      expect(terra.length).toBeGreaterThan(1);
    });

    it('Éter has 2 arcano (O Louco and O Mundo)', () => {
      const ether = getArcanoByElement('Éter');
      expect(ether.length).toBe(2);
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all mappings have non-empty significado_espiritual', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });

    it('all mappings have non-empty lição_espiritual', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.lição_espiritual.length).toBeGreaterThan(5);
      }
    });

    it('all mappings have non-empty afirmação', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.afirmação.length).toBeGreaterThan(5);
      }
    });

    it('all mappings have orixá from Candomblé tradition', () => {
      const all = getAllTarotElements();
      const orixas = all.map((m) => m.orixá);
      const uniqueOrixas = [...new Set(orixas)];
      expect(uniqueOrixas.length).toBeGreaterThan(5);
    });

    it('all mappings have sephirot from Kabbalah', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.sephirah.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have chakra alignment', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have cores array with at least one color', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.cores.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have dia_sagrado', () => {
      const all = getAllTarotElements();
      for (const mapping of all) {
        expect(mapping.dia_sagrado).toBeDefined();
        expect(mapping.dia_sagrado.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Type exports ────────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('TarotElementMapping type is exported', () => {
      const mapping: TarotElementMapping = {
        arcano: 'Teste',
        numero_carta: 0,
        elemento: 'Fogo',
        significado_espiritual: 'Teste',
        arquétipo: 'Teste',
        orixá: 'Teste',
        sephirah: 'Teste',
        chakra: 'Teste',
        lição_espiritual: 'Teste',
        qualidades: ['Teste'],
        afirmação: 'Teste',
        cores: ['Teste'],
        dia_sagrado: 'Teste',
      };
      expect(mapping.arcano).toBe('Teste');
    });

    it('Elemento type is exported', () => {
      const elemento: Elemento = 'Fogo';
      expect(elemento).toBe('Fogo');
    });
  });
});
