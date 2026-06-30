// ============================================================================
// W73 moderation-queue.spec.ts — runtime spec harness (NOT imported by smoke)
// ============================================================================
// Run via smoke.ts — direct execution under node --experimental-strip-types.
// This file documents expected behaviors as exported metadata for the smoke
// runner and IDEIA-spec validation.
//
// Each `it(label, fn)` is registered in the global SPEC_REGISTRY below and
// invoked from smoke.ts in cycle.
// ============================================================================

import {
  submitReport,
  autoClassifyReport,
  addToReviewQueue,
  claimReport,
  resolveReport,
  dismissReport,
  listPendingReports,
  listReportsByReviewer,
  getReportStats,
  isContentFlagged,
  getSacredContext,
  __resetModerationStore,
  auditModerationRules,
  auditSacredWhitelist,
  PROTECTED_SACRED_TERMS,
  newUserId,
  newContentId,
  type ModerationReport,
} from './moderation-queue.ts';

// ────────────────────────────────────────────────────────────────────────────
// Mini assertion harness (Spec)
// ────────────────────────────────────────────────────────────────────────────

export interface Spec {
  name: string;
  run: () => void | Promise<void>;
}

export const SPEC_REGISTRY: Spec[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({
    name,
    run: () => {
      __resetModerationStore();
      return run();
    },
  });
}

let _lastReport: ModerationReport | null = null;
function makeReport(reason: 'spam' | 'harassment' | 'sacred-violation' | 'misinformation' | 'lgpd-violation' | 'hate-speech' | 'self-harm' | 'off-topic' | 'other' = 'spam') {
  const r = submitReport(
    newUserId('user_alice'),
    newContentId('content_xyz'),
    'comment',
    reason,
    'some evidence',
  );
  if (!r.ok) throw new Error(`setup fail: ${r.error.message}`);
  _lastReport = r.value;
  return r.value;
}

// ────────────────────────────────────────────────────────────────────────────
// Setup / teardown
// ────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  __resetModerationStore();
});

function beforeEach(fn: () => void): void { /* hoisted at smoke runtime */ }

// ────────────────────────────────────────────────────────────────────────────
// 1. submitReport happy path
// ────────────────────────────────────────────────────────────────────────────

it('submitReport accepts a valid report and returns pending status', () => {
  const r = submitReport(
    newUserId('user_bob'),
    newContentId('content_a'),
    'comment',
    'spam',
    'looks like spam',
  );
  if (!r.ok) throw new Error('expected ok');
  if (r.value.status !== 'pending') throw new Error('expected pending status');
});

// 9 reason types — one per ReportReason
it('submitReport accepts reason: harassment', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'harassment', 'x');
  if (!r.ok) throw new Error('harassment should be accepted');
});
it('submitReport accepts reason: sacred-violation', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'sacred-violation', 'x');
  if (!r.ok) throw new Error('sacred-violation should be accepted');
});
it('submitReport accepts reason: misinformation', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'misinformation', 'x');
  if (!r.ok) throw new Error('misinformation should be accepted');
});
it('submitReport accepts reason: lgpd-violation', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'lgpd-violation', 'x');
  if (!r.ok) throw new Error('lgpd-violation should be accepted');
});
it('submitReport accepts reason: hate-speech', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'hate-speech', 'x');
  if (!r.ok) throw new Error('hate-speech should be accepted');
});
it('submitReport accepts reason: self-harm', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'self-harm', 'x');
  if (!r.ok) throw new Error('self-harm should be accepted');
});
it('submitReport accepts reason: off-topic', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'off-topic', 'x');
  if (!r.ok) throw new Error('off-topic should be accepted');
});
it('submitReport accepts reason: other', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'other', 'x');
  if (!r.ok) throw new Error('other should be accepted');
});

// ────────────────────────────────────────────────────────────────────────────
// 2. autoClassifyReport
// ────────────────────────────────────────────────────────────────────────────

it('autoClassifyReport flags spam with links as hide-content', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const result = autoClassifyReport(r.value, 'compre-agora https://spam.example https://spam2.example https://spam3.example');
  if (result.suggestedAction !== 'hide-content') throw new Error(`expected hide-content, got ${result.suggestedAction}`);
});

it('autoClassifyReport flags harassment with personal pronouns + negative adjectives', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'harassment', '');
  if (!r.ok) throw new Error('setup');
  const result = autoClassifyReport(r.value, 'voce e lixo e um nojo para ela');
  if (result.suggestedAction !== 'warn-author') throw new Error(`expected warn-author, got ${result.suggestedAction}`);
});

