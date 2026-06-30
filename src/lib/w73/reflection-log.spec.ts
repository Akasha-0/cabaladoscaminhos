// W73-B: Reflection Log Engine — self-running spec harness
// 22 assertions covering CRUD, validation, streak, share, LGPD.

import {
  createReflection,
  updateReflection,
  deleteReflection,
  getReflectionById,
  listUserReflections,
  getReflectionsByTradition,
  getCurrentStreak,
  shareReflectionToCircle,
  setHmacSecret,
  _resetForTest,
  _addCircleMemberForTest,
  asUserId,
  asPromptId,
  asCircleId,
  auditReflectionRules,
} from './reflection-log.ts';
import type { Mood, Result } from './reflection-log.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(cond: boolean, msg: string): void {
  if (cond) passed += 1;
  else {
    failed += 1;
    failures.push(msg);
  }
}

function unwrap<T>(r: Result<T, any>): T {
  if (!r.ok) throw new Error('unwrap: ' + JSON.stringify(r));
  return r.value as T;
}

setHmacSecret('test-secret-for-spec-only');
_resetForTest();

const alice = asUserId('alice-001');
const bob = asUserId('bob-002');
const promptA = asPromptId('prompt-aaa');
const promptB = asPromptId('prompt-bbb');
const circleX = asCircleId('circle-x');
_addCircleMemberForTest(circleX, alice);
_addCircleMemberForTest(circleX, bob);

// ── Happy path (4) ──────────────────────────────────────────
{
  const r1 = await createReflection(
    alice,
    promptA,
    'Hoje a meditação trouxe clareza. Senti Oxalá na brisa.',
    'clear' as Mood,
    { tradition: 'orixas', archetype: 'morning', sacredTags: ['Oxalá', 'vento'] },
    new Date('2026-06-30T08:00:00Z'),
  );
  assert(r1.ok, 'happy path create ok');
  const v1 = unwrap(r1);
  assert(v1.body.length >= 1, 'body stored');
  assert(v1.encrypted.algo === 'HMAC-SHA256', 'HMAC-SHA256 algo');
  assert(/^[a-f0-9]{64}$/.test(v1.encrypted.hmac), `hmac is 64-hex (got ${v1.encrypted.hmac})`);

  // ── One-per-day enforcement (2) ─────────────────────────────
  const r2 = await createReflection(
    alice,
    promptB,
    'Reflexão revisitada: ajustei um pouco o tom.',
    'radiant' as Mood,
    { tradition: 'orixas', archetype: 'morning', sacredTags: ['clareza'] },
    new Date('2026-06-30T20:00:00Z'),
  );
  assert(r2.ok, 'same date second call returns ok (updates)');
  const v2 = unwrap(r2);
  assert(v2.id === v1.id, 'same id (update, not new)');

  // ── Validation rejection (3) ────────────────────────────────
  const rTooLong = await createReflection(
    alice,
    promptA,
    'x'.repeat(5001),
    'clear' as Mood,
    { tradition: 'tarot', dateISO: '2026-06-25' },
    new Date('2026-06-30T08:00:00Z'),
  );
  assert(!rTooLong.ok && rTooLong.error === 'BODY_TOO_LONG', 'body >5000 rejected');

  const rBadMood = await createReflection(
    alice,
    promptA,
    'normal text',
    'furious' as Mood,
    { tradition: 'tarot', dateISO: '2026-06-25' },
    new Date('2026-06-30T08:00:00Z'),
  );
  assert(!rBadMood.ok && rBadMood.error === 'INVALID_MOOD', 'bad mood rejected');

  const rTooOld = await createReflection(
    alice,
    promptA,
    'antigo demais',
    'clear' as Mood,
    { tradition: 'tarot', dateISO: '2026-06-01' },
    new Date('2026-06-30T08:00:00Z'),
  );
  assert(!rTooOld.ok && rTooOld.error === 'BACKFILL_TOO_OLD', 'backfill >7 days rejected');

  // ── Update happy path (1) ──────────────────────────────────
  const r3 = await updateReflection(
    v1.id,
    'Nova versão do mesmo dia.',
    'radiant' as Mood,
    alice,
    new Date('2026-06-30T21:00:00Z'),
  );
  assert(r3.ok && unwrap(r3).body === 'Nova versão do mesmo dia.', 'update happy path');

  // ── Soft delete (2) ─────────────────────────────────────────
  const delOk = deleteReflection(v1.id, alice);
  assert(delOk.ok, 'soft delete ok');
  const afterDelete = getReflectionById(v1.id);
  assert(afterDelete.ok && afterDelete.value === null, 'deleted reflection returns null');
}

