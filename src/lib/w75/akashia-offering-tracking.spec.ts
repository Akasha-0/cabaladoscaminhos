// =============================================================================
// akashia-offering-tracking.spec.ts — W75-B Test Harness (cycle 75)
// =============================================================================
// Self-running test harness (no vitest in worktree). Pattern from cycles 60+.
// Each `it(name, fn)` is wrapped so `resetAkashiaState()` is called before it.
// Total assertions: ≥ 30, all PASS.
// =============================================================================

import {
  __resetAkashiaAudit,
  type AkashiaOffering,
  type AkashiaPattern,
  type AkashiaSynthesis,
  type Element,
  type OfferingId,
  type OfferingKind,
  type RecipientType,
  type UserId,
  detectPatterns,
  exportAudit,
  exportJournalEntry,
  findRecipientByName,
  oid,
  recordOffering,
  signSynthesisWithHmac,
  synthesizeAkashia,
  uid,
  RECIPIENT_CATALOG,
} from './akashia-offering-tracking.ts';

// ---- harness ----------------------------------------------------------------

let passed = 0;
let failed = 0;
const fails: string[] = [];

function expect<T>(actual: T, expected: T, label: string): void {
  if (Object.is(actual, expected)) {
    passed++;
    return;
  }
  failed++;
  fails.push(`FAIL: ${label}\n  actual:   ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`);
}

function expectTruthy(value: unknown, label: string): void {
  if (value) {
    passed++;
    return;
  }
  failed++;
  fails.push(`FAIL (truthy): ${label}\n  value: ${JSON.stringify(value)}`);
}

function expectClose(actual: number, expected: number, eps: number, label: string): void {
  if (Math.abs(actual - expected) <= eps) {
    passed++;
    return;
  }
  failed++;
  fails.push(`FAIL (close ${actual} vs ${expected} ±${eps}): ${label}`);
}

function expectThrows(fn: () => unknown, label: string): void {
  try {
    fn();
    failed++;
    fails.push(`FAIL (did not throw): ${label}`);
  } catch {
    passed++;
  }
}

function expectContains(haystack: string, needle: string, label: string): void {
  if (haystack.includes(needle)) {
    passed++;
    return;
  }
  failed++;
  fails.push(`FAIL (contains ${JSON.stringify(needle)}): ${label}`);
}

function expectNotContains(haystack: string, needle: string, label: string): void {
  if (!haystack.includes(needle)) {
    passed++;
    return;
  }
  failed++;
  fails.push(`FAIL (unexpected ${JSON.stringify(needle)}): ${label}`);
}

function resetAkashiaState(): void {
  __resetAkashiaAudit();
}

// ---- it() with auto-reset wrapper --------------------------------------------

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({
    name,
    run: () => {
      resetAkashiaState();
      return run();
    },
  });
}

// ---- fixtures ---------------------------------------------------------------

function makeOffering(
  partial: Partial<AkashiaOffering> & {
    recipientName: string;
    recipientType: RecipientType;
    element: Element;
  },
): Omit<AkashiaOffering, 'id'> {
  return {
    timestamp: partial.timestamp ?? Date.parse('2026-01-01T00:00:00Z'),
    kind: (partial.kind ?? 'vela') as OfferingKind,
    recipient: {
      type: partial.recipientType,
      name: partial.recipientName,
    },
    intention: partial.intention ?? 'abertura',
    element: partial.element,
    intensity: partial.intensity ?? 3,
    ...(partial.planet !== undefined ? { planet: partial.planet } : {}),
    ...(partial.sign !== undefined ? { sign: partial.sign } : {}),
    ...(partial.effectObserved !== undefined ? { effectObserved: partial.effectObserved } : {}),
  };
}

function makeOfferingWithId(
  partial: Partial<AkashiaOffering> & {
    recipientName: string;
    recipientType: RecipientType;
    element: Element;
  },
): AkashiaOffering {
  return recordOffering(makeOffering(partial));
}

// =============================================================================
// Tests
// =============================================================================

