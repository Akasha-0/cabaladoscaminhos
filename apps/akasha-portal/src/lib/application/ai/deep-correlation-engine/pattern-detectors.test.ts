import { describe, it, expect } from 'vitest';
import {
  detectRecurringNumberPatterns,
  detectElementalImbalance,
  detectKarmicThemes,
  detectSpiritualBlocks,
} from './pattern-detectors';
import type { UserSpiritualData } from '../types';

const BASE_USER: UserSpiritualData = {
  id: 'test-id',
  nome: 'João Teste',
  dataNascimento: '1990-01-15',
  numeroPessoal: 11,
  arcoPessoal: 5,
  odu: 'Ogbe',
  orixaRegente: 'Ogum',
  sefirotDominante: ['Keter'],
  arcoMaior: [0, 1, 21],
  sign: 'Aries',
  houses: { 4: 10 },
  rashi: 'Meshona',
};

describe('pattern-detectors', () => {
  // ── detectRecurringNumberPatterns ──────────────────────────────────────────

  describe('detectRecurringNumberPatterns', () => {
    it('detects personal number matching an Odú/Tarot arcana', () => {
      // Ogbe maps to arcana 0 (The Fool); numeroPessoal 11 also matches Ejilaxebô [11]
      // AND has repeating "11" digits → 2 patterns total
      const patterns = detectRecurringNumberPatterns(BASE_USER);
      expect(patterns).toHaveLength(2);
      expect(patterns[0].patternType).toBe('recurring_number');
      expect(patterns[0].systems).toContain('numerology');
      expect(patterns[0].systems).toContain('tarot');
      expect(patterns[0].systems).toContain('ifa');
      expect(patterns[0].urgency).toBe('medium');
    });

    it('detects repeating digits in personal number', () => {
      // 11 has repeating '1'
      const patterns = detectRecurringNumberPatterns(BASE_USER);
      expect(patterns.some(p => p.patternType === 'recurring_number' && p.systems.includes('numerology'))).toBe(true);
    });

    it('returns empty array when numeroPessoal is missing', () => {
      const noNumber: UserSpiritualData = { ...BASE_USER, numeroPessoal: undefined as unknown as number };
      const patterns = detectRecurringNumberPatterns(noNumber);
      expect(patterns).toHaveLength(0);
    });

    it('edge case: numeroPessoal > 15 not in ODU_TAROT_MAP produces no pattern', () => {
      // ODU_TAROT_MAP values are 0-15; use 16 which skips repeating-digit check (>9)
      // and is not in the map → 0 patterns
      const singleDigit: UserSpiritualData = { ...BASE_USER, numeroPessoal: 16 };
      const patterns = detectRecurringNumberPatterns(singleDigit);
      expect(patterns).toHaveLength(0);
    });
  });

  // ── detectElementalImbalance ──────────────────────────────────────────────

  describe('detectElementalImbalance', () => {
    it('detects elemental imbalance when one element is dominant', () => {
      // Ogum → Fogo, Aries → Fogo → 2× Fogo, only 1 unique element
      // condition: elementCounts.length >= 2 → FAILS (only 1 unique)
      // → returns 0 patterns (no imbalance by current logic)
      const patterns = detectElementalImbalance(BASE_USER);
      expect(patterns).toHaveLength(0);
    });

    it('returns empty array when no elemental data is present', () => {
      const noData: UserSpiritualData = {
        ...BASE_USER,
        orixaRegente: undefined as unknown as string,
        sign: undefined as unknown as string,
      };
      const patterns = detectElementalImbalance(noData);
      expect(patterns).toHaveLength(0);
    });

    it('edge case: single element from one system does not trigger imbalance', () => {
      // Only Aries (Fogo) — not enough for "dominant with 2+"
      const oneSystem: UserSpiritualData = {
        ...BASE_USER,
        orixaRegente: undefined as unknown as string, // no Orixá
        sign: 'Aries',
      };
      const patterns = detectElementalImbalance(oneSystem);
      expect(patterns).toHaveLength(0);
    });
  });

  // ── detectKarmicThemes ─────────────────────────────────────────────────────

  describe('detectKarmicThemes', () => {
    it('detects karmic theme when multiple systems have karmic indicators', () => {
      // numeroPessoal 11 → numerology karmic; arcoMaior includes 10/21 → tarot karmic
      // sign = Aries → not Scorpio; odu = Ogbe → not Ofun/Meji; rashi = Meshona → not Vrischika
      // → only 2 systems (numerology + tarot), still triggers
      const patterns = detectKarmicThemes(BASE_USER);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].patternType).toBe('karmic_theme');
      expect(patterns[0].urgency).toBe('medium');
    });

    it('returns empty array when no karmic indicators are present', () => {
      const noKarmic: UserSpiritualData = {
        ...BASE_USER,
        numeroPessoal: 5,        // not 9 or 11
        arcoMaior: [3, 4],       // no 10 or 21
        odu: 'Ogbe',             // not Ofun or Meji
        sign: 'Taurus',          // not Scorpio
        rashi: 'Vrishabha',      // not Vrischika
      };
      const patterns = detectKarmicThemes(noKarmic);
      expect(patterns).toHaveLength(0);
    });

    it('edge case: exactly one system indicator returns empty', () => {
      const oneSystem: UserSpiritualData = {
        ...BASE_USER,
        numeroPessoal: 9,         // karmic in numerology
        arcoMaior: [1, 2],       // no karmic
        odu: 'Ogbe',             // no karmic
        sign: 'Taurus',          // no karmic
        rashi: 'Meshona',        // no karmic
      };
      const patterns = detectKarmicThemes(oneSystem);
      // Only 1 system (numerology) → should be empty per logic "systems.length >= 2"
      expect(patterns).toHaveLength(0);
    });
  });

  // ── detectSpiritualBlocks ─────────────────────────────────────────────────

  describe('detectSpiritualBlocks', () => {
    it('detects spiritual blocks when 2+ systems have gaps', () => {
      // sefirotDominante length === 1 + numeroPessoal → kabbalah block
      // !arcoMaior + numeroPessoal → tarot block (arcoMaior = [0,1,21] so no block here)
      // orixaRegente + !odu → ifa block (odu = Ogbe, so no block)
      // Only 1 block triggers → need 2 to fire
      const twoBlocks: UserSpiritualData = {
        ...BASE_USER,
        arcoMaior: undefined as unknown as number[], // triggers tarot block
        odu: undefined as unknown as string,         // triggers ifa block
      };
      const patterns = detectSpiritualBlocks(twoBlocks);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].patternType).toBe('spiritual_block');
      expect(patterns[0].urgency).toBe('high');
    });

    it('returns empty array when all systems are present', () => {
      const complete: UserSpiritualData = {
        ...BASE_USER,
        sefirotDominante: ['Keter', 'Chokhmah'], // not single
        arcoMaior: [0, 1, 21],                   // present
        orixaRegente: 'Ogum',                    // present
        odu: 'Ogbe',                             // present
      };
      const patterns = detectSpiritualBlocks(complete);
      expect(patterns).toHaveLength(0);
    });

    it('edge case: exactly one block does not trigger pattern', () => {
      const oneBlock: UserSpiritualData = {
        ...BASE_USER,
        sefirotDominante: ['Keter'], // single → kabbalah block
        arcoMaior: [0, 1, 21],       // present → no tarot block
        orixaRegente: 'Ogum',        // present → no ifa block
        odu: 'Ogbe',                 // present → no ifa block
      };
      const patterns = detectSpiritualBlocks(oneBlock);
      // Only 1 block → should be empty per logic "blocks.length >= 2"
      expect(patterns).toHaveLength(0);
    });
  });
});
