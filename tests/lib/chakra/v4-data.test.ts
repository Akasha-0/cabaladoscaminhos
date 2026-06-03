/**
 * Chakra V4 Data Tests
 *
 * Tests for ChakraV4Data structure at @/lib/chakra/v4/chakra-v4-data
 *
 * Structure: ChakraV4Data {
 *   id, name, nameSanskrit, color, frequency, element, meaning, location
 * }
 */
import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/chakra/v4/chakra-v4-data';

describe('chakra/v4-data', () => {
  describe('getData', () => {
    it('returns array of 7 chakras', () => {
      const chakras = getData();
      expect(chakras).toHaveLength(7);
    });

    it('each chakra has required fields', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(chakra.id).toBeDefined();
        expect(chakra.name).toBeDefined();
        expect(chakra.nameSanskrit).toBeDefined();
        expect(chakra.color).toBeDefined();
        expect(typeof chakra.frequency).toBe('number');
        expect(chakra.element).toBeDefined();
        expect(chakra.meaning).toBeDefined();
        expect(chakra.location).toBeDefined();
      }
    });

    it('first chakra is Muladhara (root)', () => {
      const root = getData()[0];
      expect(root.name).toBe('Muladhara');
      expect(root.id).toBe('muladhara');
    });

    it('seventh chakra is Sahasrara (crown)', () => {
      const crown = getData()[6];
      expect(crown.name).toBe('Sahasrara');
      expect(crown.id).toBe('sahasrara');
    });
  });

  describe('chakra frequency integrity', () => {
    it('all chakras have valid frequency numbers', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(chakra.frequency).toBeGreaterThan(0);
      }
    });

    it('frequencies are in ascending order', () => {
      const chakras = getData();
      const frequencies = chakras.map(c => c.frequency);
      const sorted = [...frequencies].sort((a, b) => a - b);
      expect(frequencies).toEqual(sorted);
    });
  });

  describe('chakra element progression', () => {
    it('first chakra is terra (lowest frequency)', () => {
      const root = getData()[0];
      expect(root.element).toBe('terra');
      expect(root.id).toBe('muladhara');
    });

    it('last chakra is not terra', () => {
      const crown = getData()[6];
      expect(crown.element).not.toBe('terra');
    });
  });

  describe('chakra color format', () => {
    it('all chakras have hex color codes', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(chakra.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });
});
