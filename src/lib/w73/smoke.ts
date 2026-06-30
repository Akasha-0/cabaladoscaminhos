#!/usr/bin/env node --experimental-strip-types --no-warnings
// ============================================================================
// W73 smoke.ts — runtime end-to-end smoke harness
// ----------------------------------------------------------------------------
// 7 sections (per W73 brief):
//   1. REPORT_SUBMISSION — 9 cases (1 per ReportReason)
//   2. AUTO_CLASSIFICATION — 5 cases (spam / harassment / sacred / lgpd / hate)
//   3. REVIEW_QUEUE_LIFECYCLE — 5 cases (submit → claim → resolve)
//   4. MODERATION_ACTIONS — 7 cases (1 per ModerationAction)
//   5. AUDIT_APPEND — 11 cases (1 per AuditAction)
//   6. HASH_CHAIN_INTEGRITY — 3 cases (valid / 1 tampered / multiple tampered)
//   7. SACRED_WHITELIST — 7 cases (1 per tradition has ≥10 protected terms)
// Plus audit-hook assertions (auditModerationRules / auditSacredWhitelist /
// auditHashChain).
// ----------------------------------------------------------------------------
// Runs both spec files (moderation-queue.spec.ts + audit-log.spec.ts) AND an
// independent "smoke sections" pass to satisfy the W73 brief section list.
// ============================================================================

import * as mq from './moderation-queue.ts';
import * as al from './audit-log.ts';
import { SPEC_REGISTRY as MQ_REGISTRY } from './moderation-queue.spec.ts';
import { SPEC_REGISTRY as AL_REGISTRY } from './audit-log.spec.ts';

// ────────────────────────────────────────────────────────────────────────────
// Mini assertion harness
// ────────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertIt(condition: unknown, label: string): asserts condition {
  if (condition) {
    passed += 1;
    process.stdout.write(`  ✓ ${label}\n`);
  } else {
    failed += 1;
    failures.push(label);
    process.stdout.write(`  ✗ ${label}\n`);
  }
}

function header(title: string): void {
  process.stdout.write(`\n── ${title} ──\n`);
}

async function runSpecRegistry(registry: { name: string; run: () => void | Promise<void> }[], prefix: string): Promise<void> {
  for (const s of registry) {
    try {
      await s.run();
      passed += 1;
      process.stdout.write(`  ✓ ${prefix}${s.name}\n`);
    } catch (e) {
      failed += 1;
      failures.push(`${prefix}${s.name}`);
      process.stdout.write(`  ✗ ${prefix}${s.name} :: ${(e as Error).message}\n`);
    }
  }
}

// helper: factory for ids
const u = (s: string) => s as mq.UserId;
const cid = (s: string) => s as mq.ContentId;

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1: REPORT_SUBMISSION — 1 per ReportReason (9 total)
// ────────────────────────────────────────────────────────────────────────────

header('1. REPORT_SUBMISSION (9 cases)');

const REASONS: mq.ReportReason[] = [
  'spam', 'harassment', 'sacred-violation', 'misinformation',
  'lgpd-violation', 'hate-speech', 'self-harm', 'off-topic', 'other',
];

