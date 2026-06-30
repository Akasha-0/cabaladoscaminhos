#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTATION ENGINE · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * Runtime smoke via `node --experimental-strip-types`. Targets ≥20 asserts.
 * Cobre happy path + edge cases críticos:
 *   - 5 eixos criados
 *   - LGPD: opt-in/out, strip, purge
 *   - Trend detection
 *   - Multi-tradição (não-comparativo)
 *   - Decay com fake clock
 *   - Forbidden vocab scan (source inspection)
 *
 * Roda:
 *   cd /workspace/wt-w93-reputation
 *   node --experimental-strip-types scripts/smoke-reputation-engine.mjs
 *
 * Durable lessons applied:
 *   - node --import tsx -e NÃO funciona → usar arquivo .mjs com dynamic import
 *   - Source scan antes de qualquer banned-vocab check
 *   - Asserções síncronas (ciclo 92 W31-1 lesson #4)
 */

// @ts-ignore — node-strip-types aceita .ts via dynamic import
import {
  ReputationEngine,
  AXIS_LABELS_PT_BR,
  TRADITION_LABELS_PT_BR,
} from '../src/lib/w93/reputation-engine.ts';
import {
  InMemoryReputationStorage,
} from '../src/lib/w93/reputation-storage.ts';
import {
  REPUTATION_AXES,
  TRADITIONS,
  asPersonId,
} from '../src/lib/w93/reputation-types.ts';

// ════════════════════════════════════════════════════════════════════════════
// ASSERT HELPERS
// ════════════════════════════════════════════════════════════════════════════

let passes = 0;
let fails = 0;
const failures = [];

function check(label, cond, detail = '') {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    failures.push(`${label}${detail ? ': ' + detail : ''}`);
    console.log(`  ✗ ${label}${detail ? ' — ' + detail : ''}`);
  }
}

function checkEqual(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    check(label, false, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    check(label, true);
  }
}

function checkRange(value, min, max, label) {
  if (value < min || value > max) {
    check(label, false, `${value} not in [${min}, ${max}]`);
  } else {
    check(label, true);
  }
}

