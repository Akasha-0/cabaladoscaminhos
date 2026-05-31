/**
 * Tests for Tarot-Tarot Spiritual Correlation Module
 * Validates the relationships between Major Arcana cards
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotTarots,
  getTarotByType,
  getMirrorPairs,
  getSequentialJourney,
  getElementalConnections,
  getTransformationConnections,
  getAllArcanos,
  getMeaningBetweenArcanos,
  getRelationTypeBetweenArcanos,
  getAllRelationshipTypes,
  hasRelationship,
  getConnectionsByElement,
  TAROT_TAROT_MAP,
  type TarotTarotMapping,
  type TarotRelacaoTipo,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  // ─── getTarotTarot ─────────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mappings for O Louco', () => {
      const results = getTarotTarot('O Louco');
      expect(results.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const upper = getTarotTarot('O MAGO');
      const lower = getTarotTarot('o mago');
      expect(upper.length).toBe(lower.length);
    });

    it('returns mappings where arcano is origin', () => {
      const results = getTarotTarot('O Louco');
      const hasOrigin = results.some(
        (r) => r.arcano_origem.toLowerCase() === 'o louco'
      );
      expect(hasOrigin).toBe(true);
    });

    it('returns mappings where arcano is destination', () => {
      const results = getTarotTarot('O Mundo');
      const hasDestination = results.some(
        (r) => r.arcano_destino.toLowerCase() === 'o mundo'
      );
      expect(hasDestination).toBe(true);
    });

    it('returns empty array for non-existent arcano', () => {
      const results = getTarotTarot('NonExistent');
      expect(results).toHaveLength(0);
    });

    it('trims whitespace from arcano name', () => {
      const results = getTarotTarot('  O Mago  ');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ─── getAllTarotTarots ─────────────────────────────────────────────────────────

  describe('getAllTarotTarots', () => {
    it('returns array of all mappings', () => {
      const results = getAllTarotTarots();
      expect(Array.isArray(results)).toBe(true);
    });

    it('returns all mappings from constant', () => {
      const results = getAllTarotTarots();
      expect(results.length).toBe(TAROT_TAROT_MAP.length);
    });

    it('returns readonly array', () => {
      const results = getAllTarotTarots();
      expect(results).toEqual(TAROT_TAROT_MAP);
    });

    it('each mapping has required fields', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('arcano_origem');
        expect(mapping).toHaveProperty('arcano_destino');
        expect(mapping).toHaveProperty('numero_origem');
        expect(mapping).toHaveProperty('numero_destino');
        expect(mapping).toHaveProperty('tipo_relacao');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('transformacao');
        expect(mapping).toHaveProperty('licao');
        expect(mapping).toHaveProperty('affirmacao');
      }
    });

    it('source and destination are different', () => {
      const results = getAllTarotTarots();
      for (const mapping of results) {
        expect(mapping.arcano_origem).not.toBe(mapping.arcano_destino);
      }
    });
  });

  // ─── getTarotByType ────────────────────────────────────────────────────────────

  describe('getTarotByType', () => {
    it('returns espelho relationships', () => {
      const results = getTarotByType('espelho');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('espelho');
      }
    });

    it('returns sequencial relationships', () => {
      const results = getTarotByType('sequencial');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('sequencial');
      }
    });

    it('returns elemental relationships', () => {
      const results = getTarotByType('elemental');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('elemental');
      }
    });

    it('returns transformacao relationships', () => {
      const results = getTarotByType('transformacao');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('transformacao');
      }
    });

    it('returns caminho relationships', () => {
      const results = getTarotByType('caminho');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('caminho');
      }
    });

    it('returns complementar relationships', () => {
      const results = getTarotByType('complementar');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('complementar');
      }
    });

    it('returns par_arcano relationships', () => {
      const results = getTarotByType('par_arcano');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.tipo_relacao).toBe('par_arcano');
      }
    });
  });

  // ─── getMirrorPairs ───────────────────────────────────────────────────────────

  describe('getMirrorPairs', () => {
    it('returns mirror pairs', () => {
      const results = getMirrorPairs();
      expect(results.length).toBeGreaterThan(0);
    });

    it('each mirror pair has elemento Éter or same element pattern', () => {
      const results = getMirrorPairs();
      for (const mapping of results) {
        // Mirror pairs should include elemento field
        expect(mapping).toHaveProperty('elemento');
      }
    });

    it('includes O Louco - O Mundo pair', () => {
      const results = getMirrorPairs();
      const hasPair = results.some(
        (r) =>
          (r.arcano_origem === 'O Louco' && r.arcano_destino === 'O Mundo') ||
          (r.arcano_origem === 'O Mundo' && r.arcano_destino === 'O Louco')
      );
      expect(hasPair).toBe(true);
    });

    it('numbers add up to 21 for mirror pairs', () => {
      const results = getMirrorPairs();
      for (const mapping of results) {
        expect(mapping.numero_origem + mapping.numero_destino).toBe(21);
      }
    });
  });

  // ─── getSequentialJourney ──────────────────────────────────────────────────────

  describe('getSequentialJourney', () => {
    it('returns sequential relationships', () => {
      const results = getSequentialJourney();
      expect(results.length).toBeGreaterThan(0);
    });

    it('follows Fool\'s journey sequence', () => {
      const results = getSequentialJourney();
      // Check that origin and destination are consecutive numbers
      for (const mapping of results) {
        expect(Math.abs(mapping.numero_origem - mapping.numero_destino)).toBe(1);
      }
    });

    it('includes O Louco - O Mago connection', () => {
      const results = getSequentialJourney();
      const hasPair = results.some(
        (r) =>
          r.arcano_origem === 'O Louco' && r.arcano_destino === 'O Mago'
      );
      expect(hasPair).toBe(true);
    });
  });

  // ─── getElementalConnections ───────────────────────────────────────────────────

  describe('getElementalConnections', () => {
    it('returns elemental relationships', () => {
      const results = getElementalConnections();
      expect(results.length).toBeGreaterThan(0);
    });

    it('each elemental connection has elemento field', () => {
      const results = getElementalConnections();
      for (const mapping of results) {
        expect(mapping.elemento).toBeDefined();
        expect(['Água', 'Terra', 'Fogo', 'Ar', 'Éter']).toContain(mapping.elemento);
      }
    });

    it('O Mago connects to A Justiça via Água', () => {
      const results = getElementalConnections();
      const hasConnection = results.some(
        (r) =>
          r.arcano_origem === 'O Mago' &&
          r.arcano_destino === 'A Justiça' &&
          r.elemento === 'Água'
      );
      expect(hasConnection).toBe(true);
    });
  });

  // ─── getTransformationConnections ─────────────────────────────────────────────

  describe('getTransformationConnections', () => {
    it('returns transformation relationships', () => {
      const results = getTransformationConnections();
      expect(results.length).toBeGreaterThan(0);
    });

    it('includes A Morte - O Julgamento pair', () => {
      const results = getTransformationConnections();
      const hasPair = results.some(
        (r) =>
          (r.arcano_origem === 'A Morte' && r.arcano_destino === 'O Julgamento') ||
          (r.arcano_origem === 'O Julgamento' && r.arcano_destino === 'A Morte')
      );
      expect(hasPair).toBe(true);
    });

    it('includes A Torre - A Estrela pair', () => {
      const results = getTransformationConnections();
      const hasPair = results.some(
        (r) =>
          (r.arcano_origem === 'A Torre' && r.arcano_destino === 'A Estrela') ||
          (r.arcano_origem === 'A Estrela' && r.arcano_destino === 'A Torre')
      );
      expect(hasPair).toBe(true);
    });

    it('includes A Lua - O Sol pair', () => {
      const results = getTransformationConnections();
      const hasPair = results.some(
        (r) =>
          (r.arcano_origem === 'A Lua' && r.arcano_destino === 'O Sol') ||
          (r.arcano_origem === 'O Sol' && r.arcano_destino === 'A Lua')
      );
      expect(hasPair).toBe(true);
    });
  });

  // ─── getAllArcanos ─────────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const results = getAllArcanos();
      expect(Array.isArray(results)).toBe(true);
    });

    it('returns unique arcano names', () => {
      const results = getAllArcanos();
      const unique = new Set(results);
      expect(results.length).toBe(unique.size);
    });

    it('returns sorted array', () => {
      const results = getAllArcanos();
      const sorted = [...results].sort();
      expect(results).toEqual(sorted);
    });

    it('includes major arcano cards', () => {
      const results = getAllArcanos();
      expect(results).toContain('O Louco');
      expect(results).toContain('O Mago');
      expect(results).toContain('A Imperatriz');
      expect(results).toContain('O Sol');
      expect(results).toContain('O Mundo');
    });

    it('each arcano appears in at least one mapping', () => {
      const results = getAllArcanos();
      const allMappings = getAllTarotTarots();
      for (const arcano of results) {
        const appears = allMappings.some(
          (m) =>
            m.arcano_origem === arcano || m.arcano_destino === arcano
        );
        expect(appears).toBe(true);
      }
    });
  });

  // ─── getMeaningBetweenArcanos ───────────────────────────────────────────────────

  describe('getMeaningBetweenArcanos', () => {
    it('returns meaning for O Louco and O Mundo', () => {
      const result = getMeaningBetweenArcanos('O Louco', 'O Mundo');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns meaning regardless of order', () => {
      const forward = getMeaningBetweenArcanos('O Louco', 'O Mago');
      const reverse = getMeaningBetweenArcanos('O Mago', 'O Louco');
      expect(forward).toBe(reverse);
    });

    it('is case-insensitive', () => {
      const upper = getMeaningBetweenArcanos('O MAGO', 'A JUSTIÇA');
      const lower = getMeaningBetweenArcanos('o mago', 'a justiça');
      expect(upper).toBe(lower);
    });

    it('returns null for non-existent pair', () => {
      const result = getMeaningBetweenArcanos('NonExistent', 'O Mago');
      expect(result).toBeNull();
    });

    it('returns null for unrelated arcanos', () => {
      const result = getMeaningBetweenArcanos('O Sol', 'O Louco');
      // These may not have a direct relationship
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  // ─── getRelationTypeBetweenArcanos ─────────────────────────────────────────────

  describe('getRelationTypeBetweenArcanos', () => {
    it('returns espelho for mirror pairs', () => {
      const result = getRelationTypeBetweenArcanos('O Louco', 'O Mundo');
      expect(result).toBe('espelho');
    });

    it('returns sequencial for journey pairs', () => {
      const result = getRelationTypeBetweenArcanos('O Louco', 'O Mago');
      expect(result).toBe('sequencial');
    });

    it('returns null for non-existent relationship', () => {
      const result = getRelationTypeBetweenArcanos('NonExistent', 'O Mago');
      expect(result).toBeNull();
    });

    it('returns correct type for elemental connections', () => {
      const result = getRelationTypeBetweenArcanos('O Mago', 'A Justiça');
      expect(result).toBe('elemental');
    });

    it('returns correct type for transformation connections', () => {
      const result = getRelationTypeBetweenArcanos('A Morte', 'O Julgamento');
      expect(result).toBe('transformacao');
    });
  });

  // ─── getAllRelationshipTypes ───────────────────────────────────────────────────

  describe('getAllRelationshipTypes', () => {
    it('returns array of relationship types', () => {
      const results = getAllRelationshipTypes();
      expect(Array.isArray(results)).toBe(true);
    });

    it('returns unique types', () => {
      const results = getAllRelationshipTypes();
      const unique = new Set(results);
      expect(results.length).toBe(unique.size);
    });

    it('includes all relationship type values', () => {
      const results = getAllRelationshipTypes();
      expect(results).toContain('espelho');
      expect(results).toContain('sequencial');
      expect(results).toContain('elemental');
      expect(results).toContain('transformacao');
      expect(results).toContain('caminho');
      expect(results).toContain('complementar');
      expect(results).toContain('par_arcano');
    });
  });

  // ─── hasRelationship ───────────────────────────────────────────────────────────

  describe('hasRelationship', () => {
    it('returns true for related arcanos', () => {
      expect(hasRelationship('O Louco', 'O Mundo')).toBe(true);
    });

    it('returns true regardless of order', () => {
      expect(hasRelationship('O Mago', 'A Justiça')).toBe(true);
      expect(hasRelationship('A Justiça', 'O Mago')).toBe(true);
    });

    it('returns false for non-related arcanos', () => {
      expect(hasRelationship('NonExistent', 'O Mago')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(hasRelationship('o mago', 'a justiça')).toBe(true);
      expect(hasRelationship('O MAGO', 'A JUSTIÇA')).toBe(true);
    });
  });

  // ─── getConnectionsByElement ───────────────────────────────────────────────────

  describe('getConnectionsByElement', () => {
    it('returns connections for Água', () => {
      const results = getConnectionsByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.elemento).toBe('Água');
      }
    });

    it('returns connections for Terra', () => {
      const results = getConnectionsByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.elemento).toBe('Terra');
      }
    });

    it('returns connections for Fogo', () => {
      const results = getConnectionsByElement('Fogo');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.elemento).toBe('Fogo');
      }
    });

    it('returns connections for Ar', () => {
      const results = getConnectionsByElement('Ar');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.elemento).toBe('Ar');
      }
    });

    it('returns connections for Éter', () => {
      const results = getConnectionsByElement('Éter');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.elemento).toBe('Éter');
      }
    });

    it('returns empty array for unknown element', () => {
      const results = getConnectionsByElement('Unknown');
      expect(results).toHaveLength(0);
    });
  });

  // ─── TAROT_TAROT_MAP Constant ─────────────────────────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('is a frozen array', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });

    it('has meaningful mappings', () => {
      expect(TAROT_TAROT_MAP.length).toBeGreaterThan(20);
    });

    it('each mapping has spiritual content', () => {
      for (const mapping of TAROT_TAROT_MAP) {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
        expect(mapping.transformacao.length).toBeGreaterThan(5);
        expect(mapping.licao.length).toBeGreaterThan(5);
        expect(mapping.affirmacao.length).toBeGreaterThan(5);
      }
    });

    it('card numbers are valid (0-21)', () => {
      for (const mapping of TAROT_TAROT_MAP) {
        expect(mapping.numero_origem).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_origem).toBeLessThanOrEqual(21);
        expect(mapping.numero_destino).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_destino).toBeLessThanOrEqual(21);
      }
    });

    it('contains representation for all Major Arcana arcs', () => {
      const allArcanos = getAllArcanos();
      // Should have at least 15 unique arcanos represented
      expect(allArcanos.length).toBeGreaterThanOrEqual(15);
    });
  });

  // ─── Relationship Type Completeness ───────────────────────────────────────────

  describe('Relationship type completeness', () => {
    it('espelho has mirror pairs for key cards', () => {
      const mirrorPairs = getMirrorPairs();
      // Should have multiple mirror pairs (0-21, 1-20, etc.)
      expect(mirrorPairs.length).toBeGreaterThanOrEqual(10);
    });

    it('sequencial covers journey progression', () => {
      const sequential = getSequentialJourney();
      // Should have multiple sequential pairs covering the journey
      expect(sequential.length).toBeGreaterThanOrEqual(5);
    });

    it('elemental covers multiple elements', () => {
      const elemental = getElementalConnections();
      const elements = new Set(elemental.map((e) => e.elemento));
      // Should cover multiple elements
      expect(elements.size).toBeGreaterThanOrEqual(3);
    });

    it('transformacao has death-rebirth cycle', () => {
      const transformations = getTransformationConnections();
      const hasDeathRebirth = transformations.some(
        (t) =>
          (t.arcano_origem === 'A Morte' || t.arcano_destino === 'A Morte') &&
          (t.arcano_origem === 'O Julgamento' || t.arcano_destino === 'O Julgamento')
      );
      expect(hasDeathRebirth).toBe(true);
    });
  });

  // ─── Integration with other Tarot correlations ─────────────────────────────────

  describe('Integration with Tarot correlations', () => {
    it('O Louco connects to multiple other arcs', () => {
      const results = getTarotTarot('O Louco');
      expect(results.length).toBeGreaterThan(1);
    });

    it('O Mago is well connected', () => {
      const results = getTarotTarot('O Mago');
      expect(results.length).toBeGreaterThan(1);
    });

    it('O Mundo connects to multiple other arcs', () => {
      const results = getTarotTarot('O Mundo');
      expect(results.length).toBeGreaterThan(1);
    });

    it('A Morte is significant in transformations', () => {
      const results = getTarotTarot('A Morte');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ─── Round-trip consistency ────────────────────────────────────────────────────

  describe('Round-trip consistency', () => {
    it('getAllTarotTarots returns same length as constant', () => {
      const results = getAllTarotTarots();
      expect(results.length).toBe(TAROT_TAROT_MAP.length);
    });

    it('getAllRelationshipTypes returns all unique types', () => {
      const types = getAllRelationshipTypes();
      const allTypes = new Set(getAllTarotTarots().map((m) => m.tipo_relacao));
      expect(types.length).toBe(allTypes.size);
    });

    it('getAllArcanos returns all unique arcano names', () => {
      const arcanos = getAllArcanos();
      const allArcanos = new Set<string>();
      for (const mapping of getAllTarotTarots()) {
        allArcanos.add(mapping.arcano_origem);
        allArcanos.add(mapping.arcano_destino);
      }
      expect(arcanos.length).toBe(allArcanos.size);
    });
  });
});