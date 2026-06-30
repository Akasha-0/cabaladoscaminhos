#!/usr/bin/env node
// ============================================================================
// W87-B — Mentorship Pairing · Smoke (runtime + source-inspection)
// ----------------------------------------------------------------------------
// Roda 10+ invariants:
//   1. List all mentors (8)
//   2. Filter by tradição=cigano + onlyAccepting=false → 2
//   3. Filter by tradição=cigano default → 1 (Ramiro pausado)
//   4. Find pairings for mentee-br-iniciante (top 5)
//   5. Verify score range [0, 100]
//   6. Create pairing request (LGPD consent true) → success
//   7. Block pairing sem LGPD consent → lgpd_missing
//   8. Accept pairing → status='accepted'
//   9. Complete pairing → status='completed'
//  10. Decline pairing flow
//  11. ARIA + data-testid contracts no page.tsx
//  12. 7 tradição symbols visíveis no source
// ============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);

const PROJECT_ROOT = join(__dirnameLocal, '..');

// Engine carregado via tsx — usamos require com path explícito .ts
const enginePath = join(PROJECT_ROOT, 'src/engine/mentorship/index.ts');
const {
  createMentorshipEngine,
  InMemoryMentorshipAdapter,
  computePairingScore,
  applyMentorFilter,
  LGPD_VERSION,
  menteeId,
  mentorId,
  pairingId,
  TRADIÇÕES,
  TRADIÇÃO_SYMBOL,
  TRADIÇÃO_LABEL,
  STUDY_AREAS,
  LEVEL_ORDER,
  MESSAGE_MIN_LEN,
  PLAUSIBLE_THRESHOLD,
} = await import(enginePath);

// ============================================================
// Helpers
// ============================================================

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function checkEq(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) {
    check(name, false, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    check(name, true);
  }
}

// ============================================================
// Import do engine via tsx (carrega types.ts + factory + adapter)
// ============================================================


// ============================================================
// 1. List all mentors (8)
// ============================================================

console.log('\n[1] List all mentors (8 expected)');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentors = await engine.listAvailableMentors({ onlyAccepting: false });
  checkEq('listAvailableMentors({ onlyAccepting: false }).length', mentors.length, 8);
}

// ============================================================
// 2. Filter by tradição=cigano + onlyAccepting=false → 2
// ============================================================

console.log('\n[2] Filter tradição=cigano (onlyAccepting=false → 2)');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const filtered = await engine.listAvailableMentors({ tradição: 'cigano', onlyAccepting: false });
  checkEq('tradição=cigano + onlyAccepting=false', filtered.length, 2);
}

// ============================================================
// 3. Filter tradição=cigano default (onlyAccepting=true) → 1
// ============================================================

console.log('\n[3] Filter tradição=cigano default → 1 (Ramiro pausado)');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const filtered = await engine.listAvailableMentors({ tradição: 'cigano' });
  checkEq('tradição=cigano default', filtered.length, 1);
}

// ============================================================
// 4. Find pairings for mentee-br-iniciante (top 5)
// ============================================================

console.log('\n[4] findPairings(mentee-br-iniciante, topN=5)');
let top5;
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentee = await adapter.getMentee(menteeId('mentee-br-iniciante'));
  check('mentee-br-iniciante exists', mentee !== null);
  top5 = await engine.findPairings(mentee, 5);
  checkEq('findPairings topN=5 length', top5.length, 5);
  // Ordem desc
  let isDesc = true;
  for (let i = 0; i < top5.length - 1; i++) {
    if (top5[i].score < top5[i + 1].score) {
      isDesc = false;
      break;
    }
  }
  check('pairings em ordem desc', isDesc);
  // Nenhum Ramiro
  check('Ramiro NÃO aparece', !top5.some((p) => p.mentorId === mentorId('mentor-cigano-ramiro')));
}

// ============================================================
// 5. Verify score range [0, 100]
// ============================================================

console.log('\n[5] Score range [0, 100] em todos os pairings');
{
  const allValid = top5.every((p) => p.score >= 0 && p.score <= 100);
  check('todos os scores em [0, 100]', allValid);
}

// ============================================================
// 6. Create pairing request (LGPD consent true) → success
// ============================================================

console.log('\n[6] createPairingRequest happy path');
let pairing1;
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: true,
  });
  checkEq('kind === "success"', result.kind, 'success');
  check('pairing retornado', !!result.pairing);
  pairing1 = result.pairing;
  checkEq('pairing.status === "pending"', pairing1.status, 'pending');
  checkEq('pairing.lgpdConsent === true', pairing1.lgpdConsent, true);
  check('pairing.createdAt é ISO válido', !isNaN(Date.parse(pairing1.createdAt)));
}

// ============================================================
// 7. Block pairing sem LGPD consent
// ============================================================

console.log('\n[7] createPairingRequest sem LGPD consent → lgpd_missing');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: false,
  });
  checkEq('kind === "lgpd_missing"', result.kind, 'lgpd_missing');
  check('mensagem menciona LGPD_VERSION', result.message.includes(LGPD_VERSION));
}

// ============================================================
// 8. Accept pairing → status='accepted'
// ============================================================