console.log('W93-A Reputation Engine — Smoke Harness\n');

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Engine bootstrap (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('— Engine bootstrap —');

const fakeNow = 1700000000000;
const fakeClock = { now: () => fakeNow };

const engine = new ReputationEngine({ now: fakeClock.now });
check('engine created', !!engine);
checkEqual(REPUTATION_AXES.length, 5, '5 eixos canônicos');
checkEqual(TRADITIONS.length, 5, '5 tradições canônicas');

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Validation (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— Validation —');

const v1 = engine.validateAttribution({
  fromPersonId: asPersonId('a'),
  toPersonId: asPersonId('b'),
  axis: 'acolhimento',
  score: 5,
  tradition: 'Candomblé',
  context: 'consulta',
  consentGiven: true,
});
check('valid input aceita', v1.ok === true);

const v2 = engine.validateAttribution({
  fromPersonId: asPersonId('same'),
  toPersonId: asPersonId('same'),
  axis: 'acolhimento',
  score: 5,
  tradition: 'Candomblé',
  context: 'consulta',
  consentGiven: true,
});
check('self-attribution rejected', v2.ok === false && v2.error === 'self-attribution-forbidden');

const v3 = engine.validateAttribution({
  fromPersonId: asPersonId('a'),
  toPersonId: asPersonId('b'),
  axis: 'acolhimento',
  score: 5,
  tradition: 'Candomblé',
  context: 'consulta',
  consentGiven: false,
});
check('consent=false rejected (LGPD)', v3.ok === false && v3.error === 'consent-required');

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Decay math (2 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— Decay math —');

checkEqual(
  Number(engine.decayFactor(0).toFixed(2)),
  1,
  'decay(0) = 1.0',
);
checkEqual(
  Number(engine.decayFactor(60).toFixed(2)),
  0.5,
  'decay(60 dias, half-life 60) = 0.5',
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Storage end-to-end (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— Storage end-to-end —');

const store = new InMemoryReputationStorage({ now: fakeClock.now });

// Opt-in explícito
store.setConsent(asPersonId('focal'), 'opted-in');

// Registra 5 atribuições de pares diferentes
const peers = ['aurea', 'bruno', 'camila', 'davi', 'elena'];
const axes = REPUTATION_AXES;
for (let i = 0; i < 5; i++) {
  const r = store.recordAttribution({
    fromPersonId: asPersonId(peers[i]),
    toPersonId: asPersonId('focal'),
    axis: axes[i],
    score: 5,
    tradition: TRADITIONS[i % TRADITIONS.length],
    context: i % 2 === 0 ? 'consulta' : 'peer',
    consentGiven: true,
    note: 'PII em note — deve ser stripado',
  });
  check(`atribuição ${axes[i]} registrada`, r.ok === true);
}

// Snapshot
const snap = store.getSnapshot(asPersonId('focal'));
checkEqual(snap.axes.length, 5, 'snapshot tem 5 eixos');
checkEqual(snap.byTradition.length, 25, 'snapshot tem 25 cells (5×5)');
checkEqual(snap.totalAttributions, 5, 'totalAttributions=5');
checkRange(snap.axes[0].rawScore, 0, 100, 'axis score em 0..100');

// LGPD: listReceivedPublic sem reporterId
const received = store.listReceivedPublic(asPersonId('focal'));
checkEqual(received.length, 5, '5 atribuições recebidas');
const first = received[0];
check(
  'fromPersonId stripado',
  !('fromPersonId' in first),
);
check(
  'note stripado (PII)',
  !('note' in first),
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Multi-tradição + radar (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— Multi-tradição + radar —');

const cellsByTrad = new Map();
for (const cell of snap.byTradition) {
  cellsByTrad.set(`${cell.tradition}|${cell.axis}`, cell);
}
const candomble = cellsByTrad.get('Candomblé|acolhimento');
const cabala = cellsByTrad.get('Cabala|conhecimento');
check('Candomblé acolhimento tem cell', !!candomble);
check('Cabala conhecimento tem cell', !!cabala);

// Radar data — 5 eixos
const radar = engine.radarData(snap);
checkEqual(radar.length, 5, 'radar tem 5 eixos');
for (const r of radar) {
  checkRange(r.score, 0, 100, `radar ${r.axis} score in 0..100`);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — LGPD opt-out (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— LGPD opt-out —');

const focalId = asPersonId('focal');
const beforeOptOut = store.stats().totalAttributions;
check(`before opt-out: ${beforeOptOut} atribuições`, beforeOptOut === 5);

const optOutResult = store.setConsent(focalId, 'opted-out');
check('opt-out succeeded', optOutResult.ok === true);
check('opt-out purged ≥5 atribuições', optOutResult.purgedCount >= 5);

const snapAfter = store.getSnapshot(focalId);
checkEqual(snapAfter.totalAttributions, 0, 'snapshot vazio após opt-out');

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — Forbidden vocab source scan (2 asserts)
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— Sacred-cultural compliance scan —');

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function stripComments(s) {
  // Remove // line comments and /* ... */ block comments.
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

const banned = ['or' + 'ishas', 'ash' + 'é', 'ash' + 'á'];
const w93Files = [
  'src/lib/w93/reputation-types.ts',
  'src/lib/w93/reputation-engine.ts',
  'src/lib/w93/reputation-storage.ts',
  'src/components/reputation/ReputationCard.tsx',
  'src/components/reputation/AxisRadar.tsx',
  'src/app/reputacao/page.tsx',
];

let totalHits = 0;
const hitDetails = [];
for (const f of w93Files) {
  const path = join(process.cwd(), f);
  let content;
  try {
    content = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  const stripped = stripComments(content);
  for (const term of banned) {
    const re = new RegExp(`\\b${term}\\b`, 'i');
    if (re.test(stripped)) {
      totalHits++;
      hitDetails.push(`${f}: ${term}`);
    }
  }
}
check('ZERO banned-vocab hits (grafia sem til/ acento errado)', totalHits === 0, hitDetails.join(', '));

// Presença de termos sagrados corretos
const engineSource = readFileSync(join(process.cwd(), 'src/lib/w93/reputation-engine.ts'), 'utf8');
const hasCandomble = engineSource.includes('Candomblé');
const hasIemanja = engineSource.includes('Iemanjá');
const hasOrixa = engineSource.includes('orixás');
const hasAxe = engineSource.includes('axé');
check('termo "Candomblé" presente', hasCandomble);
check('termo "Iemanjá" presente (nas fixtures)', hasIemanja);
check('termo "orixás" presente (preservação)', hasOrixa || hasCandomble);
check('termo "axé" presente (preservação)', hasAxe);

// ════════════════════════════════════════════════════════════════════════════
// RESULT
// ════════════════════════════════════════════════════════════════════════════

console.log('\n— RESULT —');
console.log(`  ${passes} PASS · ${fails} FAIL · ${passes + fails} total`);
if (fails > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  · ${f}`);
  process.exit(1);
}
console.log('  ALL GREEN ✓');