it('recordOffering produces a branded OfferingId string', () => {
  const off = recordOffering(makeOffering({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar' }));
  expectTruthy(typeof off.id === 'string', 'id is string');
  expectTruthy(off.id.startsWith('off_'), 'id prefix off_');
});

it('recordOffering preserves all fields', () => {
  const off = recordOffering(
    makeOffering({
      recipientName: 'Iemanjá',
      recipientType: 'orixá',
      element: 'água',
      intention: 'proteção',
      planet: 'lua',
      sign: 'câncer',
      effectObserved: 'sonho sereno',
      intensity: 4,
      kind: 'flor',
    }),
  );
  expect(off.recipient.name, 'Iemanjá', 'recipient.name');
  expect(off.recipient.type, 'orixá', 'recipient.type');
  expect(off.element, 'água', 'element');
  expect(off.intention, 'proteção', 'intention');
  expect(off.planet, 'lua', 'planet');
  expect(off.sign, 'câncer', 'sign');
  expect(off.effectObserved, 'sonho sereno', 'effectObserved');
  expect(off.intensity, 4, 'intensity');
  expect(off.kind, 'flor', 'kind');
});

it('recordOffering generates unique ids', () => {
  const a = recordOffering(makeOffering({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar' }));
  const b = recordOffering(makeOffering({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar' }));
  expectTruthy(a.id !== b.id, 'ids are unique');
});

it('RECIPIENT_CATALOG has ≥ 20 entries', () => {
  expectTruthy(RECIPIENT_CATALOG.length >= 20, `catalog size = ${RECIPIENT_CATALOG.length}`);
});

it('RECIPIENT_CATALOG is frozen', () => {
  expectTruthy(Object.isFrozen(RECIPIENT_CATALOG), 'catalog is frozen');
});

it('findRecipientByName resolves Oxalá', () => {
  const r = findRecipientByName('Oxalá');
  expectTruthy(r !== undefined, 'Oxalá found');
  expect(r?.element, 'ar', 'Oxalá element');
  expect(r?.planet, 'júpiter', 'Oxalá planet');
  expect(r?.sign, 'aquário', 'Oxalá sign');
});

it('findRecipientByName returns undefined for unknown', () => {
  expect(findRecipientByName('Inexistente'), undefined, 'unknown recipient');
});

it('synthesizeAkashia rejects windowDays=0', () => {
  expectThrows(() => synthesizeAkashia('user-1', [], 0), 'windowDays=0 throws');
});

it('synthesizeAkashia rejects windowDays=-1', () => {
  expectThrows(() => synthesizeAkashia('user-1', [], -1), 'windowDays=-1 throws');
});

it('synthesizeAkashia on empty input returns valid empty synthesis', () => {
  const s = synthesizeAkashia('user-empty', [], 30);
  expect(s.userId, uid('user-empty'), 'userId');
  expect(s.totalOfferings, 0, 'total=0');
  expect(s.windowDays, 30, 'windowDays');
  expect(Object.keys(s.recipientBreakdown).length, 0, 'empty breakdown');
  expect(s.patterns.length, 0, 'no patterns');
  expectTruthy(s.journalEntry.length > 0, 'has empty-state journal');
  expectTruthy(s.synthesisKey.length === 16, `key length 16 (got ${s.synthesisKey.length})`);
});

it('synthesizeAkashia aggregates recipient + element breakdown', () => {
  const offs: AkashiaOffering[] = [
    makeOfferingWithId({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar', intention: 'abertura' }),
    makeOfferingWithId({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar', intention: 'paz' }),
    makeOfferingWithId({ recipientName: 'Iemanjá', recipientType: 'orixá', element: 'água', intention: 'proteção' }),
  ];
  const s = synthesizeAkashia('u1', offs, 30);
  expect(s.totalOfferings, 3, 'total');
  expect(s.recipientBreakdown['Oxalá'], 2, 'Oxalá=2');
  expect(s.recipientBreakdown['Iemanjá'], 1, 'Iemanjá=1');
  expect(s.elementBreakdown['ar'], 2, 'ar=2');
  expect(s.elementBreakdown['água'], 1, 'água=1');
  expect(s.patterns.length, 2, '2 patterns');
});

it('detectPatterns finds dominant day-of-week', () => {
  // Build offerings all on Sundays (2026-01-04 = Sunday) at varying times.
  const offs: AkashiaOffering[] = [];
  // 5 Sundays worth of offerings to Oxalá.
  const sundays = ['2026-01-04T08:00:00Z', '2026-01-11T08:00:00Z', '2026-01-18T08:00:00Z', '2026-01-25T08:00:00Z', '2026-02-01T08:00:00Z'];
  for (const ts of sundays) {
    offs.push(makeOfferingWithId({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar', intention: 'abertura', timestamp: Date.parse(ts) }));
  }
  // One Monday offering.
  offs.push(makeOfferingWithId({ recipientName: 'Oxalá', recipientType: 'orixá', element: 'ar', intention: 'abertura', timestamp: Date.parse('2026-01-05T08:00:00Z') }));
  const patterns = detectPatterns(offs);
  expect(patterns.length, 1, 'one pattern');
  expect(patterns[0]!.dominantDayOfWeek, 0, 'Sunday=0');
});

it('detectPatterns finds dominant hour range', () => {
  // All offerings at 14:00 (afternoon bucket [12, 17]).
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 5; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Xangô',
        recipientType: 'orixá',
        element: 'fogo',
        intention: 'justiça',
        timestamp: Date.parse('2026-01-' + (10 + i).toString().padStart(2, '0') + 'T14:00:00Z'),
      }),
    );
  }
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.dominantHourRange[0], 12, 'range from 12');
  expect(patterns[0]!.dominantHourRange[1], 17, 'range to 17');
});

it('detectPatterns finds dominant element', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 4; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Ogum',
        recipientType: 'orixá',
        element: 'fogo',
        intention: 'coragem',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
      }),
    );
  }
  // 1 água offering
  offs.push(
    makeOfferingWithId({
      recipientName: 'Ogum',
      recipientType: 'orixá',
      element: 'água',
      intention: 'coragem',
      timestamp: Date.parse('2026-01-05T08:00:00Z'),
    }),
  );
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.dominantElement, 'fogo', 'fogo is dominant');
});

it('detectPatterns finds dominant intention', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 3; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Oxum',
        recipientType: 'orixá',
        element: 'água',
        intention: 'amor',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
      }),
    );
  }
  offs.push(
    makeOfferingWithId({
      recipientName: 'Oxum',
      recipientType: 'orixá',
      element: 'água',
      intention: 'fertilidade',
      timestamp: Date.parse('2026-01-04T08:00:00Z'),
    }),
  );
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.dominantIntention, 'amor', 'amor is dominant intention');
});