console.log('\n[8] acceptPairing → status=accepted');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const created = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: true,
  });
  const acc = await engine.acceptPairing(created.pairing.id);
  checkEq('ok === true', acc.ok, true);
  checkEq('status === "accepted"', acc.pairing.status, 'accepted');
  check('updatedAt presente', !!acc.pairing.updatedAt);
}

// ============================================================
// 9. Complete pairing → status='completed'
// ============================================================

console.log('\n[9] completePairing → status=completed');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const created = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: true,
  });
  await engine.acceptPairing(created.pairing.id);
  const comp = await engine.completePairing(created.pairing.id);
  checkEq('ok === true', comp.ok, true);
  checkEq('status === "completed"', comp.pairing.status, 'completed');
}

// ============================================================
// 10. Decline pairing flow
// ============================================================

console.log('\n[10] declinePairing flow');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const created = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: true,
  });
  const decl = await engine.declinePairing(created.pairing.id);
  checkEq('ok === true', decl.ok, true);
  checkEq('status === "declined"', decl.pairing.status, 'declined');
  // Decline → complete é INVÁLIDO
  const comp = await engine.completePairing(created.pairing.id);
  checkEq('complete após decline → ok=false', comp.ok, false);
}

// ============================================================
// 11. ARIA + data-testid contracts no page.tsx
// ============================================================

console.log('\n[11] ARIA + data-testid contracts (page.tsx source)');
{
  const pageSrc = readFileSync(join(PROJECT_ROOT, 'src/app/mentorship/page.tsx'), 'utf-8');
  const typesSrc = readFileSync(join(PROJECT_ROOT, 'src/engine/mentorship/types.ts'), 'utf-8');
  check('role="dialog" presente', pageSrc.includes('role="dialog"'));
  check('aria-modal="true" presente', pageSrc.includes('aria-modal="true"'));
  check('aria-live="polite" presente', pageSrc.includes('aria-live="polite"'));
  check('aria-required="true" presente', pageSrc.includes('aria-required="true"'));
  check('data-testid="mentor-card" presente', pageSrc.includes('data-testid="mentor-card"'));
  check('data-testid="pairing-modal" presente', pageSrc.includes('data-testid="pairing-modal"'));
  check('data-testid="lgpd-consent" presente', pageSrc.includes('data-testid="lgpd-consent"'));
  // 7 filter-chip-tradição-* — gerado via template dynamic testId={`filter-chip-tradição-${t}`}
  // Validamos que (a) o template existe em page.tsx, (b) os 7 nomes estão em types.ts
  check('template filter-chip-tradição dinâmico presente', /testId=\{`filter-chip-tradição-\$\{t\}`\}/.test(pageSrc));
  for (const t of ['cigano', 'candomble', 'umbanda', 'ifa', 'cabala', 'astrologia', 'tantra']) {
    check(`types.ts tem tradição '${t}'`, typesSrc.includes(`'${t}'`));
  }
  check('submit disabled sem canSubmit', /disabled=\{!canSubmit\}/.test(pageSrc));
}

// ============================================================
// 12. 7 tradição symbols visíveis no source
// ============================================================

console.log('\n[12] 7 tradição symbols (✦🪶☩◈☸☉☬)');
{
  const pageSrc2 = readFileSync(join(PROJECT_ROOT, 'src/app/mentorship/page.tsx'), 'utf-8');
  const typesSrc2 = readFileSync(join(PROJECT_ROOT, 'src/engine/mentorship/types.ts'), 'utf-8');
  const allSrc = typesSrc2 + '\n' + pageSrc2;
  for (const sym of ['✦', '🪶', '☩', '◈', '☸', '☉', '☬']) {
    check(`symbol ${sym} presente`, allSrc.includes(sym));
  }
  // Sacred terms preservation
  check('"Candomblé" preservado', allSrc.includes('Candomblé'));
  check('"Ifá" preservado', allSrc.includes('Ifá'));
  check('"Tantra" preservado', allSrc.includes('Tantra'));
  // Curator intent exclusions
  for (const banned of ['amarre de amor', 'vinculação amorosa', 'prejudicar terceiros']) {
    check(`banned: "${banned}" NÃO presente`, !allSrc.toLowerCase().includes(banned));
  }
}

// ============================================================
// 13. SCORE_WEIGHTS sanity (semantic)
// ============================================================

console.log('\n[13] SCORE_WEIGHTS sanity');
{
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentor = (await engine.getMentor(mentorId('mentor-cigana-mira')));
  const mentee = await adapter.getMentee(menteeId('mentee-br-iniciante'));
  check('Cigana Mira existe', mentor !== null);
  check('Lúcia existe', mentee !== null);
  const ps = computePairingScore(mentor, mentee);
  check('score plausível para cigano iniciante em SP', ps.score >= PLAUSIBLE_THRESHOLD);
  check('reason array populado', ps.reason.length >= 3);
}

// ============================================================
// Final
// ============================================================

console.log('');
console.log('═'.repeat(60));
console.log(`═ SMOKE: ${passed} PASS · ${failed} FAIL · ${passed + failed} total ═`);
console.log('═'.repeat(60));

if (failed > 0) {
  console.log('');
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  - ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
  }
  process.exit(1);
}

process.exit(0);
