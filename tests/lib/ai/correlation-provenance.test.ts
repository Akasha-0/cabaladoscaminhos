import { describe, it, expect } from 'vitest';
import { CORRELATION_MAP } from '@/lib/ai/correlation-map';

/**
 * Supported traditions for CORRELATION_MAP.source values.
 * Derived from correspondence-source.md (supported traditions) and
 * existing entries in the map.
 */
const SUPPORTED_TRADITIONS = new Set([
  'Astrologia Ocidental Clássica',
  'Cabala Numérica Pitagórica',
  'Numerologia Tântrica Indiana',
  // Additional traditions from correspondence-source.md that may appear:
  'Numerologia Cabalística',
  'Astrologia',
  'Cabala',
  'Tarot',
  'Odu Ifá',
  'Orixás',
  'Chakras',
  'Geometria Sagrada',
  'Frequências Solfeggio',
]);

/** Minimum character length for a substantive rationale. */
const MIN_RATIONALE_LENGTH = 5;

/** All 36 Mesa Real house IDs. */
const HOUSE_IDS = Array.from({ length: 36 }, (_, i) => i + 1);

describe('CORRELATION_MAP provenance (AD-20.6, AD-20.8)', () => {
  describe('Test 1 — All 36 houses have source + rationale in all 3 systems', () => {
    for (const houseId of HOUSE_IDS) {
      const entry = CORRELATION_MAP[houseId]!;

      it(`House ${houseId} (${entry.houseName}) — astrology has source`, () => {
        expect(
          entry.astrology.source,
          `House ${houseId} astrology.source is undefined or empty`
        ).toBeDefined();
        expect(
          entry.astrology.source?.trim().length,
          `House ${houseId} astrology.source is empty`
        ).toBeGreaterThan(0);
      });

      it(`House ${houseId} (${entry.houseName}) — astrology has rationale`, () => {
        expect(
          entry.astrology.rationale,
          `House ${houseId} astrology.rationale is undefined or empty`
        ).toBeDefined();
        expect(
          entry.astrology.rationale?.trim().length,
          `House ${houseId} astrology.rationale is empty`
        ).toBeGreaterThan(0);
      });

      it(`House ${houseId} (${entry.houseName}) — kabalah has source`, () => {
        expect(
          entry.kabalah.source,
          `House ${houseId} kabalah.source is undefined or empty`
        ).toBeDefined();
        expect(
          entry.kabalah.source?.trim().length,
          `House ${houseId} kabalah.source is empty`
        ).toBeGreaterThan(0);
      });

      it(`House ${houseId} (${entry.houseName}) — kabalah has rationale`, () => {
        expect(
          entry.kabalah.rationale,
          `House ${houseId} kabalah.rationale is undefined or empty`
        ).toBeDefined();
        expect(
          entry.kabalah.rationale?.trim().length,
          `House ${houseId} kabalah.rationale is empty`
        ).toBeGreaterThan(0);
      });

      it(`House ${houseId} (${entry.houseName}) — tantric has source`, () => {
        expect(
          entry.tantric.source,
          `House ${houseId} tantric.source is undefined or empty`
        ).toBeDefined();
        expect(
          entry.tantric.source?.trim().length,
          `House ${houseId} tantric.source is empty`
        ).toBeGreaterThan(0);
      });

      it(`House ${houseId} (${entry.houseName}) — tantric has rationale`, () => {
        expect(
          entry.tantric.rationale,
          `House ${houseId} tantric.rationale is undefined or empty`
        ).toBeDefined();
        expect(
          entry.tantric.rationale?.trim().length,
          `House ${houseId} tantric.rationale is empty`
        ).toBeGreaterThan(0);
      });
    }
  });

  describe('Test 2 — Source values are from supported traditions', () => {
    for (const houseId of HOUSE_IDS) {
      const entry = CORRELATION_MAP[houseId]!;

      it(`House ${houseId} — astrology source "${entry.astrology.source}" is supported`, () => {
        const source = entry.astrology.source;
        expect(
          source,
          `House ${houseId} astrology.source is undefined`
        ).toBeDefined();
        expect(
          SUPPORTED_TRADITIONS.has(source!),
          `House ${houseId} astrology.source "${source}" is not in supported traditions: ${[...SUPPORTED_TRADITIONS].join(', ')}`
        ).toBe(true);
      });

      it(`House ${houseId} — kabalah source "${entry.kabalah.source}" is supported`, () => {
        const source = entry.kabalah.source;
        expect(
          source,
          `House ${houseId} kabalah.source is undefined`
        ).toBeDefined();
        expect(
          SUPPORTED_TRADITIONS.has(source!),
          `House ${houseId} kabalah.source "${source}" is not in supported traditions: ${[...SUPPORTED_TRADITIONS].join(', ')}`
        ).toBe(true);
      });

      it(`House ${houseId} — tantric source "${entry.tantric.source}" is supported`, () => {
        const source = entry.tantric.source;
        expect(
          source,
          `House ${houseId} tantric.source is undefined`
        ).toBeDefined();
        expect(
          SUPPORTED_TRADITIONS.has(source!),
          `House ${houseId} tantric.source "${source}" is not in supported traditions: ${[...SUPPORTED_TRADITIONS].join(', ')}`
        ).toBe(true);
      });
    }
  });

  describe('Test 3 — Rationale values are substantive (min 5 chars)', () => {
    for (const houseId of HOUSE_IDS) {
      const entry = CORRELATION_MAP[houseId]!;

      it(`House ${houseId} — astrology rationale has ≥${MIN_RATIONALE_LENGTH} chars`, () => {
        const rationale = entry.astrology.rationale ?? '';
        expect(
          rationale.trim().length,
          `House ${houseId} astrology.rationale "${rationale}" has ${rationale.trim().length} chars, expected ≥${MIN_RATIONALE_LENGTH}`
        ).toBeGreaterThanOrEqual(MIN_RATIONALE_LENGTH);
      });

      it(`House ${houseId} — kabalah rationale has ≥${MIN_RATIONALE_LENGTH} chars`, () => {
        const rationale = entry.kabalah.rationale ?? '';
        expect(
          rationale.trim().length,
          `House ${houseId} kabalah.rationale "${rationale}" has ${rationale.trim().length} chars, expected ≥${MIN_RATIONALE_LENGTH}`
        ).toBeGreaterThanOrEqual(MIN_RATIONALE_LENGTH);
      });

      it(`House ${houseId} — tantric rationale has ≥${MIN_RATIONALE_LENGTH} chars`, () => {
        const rationale = entry.tantric.rationale ?? '';
        expect(
          rationale.trim().length,
          `House ${houseId} tantric.rationale "${rationale}" has ${rationale.trim().length} chars, expected ≥${MIN_RATIONALE_LENGTH}`
        ).toBeGreaterThanOrEqual(MIN_RATIONALE_LENGTH);
      });
    }
  });

  describe('Test 4 — No duplicate extractionKeys within a single system block', () => {
    for (const houseId of HOUSE_IDS) {
      const entry = CORRELATION_MAP[houseId]!;

      it(`House ${houseId} — astrology extractionKeys are unique`, () => {
        const keys = entry.astrology.extractionKeys;
        const seen = new Set<string>();
        const duplicates: string[] = [];
        for (const key of keys) {
          if (seen.has(key)) duplicates.push(key);
          seen.add(key);
        }
        expect(
          duplicates,
          `House ${houseId} astrology has duplicate extractionKeys: ${duplicates.join(', ')}`
        ).toHaveLength(0);
      });

      it(`House ${houseId} — kabalah extractionKeys are unique`, () => {
        const keys = entry.kabalah.extractionKeys;
        const seen = new Set<string>();
        const duplicates: string[] = [];
        for (const key of keys) {
          if (seen.has(key)) duplicates.push(key);
          seen.add(key);
        }
        expect(
          duplicates,
          `House ${houseId} kabalah has duplicate extractionKeys: ${duplicates.join(', ')}`
        ).toHaveLength(0);
      });

      it(`House ${houseId} — tantric extractionKeys are unique`, () => {
        const keys = entry.tantric.extractionKeys;
        const seen = new Set<string>();
        const duplicates: string[] = [];
        for (const key of keys) {
          if (seen.has(key)) duplicates.push(key);
          seen.add(key);
        }
        expect(
          duplicates,
          `House ${houseId} tantric has duplicate extractionKeys: ${duplicates.join(', ')}`
        ).toHaveLength(0);
      });
    }
  });
});