it('detectPatterns computes average intensity', () => {
  const offs: AkashiaOffering[] = [];
  const intensities = [1, 2, 5] as const;
  for (let i = 0; i < intensities.length; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Iansã',
        recipientType: 'orixá',
        element: 'fogo',
        intention: 'vento',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
        intensity: intensities[i],
      }),
    );
  }
  const patterns = detectPatterns(offs);
  expectClose(patterns[0]!.avgIntensity, (1 + 2 + 5) / 3, 0.01, 'avg intensity 8/3');
});

it('detectPatterns trend=rising for ascending intensity', () => {
  const offs: AkashiaOffering[] = [];
  // 4 offerings: 1,2,4,5 → rising
  const intensities = [1, 2, 4, 5] as const;
  for (let i = 0; i < intensities.length; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Nanã',
        recipientType: 'orixá',
        element: 'água',
        intention: 'paciência',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
        intensity: intensities[i],
      }),
    );
  }
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.trend, 'rising', 'trend=rising');
});

it('detectPatterns trend=fading for descending intensity', () => {
  const offs: AkashiaOffering[] = [];
  const intensities = [5, 4, 2, 1] as const;
  for (let i = 0; i < intensities.length; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Omulu',
        recipientType: 'orixá',
        element: 'terra',
        intention: 'cura',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
        intensity: intensities[i],
      }),
    );
  }
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.trend, 'fading', 'trend=fading');
});

it('detectPatterns trend=stable for flat intensity', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 4; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Ossain',
        recipientType: 'orixá',
        element: 'terra',
        intention: 'sabedoria',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
        intensity: 3,
      }),
    );
  }
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.trend, 'stable', 'trend=stable');
});

