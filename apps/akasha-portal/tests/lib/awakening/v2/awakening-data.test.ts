import { describe, it, expect, beforeEach } from 'vitest';
import {
  getData,
  getArchetypeById,
  getArchetypesByElement,
  getArchetypesByPlanet,
  type AwakeningArchetype,
} from '@/lib/awakening/v2/awakening-data';

describe('awakening-data', () => {
  describe('getData', () => {
    it('returns AwakeningData with version 2.0.0', () => {
      const data = getData();
      expect(data.version).toBe('2.0.0');
    });

    it('returns array of archetypes with count > 0', () => {
      const data = getData();
      expect(data.archetypes.length).toBeGreaterThan(0);
    });

    it('returns singleton — multiple calls return same object', () => {
      const first = getData();
      const second = getData();
      expect(first).toBe(second);
    });

    it('each archetype has required fields', () => {
      const data = getData();
      const requiredFields: (keyof AwakeningArchetype)[] = [
        'id',
        'name',
        'portugueseName',
        'element',
        'planet',
        'sephirah',
        'description',
        'practices',
        'warnings',
        'integrationPoints',
      ];
      for (const archetype of data.archetypes) {
        for (const field of requiredFields) {
          expect(archetype[field]).toBeDefined();
        }
      }
    });

    it('practices is non-empty array for all archetypes', () => {
      const data = getData();
      for (const archetype of data.archetypes) {
        expect(Array.isArray(archetype.practices)).toBe(true);
        expect(archetype.practices.length).toBeGreaterThan(0);
      }
    });

    it('warnings is non-empty array for all archetypes', () => {
      const data = getData();
      for (const archetype of data.archetypes) {
        expect(Array.isArray(archetype.warnings)).toBe(true);
        expect(archetype.warnings.length).toBeGreaterThan(0);
      }
    });

    it('all archetype ids are unique', () => {
      const data = getData();
      const ids = data.archetypes.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getArchetypeById', () => {
    it('returns neophyte archetype for id neophite', () => {
      const archetype = getArchetypeById('neophite');
      expect(archetype).toBeDefined();
      expect(archetype!.id).toBe('neophite');
      expect(archetype!.name).toBe('Neophyte');
    });

    it('returns unified archetype for id unificado', () => {
      const archetype = getArchetypeById('unificado');
      expect(archetype).toBeDefined();
      expect(archetype!.id).toBe('unificado');
      expect(archetype!.name).toBe('Unified');
    });

    it('returns undefined for invalid id', () => {
      const archetype = getArchetypeById('invalid');
      expect(archetype).toBeUndefined();
    });

    it('returns undefined for empty string id', () => {
      const archetype = getArchetypeById('');
      expect(archetype).toBeUndefined();
    });
  });

  describe('getArchetypesByElement', () => {
    it('returns archetypes with element Ar (includes neophite and sábio)', () => {
      const archetypes = getArchetypesByElement('Ar');
      expect(archetypes.length).toBeGreaterThanOrEqual(2);
      const ids = archetypes.map((a) => a.id);
      expect(ids).toContain('neophite');
      expect(ids).toContain('sábio');
    });

    it('returns archetypes with element Fogo (includes buscador and iluminado)', () => {
      const archetypes = getArchetypesByElement('Fogo');
      expect(archetypes.length).toBeGreaterThanOrEqual(2);
      const ids = archetypes.map((a) => a.id);
      expect(ids).toContain('buscador');
      expect(ids).toContain('iluminado');
    });

    it('returns empty array for unknown element', () => {
      const archetypes = getArchetypesByElement('unknown');
      expect(archetypes).toEqual([]);
    });
  });

  describe('getArchetypesByPlanet', () => {
    it('returns archetypes with planet Mercúrio (includes neophite and mago)', () => {
      const archetypes = getArchetypesByPlanet('Mercúrio');
      expect(archetypes.length).toBeGreaterThanOrEqual(2);
      const ids = archetypes.map((a) => a.id);
      expect(ids).toContain('neophite');
      expect(ids).toContain('mago');
    });

    it('returns archetypes with planet Sol (includes místico and iluminado)', () => {
      const archetypes = getArchetypesByPlanet('Sol');
      expect(archetypes.length).toBeGreaterThanOrEqual(2);
      const ids = archetypes.map((a) => a.id);
      expect(ids).toContain('místico');
      expect(ids).toContain('iluminado');
    });

    it('returns empty array for unknown planet', () => {
      const archetypes = getArchetypesByPlanet('unknown');
      expect(archetypes).toEqual([]);
    });
  });
});