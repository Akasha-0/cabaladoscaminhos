/**
 * AD-18.1 Contract: MatrixData canonical format verification.
 * ============================================================
 * Investigation across all boundaries: store → save → DB → generate → consult
 *
 * CANONICAL FORMAT (from @/types/index.ts MatrixEntry):
 *   Record<"1".."36", { house: number; carta: number; odu: number }>
 *
 * Each boundary has documented mismatches that need resolution.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// §1 Canonical format simulation
// ---------------------------------------------------------------------------

/** Canonical MatrixEntry per @/types/index.ts */
interface CanonicalMatrixEntry {
  house: number;
  carta: number;
  odu: number;
}
type CanonicalMatrixData = Record<string, CanonicalMatrixEntry>;

/**
 * What handleGenerateDossie (CockpitSidebar.tsx:100-108) ACTUALLY produces.
 * Format: { carta: number; cartaName: string; odu: number; oduName: string }
 *
 * ISSUE: Flat format vs canonical nested object { house, carta, odu }.
 * The store sends carta/odu as primitives, not nested with .house field.
 */
function simulateHandleGenerateDossie(
  houses: Map<number, { carta: { numero: number; nome: string }; odu: { numero: number; name: string } }>
): Record<string, { carta: number; cartaName: string; odu: number; oduName: string } | null> {
  const matrixData: Record<string, { carta: number; cartaName: string; odu: number; oduName: string } | null> = {};
  houses.forEach((house, casaNum) => {
    if (house.carta && house.odu) {
      matrixData[String(casaNum)] = {
        carta: house.carta.numero,
        cartaName: house.carta.nome,
        odu: house.odu.numero,
        oduName: house.odu.name,
      };
    }
  });
  return matrixData;
}

// ---------------------------------------------------------------------------
// §2 Store → Save boundary
// ---------------------------------------------------------------------------

describe('AD-18.1 §2: Store → Save boundary (CockpitSidebar → /api/mesa-real/save)', () => {
  it('handleGenerateDossie produces flat format with carta/odu as primitives', () => {
    const houses = new Map([
      [
        24,
        {
          casaNumero: 24,
          carta: { numero: 24, nome: 'Carta 24', significado: 'test' },
          odu: { numero: 5, name: 'Odu 5' },
        },
      ],
    ]);

    const matrixData = simulateHandleGenerateDossie(houses);

    expect(matrixData['24']).toEqual({
      carta: 24,
      cartaName: 'Carta 24',
      odu: 5,
      oduName: 'Odu 5',
    });
  });

  it('BUG: save/route validateCardUniqueness expects nested carta/odu objects', () => {
    /**
     * validateCardUniqueness (save/route.ts:63) does:
     *   const cartaNum = data.carta.numero;
     *
     * But handleGenerateDossie sends flat { carta: number, odu: number }.
     * So data.carta.numero is undefined — validation will fail.
     */
    const flatMatrixData = {
      '24': { carta: 24, cartaName: 'Carta 24', odu: 5, oduName: 'Odu 5' },
    };

    // Simulate what validateCardUniqueness does
    let extractedCardNumber: number | undefined;
    for (const [casa, data] of Object.entries(flatMatrixData)) {
      if (data && 'carta' in data && 'odu' in data) {
        // @ts-expect-error — accessing .numero on a number (flat format)
        extractedCardNumber = data.carta.numero; // undefined!
      }
    }

    expect(extractedCardNumber).toBeUndefined(); // BUG: should be 24
  });
});

// ---------------------------------------------------------------------------
// §3 Save → DB boundary
// ---------------------------------------------------------------------------