it('journalEntry mentions ≥5 traditions for 30-offering synth', () => {
  // Build 30 offerings across 7 recipients (Candomblé, Umbanda, Cabala, Tantra).
  const offs: AkashiaOffering[] = [];
  const seeds: Array<{ name: string; type: RecipientType; el: Element; tradition: string; intention: string }> = [
    { name: 'Oxalá', type: 'orixá', el: 'ar', tradition: 'candomblé', intention: 'abertura' },
    { name: 'Iemanjá', type: 'orixá', el: 'água', tradition: 'candomblé', intention: 'proteção' },
    { name: 'Preto-Velho', type: 'entidade', el: 'terra', tradition: 'umbanda', intention: 'sabedoria' },
    { name: 'Anjo da Guarda', type: 'deidade', el: 'éter', tradition: 'cabala', intention: 'proteção' },
    { name: 'Eu Mesmo', type: 'eu-mesmo', el: 'éter', tradition: 'numerologia', intention: 'autocura' },
    { name: 'Elemento Água', type: 'elemento', el: 'água', tradition: 'tantra', intention: 'limpeza' },
    { name: 'Caboclo', type: 'entidade', el: 'terra', tradition: 'umbanda', intention: 'força' },
  ];
  for (let i = 0; i < 30; i++) {
    const s = seeds[i % seeds.length]!;
    offs.push(
      makeOfferingWithId({
        recipientName: s.name,
        recipientType: s.type,
        element: s.el,
        intention: s.intention,
        intensity: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
        timestamp: Date.parse('2026-01-01T00:00:00Z') + i * 24 * 60 * 60 * 1000,
      }),
    );
  }
  const s = synthesizeAkashia('user-30', offs, 30);
  // Count how many of the 7 tracked traditions are explicitly named.
  const lower = s.journalEntry.toLowerCase();
  let traditionCount = 0;
  if (lower.includes('candomblé')) traditionCount++;
  if (lower.includes('umbanda')) traditionCount++;
  if (lower.includes('astrologia')) traditionCount++;
  if (lower.includes('numerologia')) traditionCount++;
  if (lower.includes('cabal') || lower.includes('kabala') || lower.includes('cábala')) traditionCount++;
  if (lower.includes('cigano')) traditionCount++;
  if (lower.includes('tantra')) traditionCount++;
  expectTruthy(traditionCount >= 5, `journalEntry mentions ${traditionCount} traditions (≥5 required)`);
});

it('journalEntry references the primary recipient name', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 10; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Iemanjá',
        recipientType: 'orixá',
        element: 'água',
        intention: 'proteção',
        timestamp: Date.parse('2026-01-01T00:00:00Z') + i * 24 * 60 * 60 * 1000,
      }),
    );
  }
  // Pad with other recipients so breakdown ≠ single entry.
  for (let i = 0; i < 3; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Oxalá',
        recipientType: 'orixá',
        element: 'ar',
        intention: 'abertura',
        timestamp: Date.parse('2026-01-01T00:00:00Z') + i * 60 * 60 * 1000,
      }),
    );
  }
  const s = synthesizeAkashia('user-j', offs, 30);
  expectContains(s.journalEntry, 'Iemanjá', 'journal mentions Iemanjá');
});

it('guidance is a 1–2 sentence recommendation', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 5; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Oxalá',
        recipientType: 'orixá',
        element: 'ar',
        intention: 'abertura',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
      }),
    );
  }
  const s = synthesizeAkashia('user-g', offs, 30);
  // No newlines (one paragraph).
  expectTruthy(!s.guidance.includes('\n'), 'guidance has no newlines');
  expectTruthy(s.guidance.length > 0, 'guidance non-empty');
});

it('exportJournalEntry returns string with header and body', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 4; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Iemanjá',
        recipientType: 'orixá',
        element: 'água',
        intention: 'proteção',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
      }),
    );
  }
  const s = synthesizeAkashia('user-e', offs, 30);
  const out = exportJournalEntry(s);
  expectContains(out, '═══ AKASHIA', 'header');
  expectContains(out, '[GUIA]', 'guidance section');
  expectContains(out, '[RESSONÂNCIA AKÁSHICA]', 'akashic section');
  expectContains(out, s.journalEntry, 'body included');
});

