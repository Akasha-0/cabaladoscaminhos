// biorhythm.smoke.ts — self-running smoke runner
// Run: node --experimental-strip-types biorhythm.smoke.ts

import {
  calculateBiorhythm,
  getCyclePhase,
  getCriticalDaysBetween,
  auditBiorhythmEdgeCases,
} from './biorhythm.ts';
import {
  getDailySignature,
  reduceToSingle,
  auditNumerologyDaily,
  ciganoCardForDay,
  oduRegenteForComposite,
} from './numerology-daily.ts';

let passed = 0, failed = 0;
function check(cond: boolean, label: string): void {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else      { failed++; console.error(`  ✗ ${label}`); }
}

// ─── Section 1: biorhythm core ───────────────────────────────────────────
console.log('§1 biorhythm core');
{
  const r = calculateBiorhythm('1990-01-01', '1990-01-01');
  check(r.dayOfLife === 0, 'dayOfLife = 0 on birthday');
  check(Math.abs(r.physical) < 0.001, 'physical ≈ 0 on birthday');
  check(Math.abs(r.emotional) < 0.001, 'emotional ≈ 0 on birthday');
  check(Math.abs(r.intellectual) < 0.001, 'intellectual ≈ 0 on birthday');
  check(r.physicalCritical && r.emotionalCritical && r.intellectualCritical, 'all cycles critical on birthday');
}
{
  const r = calculateBiorhythm('1990-01-01', '1990-01-24');
  check(Math.abs(r.physical) < 0.001, 'day 23 → physical ≈ 0');
  check(r.physicalCritical, 'day 23 → physical critical');
  check(Math.abs(Math.sin(2 * Math.PI * 23 / 28) - r.emotional) < 0.001, 'day 23 → emotional correct');
  check(r.summary.length > 50, 'summary non-trivial');
}

// ─── Section 2: biorhythm phases + critical days ─────────────────────────
console.log('§2 phases + critical days');
{
  const phases = getCyclePhase('1990-01-01', '1990-01-12');
  check(phases.physical.period === 23, 'physical period');
  check(phases.emotional.period === 28, 'emotional period');
  check(phases.intellectual.period === 33, 'intellectual period');
  check(['ascending', 'descending', 'peak', 'trough'].includes(phases.physical.trend), 'physical trend valid');
}
{
  const crit = getCriticalDaysBetween('1990-01-01', '1990-01-01', '1990-01-24', 30);
  check(crit.criticalDays.length >= 4, `≥ 4 critical days (got ${crit.criticalDays.length})`);
  const day0 = crit.criticalDays.find((c) => c.dayOfLife === 0);
  check(day0 !== undefined && day0.cycles.length === 3, 'day 0 has all 3 cycles critical');
}

// ─── Section 3: biorhythm audit ───────────────────────────────────────────
console.log('§3 biorhythm audit');
{
  const a = auditBiorhythmEdgeCases(300);
  check(a.periodsValid, 'periods valid (23/28/33)');
  check(a.phaseRange.min >= -1.001 && a.phaseRange.max <= 1.001, 'phase range in [-1, 1]');
  check(a.criticalAccuracy >= 0.95, `critical accuracy ≥ 95% (got ${a.criticalAccuracy.toFixed(3)})`);
  check(a.traditionsCovered >= 5, `≥ 5 traditions (covered=${a.traditionsCovered})`);
}

// ─── Section 4: numerology reduce + master ───────────────────────────────
console.log('§4 numerology reduce + master');
{
  for (let n = 1; n <= 9; n++) {
    const r = reduceToSingle(n);
    check(r.reduced === n && !r.isMaster, `reduce(${n}) = ${n}`);
  }
  check(reduceToSingle(11, { preserveMasters: true }).master === 11, 'master 11 preserved');
  check(reduceToSingle(22, { preserveMasters: true }).master === 22, 'master 22 preserved');
  check(reduceToSingle(33, { preserveMasters: true }).master === 33, 'master 33 preserved');
  check(reduceToSingle(11, { preserveMasters: true }).reduced === 2, '11 → 2');
  check(reduceToSingle(22, { preserveMasters: true }).reduced === 4, '22 → 4');
  check(reduceToSingle(33, { preserveMasters: true }).reduced === 6, '33 → 6');
}