// ── Streak (4) ──────────────────────────────────────────────
{
  _resetForTest();
  const u = asUserId('streak-user-001');
  const s0 = getCurrentStreak(u, new Date('2026-06-30T20:00:00Z'));
  assert(s0.ok && unwrap(s0).days === 0, `0-day streak (got ${unwrap(s0).days})`);

  await createReflection(u, promptA, 'd-3', 'clear' as Mood, {
    tradition: 'tarot',
    dateISO: '2026-06-28',
  });
  await createReflection(u, promptA, 'd-2', 'clear' as Mood, {
    tradition: 'tarot',
    dateISO: '2026-06-29',
  });
  await createReflection(u, promptA, 'd-1', 'clear' as Mood, {
    tradition: 'tarot',
    dateISO: '2026-06-30',
  });
  const s3 = getCurrentStreak(u, new Date('2026-06-30T20:00:00Z'));
  const s3v = unwrap(s3);
  assert(s3v.days === 3, `3-day streak (got ${s3v.days})`);
  assert(s3v.longestStreak === 3, `longest 3 (got ${s3v.longestStreak})`);
}

// ── Broken streak ────────────────────────────────────────────
{
  _resetForTest();
  const u2 = asUserId('streak-broken-002');
  await createReflection(u2, promptA, 'd-0', 'clear' as Mood, {
    tradition: 'tarot',
    dateISO: '2026-06-28',
  });
  await createReflection(u2, promptA, 'd-2', 'clear' as Mood, {
    tradition: 'tarot',
    dateISO: '2026-06-30',
  });
  const sBroken = getCurrentStreak(u2, new Date('2026-06-30T20:00:00Z'));
  assert(unwrap(sBroken).days === 1, `broken streak = 1 (got ${unwrap(sBroken).days})`);
}

// ── 7-day streak ────────────────────────────────────────────
{
  _resetForTest();
  const u3 = asUserId('streak-7-003');
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2026, 5, 24 + i, 12, 0, 0));
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    await createReflection(u3, promptA, `d-${i}`, 'radiant' as Mood, { tradition: 'tarot', dateISO: iso });
  }
  const s7 = getCurrentStreak(u3, new Date('2026-06-30T20:00:00Z'));
  assert(unwrap(s7).days === 7, `7-day streak (got ${unwrap(s7).days})`);
}

// ── Share to circle (3) ─────────────────────────────────────
{
  _resetForTest();
  const u4 = asUserId('share-001');
  const c4 = asCircleId('c4');
  _addCircleMemberForTest(c4, u4);
  const r4 = await createReflection(u4, promptA, 'compartilhar', 'radiant' as Mood, {
    tradition: 'cabala',
    sacredTags: ['Kether', 'centelha'],
    dateISO: '2026-06-30',
  });
  assert(r4.ok, 'pre-share create ok');

  const shareOk = await shareReflectionToCircle(unwrap(r4).id, c4, u4);
  assert(unwrap(shareOk).sharedToCircles.includes(c4), 'share ok to member');

  const u4NonMember = asUserId('non-member-001');
  const r4Foreign = await createReflection(u4NonMember, promptA, 'x', 'clear' as Mood, {
    tradition: 'cabala',
    dateISO: '2026-06-30',
  });
  const shareBad = await shareReflectionToCircle(unwrap(r4Foreign).id, c4, u4NonMember);
  assert(!shareBad.ok && shareBad.error === 'NOT_CIRCLE_MEMBER', 'non-member share rejected');
}

// ── LGPD audit (2) ──────────────────────────────────────────
{
  const audit = auditReflectionRules();
  assert(audit.length === 10, 'audit has 10 rules');
  assert(audit.every((r) => r.isEnforced), 'all rules report isEnforced=true');
}

// ── SacredTags cap (1) ──────────────────────────────────────
{
  const rTag = await createReflection(
    asUserId('tagger-001'),
    promptA,
    'tags',
    'clear' as Mood,
    { tradition: 'tarot', sacredTags: ['a', 'b', 'c', 'd', 'e'], dateISO: '2026-06-30' },
  );
  assert(unwrap(rTag).sacredTags.length <= 3, `tags capped at 3 (got ${unwrap(rTag).sacredTags.length})`);
}

// ── Summary ──────────────────────────────────────────────────
console.log(`REFLECTION-LOG:    ${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