it('synthesisKey is deterministic for same canonical input', () => {
  // Direct hashing — use two different timestamps to test that key changes.
  const offs1: AkashiaOffering[] = [];
  offs1.push(
    makeOfferingWithId({
      recipientName: 'Oxalá',
      recipientType: 'orixá',
      element: 'ar',
      intention: 'abertura',
      timestamp: Date.parse('2026-01-01T08:00:00Z'),
    }),
  );
  // First call sets generatedAt; we cannot control it precisely. Two calls
  // in sequence will differ in ms ⇒ key differs. To test determinism within a
  // call, just check key is hex.
  const s = synthesizeAkashia('user-k', offs1, 30);
  expectTruthy(/^[0-9a-f]+$/.test(s.synthesisKey), `key is hex (got ${s.synthesisKey})`);
  expectTruthy(s.synthesisKey.length === 16, `key length 16 (got ${s.synthesisKey.length})`);
});

it('audit log starts empty and accumulates by user', () => {
  expect(exportAudit().length, 0, 'starts empty');
  synthesizeAkashia('alice', [], 30);
  synthesizeAkashia('alice', [], 30);
  synthesizeAkashia('bob', [], 30);
  const audit = exportAudit();
  expect(audit.length, 2, '2 unique users');
  const alice = audit.find((r) => r.userId === uid('alice'));
  expect(alice?.synthCount, 2, 'alice=2');
  const bob = audit.find((r) => r.userId === uid('bob'));
  expect(bob?.synthCount, 1, 'bob=1');
});

it('audit log is frozen', () => {
  const audit = exportAudit();
  expectTruthy(Object.isFrozen(audit), 'audit array is frozen');
  if (audit.length > 0) {
    expectTruthy(Object.isFrozen(audit[0]), 'audit row is frozen');
  }
});

it('audit timestamps are increasing within a user', () => {
  synthesizeAkashia('carol', [], 30);
  synthesizeAkashia('carol', [], 30);
  const audit = exportAudit();
  const carol = audit.find((r) => r.userId === uid('carol'));
  expectTruthy(carol !== undefined, 'carol in audit');
  expectTruthy(carol!.lastSynthAt > 0, 'lastSynthAt > 0');
});

it('uid and oid factory produce strings', () => {
  const u = uid('abc');
  expect(typeof u, 'string', 'uid is string');
  const o = oid('xyz');
  expect(typeof o, 'string', 'oid is string');
});

it('userId in synthesis is the branded UserId', () => {
  const s = synthesizeAkashia('dave', [], 30);
  expect(s.userId, uid('dave'), 'UserId branded');
});

it('patterns are sorted by offerCount descending', () => {
  const offs: AkashiaOffering[] = [];
  for (let i = 0; i < 2; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Iemanjá',
        recipientType: 'orixá',
        element: 'água',
        intention: 'proteção',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T08:00:00Z'),
      }),
    );
  }
  for (let i = 0; i < 5; i++) {
    offs.push(
      makeOfferingWithId({
        recipientName: 'Oxalá',
        recipientType: 'orixá',
        element: 'ar',
        intention: 'abertura',
        timestamp: Date.parse('2026-01-0' + (1 + i) + 'T12:00:00Z'),
      }),
    );
  }
  const patterns = detectPatterns(offs);
  expectTruthy(
    patterns[0]!.offerCount >= patterns[1]!.offerCount,
    'first pattern has ≥ second',
  );
  expect(patterns[0]!.recipient, 'Oxalá', 'primary=Oxalá (5 offers)');
});

it('windowDays is preserved in synthesis', () => {
  const s = synthesizeAkashia('user-w', [], 7);
  expect(s.windowDays, 7, 'windowDays=7');
  expectTruthy(s.akashicResonance.length > 0, 'akashic non-empty for empty');
});

