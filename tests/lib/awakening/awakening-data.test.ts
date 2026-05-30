import { describe, it, expect, beforeEach } from 'vitest';
import {
  getArchetypeById,
  getArchetypesByElement,
  getArchetypesByPlanet,
  getData,
} from '@/lib/awakening/v2/awakening-data';

describe('awakening-data', () => {
  describe('getArchetypeById', () => {
    it('returns archetype for valid id', () => {
      const archetype = getArchetypeById('neophite');
      expect(archetype).toBeDefined();
      expect(archetype?.id).toBe('neophite');
      expect(archetype?.name).toBe('Neophyte');
      expect(archetype?.portugueseName).toBe('Neófito');
    });

    it('returns archetype for different valid id', () => {
      const archetype = getArchetypeById('mago');
      expect(archetype).toBeDefined();
      expect(archetype?.id).toBe('mago');
      expect(archetype?.name).toBe('Magician');
    });

    it('returns undefined for invalid id', () => {
      const archetype = getArchetypeById('nonexistent');
      expect(archetype).toBeUndefined();
    });

    it('returns undefined for empty string id', () => {
      const archetype = getArchetypeById('');
      expect(archetype).toBeUndefined();
    });
  });

  describe('getArchetypesByElement', () => {
    it('returns archetypes filtered by element', () => {
      const archetypes = getArchetypesByElement('Akasha');
      expect(archetypes).toBeDefined();
      expect(archetypes.length).toBeGreaterThan(0);
      archetypes.forEach((a) => {
        expect(a.element).toBe('Akasha');
      });
    });

    it('returns multiple archetypes for Akasha element', () => {
      const archetypes = getArchetypesByElement('Akasha');
      expect(archetypes.length).toBe(4);
      const ids = archetypes.map((a) => a.id).sort();
      expect(ids).toEqual(['mago', 'místico', 'sacerdote', 'unificado']);
    });

    it('returns single archetype for unique element', () => {
      const archetypes = getArchetypesByElement('Ar');
      expect(archetypes.length).toBe(2);
      archetypes.forEach((a) => {
        expect(a.element).toBe('Ar');
      });
    });

    it('returns empty array for nonexistent element', () => {
      const archetypes = getArchetypesByElement('NonexistentElement');
      expect(archetypes).toEqual([]);
    });
  });

  describe('getArchetypesByPlanet', () => {
    it('returns archetypes filtered by planet', () => {
      const archetypes = getArchetypesByPlanet('Sol');
      expect(archetypes).toBeDefined();
      expect(archetypes.length).toBeGreaterThan(0);
      archetypes.forEach((a) => {
        expect(a.planet).toBe('Sol');
      });
    });

    it('returns multiple archetypes for Sol planet', () => {
      const archetypes = getArchetypesByPlanet('Sol');
      expect(archetypes.length).toBe(2);
      const ids = archetypes.map((a) => a.id).sort();
      expect(ids).toEqual(['iluminado', 'místico']);
    });

    it('returns single archetype for unique planet', () => {
      const archetypes = getArchetypesByPlanet('Netuno');
      expect(archetypes.length).toBe(1);
      expect(archetypes[0].id).toBe('unificado');
    });

    it('returns empty array for nonexistent planet', () => {
      const archetypes = getArchetypesByPlanet('Plutão');
      expect(archetypes).toEqual([]);
    });

    it('is case-sensitive', () => {
      const archetypes = getArchetypesByPlanet('sol');
      expect(archetypes).toEqual([]);
    });
  });

  describe('getData', () => {
    it('returns AwakeningData with version', () => {
      const data = getData();
      expect(data).toBeDefined();
      expect(data.version).toBe('2.0.0');
    });

    it('returns AwakeningData with lastUpdated', () => {
      const data = getData();
      expect(data.lastUpdated).toBe('2026-05-28');
    });

    it('returns AwakeningData with archetypes array', () => {
      const data = getData();
      expect(data.archetypes).toBeDefined();
      expect(Array.isArray(data.archetypes)).toBe(true);
    });

    it('returns AwakeningData with all archetypes', () => {
      const data = getData();
      expect(data.archetypes.length).toBe(10);
    });

    it('returns same cached instance on multiple calls', () => {
      const data1 = getData();
      const data2 = getData();
      expect(data1).toBe(data2);
    });

    it('archetypes array is same reference on cached calls', () => {
      const data1 = getData();
      const data2 = getData();
      expect(data1.archetypes).toBe(data2.archetypes);
    });
  });
});