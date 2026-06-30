/**
 * Audit Spec — wave 68
 * Self-running harness.
 *
 * Covers: logAuthEvent for all 11 event types, queryAuthEvents with
 * type/since/until/ip/limit/offset filters, getAuthEventById,
 * countByType, pagination, resetAuditLog, error paths.
 */

import {
  logAuthEvent, queryAuthEvents, getAuthEventById,
  countByType, totalEventsForUser, totalEventsInLog, resetAuditLog,
  ALL_AUTH_EVENT_TYPES,
  InvalidAuthEventError, AuditError,
} from '../audit.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual === expected) passed += 1;
  else { failed += 1; failures.push(`${label}: expected ${String(expected)}, got ${String(actual)}`); }
}
function expectTrue(cond: boolean, label: string): void {
  if (cond) passed += 1;
  else { failed += 1; failures.push(label); }
}
async function expectThrows(fn: () => unknown | Promise<unknown>, ctor: new (...a: never[]) => Error, label: string): Promise<void> {
  let caught: unknown = null;
  try { await fn(); } catch (err) { caught = err; }
  if (caught === null) { failed += 1; failures.push(`${label}: no throw`); return; }
  if (caught instanceof ctor) passed += 1;
  else { failed += 1; failures.push(`${label}: threw ${(caught as Error).name}, not ${ctor.name}`); }
}

async function run(): Promise<void> {
  resetAuditLog();
  expectEqual(totalEventsInLog(), 0, 'starts empty');

  // ── log every type ──
  let i = 0;
  for (const type of ALL_AUTH_EVENT_TYPES) {
    logAuthEvent({ userId: `user-${type}`, type, ip: '1.1.1.1', userAgent: 'UA', metadata: { idx: i } });
    i += 1;
  }
  expectEqual(totalEventsInLog(), ALL_AUTH_EVENT_TYPES.length, 'all events logged');

  // ── each user has 1 event ──
  for (const type of ALL_AUTH_EVENT_TYPES) {
    expectEqual(totalEventsForUser(`user-${type}`), 1, `user-${type} has 1 event`);
  }

  // ── getAuthEventById ──
  const e1 = logAuthEvent({ userId: 'audit-user-1', type: 'login', ip: '9.9.9.9' });
  const found = getAuthEventById(e1.id);
  expectEqual(found?.userId, 'audit-user-1', 'getAuthEventById returns by id');
  expectEqual(getAuthEventById('does-not-exist'), null, 'getAuthEventById null for unknown');

  // ── multiple events for same user ──
  logAuthEvent({ userId: 'u-multi', type: 'login', ip: '10.0.0.1' });
  logAuthEvent({ userId: 'u-multi', type: 'login_failed', ip: '10.0.0.1' });
  logAuthEvent({ userId: 'u-multi', type: 'logout', ip: '10.0.0.1' });
  logAuthEvent({ userId: 'u-multi', type: '2fa_enabled', ip: '10.0.0.2' });
  expectEqual(totalEventsForUser('u-multi'), 4, 'u-multi has 4 events');

  // ── query by type filter ──
  const qType = await queryAuthEvents({ userId: 'u-multi', filter: { types: ['login', 'login_failed'] } });
  expectEqual(qType.events.length, 2, 'type filter returns 2');
  expectEqual(qType.total, 2, 'total reflects matched');

  // ── query by ip filter ──
  const qIp = await queryAuthEvents({ userId: 'u-multi', filter: { ip: '10.0.0.2' } });
  expectEqual(qIp.events.length, 1, 'ip filter returns 1');
  expectEqual(qIp.events[0]!.type, '2fa_enabled', 'ip filter correct event');

  // ── countByType ──
  const c = countByType('u-multi');
  expectEqual(c.login, 1, 'count login');
  expectEqual(c.logout, 1, 'count logout');
  expectEqual(c.login_failed, 1, 'count login_failed');
  expectEqual(c['2fa_enabled'], 1, 'count 2fa_enabled');
  expectEqual(c.session_revoked, 0, 'count session_revoked 0');

  // ── pagination ──
  for (let n = 0; n < 5; n += 1) {
    logAuthEvent({ userId: 'u-page', type: 'login', ip: '10.0.0.3' });
  }
  const page1 = await queryAuthEvents({ userId: 'u-page', filter: { limit: 2, offset: 0 } });
  expectEqual(page1.events.length, 2, 'page1 size 2');
  expectEqual(page1.total, 5, 'page1 total 5');
  expectEqual(page1.hasMore, true, 'page1 hasMore true');
  const page3 = await queryAuthEvents({ userId: 'u-page', filter: { limit: 2, offset: 4 } });
  expectEqual(page3.events.length, 1, 'page3 size 1');
  expectEqual(page3.hasMore, false, 'page3 hasMore false');

  // ── since/until window ──
  const old = new Date(Date.now() - 10_000);
  const recent = new Date();
  logAuthEvent({ userId: 'u-time', type: 'login', createdAt: old });
  logAuthEvent({ userId: 'u-time', type: 'logout', createdAt: recent });
  const qSince = await queryAuthEvents({ userId: 'u-time', filter: { since: new Date(Date.now() - 1_000) } });
  expectEqual(qSince.events.length, 1, 'since filter returns 1 recent');
  const qUntil = await queryAuthEvents({ userId: 'u-time', filter: { until: old } });
  expectEqual(qUntil.events.length, 1, 'until filter returns 1 old');

  // ── invalid input ──
  await expectThrows(() => logAuthEvent({ userId: '', type: 'login' }), InvalidAuthEventError, 'empty userId rejected');
  // @ts-expect-error testing invalid type
  await expectThrows(() => logAuthEvent({ userId: 'u', type: 'bogus_type' }), InvalidAuthEventError, 'unknown event type rejected');
  // queryAuthEvents requires userId
  let qErr = false;
  try { await queryAuthEvents({ userId: '' }); }
  catch (e) { if (e instanceof InvalidAuthEventError) qErr = true; }
  expectTrue(qErr, 'empty query userId rejected');

  // ── metadata is frozen ──
  const eMeta = logAuthEvent({ userId: 'u-meta', type: 'login', metadata: { ok: true, count: 5 } });
  expectTrue(Object.isFrozen(eMeta.metadata), 'metadata is frozen');
  expectEqual(eMeta.metadata.count, 5, 'metadata.count 5');

  // ── ALL_AUTH_EVENT_TYPES has 11 entries ──
  expectEqual(ALL_AUTH_EVENT_TYPES.length, 11, '11 event types');

  // ── resetAuditLog ──
  resetAuditLog();
  expectEqual(totalEventsInLog(), 0, 'reset clears log');
  expectEqual(totalEventsForUser('u-multi'), 0, 'reset clears per-user index');

  // ── Summary ──
  console.log(`audit.spec.ts: ${passed}/${passed + failed} PASS`);
  if (failed > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('audit.spec.ts: harness crashed:', err);
  process.exit(1);
});