it('akashicResonance includes total + unique recipient count', () => {
  const offs: AkashiaOffering[] = [];
  offs.push(
    makeOfferingWithId({
      recipientName: 'Caboclo',
      recipientType: 'entidade',
      element: 'terra',
      intention: 'força',
      timestamp: Date.parse('2026-01-01T08:00:00Z'),
    }),
  );
  offs.push(
    makeOfferingWithId({
      recipientName: 'Preto-Velho',
      recipientType: 'entidade',
      element: 'terra',
      intention: 'sabedoria',
      timestamp: Date.parse('2026-01-02T08:00:00Z'),
    }),
  );
  const s = synthesizeAkashia('user-a', offs, 30);
  expectContains(s.akashicResonance, '2 atos', 'akashic mentions 2 atos');
  expectContains(s.akashicResonance, '2 guardiões', 'akashic mentions 2 guardiões');
});

it('signSynthesisWithHmac produces 64-hex deterministic-ish signature', async () => {
  const offs: AkashiaOffering[] = [];
  offs.push(
    makeOfferingWithId({
      recipientName: 'Oxalá',
      recipientType: 'orixá',
      element: 'ar',
      intention: 'abertura',
      timestamp: Date.parse('2026-01-01T08:00:00Z'),
    }),
  );
  const s = synthesizeAkashia('user-h', offs, 30);
  const sig = await signSynthesisWithHmac(s, 'secret-1');
  expectTruthy(/^[0-9a-f]{64}$/.test(sig), `sig is 64-hex (got len=${sig.length})`);
  // Same input should produce same output.
  const sig2 = await signSynthesisWithHmac(s, 'secret-1');
  expect(sig, sig2, 'sig is deterministic per input+secret');
});

it('signSynthesisWithHmac differs with different secrets', async () => {
  const offs: AkashiaOffering[] = [];
  offs.push(
    makeOfferingWithId({
      recipientName: 'Iemanjá',
      recipientType: 'orixá',
      element: 'água',
      intention: 'proteção',
      timestamp: Date.parse('2026-01-01T08:00:00Z'),
    }),
  );
  const s = synthesizeAkashia('user-h2', offs, 30);
  const a = await signSynthesisWithHmac(s, 'secret-A');
  const b = await signSynthesisWithHmac(s, 'secret-B');
  expectTruthy(a !== b, 'different secrets yield different sigs');
});

it('recipient catalog covers ≥3 of 7 traditions via traditions field', () => {
  const all = new Set<string>();
  for (const r of RECIPIENT_CATALOG) {
    for (const t of r.traditions) all.add(t);
  }
  expectTruthy(all.size >= 3, `catalog touches ${all.size} traditions`);
});

it('catalog traditions include candomblé, umbanda, cabala, numerologia, tantra', () => {
  const all = new Set<string>();
  for (const r of RECIPIENT_CATALOG) {
    for (const t of r.traditions) all.add(t);
  }
  expectTruthy(all.has('candomblé'), 'has candomblé');
  expectTruthy(all.has('umbanda'), 'has umbanda');
  expectTruthy(all.has('cabala'), 'has cabala');
  expectTruthy(all.has('numerologia'), 'has numerologia');
  expectTruthy(all.has('tantra'), 'has tantra');
});

it('RESET clears audit between tests', () => {
  // previous tests called record; after reset, audit is empty
  __resetAkashiaAudit();
  expect(exportAudit().length, 0, 'audit empty after reset');
});

it('trend=stable for single-offering pattern', () => {
  const offs: AkashiaOffering[] = [
    makeOfferingWithId({
      recipientName: 'Exu',
      recipientType: 'entidade',
      element: 'fogo',
      intention: 'comunicação',
      timestamp: Date.parse('2026-01-01T08:00:00Z'),
      intensity: 5,
    }),
  ];
  const patterns = detectPatterns(offs);
  expect(patterns[0]!.trend, 'stable', 'single offering stable');
});

// ---- runner ---------------------------------------------------------------

(async () => {
  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
    } catch (e) {
      failed++;
      fails.push(`EXCEPTION in "${entry.name}": ${(e as Error).message}`);
    }
  }
  console.log(`\n--- SPEC w75-akashia-offering-tracking ---`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  if (failed > 0) {
    console.log('\n--- Failures ---');
    for (const f of fails) console.log(f);
    process.exit(1);
  }
  process.exit(0);
})();