it('autoClassifyReport returns sacred-recontextualize for content with misused sacred terms', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'sacred-violation', '');
  if (!r.ok) throw new Error('setup');
  const result = autoClassifyReport(r.value, 'esse kundalini e uma merda porcaria');
  if (result.suggestedAction !== 'sacred-recontextualize') throw new Error(`expected sacred-recontextualize, got ${result.suggestedAction}`);
});

it('autoClassifyReport detects CPF as LGPD violation', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'lgpd-violation', '');
  if (!r.ok) throw new Error('setup');
  const result = autoClassifyReport(r.value, 'meu cpf e 123.456.789-09');
  if (result.suggestedAction !== 'remove-content') throw new Error(`expected remove-content, got ${result.suggestedAction}`);
});

it('autoClassifyReport detects hate-speech slur and removes', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'hate-speech', '');
  if (!r.ok) throw new Error('setup');
  const result = autoClassifyReport(r.value, 'voce e um chuto-1 porco');
  if (result.suggestedAction !== 'remove-content') throw new Error(`expected remove-content, got ${result.suggestedAction}`);
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Review queue lifecycle
// ────────────────────────────────────────────────────────────────────────────

it('addToReviewQueue puts a pending report in-review with priority', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const a = addToReviewQueue(r.value.id, 'urgent');
  if (!a.ok) throw new Error('expected ok');
  const listed = listPendingReports({ status: 'in-review' }, { offset: 0, limit: 10 });
  if (!listed.ok || listed.value.length !== 1) throw new Error('expected 1 in-review');
});

it('claimReport happy path', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const claimed = claimReport(r.value.id, newUserId('mod_zoe'));
  if (!claimed.ok) throw new Error('expected ok');
  if (claimed.value.reviewerId !== newUserId('mod_zoe')) throw new Error('reviewer not set');
});

it('claimReport fails when already claimed by another reviewer', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const c1 = claimReport(r.value.id, newUserId('mod_a'));
  if (!c1.ok) throw new Error('first claim should succeed');
  const c2 = claimReport(r.value.id, newUserId('mod_b'));
  if (c2.ok) throw new Error('second claim should fail with ALREADY_CLAIMED');
  if (c2.error.code !== 'ALREADY_CLAIMED') throw new Error('expected ALREADY_CLAIMED');
});

// 7 action types — one per ModerationAction
it('resolveReport action=warn-author', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = resolveReport(r.value.id, 'warn-author', 'first warning', newUserId('mod'));
  if (!x.ok || x.value.action !== 'warn-author') throw new Error('fail');
});
it('resolveReport action=hide-content', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = resolveReport(r.value.id, 'hide-content', 'spam', newUserId('mod'));
  if (!x.ok || x.value.action !== 'hide-content') throw new Error('fail');
});
it('resolveReport action=remove-content', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = resolveReport(r.value.id, 'remove-content', 'spam', newUserId('mod'));
  if (!x.ok || x.value.action !== 'remove-content') throw new Error('fail');
});
it('resolveReport action=temp-ban', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = resolveReport(r.value.id, 'temp-ban', 'temp', newUserId('mod'));
  if (!x.ok || x.value.action !== 'temp-ban') throw new Error('fail');
});
it('resolveReport action=perm-ban', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = resolveReport(r.value.id, 'perm-ban', 'perm', newUserId('mod'));
  if (!x.ok || x.value.action !== 'perm-ban') throw new Error('fail');
});
it('resolveReport action=sacred-recontextualize', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = resolveReport(r.value.id, 'sacred-recontextualize', 'recon', newUserId('mod'));
  if (!x.ok || x.value.action !== 'sacred-recontextualize') throw new Error('fail');
});
it('resolveReport action=no-action via dismissReport', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  const x = dismissReport(r.value.id, 'false positive', newUserId('mod'));
  if (!x.ok || x.value.action !== 'no-action') throw new Error('fail');
});

it('listPendingReports filters by priority + reason', () => {
  submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  submitReport(newUserId('u2'), newContentId('c2'), 'comment', 'harassment', '');
  const list = listPendingReports({ priority: 'normal' }, { offset: 0, limit: 10 });
  if (!list.ok) throw new Error('fail');
  if (list.value.length < 1) throw new Error('expected some');
});

it('listReportsByReviewer returns only that reviewer', () => {
  const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'spam', '');
  if (!r.ok) throw new Error('setup');
  claimReport(r.value.id, newUserId('mod_zoe'));
  const list = listReportsByReviewer(newUserId('mod_zoe'), {});
  if (!list.ok || list.value.length !== 1) throw new Error('expected 1');
});