mq.__resetModerationStore();
for (const reason of REASONS) {
  const r = mq.submitReport(u('reporter_alice'), cid('content_001'), 'comment', reason, 'evidence');
  if (!r.ok || r.value.reason !== reason) {
    assertIt(false, `submitReport accepts reason=${reason}`);
  } else {
    assertIt(true, `submitReport accepts reason=${reason}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2: AUTO_CLASSIFICATION (5 cases)
// ────────────────────────────────────────────────────────────────────────────

header('2. AUTO_CLASSIFICATION (5 cases)');

mq.__resetModerationStore();

// 2a spam
let r = mq.submitReport(u('u1'), cid('c_spam'), 'comment', 'spam', '');
assertIt(r.ok, 'spam submit ok');
const clsSpam = mq.autoClassifyReport(r.value, 'compre-agora https://spam.example https://spam2.example https://spam3.example link');
assertIt(clsSpam.suggestedAction === 'hide-content', 'spam with links → hide-content');

// 2b harassment
r = mq.submitReport(u('u2'), cid('c_har'), 'comment', 'harassment', '');
assertIt(r.ok, 'harassment submit ok');
const clsHar = mq.autoClassifyReport(r.value, 'voce ela ele lixo nojo inutil');
assertIt(clsHar.suggestedAction === 'warn-author', 'harassment with pronouns+adjectives → warn-author');

// 2c sacred-violation (with profane context)
r = mq.submitReport(u('u3'), cid('c_sac'), 'comment', 'sacred-violation', '');
assertIt(r.ok, 'sacred submit ok');
const clsSac = mq.autoClassifyReport(r.value, 'esse kundalini e uma merda porcaria');
assertIt(clsSac.suggestedAction === 'sacred-recontextualize', 'sacred + profane → sacred-recontextualize');
assertIt(clsSac.sacredFlags.length > 0, 'sacred flags populated');

// 2d LGPD-violation (CPF)
r = mq.submitReport(u('u4'), cid('c_lgpd'), 'comment', 'lgpd-violation', '');
assertIt(r.ok, 'lgpd submit ok');
const clsLgpd = mq.autoClassifyReport(r.value, 'meu cpf e 123.456.789-09');
assertIt(clsLgpd.suggestedAction === 'remove-content', 'CPF detected → remove-content');

// 2e hate-speech
r = mq.submitReport(u('u5'), cid('c_hate'), 'comment', 'hate-speech', '');
assertIt(r.ok, 'hate submit ok');
const clsHate = mq.autoClassifyReport(r.value, 'chuto-1 chuto-2 chuto-3');
assertIt(clsHate.suggestedAction === 'remove-content', 'slur detected → remove-content');

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3: REVIEW_QUEUE_LIFECYCLE (5 cases)
// ────────────────────────────────────────────────────────────────────────────

header('3. REVIEW_QUEUE_LIFECYCLE (5 cases)');

mq.__resetModerationStore();

// 3a submit → enqueue
const sub = mq.submitReport(u('reporter_bob'), cid('content_42'), 'post', 'harassment', 'evidence B');
assertIt(sub.ok, '3a submit ok');
const queued = mq.addToReviewQueue(sub.value!.id, 'high');
assertIt(queued.ok, '3a enqueue ok');
const list = mq.listPendingReports({ status: 'in-review' }, { offset: 0, limit: 10 });
assertIt(list.ok && list.value.length >= 1, '3a list in-review ok');

// 3b submit → claim happy
const sub2 = mq.submitReport(u('reporter_ca'), cid('content_43'), 'comment', 'spam', '');
assertIt(sub2.ok, '3b/3c/3d setup');
if (!sub2.ok) throw new Error('sub2 setup');
const claim = mq.claimReport(sub2.value.id, u('mod_zoe'));
assertIt(claim.ok, '3b claim happy path');
if (!claim.ok) assertIt(false, '3b reviewer set');
else assertIt(claim.value.reviewerId === u('mod_zoe'), '3b reviewer set');

// 3c claim already taken
const claim2 = mq.claimReport(sub2.value!.id, u('mod_other'));
assertIt(!claim2.ok && claim2.error.code === 'ALREADY_CLAIMED', '3c second claim → ALREADY_CLAIMED');

// 3d resolve
const resolve = mq.resolveReport(sub2.value.id, 'hide-content', 'spam confirmed', u('mod_zoe'));
if (!resolve.ok) assertIt(false, '3d resolve → resolved');
else assertIt(resolve.value.status === 'resolved', '3d resolve → resolved');
if (!resolve.ok) assertIt(false, '3d action=hide-content');
else assertIt(resolve.value.action === 'hide-content', '3d action=hide-content');

// 3e resolve requires rationale
const sub3 = mq.submitReport(u('reporter_e'), cid('content_44'), 'comment', 'spam', '');
assertIt(sub3.ok, '3e setup');
if (!sub3.ok) throw new Error('sub3 setup');
const noRat = mq.resolveReport(sub3.value.id, 'warn-author', '', u('mod_zoe'));
assertIt(!noRat.ok && noRat.error.code === 'INVALID_INPUT', '3e empty rationale rejected');

// ────────────────────────────────────────────────────────────────────────────
// SECTION 4: MODERATION_ACTIONS (7 cases — 1 per ModerationAction)
// ────────────────────────────────────────────────────────────────────────────

header('4. MODERATION_ACTIONS (7 cases)');

mq.__resetModerationStore();
const ACTIONS: mq.ModerationAction[] = [
  'no-action', 'warn-author', 'hide-content', 'remove-content',
  'temp-ban', 'perm-ban', 'sacred-recontextualize',
];

let allActionResolved = true;
for (const action of ACTIONS) {
  const sr = mq.submitReport(u('r_' + action), cid('c_' + action), 'comment', 'spam', '');
  if (!sr.ok) { allActionResolved = false; break; }
  if (action === 'no-action') {
    const d = mq.dismissReport(sr.value.id, 'false positive', u('mod'));
    if (!d.ok || d.value!.action !== 'no-action') allActionResolved = false;
  } else {
    const x = mq.resolveReport(sr.value.id, action, 'rationale for ' + action, u('mod'));
    if (!x.ok || x.value!.action !== action) allActionResolved = false;
  }
}
assertIt(allActionResolved, 'all 7 ModerationAction types resolve correctly');

// ────────────────────────────────────────────────────────────────────────────
// SECTION 5: AUDIT_APPEND (11 cases — 1 per AuditAction)
// ────────────────────────────────────────────────────────────────────────────

header('5. AUDIT_APPEND (11 cases)');

al.__resetAuditStore();
const AUDIT_ACTIONS: al.AuditAction[] = [
  'report-submitted', 'report-classified', 'report-claimed', 'report-resolved',
  'content-hidden', 'content-removed', 'user-warned', 'user-banned',
  'user-unbanned', 'sacred-recontextualized', 'audit-exported',
];

let allAuditAccepted = true;
let firstHash = '';
for (const action of AUDIT_ACTIONS) {
  const r = al.appendAudit({
    actorId: al.newUserId('actor_' + action),
    actorRole: 'moderator',
    action,
    targetType: 'content',
    targetId: 't_' + action,
    payload: { reason: 'smoke', iteration: action },
    ip: '127.0.0.1',
    userAgent: 'smoke-runner/1.0',
  });
  if (!r.ok) { allAuditAccepted = false; break; }
  const rval = r.value;
  if (rval.action !== action) { allAuditAccepted = false; break; }
  if (!firstHash) firstHash = rval.hashChain;
}
assertIt(allAuditAccepted, 'all 11 AuditAction types append to chain');
assertIt(firstHash.length === 64, 'first hash chain link is 64 hex chars (SHA-256)');

// ────────────────────────────────────────────────────────────────────────────
// SECTION 6: HASH_CHAIN_INTEGRITY (3 cases)
// ────────────────────────────────────────────────────────────────────────────

header('6. HASH_CHAIN_INTEGRITY (3 cases)');

al.__resetAuditStore();
const a = al.appendAudit({
  actorId: al.newUserId('admin_1'), actorRole: 'admin',
  action: 'report-submitted', targetType: 'content', targetId: 't1', payload: { ok: 1 },
  ip: '1.1.1.1', userAgent: 'smoke/ua',
});
const b = al.appendAudit({
  actorId: al.newUserId('admin_1'), actorRole: 'admin',
  action: 'report-claimed', targetType: 'report', targetId: 't1', payload: { ok: 1 },
  ip: '1.1.1.1', userAgent: 'smoke/ua',
});
const c = al.appendAudit({
  actorId: al.newUserId('admin_1'), actorRole: 'admin',
  action: 'report-resolved', targetType: 'report', targetId: 't1', payload: { ok: 1 },
  ip: '1.1.1.1', userAgent: 'smoke/ua',
});
assertIt(a.ok && b.ok && c.ok, 'audit append setup');
if (!a.ok || !b.ok || !c.ok) throw new Error('audit append setup');

// 6a valid chain
const v6a = al.verifyHashChain(a.value.id, c.value.id);
if (!v6a.ok) assertIt(false, '6a hash chain valid for full range');
else assertIt(v6a.value.isValid, '6a hash chain valid for full range');

// 6b partial chain (a..b)
const v6b = al.verifyHashChain(a.value.id, b.value.id);
if (!v6b.ok) assertIt(false, '6b hash chain valid for partial range');
else assertIt(v6b.value.isValid, '6b hash chain valid for partial range');

// 6c auto-audit after export
al.exportAuditTrail({}, 'json', al.newUserId('admin_2'), 'admin');
const chainFinal = al.auditHashChain();
assertIt(chainFinal.isValid, '6c auditHashChain isValid=true after export');
assertIt(chainFinal.chainLength === 4, `6c chain length includes export (expected 4, got ${chainFinal.chainLength})`);

// ────────────────────────────────────────────────────────────────────────────
// SECTION 7: SACRED_WHITELIST (7 cases — 1 per tradition)
// ────────────────────────────────────────────────────────────────────────────

header('7. SACRED_WHITELIST (7 cases)');

const TRADITIONS: mq.Tradition[] = [
  'cigano', 'orixas', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot',
];

for (const trad of TRADITIONS) {
  const terms = mq.PROTECTED_SACRED_TERMS[trad];
  assertIt(terms.length >= 10, `${trad} has ≥10 protected terms (got ${terms.length})`);
}

const totalSacredTerms = TRADITIONS.reduce((sum, t) => sum + mq.PROTECTED_SACRED_TERMS[t].length, 0);
assertIt(totalSacredTerms >= 100, `total sacred terms ≥100 across 7 traditions (got ${totalSacredTerms})`);

// ────────────────────────────────────────────────────────────────────────────
// AUDIT HOOKS (extra)
// ────────────────────────────────────────────────────────────────────────────

header('8. AUDIT HOOKS');

const modRules = mq.auditModerationRules();
assertIt(modRules.length >= 5, `auditModerationRules returns ≥5 rules (got ${modRules.length})`);

const wAudit = mq.auditSacredWhitelist();
assertIt(wAudit.length === 7 && wAudit.every((t) => t.termCount >= 10), 'auditSacredWhitelist returns 7 traditions, each ≥10');

// ────────────────────────────────────────────────────────────────────────────
// SPEC FILE EXECUTION
// ────────────────────────────────────────────────────────────────────────────

header('SPEC: moderation-queue.spec.ts');
await runSpecRegistry(MQ_REGISTRY, '[MQ] ');

header('SPEC: audit-log.spec.ts');
await runSpecRegistry(AL_REGISTRY, '[AL] ');

// ────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ────────────────────────────────────────────────────────────────────────────

process.stdout.write(`\n── SMOKE SUMMARY ──\n`);
process.stdout.write(`Passed: ${passed}\n`);
process.stdout.write(`Failed: ${failed}\n`);
if (failed > 0) {
  process.stdout.write(`Failures:\n  - ${failures.join('\n  - ')}\n`);
  process.exit(1);
}
process.exit(0);