// ─── Section 5: cigano + odu ─────────────────────────────────────────────
console.log('§5 cigano + odu');
{
  const c1 = ciganoCardForDay(1);
  check(c1.name === 'O Cavaleiro', 'cigano #1 = O Cavaleiro');
  const c28 = ciganoCardForDay(28);
  check(c28.name === 'O Cigano', 'cigano #28 = O Cigano');
  const c29 = ciganoCardForDay(29);
  check(c29.number === 1, 'cigano #29 wraps to 1');
  const odu1 = oduRegenteForComposite(1);
  check(odu1.id === 1 && odu1.name === 'Ogbe', 'Odu 1 = Ogbe');
  const odu11 = oduRegenteForComposite(11);
  check(odu11.id === 1, 'master 11 → Odu 1 (Ogbe)');
  const odu33 = oduRegenteForComposite(33);
  check(odu33.id === 16, 'master 33 → Odu 16 (Ofurufu)');
}

// ─── Section 6: getDailySignature (full) ─────────────────────────────────
console.log('§6 getDailySignature');
{
  const sig = getDailySignature('1990-01-15', '2024-06-15');
  check(sig.day === 9, `day = 9 (got ${sig.day})`);
  check(sig.month === 6, `month = 6 (got ${sig.month})`);
  check(sig.year === 8, `year = 8 (got ${sig.year})`);
  check(sig.composite === 5, `composite = 5 (got ${sig.composite})`);
  check(sig.archetype.name === 'O Sábio', `archetype = O Sábio (got ${sig.archetype.name})`);
  check(sig.ciganoCard.name === 'Os Buquês', `cigano = Os Buquês (got ${sig.ciganoCard.name})`);
  check(sig.oduRegente.name === 'Oxê', `Odu = Oxê (got ${sig.oduRegente.name})`);
  check(sig.chakra.name === 'Terceiro-Olho', `chakra = Terceiro-Olho (got ${sig.chakra.name}, key=2)`);
  check(sig.summary.length > 100, 'summary non-trivial');
}

// ─── Section 7: numerology audit ─────────────────────────────────────────
console.log('§7 numerology audit');
{
  const a = auditNumerologyDaily();
  check(a.reduceConsistent, 'reduce consistent');
  check(a.masterPreservationCorrect, 'master preservation correct');
  check(a.archetypeCoverage === 9, `9 archetypes (got ${a.archetypeCoverage})`);
  check(a.chakraRotation.length === 7, `7 chakras (got ${a.chakraRotation.length})`);
  check(a.ciganoCoverage === 28, `28 unique cigano cards (got ${a.ciganoCoverage})`);
  check(a.traditionsCount >= 5, `≥ 5 traditions (got ${a.traditionsCount})`);
}

// ─── Section 8: cross-engine integration ────────────────────────────────
console.log('§8 cross-engine integration');
{
  const sig = getDailySignature('1990-01-15', '2024-06-15');
  check(sig.summary.includes('Dia pessoal'), 'summary mentions Dia pessoal (Numerologia)');
  check(sig.summary.includes('Carta-cigana'), 'summary mentions Carta-cigana');
  check(sig.summary.includes('regido por'), 'summary mentions regido por (Astrologia)');
  check(sig.summary.includes('Orixá regente'), 'summary mentions Orixá regente');
  check(sig.summary.includes('Chakra'), 'summary mentions Chakra (Tantra/Cabala)');

  const bior = calculateBiorhythm('1990-01-01', '2024-01-01');
  check(bior.summary.includes('Carta-cigana'), 'biorhythm summary mentions Cigano');
  check(bior.summary.includes('Odu regente'), 'biorhythm summary mentions Orixá');
  check(bior.summary.includes('Chakra'), 'biorhythm summary mentions Tantra/Cabala');
  check(bior.summary.includes('regido por'), 'biorhythm summary mentions Astrologia');
  check(bior.summary.includes('Numerologia cabalística'), 'biorhythm summary mentions Numerologia');
}

// ─── Section 9: determinism + idempotency ────────────────────────────────
console.log('§9 determinism');
{
  const a = calculateBiorhythm('1990-01-01', '2024-06-15');
  const b = calculateBiorhythm('1990-01-01', '2024-06-15');
  check(a.dayOfLife === b.dayOfLife && a.physical === b.physical && a.emotional === b.emotional && a.intellectual === b.intellectual, 'biorhythm deterministic');
  const s1 = getDailySignature('1990-01-15', '2024-06-15');
  const s2 = getDailySignature('1990-01-15', '2024-06-15');
  check(s1.day === s2.day && s1.composite === s2.composite && s1.summary === s2.summary, 'numerology deterministic');
}

// ─── Final ───────────────────────────────────────────────────────────────
console.log(`\n${passed}/${passed + failed} SMOKE CHECKS PASSED`);
if (failed > 0) { console.error('SMOKE FAIL'); process.exit(1); }
console.log('SMOKE PASS');