// ────────────────────────────────────────────────────────────────────────────
// 4. getReportStats
// ────────────────────────────────────────────────────────────────────────────

it('getReportStats math is correct for a 30-day window', () => {
  for (let i = 0; i < 3; i += 1) {
    const r = submitReport(newUserId('u'), newContentId(`c${i}`), 'comment', 'spam', '');
    if (!r.ok) throw new Error('setup');
    if (i === 0) resolveReport(r.value.id, 'hide-content', 'spam', newUserId('mod'));
  }
  const s = getReportStats(30);
  if (!s.ok) throw new Error('fail');
  if (s.value.total !== 3) throw new Error(`expected 3 total, got ${s.value.total}`);
  if (s.value.byReason.spam !== 3) throw new Error(`expected 3 spam`);
  if (s.value.byAction['hide-content'] !== 1) throw new Error(`expected 1 hide`);
});

// ────────────────────────────────────────────────────────────────────────────
// 5. Sacred whitelist — 7 traditions, each ≥10 terms, no auto-flag
// ────────────────────────────────────────────────────────────────────────────

const TRADITIONS_TO_TEST = ['cigano', 'orixas', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot'] as const;

for (const trad of TRADITIONS_TO_TEST) {
  it(`sacred whitelist "${trad}" contains ≥10 terms`, () => {
    if (PROTECTED_SACRED_TERMS[trad].length < 10) throw new Error(`too few`);
  });
  it(`autoClassifyReport does NOT flag "${trad}" terms (false-positive guard)`, () => {
    // Pick the first term from that tradition; use it in benign text:
    const term = PROTECTED_SACRED_TERMS[trad][0];
    const r = submitReport(newUserId('u'), newContentId('c'), 'comment', 'sacred-violation', '');
    if (!r.ok) throw new Error('setup');
    const result = autoClassifyReport(r.value, `oi pessoal, vamos falar sobre ${term} hoje na roda`);
    // Without profane context, the auto-classifier must NOT pick sacred-recontextualize
    // (the sacred-violation action requires profane hints; here we have none).
    if (result.suggestedAction === 'sacred-recontextualize') {
      throw new Error(`false positive: ${term} flagged without profane context`);
    }
    // And the sacred term should appear in the false-positive flag list:
    if (!result.sacredFlags.includes(term)) {
      throw new Error(`sacredFlag missing for ${term}`);
    }
  });
  it(`getSacredContext(${trad}) returns matched terms + risk`, () => {
    const sample = PROTECTED_SACRED_TERMS[trad].slice(0, 3).join(' ');
    const ctx = getSacredContext(trad, `hoje vou falar sobre ${sample} e seus significados`);
    if (ctx.matchedTerms.length < 1) throw new Error(`no match for ${trad}`);
    if (ctx.falsePositiveRisk === 'low') {
      // we passed 3 terms so risk should be at least medium
      throw new Error(`risk unexpected: ${ctx.falsePositiveRisk}`);
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 6. isContentFlagged quick lookup
// ────────────────────────────────────────────────────────────────────────────

it('isContentFlagged returns true when a pending report exists', () => {
  submitReport(newUserId('u'), newContentId('contentX'), 'comment', 'spam', '');
  const r = isContentFlagged(newContentId('contentX'));
  if (!r.ok || r.value !== true) throw new Error('expected flagged');
});

it('isContentFlagged returns false when no report exists', () => {
  const r = isContentFlagged(newContentId('contentNE'));
  if (!r.ok || r.value !== false) throw new Error('expected not flagged');
});

// ────────────────────────────────────────────────────────────────────────────
// 7. Audit hooks
// ────────────────────────────────────────────────────────────────────────────

it('auditModerationRules returns ≥5 enforced rules', () => {
  const rules = auditModerationRules();
  if (rules.length < 5) throw new Error(`only ${rules.length} rules`);
  if (!rules.every((r) => r.isEnforced)) throw new Error('all rules must be enforced');
});

it('auditSacredWhitelist returns 7 traditions', () => {
  const w = auditSacredWhitelist();
  if (w.length !== 7) throw new Error(`expected 7, got ${w.length}`);
  if (w.some((t) => t.termCount < 10)) throw new Error('all 7 must have ≥10');
});

// dummy export marker so TSC doesn't complain about unused
export const SPEC_FILE_MARKER = true;
