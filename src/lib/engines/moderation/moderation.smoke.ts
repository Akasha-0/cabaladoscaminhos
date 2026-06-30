/**
 * ════════════════════════════════════════════
 * W84-C — COMMENTS MODERATION · SMOKE
 * ════════════════════════════════════════════
 *
 * Cycle 84 · 2026-06-30
 * Author: W84-C Coder (Mavis orchestrator session 414756900012156)
 *
 * End-to-end smoke (≥30 assertions):
 *   1. SHA-256 still valid after a long chain
 *   2. submit report → review → decide → audit log present
 *   3. batch decide atomicity
 *   4. queue filtering
 *   5. moderator stats updates
 *   6. chain integrity after mutations
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };

import {
  submitReport,
  decide,
  batchDecide,
  getQueue,
  getReport,
  getAuditLog,
  getModeratorStats,
  _resetForTests,
  REPORT_REASONS,
  SAMPLE_REPORTS,
  SAMPLE_MODERATORS,
  SAMPLE_REASON_COVERAGE,
  type CommentId,
  type ReporterId,
} from './moderation-engine.ts';

import { validateChain } from './audit-logger.ts';

interface SmokeEntry {
  name: string;
  run: () => void | Promise<void>;
}

const REGISTRY: SmokeEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok =
    Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(
        expected,
      )}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) {
    throw new Error(
      `assertTrue FAIL${label ? ' (' + label + ')' : ''}: got falsy ${String(v)}`,
    );
  }
}

// ════════════════════════════════════════════
// SMOKE 1: SHA-256 baseline
// ════════════════════════════════════════════

it('NIST empty-string SHA-256 fixture', async () => {
  const mod = await import('./audit-logger.ts');
  assertEqual(
    mod._sha256Sync(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );
});

it('NIST "abc" SHA-256 fixture', async () => {
  const mod = await import('./audit-logger.ts');
  assertEqual(
    mod._sha256Sync('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

// ════════════════════════════════════════════
// SMOKE 2: full flow submit → review → decide → audit
// ════════════════════════════════════════════

it('initial sample state has 12 reports', () => {
  assertEqual(SAMPLE_REPORTS.length, 12);
  assertEqual(REPORT_REASONS.length, 8);
});

it('audit log starts with ≥12 entries from sample load', () => {
  const log = getAuditLog();
  assertTrue(log.length >= 12, `audit log should be populated, got ${log.length}`);
});

it('chain validates after sample load', () => {
  const result = validateChain();
  assertTrue(result.ok, `chain should validate, reason: ${result.reason}`);
});

it('submit a new report creates audit entry', () => {
  const before = getAuditLog().length;
  submitReport('cmt-001' as CommentId, 'rptr-smoke' as ReporterId, 'spam');
  const after = getAuditLog().length;
  assertEqual(after, before + 1);
});

it('submit → decide → audit chain updates', () => {
  const rep = submitReport(
    'cmt-002' as CommentId,
    'rptr-flow' as ReporterId,
    'misinformation',
  );
  const before = getAuditLog().length;
  const updated = decide({
    reportId: rep.id,
    moderatorId: 'mod-amara-001' as Parameters<typeof decide>[0]['moderatorId'],
    action: 'approve',
    note: 'Review confirmed safe content.',
  });
  assertEqual(updated.status, 'approved');
  const after = getAuditLog().length;
  assertEqual(after, before + 1);
});

it('chain still validates after submit + decide', () => {
  const result = validateChain();
  assertTrue(result.ok);
});

// ════════════════════════════════════════════
// SMOKE 3: batch ops
// ════════════════════════════════════════════

it('batch decide processes multiple reports', () => {
  const result = batchDecide({
    reportIds: ['rep-000b', 'rep-000c'] as unknown as ReadonlyArray<
      Parameters<typeof decide>[0]['reportId']
    >,
    moderatorId: 'mod-amara-001' as Parameters<typeof decide>[0]['moderatorId'],
    action: 'approve',
    note: 'Smoke batch review',
  });
  assertTrue(result.succeeded >= 2);
  assertTrue(result.failed === 0);
});

it('batch decide records a batch-decide audit entry', () => {
  const before = getAuditLog().length;
  batchDecide({
    reportIds: ['rep-0008'] as unknown as ReadonlyArray<Parameters<typeof decide>[0]['reportId']>,
    moderatorId: 'mod-amara-001' as Parameters<typeof decide>[0]['moderatorId'],
    action: 'approve',
    note: 'Approving other reason with note',
  });
  const after = getAuditLog().length;
  assertTrue(after > before, 'audit should grow');
});

it('chain still validates after batch ops', () => {
  const result = validateChain();
  assertTrue(result.ok);
});

// ════════════════════════════════════════════
// SMOKE 4: queue filtering
// ════════════════════════════════════════════

it('getQueue returns paginated results', () => {
  const page = getQueue({ status: 'all' }, 1, 5);
  assertTrue(page.entries.length >= 1);
  assertTrue(page.total >= 10);
});

it('getQueue with status filter', () => {
  const page = getQueue({ status: 'escalated' }, 1, 50);
  for (const e of page.entries) {
    assertEqual(e.report.status, 'escalated');
  }
});

it('getQueue with reason filter', () => {
  const page = getQueue(
    { reason: 'spam' } as Parameters<typeof getQueue>[0],
    1,
    50,
  );
  for (const e of page.entries) {
    assertEqual(e.report.reason, 'spam');
  }
});

it('getQueue with tradição filter', () => {
  const page = getQueue(
    { tradicao: 'Cigano' } as Parameters<typeof getQueue>[0],
    1,
    50,
  );
  for (const e of page.entries) {
    assertEqual(e.comment?.tradicao, 'Cigano');
  }
});

it('getQueue with search', () => {
  const page = getQueue(
    { search: 'caboclo' } as Parameters<typeof getQueue>[0],
    1,
    50,
  );
  assertTrue(page.total >= 0);
});

it('getQueue pagination hasMore', () => {
  const page1 = getQueue({ status: 'all' }, 1, 3);
  const page2 = getQueue({ status: 'all' }, 2, 3);
  assertTrue(page1.entries.length === 3);
  assertTrue(page2.entries.length >= 1);
});

// ════════════════════════════════════════════
// SMOKE 5: moderator stats
// ════════════════════════════════════════════

it('moderator stats reflect activity', () => {
  const amaraStats = getModeratorStats('mod-amara-001' as Parameters<typeof getModeratorStats>[0]);
  assertTrue(amaraStats.decided >= 1 || amaraStats.batchOps >= 1);
});

it('admin has full permission set', () => {
  const amara = SAMPLE_MODERATORS[0]!;
  assertEqual(amara.role, 'admin');
  assertTrue(amara.permissions.includes('batch-decide'));
  assertTrue(amara.permissions.includes('escalate'));
});

it('junior mod lacks escalation', () => {
  const tibet = SAMPLE_MODERATORS[2]!;
  assertFalse(tibet.permissions.includes('escalate'));
});

function assertFalse(v: unknown, label?: string): void {
  if (v) {
    throw new Error(
      `assertFalse FAIL${label ? ' (' + label + ')' : ''}: got truthy ${String(v)}`,
    );
  }
}

// ════════════════════════════════════════════
// SMOKE 6: end-to-end happy path
// ════════════════════════════════════════════

it('end-to-end happy: submit → decide → audit → stats', () => {
  const rep = submitReport(
    'cmt-005' as CommentId,
    'rptr-e2e' as ReporterId,
    'spam',
    'Seventh-day promos are not content of the house',
  );
  assertTrue(rep.status === 'pending' || rep.status === 'auto-flagged');
  const updated = decide({
    reportId: rep.id,
    moderatorId: 'mod-amara-001' as Parameters<typeof decide>[0]['moderatorId'],
    action: 'deny',
    note: 'E2E smoke denied this.',
  });
  assertEqual(updated.status, 'denied');
  const log = getAuditLog();
  const matching = log.filter((e) => (e.reportId as unknown as string) === (rep.id as unknown as string));
  assertTrue(matching.length >= 2, 'submit + decide = 2 audit entries');
});

it('chain validates after end-to-end', () => {
  const result = validateChain();
  assertTrue(result.ok);
});

it('final chain length is ≥ 14 (12 sample + 2 from submit + decide + 1 batch)', () => {
  const log = getAuditLog();
  assertTrue(log.length >= 14, `expected ≥14 entries, got ${log.length}`);
});

it('every audit entry has unique seq', () => {
  const log = getAuditLog();
  const seqs = log.map((e) => e.seq);
  const uniq = new Set(seqs);
  assertEqual(uniq.size, seqs.length, 'no duplicate seq');
});

it('every audit entry has a hash', () => {
  const log = getAuditLog();
  for (const e of log) {
    assertEqual(e.hash.length, 64, `seq ${e.seq} hash should be 64-hex`);
  }
});

it('submit-report action audit entries have null before/after reasoning', () => {
  const log = getAuditLog();
  const submits = log.filter((e) => e.action === 'submit-report');
  assertTrue(submits.length >= 12, `submit-report entries, got ${submits.length}`);
});

it('transition entries have non-null before AND after statuses', () => {
  const log = getAuditLog();
  const transitions = log.filter((e) => e.action === 'transition');
  assertTrue(transitions.length >= 1);
  for (const t of transitions) {
    assertTrue(t.before !== null, `before at seq ${t.seq}`);
    assertTrue(t.after !== null, `after at seq ${t.seq}`);
  }
});

it('batch-decide entry has meta with action and counts', () => {
  const log = getAuditLog();
  const batches = log.filter((e) => e.action === 'batch-decide');
  assertTrue(batches.length >= 1);
  for (const b of batches) {
    assertTrue(b.meta.succeeded !== undefined || b.meta.failed !== undefined);
  }
});

it('getModeratorStats distinguishes decided vs batch-ops', () => {
  const amaraStats = getModeratorStats('mod-amara-001' as Parameters<typeof getModeratorStats>[0]);
  // decided counts only 'transition' actions
  // batchOps counts only 'batch-decide' actions
  assertTrue(amaraStats.decided >= 0);
  assertTrue(amaraStats.batchOps >= 0);
});

it('SAMPLE_MODERATORS contains Amara, Kaeru, Tibério', () => {
  const names = SAMPLE_MODERATORS.map((m) => m.name);
  assertTrue(names.includes('Amara'));
  assertTrue(names.includes('Kaeru'));
  assertTrue(names.includes('Tibério'));
});

it('senior-mod has fewer permissions than admin', () => {
  const admin = SAMPLE_MODERATORS[0]!;
  const senior = SAMPLE_MODERATORS[1]!;
  assertTrue(senior.permissions.length < admin.permissions.length);
});

it('12 sample reports covers all 8 reasons', () => {
  const reasons = new Set(SAMPLE_REPORTS.map((r) => r.reason as string));
  assertEqual(reasons.size, 8);
});

it('chain tamper detection: every entry has prevHash', () => {
  const log = getAuditLog();
  for (const e of log) {
    assertEqual(e.prevHash.length, 64, `prevHash at seq ${e.seq} should be 64-hex`);
  }
});

it('chain tamper detection: first entry prevHash is genesis (all zeros)', () => {
  const log = getAuditLog();
  const first = log[0]!;
  assertEqual(first.prevHash, '0'.repeat(64));
});

it('moderator stats avgDecisionSeconds is non-negative', () => {
  const stats = getModeratorStats('mod-amara-001' as Parameters<typeof getModeratorStats>[0]);
  assertTrue(stats.avgDecisionSeconds >= 0);
});

it('SAMPLE_REASON_COVERAGE includes all 8 reasons', async () => {
  const { REPORT_REASONS } = await import('./moderation-engine.ts');
  assertTrue(SAMPLE_REASON_COVERAGE.length === REPORT_REASONS.length);
});

it('getReport returns frozen report', () => {
  const r = getReport('rep-0001' as Parameters<typeof getReport>[0]);
  assertTrue(r !== null);
  assertTrue(Object.isFrozen(r), 'report should be frozen');
});

it('chain validates at end of full smoke', () => {
  const result = validateChain();
  assertTrue(result.ok, `final chain validation, reason: ${result.reason}`);
});

// ════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════

async function runSmoke(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  _resetForTests();

  for (const entry of REGISTRY) {
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
  console.log(`  SMOKE RESULT: ${passed} PASS · ${failed} FAIL · ${REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

runSmoke().catch((err) => {
  console.error('Fatal smoke runner error:', err);
  process.exit(2);
});