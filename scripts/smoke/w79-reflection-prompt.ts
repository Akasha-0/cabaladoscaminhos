/**
 * ════════════════════════════════════════════════════════════════════════════
 * W79-A — REFLECTION PROMPT · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 */

declare const process: { exit(code: number): never };

import {
  listReflectionPrompts,
  listTraditions,
  listPhases,
  getReflectionPrompt,
  mapPhase,
  dailyReflectionSet,
  vocabularyCoverage,
  hashCacheKey,
  SACRED_TRADITIONS,
  CYCLE_PHASES,
  type BiorhythmContext,
} from '../../src/lib/w79/reflection-prompt.ts';

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
}

console.log('W79-A Reflection Prompt — Smoke Harness\n');

// ── Section 1: Coverage ─────────────────────────────────────────────────
const all = listReflectionPrompts();
check('28 prompts total', all.length === 28);
check('7 traditions', listTraditions().length === 7);
check('4 phases', listPhases().length === 4);

// Every (tradition, phase) reachable
let reachable = 0;
for (const trad of SACRED_TRADITIONS) {
  for (const phase of CYCLE_PHASES) {
    if (getReflectionPrompt(trad, phase) !== null) reachable++;
  }
}
check('28 (tradition, phase) pairs reachable', reachable === 28);

// ── Section 2: Authentic vocab in prompts ────────────────────────────────
const text = all.map((p) => p.prompt + ' ' + p.practice + ' ' + p.journalQuestion).join(' ');
check('Candomblé mentions Oxum', text.includes('Oxum'));
check('Candomblé mentions Ogum', text.includes('Ogum'));
check('Umbanda mentions Caboclos', text.includes('Caboclos'));
check('Umbanda mentions Pretos-Velhos', text.includes('Pretos-Velhos'));
check('Umbanda mentions Ciganas', text.includes('Ciganas'));
check('Ifá mentions Orunmila', text.includes('Orunmila'));
check('Cabala mentions Keter', text.includes('Keter'));
check('Cabala mentions Sefirot', text.includes('Sefirot'));
check('Astrologia mentions Lilith', text.includes('Lilith'));
check('Astrologia mentions Meio do Céu', text.includes('Meio do Céu'));
check('Tantra mentions chakra', text.toLowerCase().includes('chakra'));
check('Tantra mentions prana', text.toLowerCase().includes('prana'));
check('Cigano mentions Cigano Ramiro', text.includes('Cigano Ramiro'));

// ── Section 3: Phase mapping ────────────────────────────────────────────
check('mapPhase high+ → peak', mapPhase(0.95, false, 0.1) === 'peak');
check('mapPhase high- → trough', mapPhase(-0.95, false, -0.1) === 'trough');
check('mapPhase critical → trough', mapPhase(0.0, true, 0.0) === 'trough');

// ── Section 4: dailyReflectionSet ───────────────────────────────────────
const ctx: BiorhythmContext = {
  birthDate: '1985-03-15',
  date: '2025-01-15',
  physical: 0.9,
  emotional: 0.2,
  intellectual: 0.1,
  physicalCritical: false,
  emotionalCritical: false,
  intellectualCritical: false,
  physicalSlope: 0.1,
  emotionalSlope: 0.5,
  intellectualSlope: 0.5,
};
const set = dailyReflectionSet(ctx);
check('ReflectionSet has 7 prompts', set.prompts.length === 7);
check('ReflectionSet dominantCycle = physical', set.dominantCycle === 'physical');
check('ReflectionSet dominantPhase = peak', set.dominantPhase === 'peak');
check('ReflectionSet is frozen', Object.isFrozen(set));

// ── Section 5: vocabularyCoverage ───────────────────────────────────────
const cov = vocabularyCoverage();
let avgCov = 0;
let n = 0;
for (const trad of SACRED_TRADITIONS) {
  avgCov += cov.coverage[trad];
  n++;
}
avgCov /= n;
check(`Avg vocabulary coverage ≥ 0.5 (was ${avgCov.toFixed(2)})`, avgCov >= 0.5);

// ── Section 6: SHA-256 cache key ────────────────────────────────────────
const k1 = hashCacheKey({ a: 1 });
const k2 = hashCacheKey({ a: 1 });
const k3 = hashCacheKey({ a: 2 });
check('hashCacheKey deterministic', k1 === k2);
check('hashCacheKey varies by input', k1 !== k3);
check('hashCacheKey length = 64', k1.length === 64);

// ── Section 7: All traditions in dailyReflectionSet ────────────────────
for (const trad of SACRED_TRADITIONS) {
  const found = set.prompts.find((p) => p.tradition === trad);
  check(`ReflectionSet includes ${trad}`, found !== undefined);
}

// ── Section 8: All prompts have vocab tokens ────────────────────────────
let missingVocab = 0;
for (const p of all) {
  if (p.vocabulary.length < 2) missingVocab++;
}
check('All 28 prompts have ≥2 vocab tokens', missingVocab === 0);

console.log(`\n${passes} passed, ${fails} failed (${passes + fails} total)`);
if (fails === 0) console.log('0 failures');
else process.exit(1);