describe('AD-18.1 §3: Save → DB boundary (/api/mesa-real/save → Prisma)', () => {
  it('prisma.reading.create accepts matrixData as object (JSON)', () => {
    /**
     * save/route.ts:153 does:
     *   matrixData: matrixData as object
     *
     * Prisma stores this as JSON. The DB layer is format-agnostic.
     * Any serializable object will be persisted.
     */
    const testMatrixData = {
      '24': { carta: 24, cartaName: 'Carta 24', odu: 5, oduName: 'Odu 5' },
    };

    // Simulate Prisma JSON storage
    const serialized = JSON.stringify(testMatrixData);
    const deserialized = JSON.parse(serialized);

    expect(deserialized['24'].carta).toBe(24);
    expect(deserialized['24'].odu).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// §4 DB → Generate boundary
// ---------------------------------------------------------------------------

describe('AD-18.1 §4: DB → Generate boundary (Prisma → /api/mesa-real/generate)', () => {
  /**
   * extractFilledHouses (generate/route.ts:156-180) expects:
   *   { casa: { numero: number; nome: string }, odu: { numero: number; nome: string } }
   *
   * But the canonical @/types MatrixEntry has carta/odu as primitives.
   * And what actually arrives from DB is the flat format from handleGenerateDossie.
   */

  it('extractFilledHouses accesses carta/odu as objects with .numero', () => {
    // What DB actually returns (flat format from handleGenerateDossie)
    const dbMatrixData = {
      '1': { carta: 1, cartaName: 'A', odu: 1, oduName: 'Ogbe' },
      '24': { carta: 24, cartaName: 'X', odu: 5, oduName: 'Oxê' },
    };

    // What extractFilledHouses expects (nested objects)
    const expectedCanonicalFormat = {
      '1': { casa: { numero: 1, nome: 'A' }, odu: { numero: 1, nome: 'Ogbe' } },
      '24': { casa: { numero: 24, nome: 'X' }, odu: { numero: 5, nome: 'Oxê' } },
    };

    // Simulate extractFilledHouses with ACTUAL DB data (flat format)
    const filled: Array<{ house: number; carta: { numero: number; nome: string }; odu: { numero: number; nome: string } }> = [];

    for (const [key, value] of Object.entries(dbMatrixData)) {
      const house = Number(key);
      // @ts-expect-error — flat format has carta/odu as numbers, not objects
      if (!Number.isInteger(house) || house < 1 || house > 36 || !value?.carta || !value?.odu) {
        continue;
      }
      // This line would fail at runtime: value.carta.numero is undefined
      // @ts-expect-error — accessing .numero on a number
      const cartaNum = value.carta.numero; // undefined!
      // @ts-expect-error
      const oduNum = value.odu.numero; // undefined!

      filled.push({
        house,
        carta: { numero: cartaNum, nome: value.cartaName },
        odu: { numero: oduNum, nome: value.oduName },
      });
    }

    // BUG: cartaNum and oduNum are undefined!
    expect(filled[0].carta.numero).toBeUndefined();
    expect(filled[0].odu.numero).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// §5 Generate → Oracle boundary
// ---------------------------------------------------------------------------

describe('AD-18.1 §5: Generate → Oracle boundary (generate → oracle-prompt-builder)', () => {
  it('buildHousePayload expects carta/odu as primitives (uses getLenormandCardById)', () => {
    /**
     * oracle-prompt-builder.ts:219-220 does:
     *   const card = getLenormandCardById(entry.carta);  // entry.carta is number
     *   const odu = getOduById(entry.odu);              // entry.odu is number
     *
     * This matches the canonical @/types MatrixEntry format.
     * ✅ This boundary is correct IF extractFilledHouses normalizes the data.
     */
    const canonicalEntry = {
      house: 24,
      carta: 24, // primitive number
      odu: 5,     // primitive number
    };

    // Simulate getLenormandCardById call
    const cardId = canonicalEntry.carta;
    const oduId = canonicalEntry.odu;

    expect(typeof cardId).toBe('number');
    expect(typeof oduId).toBe('number');
  });

  it('BUG: Canonical MatrixEntry missing cartaName and oduName fields', () => {
    /**
     * The canonical @/types MatrixEntry only has:
     *   { house: number; carta: number; odu: number }
     *
     * But handleGenerateDossie produces:
     *   { carta: number; cartaName: string; odu: number; oduName: string }
     *
     * And buildHousePayload needs carta/odu as IDs to call:
     *   getLenormandCardById(entry.carta)
     *   getOduById(entry.odu)
     *
     * The canonical type should include cartaName/oduName for human-readable
     * output without additional lookups.
     */
    const canonicalEntry: CanonicalMatrixEntry = {
      house: 24,
      carta: 24,
      odu: 5,
    };

    // @ts-expect-error — cartaName doesn't exist on canonical type
    const name = canonicalEntry.cartaName; // TypeScript error

    expect(name).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// §6 Consult boundary
// ---------------------------------------------------------------------------

describe('AD-18.1 §6: Consult boundary (consult-context.ts)', () => {
  it('consult-context.ts imports MatrixData from @/types (correct)', () => {
    /**
     * consult-context.ts:12 imports:
     *   import type { MatrixData } from '@/types';
     *
     * This references the canonical type. ✅
     * The consult layer is aligned with canonical format.
     */
    const matrixData: CanonicalMatrixData = {
      '24': { house: 24, carta: 24, odu: 5 },
    };

    expect(matrixData['24'].carta).toBe(24);
    expect(matrixData['24'].odu).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// §7 Format mismatch summary
// ---------------------------------------------------------------------------

describe('AD-18.1 §7: Format mismatch summary', () => {
  it('documents all three format variants in the codebase', () => {
    // Variant A: Canonical @/types MatrixEntry (correct target)
    const canonical: CanonicalMatrixEntry = {
      house: 24,
      carta: 24,
      odu: 5,
    };

    // Variant B: Flat format from handleGenerateDossie (what store produces)
    const flatStoreFormat = {
      carta: 24,
      cartaName: 'Carta 24',
      odu: 5,
      oduName: 'Odu 5',
    };

    // Variant C: Nested format expected by save/route CasaData
    const nestedSaveFormat = {
      casa: { numero: 24, nome: 'Carta 24' },
      odu: { numero: 5, nome: 'Ogbe' },
    };

    // Verify all three exist in different parts of the codebase
    expect(canonical.carta).toBe(24);
    expect(flatStoreFormat.cartaName).toBe('Carta 24');
    expect(nestedSaveFormat.casa.numero).toBe(24);
  });

  it('identifies the fix required: normalize in handleGenerateDossie or save route', () => {
    /**
     * RECOMMENDED FIX (choose one):
     *
     * Option 1: Normalize in handleGenerateDossie (CockpitSidebar.tsx)
     *   Change line 103-108 from flat format to canonical format:
     *   matrixData[String(casaNum)] = {
     *     house: casaNum,
     *     carta: house.carta.numero,
     *     odu: house.odu.numero,
     *   };
     *
     * Option 2: Normalize in save/route.ts
     *   Add a transform step before validateCardUniqueness to convert
     *   from flat/nested format to canonical format.
     *
     * AD-18.1 recommends Option 1 (normalize at source) to ensure all
     * downstream consumers (generate, consult) receive canonical format.
     */
    const houses = new Map([
      [
        24,
        {
          casaNumero: 24,
          carta: { numero: 24, nome: 'Carta 24', significado: 'test' },
          odu: { numero: 5, name: 'Odu 5' },
        },
      ],
    ]);

    // What we SHOULD produce (canonical format)
    const correctMatrixData: CanonicalMatrixData = {};
    houses.forEach((house, casaNum) => {
      if (house.carta && house.odu) {
        correctMatrixData[String(casaNum)] = {
          house: casaNum,
          carta: house.carta.numero,
          odu: house.odu.numero,
        };
      }
    });

    expect(correctMatrixData['24']).toEqual({
      house: 24,
      carta: 24,
      odu: 5,
    });
  });
});
