// tests/lib/ai/determinism-guardians.test.ts
// AD-19.4: Determinism Guardians — 6 invariants that must hold at all times.
// These are the "last line of defense" tests: if any of these fail, the system
// is producing non-deterministic or leaking output and must be halted.

import { describe, it, expect } from 'vitest';
import { CORRELATION_MAP } from '@/lib/ai/correlation-map';
import { routeQuestion } from '@/lib/ai/theme-router';
import { getLenormandCardById } from '@/lib/constants/lenormand-cards';
import { calculateLifePath } from '@/lib/calculators/numerology-kabalah';
import { calculateSoul, calculateKarma, calculateDivineGift } from '@/lib/calculators/numerology-tantric';

// Helper types — match the internal shape of POST /api/mesa-real/save
type CasaData = {
  carta: { numero: number; nome: string; significado: string } | null;
  odu: { numero: number; nome: string; significado: string } | null;
};
type MatrixData = Record<number, CasaData | null>;

/**
 * Inline copy of the AD-17.2 card-uniqueness validator from
 * `src/app/api/mesa-real/save/route.ts`. This is the same logic used at
 * POST time and must stay in sync with that function.
 */
function validateCardUniqueness(matrixData: MatrixData): {
  valid: boolean;
  duplicates: Array<{ cardNumber: number; cardName: string; houses: number[] }>;
} {
  const cardToHouses = new Map<number, { name: string; houses: number[] }>();

  for (const [casaStr, data] of Object.entries(matrixData)) {
    if (data?.carta && data?.odu) {
      const cartaNum = data.carta.numero;
      const casa = parseInt(casaStr, 10);
      const existing = cardToHouses.get(cartaNum);

      if (existing) {
        existing.houses.push(casa);
      } else {
        cardToHouses.set(cartaNum, {
          name: data.carta.nome,
          houses: [casa],
        });
      }
    }
  }

  const duplicates: Array<{ cardNumber: number; cardName: string; houses: number[] }> = [];
  for (const [cardNum, info] of cardToHouses.entries()) {
    if (info.houses.length > 1) {
      duplicates.push({ cardNumber: cardNum, cardName: info.name, houses: info.houses });
    }
  }

  return { valid: duplicates.length === 0, duplicates };
}

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT 1 — Correlation determinism: Casa 34 must not leak ascendant/moon
// ─────────────────────────────────────────────────────────────────────────────
// Casa 34 (Os Peixes / Dinheiro) is the "money house" and must NOT reference
// ascendant or moon in any extractionKey — those belong to identity and emotion,
// not finances. This is already partially covered by the primaryPlanets check
// in correlation-determinism.test.ts; here we assert at the extraction-key level.
describe('AD-19.4 Invariant 1 — Correlation determinism: Casa 34 extraction keys', () => {
  it('Casa 34 must NOT have ascendant or moon in any extractionKey', () => {
    const entry = CORRELATION_MAP[34]!;

    const allKeys = [
      ...entry.astrology.extractionKeys,
      ...entry.kabalah.extractionKeys,
      ...entry.tantric.extractionKeys,
    ];

    for (const key of allKeys) {
      expect(key, `Casa 34 has unexpected key: ${key}`).not.toMatch(/ascendant/i);
      expect(key, `Casa 34 has unexpected key: ${key}`).not.toMatch(/moon/i);
    }
  });

  it('All 36 houses have non-empty extractionKeys in every system block', () => {
    for (let house = 1; house <= 36; house++) {
      const entry = CORRELATION_MAP[house]!;

      expect(
        entry.astrology.extractionKeys.length,
        `House ${house} astrology extractionKeys`
      ).toBeGreaterThan(0);
      expect(
        entry.kabalah.extractionKeys.length,
        `House ${house} kabalah extractionKeys`
      ).toBeGreaterThan(0);
      expect(
        entry.tantric.extractionKeys.length,
        `House ${house} tantric extractionKeys`
      ).toBeGreaterThan(0);
    }
  });

  it('Each house has source and rationale on all three system blocks', () => {
    for (let house = 1; house <= 36; house++) {
      const entry = CORRELATION_MAP[house]!;

      expect(entry.astrology.source, `House ${house}`).toBeTruthy();
      expect(entry.astrology.rationale, `House ${house}`).toBeTruthy();
      expect(entry.kabalah.source, `House ${house}`).toBeTruthy();
      expect(entry.tantric.source, `House ${house}`).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT 2 — Source uniqueness: all 36 Lenormand cards have unique ids
// ─────────────────────────────────────────────────────────────────────────────
// The 36 canonical cards are the foundation of the Mesa Real. Duplicate ids
// would cause silent card collisions in matrixData — a silent data corruption.
describe('AD-19.4 Invariant 2 — Lenormand card uniqueness', () => {
  it('getLenormandCardById(1..36) returns 36 cards with unique ids', () => {
    const cards = Array.from({ length: 36 }, (_, i) => getLenormandCardById(i + 1));

    // All 36 must be defined
    for (let i = 0; i < 36; i++) {
      expect(cards[i], `Card ${i + 1} must be defined`).toBeDefined();
    }

    // All ids must be unique
    const ids = cards.map((c) => c!.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size, 'All 36 card ids must be unique').toBe(36);

    // ids must be exactly 1..36 with no gaps and no duplicates
    const sortedIds = [...ids].sort((a, b) => a - b);
    expect(sortedIds).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
  });

  it('each card has non-empty name, keywords, baseMeaning, and shadow', () => {
    for (let i = 1; i <= 36; i++) {
      const card = getLenormandCardById(i)!;
      expect(card.name.trim().length, `Card ${i} name`).toBeGreaterThan(0);
      expect(card.keywords.trim().length, `Card ${i} keywords`).toBeGreaterThan(0);
      expect(card.baseMeaning.trim().length, `Card ${i} baseMeaning`).toBeGreaterThan(0);
      expect(card.shadow.trim().length, `Card ${i} shadow`).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT 3 — Deterministic calculation: known anchor case
// ─────────────────────────────────────────────────────────────────────────────
// "Eliane Simão de Almeida", 20/08/1986 → anchored expected values from
// the official test vector in Doc 09 §8 / Doc 04 §2.2-2.3.
// If any of these values drift, the numerology engines are non-deterministic.
describe('AD-19.4 Invariant 3 — Numerology deterministic anchor case', () => {
  // ISO date format: YYYY-MM-DD
  const BIRTH_DATE = '1986-08-20';

  // Doc 04 §2.2 + Doc 09 §8 expected values
  it('Caminho de Vida (lifePath) = 7 for 20/08/1986', () => {
    const result = calculateLifePath(BIRTH_DATE);
    expect(result.number).toBe(7);
    expect(result.master).toBe(false); // 7 is not a master number
  });

  it('Alma Tântrica (soul) = 2 for 20/08/1986', () => {
    const result = calculateSoul(BIRTH_DATE);
    expect(result).toBe(2); // day 20 → 2+0 = 2
  });

  it('Karma (mês) = 8 for 20/08/1986', () => {
    const result = calculateKarma(BIRTH_DATE);
    expect(result).toBe(8); // month 08 = 8
  });

  it('Dom Divino = 5 for 20/08/1986', () => {
    const result = calculateDivineGift(BIRTH_DATE);
    expect(result).toBe(5); // year 1986 → last two digits 86 → 8+6=14 → 1+4=5
  });

  // Cross-system consistency: same date always produces same results
  it('calculateLifePath is deterministic (same date → same result)', () => {
    const first = calculateLifePath(BIRTH_DATE);
    const second = calculateLifePath(BIRTH_DATE);
    expect(first).toEqual(second);
  });

  it('calculateSoul is deterministic (same date → same result)', () => {
    const first = calculateSoul(BIRTH_DATE);
    const second = calculateSoul(BIRTH_DATE);
    expect(first).toBe(second);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT 4 — Permutation invariant: save rejects duplicate cards
// ─────────────────────────────────────────────────────────────────────────────
// AD-17.2: validateCardUniqueness is the gatekeeper at POST /api/mesa-real/save.
// A reading with duplicate cards must be rejected before persistence.
// NOTE: validateCardUniqueness is not exported from the route, so we re-
// implement the logic inline here (must be kept in sync with the route).
// This test covers the validation path without needing a live server.
describe('AD-19.4 Invariant 4 — Mesa Real save rejects duplicate cards', () => {
  function buildMatrix(
    placed: Array<{ casa: number; carta: number; odu: number }>
  ): MatrixData {
    const matrix: MatrixData = {};
    for (const { casa, carta, odu } of placed) {
      matrix[casa] = {
        carta: { numero: carta, nome: `Carta ${carta}`, significado: 'test' },
        odu: { numero: odu, nome: `Odu ${odu}`, significado: 'test' },
      };
    }
    return matrix;
  }

  it('returns valid=true when all placed cards are unique', () => {
    // Place 5 different cards in 5 houses — no duplicates
    const placed = [
      { casa: 1, carta: 5, odu: 1 },
      { casa: 10, carta: 12, odu: 2 },
      { casa: 20, carta: 23, odu: 3 },
      { casa: 30, carta: 31, odu: 4 },
      { casa: 36, carta: 7, odu: 5 },
    ];
    const result = validateCardUniqueness(buildMatrix(placed));
    expect(result.valid).toBe(true);
    expect(result.duplicates).toHaveLength(0);
  });

  it('returns valid=false when the same card appears in multiple houses', () => {
    // Card 12 placed in house 5 and house 15 — duplicate
    const matrix: MatrixData = {};
    matrix[5] = {
      carta: { numero: 12, nome: 'Criar', significado: 'test' },
      odu: { numero: 1, nome: 'Odu', significado: 'test' },
    };
    matrix[15] = {
      carta: { numero: 12, nome: 'Criar', significado: 'test' },
      odu: { numero: 2, nome: 'Odu', significado: 'test' },
    };
    matrix[10] = {
      carta: { numero: 7, nome: 'Serpente', significado: 'test' },
      odu: { numero: 3, nome: 'Odu', significado: 'test' },
    };

    const result = validateCardUniqueness(matrix);
    expect(result.valid).toBe(false);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0]!.cardNumber).toBe(12);
    expect(result.duplicates[0]!.houses).toContain(5);
    expect(result.duplicates[0]!.houses).toContain(15);
  });

  it('skips houses with null/undefined carta (empty positions are not duplicates)', () => {
    // Only house 10 has a card; houses 5 and 15 are absent/null
    const matrix: MatrixData = {};
    matrix[10] = {
      carta: { numero: 5, nome: 'Árvore', significado: 'test' },
      odu: { numero: 1, nome: 'Odu', significado: 'test' },
    };
    // matrix[5] and matrix[15] are not set — equivalent to null carta

    const result = validateCardUniqueness(matrix);
    expect(result.valid).toBe(true);
    expect(result.duplicates).toHaveLength(0);
  });

  it('detects multiple distinct duplicate cards simultaneously', () => {
    const matrix: MatrixData = {};
    // Card 3 duplicated in houses 3 and 30
    matrix[3] = { carta: { numero: 3, nome: 'Navio', significado: 'test' }, odu: { numero: 1, nome: 'Odu', significado: 'test' } };
    matrix[30] = { carta: { numero: 3, nome: 'Navio', significado: 'test' }, odu: { numero: 1, nome: 'Odu', significado: 'test' } };
    // Card 18 duplicated in houses 18 and 25
    matrix[18] = { carta: { numero: 18, nome: 'Cachorro', significado: 'test' }, odu: { numero: 1, nome: 'Odu', significado: 'test' } };
    matrix[25] = { carta: { numero: 18, nome: 'Cachorro', significado: 'test' }, odu: { numero: 1, nome: 'Odu', significado: 'test' } };

    const result = validateCardUniqueness(matrix);
    expect(result.valid).toBe(false);
    expect(result.duplicates).toHaveLength(2);
    const nums = result.duplicates.map((d) => d.cardNumber).sort((a, b) => a - b);
    expect(nums).toEqual([3, 18]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT 5 — Theme router: same question → same houses (deterministic)
// ─────────────────────────────────────────────────────────────────────────────
// The theme router maps free-text questions to houses deterministically via
// keyword scoring. Same input must always produce identical output.
describe('AD-19.4 Invariant 5 — Theme router determinism', () => {
  it('same question returns identical RoutingResult (amor)', () => {
    const q = 'sobre meu relacionamento amoroso';
    const first = routeQuestion(q);
    const second = routeQuestion(q);
    expect(first).toEqual(second);
  });

  it('same question returns identical RoutingResult (dinheiro)', () => {
    const q = 'dinheiro e finanças';
    const first = routeQuestion(q);
    const second = routeQuestion(q);
    expect(first).toEqual(second);
  });

  it('"amor" and "dinheiro" route to different houses', () => {
    const amor = routeQuestion('relacionamento e amor');
    const dinheiro = routeQuestion('finanças e dinheiro');
    expect(amor.houses).not.toEqual(dinheiro.houses);
  });

  it('10 repeated calls produce byte-identical results (no randomization)', () => {
    const q = 'carreira profissional sucesso';
    const baseline = routeQuestion(q);
    for (let i = 0; i < 10; i++) {
      const result = routeQuestion(q);
      expect(result.themes, `Call ${i + 1}`).toEqual(baseline.themes);
      expect(result.houses, `Call ${i + 1}`).toEqual(baseline.houses);
    }
  });

  it('question without matching keywords falls back to tema geral', () => {
    const result = routeQuestion('asdfghjkl');
    expect(result.themes).toContain('geral');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT 6 — RAG closed: consult never cites outside the tiragem
// ─────────────────────────────────────────────────────────────────────────────
// This invariant is enforced at the prompt level via the SYSTEM instruction:
// "Never cite cards outside those listed in the tiragem."
// It CANNOT be unit-tested here because it requires:
//   1. An LLM invocation with a real/free AI call
//   2. Assertion that the generated text does not name unlisted card numbers
//   3. A harness to run the full consult flow
// SKIPPED: covered by integration tests (tests/integration/spiritual-reading.test.ts).
describe('AD-19.4 Invariant 6 — RAG closed loop [requires integration test]', () => {
  it.skip(
    'TODO(AD-19.4): Assert LLM output never references a card number not ' +
      'present in the tiragem matrixData. This requires the full consult ' +
      'flow (Oracle → Prompt Builder → LLM) and cannot be unit-tested ' +
      'without mocking the LLM. See tests/integration/spiritual-reading.test.ts.'
  );
});
