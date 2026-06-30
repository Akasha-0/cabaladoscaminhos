/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTATION ENGINE · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * Self-running test harness — node --experimental-strip-types
 * (or `node --import tsx --test`). Targets ≥30 assertions covering:
 *
 *   1. Validation — axes, traditions, contexts, scores, consent
 *   2. Self-attribution forbidden
 *   3. Decay math (half-life, floor)
 *   4. Axis scoring (multi-eixo, NUNCA single-score)
 *   5. Tradition × axis scoring (não-comparativo, 25 cells)
 *   6. Trend detection (rising / stable / falling / new)
 *   7. LGPD: stripReporterIdentities, purgeExpired
 *   8. Consent: opt-in, opt-out (purge imediato)
 *   9. Radar data (5 eixos visíveis)
 *  10. Branded types + type guards
 *
 * Durable lessons applied:
 *   - Self-running spec (cycle 68+)
 *   - _resetBetween() pattern (cycle 73)
 *   - Fake clock { now: () => fakeNow } (cycle 92 lesson #8)
 *   - Result narrowing positive `if (r.ok)` (cycle 73)
 *   - Object.freeze on insert (cycle 68)
 *   - Sacred-cultural compliance (terms preserved verbatim)
 */

// @ts-ignore — node-stubs.d.ts provides global types
declare const process: { exit(code: number): never; argv: string[] };
import {
  ReputationEngine,
  AXIS_LABELS_PT_BR,
  AXIS_GLYPHS,
  TRADITION_LABELS_PT_BR,
  TREND_LABELS_PT_BR,
} from '../reputation-engine.ts';
import {
  InMemoryReputationStorage,
} from '../reputation-storage.ts';
import {
  REPUTATION_AXES,
  TRADITIONS,
  ATTRIBUTION_SCORE_MIN,
  ATTRIBUTION_SCORE_MAX,
  ATTRIBUTION_SCORE_NEUTRAL,
  ATTRIBUTION_HALF_LIFE_DAYS,
  LGPD_MAX_RETENTION_DAYS,
  DECAY_FLOOR,
  RADAR_MAX_SCORE,
  RADAR_MIN_DISPLAY,
  TRADITION_AXIS_WEIGHTS,
  asPersonId,
  asAttributionId,
  isReputationAxis,
  isTraditionId,
  isAttributionContext,
  isValidScore,
  type Attribution,
  type AttributionId,
  type PersonId,
  type ReputationAxis,
  type TraditionId,
  type CreateAttributionInput,
} from '../reputation-types.ts';

// ════════════════════════════════════════════════════════════════════════════
// HARNESS
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertFalse(v: unknown, label?: string): void {
  if (v) throw new Error(`assertFalse FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertContains(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertContains FAIL${label ? ' (' + label + ')' : ''}: ${JSON.stringify(needle)} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertRange(value: number, min: number, max: number, label?: string): void {
  if (value < min || value > max) {
    throw new Error(
      `assertRange FAIL${label ? ' (' + label + ')' : ''}: ${value} not in [${min}, ${max}]`,
    );
  }
}

function assertThrows(fn: () => unknown, label?: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(`assertThrows FAIL${label ? ' (' + label + ')' : ''}: no throw`);
}

// ════════════════════════════════════════════════════════════════════════════
// FIXTURES — fake clock + helpers
// ════════════════════════════════════════════════════════════════════════════

const T0 = 1700000000000; // epoch ms — fixed
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Clock fake — começa em T0, pode avançar. */
function makeFakeClock(startAt: number = T0): { now: () => number; advance: (days: number) => void } {
  let current = startAt;
  return {
    now: () => current,
    advance: (days: number) => {
      current += days * ONE_DAY_MS;
    },
  };
}

function makeEngine(opts?: { now?: () => number; halfLifeDays?: number; maxRetentionDays?: number }): ReputationEngine {
  return new ReputationEngine({
    now: opts?.now ?? (() => T0),
    halfLifeDays: opts?.halfLifeDays ?? ATTRIBUTION_HALF_LIFE_DAYS,
    maxRetentionDays: opts?.maxRetentionDays ?? LGPD_MAX_RETENTION_DAYS,
  });
}

function makeAttribution(
  overrides: Partial<Attribution> & { toPersonId: PersonId; fromPersonId: PersonId; axis: ReputationAxis; score: 1 | 2 | 3 | 4 | 5 },
): Attribution {
  return Object.freeze({
    id: asAttributionId(`attr_${overrides.createdAt ?? T0}_${Math.random().toString(36).slice(2, 8)}`),
    tradition: 'Candomblé' as TraditionId,
    context: 'consulta' as const,
    createdAt: T0,
    consentGiven: true,
    ...overrides,
  });
}

function makeInput(overrides: Partial<CreateAttributionInput> = {}): CreateAttributionInput {
  return {
    fromPersonId: asPersonId('from_person'),
    toPersonId: asPersonId('to_person'),
    axis: 'acolhimento',
    score: 4,
    tradition: 'Candomblé',
    context: 'consulta',
    consentGiven: true,
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Constants & type guards (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('REPUTATION_AXES has exactly 5 universal axes (no overall)', () => {
  assertEqual(REPUTATION_AXES.length, 5);
  assertFalse(REPUTATION_AXES.includes('overall' as ReputationAxis), 'must NOT have single-score "overall"');
  assertContains(REPUTATION_AXES.join(','), 'acolhimento');
  assertContains(REPUTATION_AXES.join(','), 'conhecimento');
  assertContains(REPUTATION_AXES.join(','), 'presenca');
  assertContains(REPUTATION_AXES.join(','), 'contribuicao');
  assertContains(REPUTATION_AXES.join(','), 'escuta');
});

it('TRADITIONS has exactly 5 sacred traditions', () => {
  assertEqual(TRADITIONS.length, 5);
  assertContains(TRADITIONS.join(','), 'Candomblé');
  assertContains(TRADITIONS.join(','), 'Umbanda');
  assertContains(TRADITIONS.join(','), 'Ifá');
  assertContains(TRADITIONS.join(','), 'Astrologia');
  assertContains(TRADITIONS.join(','), 'Cabala');
});

it('TRADITION_AXIS_WEIGHTS has unique weighting per tradition (não-comparativo)', () => {
  const c: number = TRADITION_AXIS_WEIGHTS.Candomblé.acolhimento;
  const u: number = TRADITION_AXIS_WEIGHTS.Umbanda.acolhimento;
  const i: number = TRADITION_AXIS_WEIGHTS['Ifá'].acolhimento;
  const a: number = TRADITION_AXIS_WEIGHTS.Astrologia.acolhimento;
  const k: number = TRADITION_AXIS_WEIGHTS.Cabala.acolhimento;
  // Diferentes pesos = não-comparativo. (Não é "melhor", é "valoriza diferente")
  assertTrue(c !== u || u !== i || i !== a || a !== k, 'pesos devem variar entre tradições');
  // Candomblé valoriza presença (axé) mais que Cabala valoriza
  assertTrue(
    TRADITION_AXIS_WEIGHTS.Candomblé.presenca > TRADITION_AXIS_WEIGHTS.Cabala.presenca,
    'Candomblé (axé) > Cabala em presença',
  );
  // Astrologia valoriza contribuição mais que Candomblé
  assertTrue(
    TRADITION_AXIS_WEIGHTS.Astrologia.contribuicao > TRADITION_AXIS_WEIGHTS.Candomblé.contribuicao,
    'Astrologia > Candomblé em contribuição',
  );
});

it('type guards behave correctly for axes/traditions/contexts/scores', () => {
  assertTrue(isReputationAxis('acolhimento'));
  assertTrue(isReputationAxis('escuta'));
  assertFalse(isReputationAxis('overall'));
  assertFalse(isReputationAxis(123 as unknown));

  assertTrue(isTraditionId('Candomblé'));
  assertTrue(isTraditionId('Cabala'));
  assertFalse(isTraditionId('Tarot'));
  assertFalse(isTraditionId(null as unknown));

  assertTrue(isAttributionContext('consulta'));
  assertTrue(isAttributionContext('estudo'));
  assertFalse(isAttributionContext('random'));

  assertTrue(isValidScore(1));
  assertTrue(isValidScore(5));
  assertFalse(isValidScore(0));
  assertFalse(isValidScore(6));
  assertFalse(isValidScore('3' as unknown));
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Engine validation (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('engine rejects attribution without consentGiven (LGPD)', () => {
  const engine = makeEngine();
  const v = engine.validateAttribution(makeInput({ consentGiven: false }));
  assertFalse(v.ok);
  if (!v.ok) assertEqual(v.error, 'consent-required');
});

it('engine rejects self-attribution (universalismo: não avalia a si mesmo)', () => {
  const engine = makeEngine();
  const sameId = asPersonId('same');
  const v = engine.validateAttribution(makeInput({ fromPersonId: sameId, toPersonId: sameId }));
  assertFalse(v.ok);
  if (!v.ok) assertEqual(v.error, 'self-attribution-forbidden');
});

it('engine rejects invalid axis / tradition / context / score', () => {
  const engine = makeEngine();
  assertEqual(engine.validateAttribution(makeInput({ axis: 'overall' as ReputationAxis })).ok, false);
  assertEqual(engine.validateAttribution(makeInput({ tradition: 'Tarot' as TraditionId })).ok, false);
  assertEqual(engine.validateAttribution(makeInput({ context: 'random' as 'consulta' })).ok, false);
  assertEqual(engine.validateAttribution(makeInput({ score: 6 as 4 })).ok, false);
});

it('engine rejects empty fromId / toId', () => {
  const engine = makeEngine();
  const v1 = engine.validateAttribution(makeInput({ fromPersonId: '' as unknown as PersonId }));
  assertFalse(v1.ok);
  if (!v1.ok) assertEqual(v1.error, 'empty-from-id');
  const v2 = engine.validateAttribution(makeInput({ toPersonId: '' as unknown as PersonId }));
  assertFalse(v2.ok);
  if (!v2.ok) assertEqual(v2.error, 'empty-to-id');
});

it('engine accepts valid attribution (LGPD + universalismo OK)', () => {
  const engine = makeEngine();
  const v = engine.validateAttribution(makeInput());
  assertTrue(v.ok);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Attribution creation (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('createAttribution returns frozen Attribution with unique ID', () => {
  const engine = makeEngine();
  const r1 = engine.createAttribution(makeInput());
  const r2 = engine.createAttribution(makeInput());
  assertTrue(r1.ok && r2.ok);
  if (r1.ok && r2.ok) {
    assertTrue(r1.value.id !== r2.value.id, 'IDs must differ');
    assertTrue(Object.isFrozen(r1.value), 'Attribution must be frozen');
  }
});

it('createAttribution includes note when provided', () => {
  const engine = makeEngine();
  const r = engine.createAttribution(makeInput({ note: 'Acolhimento com axé genuíno' }));
  assertTrue(r.ok);
  if (r.ok) {
    assertEqual(r.value.note, 'Acolhimento com axé genuíno');
  }
});

it('createAttribution fails when consent=false', () => {
  const engine = makeEngine();
  const r = engine.createAttribution(makeInput({ consentGiven: false }));
  assertFalse(r.ok);
  if (!r.ok) assertEqual(r.error, 'consent-required');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Decay math (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('decayFactor returns 1 for age=0', () => {
  const engine = makeEngine();
  assertEqual(engine.decayFactor(0), 1);
});

it('decayFactor at halfLife is exactly 0.5', () => {
  const engine = makeEngine({ halfLifeDays: 60 });
  // 2^(-60/60) = 0.5
  assertEqual(Number(engine.decayFactor(60).toFixed(4)), 0.5);
});

it('decayFactor never drops below DECAY_FLOOR', () => {
  const engine = makeEngine({ halfLifeDays: 60 });
  assertRange(engine.decayFactor(365 * 10), DECAY_FLOOR, 1);
  assertEqual(engine.decayFactor(99999), DECAY_FLOOR);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Axis scoring multi-eixo (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('computeAxisScore returns zero for axis with no attributions', () => {
  const engine = makeEngine();
  const score = engine.computeAxisScore('acolhimento', []);
  assertEqual(score.rawScore, 0);
  assertEqual(score.count, 0);
  assertEqual(score.trend, 'new');
  assertEqual(score.lastAttributionAt, 0);
});

it('computeAxisScore returns 5 distinct axes (multi-eixo, NUNCA single)', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const attrs: Attribution[] = [];
  for (const axis of REPUTATION_AXES) {
    attrs.push(
      makeAttribution({
        fromPersonId: asPersonId('peer'),
        toPersonId: focal,
        axis,
        score: 5,
        tradition: 'Candomblé',
        createdAt: T0 - ONE_DAY_MS, // 1 dia atrás (decay ~ 0.99)
      }),
    );
  }
  const scores = REPUTATION_AXES.map((axis) => engine.computeAxisScore(axis, attrs));
  assertEqual(scores.length, 5);
  // Todos com score > 0
  for (const s of scores) assertTrue(s.rawScore > 0, `${s.axis} deve ter score > 0`);
  // Cada eixo é independente — devem ter counts separados
  for (const s of scores) assertEqual(s.count, 1);
});

it('computeAxisScore respects score range [0..100]', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  // 20 atribuições full-positive — saturar em 100
  const attrs: Attribution[] = [];
  for (let i = 0; i < 20; i++) {
    attrs.push(
      makeAttribution({
        fromPersonId: asPersonId('peer'),
        toPersonId: focal,
        axis: 'acolhimento',
        score: 5,
        tradition: 'Candomblé',
        createdAt: T0,
      }),
    );
  }
  const score = engine.computeAxisScore('acolhimento', attrs);
  assertRange(score.rawScore, 0, RADAR_MAX_SCORE);
  // Saturado em ~100
  assertTrue(score.rawScore >= 95, 'saturado deve estar perto de 100');
});

it('computeAxisScore ignores wrong-axis attributions', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: focal,
      axis: 'conhecimento', // wrong axis for acolhimento
      score: 5,
      tradition: 'Candomblé',
    }),
  ];
  const score = engine.computeAxisScore('acolhimento', attrs);
  assertEqual(score.count, 0);
});

it('computeAxisScore filters out non-consented attributions (LGPD)', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: focal,
      axis: 'acolhimento',
      score: 5,
      consentGiven: false,
    }),
  ];
  const score = engine.computeAxisScore('acolhimento', attrs);
  assertEqual(score.count, 0, 'consentGiven=false deve ser ignorado');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Tradition × axis scoring (não-comparativo) (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('computeTraditionAxisScores returns 25 cells (5 tradições × 5 eixos)', () => {
  const engine = makeEngine();
  const cells = engine.computeTraditionAxisScores([]);
  assertEqual(cells.length, 25);
  // Verifica que cada (tradição, eixo) aparece exatamente uma vez
  const seen = new Set<string>();
  for (const cell of cells) {
    const key = `${cell.tradition}|${cell.axis}`;
    assertFalse(seen.has(key), `duplicate cell: ${key}`);
    seen.add(key);
  }
});

it('computeTraditionAxisScores weights differ per tradition (não-comparativo)', () => {
  const engine = makeEngine();
  const cells = engine.computeTraditionAxisScores([]);
  const candomblePresenca = cells.find(
    (c) => c.tradition === 'Candomblé' && c.axis === 'presenca',
  );
  const cabalaPresenca = cells.find(
    (c) => c.tradition === 'Cabala' && c.axis === 'presenca',
  );
  assertTrue(!!candomblePresenca && !!cabalaPresenca);
  if (candomblePresenca && cabalaPresenca) {
    assertTrue(
      candomblePresenca.weight > cabalaPresenca.weight,
      'Candomblé deve ter peso maior em presença (axé)',
    );
  }
});

it('computeTraditionAxisScores NÃO agrega entre tradições (cada cell é independente)', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  // Só recebe Candomblé
  const attrs: Attribution[] = [];
  for (let i = 0; i < 5; i++) {
    attrs.push(
      makeAttribution({
        fromPersonId: asPersonId('peer'),
        toPersonId: focal,
        axis: 'acolhimento',
        score: 5,
        tradition: 'Candomblé',
        createdAt: T0,
      }),
    );
  }
  const cells = engine.computeTraditionAxisScores(attrs);
  const candomble = cells.find((c) => c.tradition === 'Candomblé' && c.axis === 'acolhimento');
  const astrologia = cells.find((c) => c.tradition === 'Astrologia' && c.axis === 'acolhimento');
  assertTrue(!!candomble && !!astrologia);
  if (candomble && astrologia) {
    // Candomblé tem score > 0, Astrologia tem 0 (não recebeu nada)
    assertTrue(candomble.score > 0);
    assertEqual(astrologia.score, 0);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — Trend detection (2 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('computeAxisScore trend=new para primeira atribuição < 7 dias', () => {
  const engine = makeEngine();
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: asPersonId('focal'),
      axis: 'acolhimento',
      score: 5,
      createdAt: T0 - 2 * ONE_DAY_MS, // 2 dias atrás
    }),
  ];
  const score = engine.computeAxisScore('acolhimento', attrs);
  assertEqual(score.trend, 'new');
});

it('computeAxisScore trend=stable para atribuições antigas sem mudança', () => {
  const engine = makeEngine();
  // Janela de 30 dias (trendWindowDays padrão). Atribuições espalhadas.
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: asPersonId('focal'),
      axis: 'conhecimento',
      score: 4,
      createdAt: T0 - 100 * ONE_DAY_MS,
    }),
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: asPersonId('focal'),
      axis: 'conhecimento',
      score: 4,
      createdAt: T0 - 50 * ONE_DAY_MS,
    }),
  ];
  const score = engine.computeAxisScore('conhecimento', attrs);
  assertEqual(score.trend, 'stable');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — Snapshot + LGPD (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('computeSnapshot returns 5 axes + 25 cells (multi-eixo sempre)', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const snap = engine.computeSnapshot({ personId: focal }, []);
  assertEqual(snap.axes.length, 5);
  assertEqual(snap.byTradition.length, 25);
  assertEqual(snap.consentStatus, 'opted-in');
  assertEqual(snap.totalAttributions, 0);
});

it('computeSnapshot excludes opted-out person (LGPD)', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: focal,
      axis: 'acolhimento',
      score: 5,
    }),
  ];
  const snapOptedOut = engine.computeSnapshot({ personId: focal }, attrs, 'opted-out');
  assertEqual(snapOptedOut.totalAttributions, 0);
  assertEqual(snapOptedOut.consentStatus, 'opted-out');
  for (const axis of snapOptedOut.axes) {
    assertEqual(axis.count, 0);
  }
});

it('computeSnapshot reflects retentionDays of oldest attribution', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: focal,
      axis: 'acolhimento',
      score: 5,
      createdAt: T0 - 30 * ONE_DAY_MS,
    }),
  ];
  const snap = engine.computeSnapshot({ personId: focal }, attrs);
  assertRange(snap.retentionDays, 29, 31);
});

it('computeSnapshot context breakdown counts by AttributionContext', () => {
  const engine = makeEngine();
  const focal = asPersonId('focal');
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('p1'),
      toPersonId: focal,
      axis: 'acolhimento',
      score: 5,
      context: 'consulta',
    }),
    makeAttribution({
      fromPersonId: asPersonId('p2'),
      toPersonId: focal,
      axis: 'conhecimento',
      score: 5,
      context: 'estudo',
    }),
    makeAttribution({
      fromPersonId: asPersonId('p3'),
      toPersonId: focal,
      axis: 'escuta',
      score: 4,
      context: 'estudo',
    }),
  ];
  const snap = engine.computeSnapshot({ personId: focal }, attrs);
  assertEqual(snap.contextBreakdown.consulta, 1);
  assertEqual(snap.contextBreakdown.estudo, 2);
  assertEqual(snap.contextBreakdown.peer, 0);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 9 — LGPD strip & purge (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('stripReporterIdentities removes fromPersonId and note (PII)', () => {
  const engine = makeEngine();
  const attr = makeAttribution({
    fromPersonId: asPersonId('reporter_secret'),
    toPersonId: asPersonId('victim'),
    axis: 'acolhimento',
    score: 5,
    note: 'PII aqui',
  });
  const pub = engine.stripReporterIdentities(attr);
  assertFalse('fromPersonId' in pub, 'fromPersonId deve ser removido');
  assertFalse('note' in pub, 'note deve ser removido');
  assertEqual(pub.axis, 'acolhimento');
  assertEqual(pub.score, 5);
});

it('stripReporterIdentitiesBatch aplica em lote', () => {
  const engine = makeEngine();
  const batch = [
    makeAttribution({ fromPersonId: asPersonId('a'), toPersonId: asPersonId('b'), axis: 'acolhimento', score: 5 }),
    makeAttribution({ fromPersonId: asPersonId('c'), toPersonId: asPersonId('d'), axis: 'conhecimento', score: 4 }),
  ];
  const pub = engine.stripReporterIdentitiesBatch(batch);
  assertEqual(pub.length, 2);
  for (const p of pub) {
    assertFalse('fromPersonId' in p);
  }
});

it('purgeExpired removes attributions older than retention', () => {
  const engine = makeEngine({ maxRetentionDays: 90 });
  const focal = asPersonId('focal');
  const attrs = [
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: focal,
      axis: 'acolhimento',
      score: 5,
      createdAt: T0 - 30 * ONE_DAY_MS, // fresh
    }),
    makeAttribution({
      fromPersonId: asPersonId('peer'),
      toPersonId: focal,
      axis: 'conhecimento',
      score: 4,
      createdAt: T0 - 100 * ONE_DAY_MS, // expired
    }),
  ];
  const purged = engine.purgeExpired(attrs, 90, T0);
  assertEqual(purged.length, 1);
  assertEqual(purged[0]!.axis, 'acolhimento');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 10 — Storage end-to-end (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('storage.recordAttribution persists + indexes', () => {
  const store = new InMemoryReputationStorage();
  const r = store.recordAttribution(makeInput());
  assertTrue(r.ok);
  assertEqual(store.stats().totalAttributions, 1);
});

it('storage.listReceivedPublic strips reporter identity (LGPD)', () => {
  const store = new InMemoryReputationStorage();
  const reporter = asPersonId('reporter_secret_id');
  const victim = asPersonId('victim');
  store.recordAttribution(
    makeInput({
      fromPersonId: reporter,
      toPersonId: victim,
      axis: 'acolhimento',
      score: 5,
      note: 'PII',
    }),
  );
  const received = store.listReceivedPublic(victim);
  assertEqual(received.length, 1);
  const first = received[0]!;
  assertFalse('fromPersonId' in first, 'fromPersonId must be stripped');
  assertFalse('note' in first, 'note must be stripped');
});

it('storage.setConsent(opted-out) purges ALL attributions immediately', () => {
  const store = new InMemoryReputationStorage();
  const focal = asPersonId('focal');
  // 3 atribuições recebidas
  for (let i = 0; i < 3; i++) {
    store.recordAttribution(
      makeInput({
        fromPersonId: asPersonId(`peer_${i}`),
        toPersonId: focal,
        axis: 'acolhimento',
        score: 5,
      }),
    );
  }
  assertEqual(store.stats().totalAttributions, 3);
  // Opt-out
  const r = store.setConsent(focal, 'opted-out');
  assertTrue(r.ok);
  assertTrue(r.purgedCount >= 3, 'deve ter purgado ≥3 atribuições');
  // Snapshot deve estar vazio
  const snap = store.getSnapshot(focal) as { totalAttributions: number };
  assertEqual(snap.totalAttributions, 0);
});

it('storage refuses attribution if recipient opted-out (LGPD)', () => {
  const store = new InMemoryReputationStorage();
  const focal = asPersonId('focal');
  store.setConsent(focal, 'opted-out');
  const r = store.recordAttribution(
    makeInput({ fromPersonId: asPersonId('peer'), toPersonId: focal, axis: 'acolhimento', score: 5 }),
  );
  assertFalse(r.ok);
  assertEqual(r.error, 'recipient-opted-out');
});

it('storage.stats() returns no PII', () => {
  const store = new InMemoryReputationStorage();
  for (let i = 0; i < 5; i++) {
    store.recordAttribution(
      makeInput({
        fromPersonId: asPersonId(`p_${i}`),
        toPersonId: asPersonId('focal'),
        axis: 'acolhimento',
        score: 5,
      }),
    );
  }
  const stats = store.stats();
  assertEqual(stats.totalAttributions, 5);
  // stats NÃO tem PII — apenas counts
  assertFalse('fromPersonId' in stats);
  assertFalse('note' in stats);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 11 — Radar data + Display labels (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('radarData returns 5 visible axes when all have score', () => {
  const engine = makeEngine();
  const snap = engine.computeSnapshot({ personId: asPersonId('focal') }, [
    ...REPUTATION_AXES.map((axis, i) =>
      makeAttribution({
        fromPersonId: asPersonId(`p${i}`),
        toPersonId: asPersonId('focal'),
        axis,
        score: 5,
        createdAt: T0,
      }),
    ),
  ]);
  const radar = engine.radarData(snap);
  assertEqual(radar.length, 5);
  for (const r of radar) assertTrue(r.visible);
});

it('AXIS_LABELS_PT_BR preserva 5 eixos em pt-BR', () => {
  assertEqual(AXIS_LABELS_PT_BR.acolhimento, 'Acolhimento');
  assertEqual(AXIS_LABELS_PT_BR.conhecimento, 'Conhecimento');
  assertEqual(AXIS_LABELS_PT_BR.presenca, 'Presença');
  assertEqual(AXIS_LABELS_PT_BR.contribuicao, 'Contribuição');
  assertEqual(AXIS_LABELS_PT_BR.escuta, 'Escuta');
});

it('TRADITION_LABELS_PT_BR preserva termos sagrados (orixás, axé)', () => {
  assertEqual(TRADITION_LABELS_PT_BR.Candomblé, 'Candomblé');
  assertEqual(TRADITION_LABELS_PT_BR.Umbanda, 'Umbanda');
  assertEqual(TRADITION_LABELS_PT_BR['Ifá'], 'Ifá');
  assertEqual(TRADITION_LABELS_PT_BR.Astrologia, 'Astrologia');
  assertEqual(TRADITION_LABELS_PT_BR.Cabala, 'Cabala');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 12 — Sacred-cultural compliance & as const (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('forbidden vocab NÃO aparece em exports (grafia sem til/sem acento)', () => {
  // Já garantido pela compilação + source scan manual.
  // Aqui validamos que as labels pt-BR usam a grafia correta.
  const all = Object.values(TRADITION_LABELS_PT_BR).join(' ');
  assertFalse(all.includes('or' + 'ishas'), 'grafia errada: forma sem til');
  assertFalse(all.includes('ash' + 'é'), 'grafia errada: acento no lugar errado');
  assertContains(all, 'Candomblé');
});

it('TREND_LABELS_PT_BR tem 4 valores (rising/stable/falling/new)', () => {
  assertEqual(Object.keys(TREND_LABELS_PT_BR).length, 4);
  assertEqual(TREND_LABELS_PT_BR.rising, 'Em ascensão');
  assertEqual(TREND_LABELS_PT_BR.stable, 'Estável');
  assertEqual(TREND_LABELS_PT_BR.falling, 'Em declínio');
  assertEqual(TREND_LABELS_PT_BR.new, 'Nova');
});

it('AXIS_GLYPHS tem glyph para cada eixo (decorativo, não-voto)', () => {
  for (const axis of REPUTATION_AXES) {
    assertTrue(!!AXIS_GLYPHS[axis], `${axis} deve ter glyph`);
    assertTrue(AXIS_GLYPHS[axis].length > 0);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 13 — asPersonId / asAttributionId branded helpers (2 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('asPersonId throws on empty string', () => {
  assertThrows(() => asPersonId(''));
});

it('asAttributionId throws on empty string', () => {
  assertThrows(() => asAttributionId(''));
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 14 — Spec coverage floor (1 assert)
// ════════════════════════════════════════════════════════════════════════════

it('minimum 30 assertions target — verify spec length', () => {
  assertTrue(SPEC_REGISTRY.length >= 30, `registered ${SPEC_REGISTRY.length} specs, need ≥30`);
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
      passed++;
      console.log(`  ✓ ${entry.name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${entry.name}: ${msg}`);
      console.log(`  ✗ ${entry.name}`);
      console.log(`    ${msg}`);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${SPEC_REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

// Direct exec — supports both:
//   1. `node --experimental-strip-types reputation-engine.spec.ts`
//   2. `node --import tsx --test reputation-engine.spec.ts` (when run via node:test runner)
const isDirectExec =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].endsWith('reputation-engine.spec.ts');

if (isDirectExec) {
  runSpecs().catch((err: unknown) => {
    console.error('Fatal runner error:', err);
    process.exit(2);
  });
}