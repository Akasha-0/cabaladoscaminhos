import { describe, it, expect } from 'vitest';
import {
  getData,
  type AlignmentData,
} from '@/lib/alignment/alignment-data';

describe('alignment-data module', () => {
  describe('getData', () => {
    it('returns an array', () => {
      const data = getData();
      expect(Array.isArray(data)).toBe(true);
    });

    it('returns all 8 alignment types', () => {
      const data = getData();
      expect(data.length).toBe(8);
    });

    it('each item has required fields', () => {
      const data = getData();
      data.forEach((item: AlignmentData) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('traits');
        expect(item).toHaveProperty('symbols');
        expect(item).toHaveProperty('colors');
      });
    });

    it('each item has non-empty strings for required fields', () => {
      const data = getData();
      data.forEach((item: AlignmentData) => {
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
      });
    });

    it('each item has non-empty arrays for traits, symbols, and colors', () => {
      const data = getData();
      data.forEach((item: AlignmentData) => {
        expect(Array.isArray(item.traits)).toBe(true);
        expect(item.traits.length).toBeGreaterThan(0);
        expect(Array.isArray(item.symbols)).toBe(true);
        expect(item.symbols.length).toBeGreaterThan(0);
        expect(Array.isArray(item.colors)).toBe(true);
        expect(item.colors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('alignment data content', () => {
    it('contains expected alignment types by id', () => {
      const data = getData();
      const ids = data.map((d) => d.id);
      expect(ids).toContain('sol-orion');
      expect(ids).toContain('lua-orion');
      expect(ids).toContain('terra-orion');
      expect(ids).toContain('agua-orion');
      expect(ids).toContain('fogo-orion');
      expect(ids).toContain('ar-orion');
      expect(ids).toContain('vazio-orion');
      expect(ids).toContain('caminho-central');
    });

    it('Sol de Orion has correct properties', () => {
      const data = getData();
      const sol = data.find((d) => d.id === 'sol-orion');
      expect(sol).toBeDefined();
      expect(sol!.name).toBe('Sol de Orion');
      expect(sol!.traits).toContain('claridade');
      expect(sol!.traits).toContain('direção');
      expect(sol!.colors).toContain('#FFD700');
    });

    it('Lua de Orion has correct properties', () => {
      const data = getData();
      const lua = data.find((d) => d.id === 'lua-orion');
      expect(lua).toBeDefined();
      expect(lua!.name).toBe('Lua de Orion');
      expect(lua!.traits).toContain('reflexão');
      expect(lua!.traits).toContain('intuição');
    });

    it('Caminho Central has balanced traits', () => {
      const data = getData();
      const caminho = data.find((d) => d.id === 'caminho-central');
      expect(caminho).toBeDefined();
      expect(caminho!.traits).toContain('equilíbrio');
      expect(caminho!.traits).toContain('harmonia');
    });

    it('Fogo de Orion has transformation traits', () => {
      const data = getData();
      const fogo = data.find((d) => d.id === 'fogo-orion');
      expect(fogo).toBeDefined();
      expect(fogo!.traits).toContain('transformação');
      expect(fogo!.traits).toContain('purificação');
    });
  });

  describe('colors are valid hex codes', () => {
    it('all colors are valid hex color format', () => {
      const data = getData();
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      data.forEach((item: AlignmentData) => {
        item.colors.forEach((color) => {
          expect(color).toMatch(hexRegex);
        });
      });
    });
  });
});