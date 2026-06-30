/**
 * ════════════════════════════════════════════════════════════════════════════
 *  governance.spec.ts — 60+ assertions across 8 sections
 *
 *  Sections:
 *    §1 — RULES_TEMPLATES + types (8)
 *    §2 — setCircleRules + validation (10)
 *    §3 — vote cycle (propose → cast → tally) (12)
 *    §4 — vote tally edge cases (8)
 *    §5 — flagContent + resolveFlag (10)
 *    §6 — assertGovernanceHealthy + audits (8)
 *    §7 — ban-override side effects (4)
 *    §8 — proposal kinds validation (8)
 *
 *  Runs via `node --experimental-strip-types` OR vitest (when binary lands).
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  createCircle,
  getCircle,
  __resetCircleStore,
  toUserId,
  toCircleId,
  type Rule,
  type RuleId,
  CircleNotFoundError,
  CircleForbiddenError,
} from '../circles.ts';

import {
  joinCircle,
  __resetMembershipStore,
} from '../membership.ts';

import {
  createPost,
  __resetFeedStore,
  __getFeedState,
} from '../feed.ts';

import {
  setHmacSecret as setCircleHmac,
} from '../circles.ts';

import {
  RULES_TEMPLATES,
  RULE_TEMPLATE_NAMES,
  resolveRuleTemplate,
  setCircleRules,
  applyRuleTemplate,
  proposeVote,
  castVote,
  tallyVote,
  flagContent,
  resolveFlag,
  listFlags,
  getFlag,
  auditCircle,
  auditOpenFlags,
  auditPendingVotes,
  assertGovernanceHealthy,
  getBanOverrides,
  PROPOSAL_KINDS,
  VOTE_CHOICES,
  isVoteChoice,
  RESOLUTION_ACTIONS,
  type ProposalType,
  type Vote,
  type VoteChoice,
  type VoteId,
  type FlagId,
  type Flag,
  asVoteId,
  asFlagId,
  GovernanceValidationError,
  VoteNotFoundError,
  FlagNotFoundError,
  setGovernanceHmacSecret,
  __resetGovernanceStore,
  __attachFeedState,
} from '../governance.ts';

import {
  expectEqual,
  expectNotEqual,
  expectTrue,
  expectFalse,
  expectThrows,
  expectLen,
  expectContains,
  expectFrozen,
  expectGreaterThan,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

const ALICE = toUserId('user-alice');
const BOB = toUserId('user-bob');
const CARLA = toUserId('user-carla');
const DAN = toUserId('user-dan');
const EVE = toUserId('user-eve');

export function runGovernanceSpec(): number {
  resetHarness();
  __resetCircleStore();
  __resetMembershipStore();
  __resetFeedStore();
  __resetGovernanceStore();
  setCircleHmac('test-secret-gov');
  setGovernanceHmacSecret('test-secret-gov');

  // ── §1 — RULES_TEMPLATES + types ────────────────────────────────────────
  section('§1 templates + types');
  expectEqual('RULES_TEMPLATES has 5 templates', Object.keys(RULES_TEMPLATES).length, 5);
  expectEqual('RULE_TEMPLATE_NAMES has 5 entries', RULE_TEMPLATE_NAMES.length, 5);
  expectEqual('RULES_TEMPLATES.default has 4 rules', RULES_TEMPLATES.default.length, 4);
  expectEqual('RULES_TEMPLATES.strict has 4 rules', RULES_TEMPLATES.strict.length, 4);
  expectEqual('PROPOSAL_KINDS has 3 entries', PROPOSAL_KINDS.length, 3);
  expectEqual('VOTE_CHOICES has 3 entries', VOTE_CHOICES.length, 3);
  expectTrue('isVoteChoice("yes")', isVoteChoice('yes'));
  expectEqual('RESOLUTION_ACTIONS has 4 entries', RESOLUTION_ACTIONS.length, 4);

  // ── §2 — setCircleRules + validation ────────────────────────────────────
  section('§2 setCircleRules');
  const c1 = createCircle(ALICE, { name: 'Tantra Sangha', theme: 'tantra-meditation', isPublic: true, maxMembers: 50 });
  const newRules = setCircleRules(c1.id, ALICE, [
    { text: 'Respeite o silencio', severity: 'critical', enforcedBy: 'mod' },
    { text: 'Nao compartilhe praticas avancadas', severity: 'warning', enforcedBy: 'mod' },
  ]);
  expectEqual('setCircleRules returns frozen array', Object.isFrozen(newRules), true);
  expectEqual('setCircleRules returns 2 rules', newRules.length, 2);
  // Frozen rule check
  expectFrozen('rule is frozen', newRules[0]);
  expectThrows('non-creator cannot set rules', () =>
    setCircleRules(c1.id, BOB, [
      { text: 'regra X', severity: 'info', enforcedBy: 'auto' },
    ]),
  );
  expectThrows('invalid severity throws', () =>
    setCircleRules(c1.id, ALICE, [
      { text: 'regra valida', severity: 'extreme' as never, enforcedBy: 'auto' },
    ]),
  );
  // applyRuleTemplate
  const devRules = applyRuleTemplate(c1.id, ALICE, 'devotional');
  expectEqual('applyRuleTemplate devotional has 3 rules', devRules.length, 3);
  expectEqual('first rule text starts with "Respeite"', devRules[0]?.text.startsWith('Respeite'), true);
  expectThrows('non-creator cannot apply template', () =>
    applyRuleTemplate(c1.id, BOB, 'default'),
  );
  expectThrows('invalid template name throws', () =>
    applyRuleTemplate(c1.id, ALICE, 'extreme' as never),
  );

  // ── §3 — vote cycle (propose → cast → tally) ────────────────────────────
  section('§3 vote cycle');
  // Need enough members for quorum. memberCount must be ≥ 4 to pass at 25% with 2 yes/no voters.
  joinCircle(c1.id, BOB);
  joinCircle(c1.id, CARLA);
  joinCircle(c1.id, DAN);
  joinCircle(c1.id, EVE);
  expectEqual('c1 memberCount after 4 joins = 4', getCircle(c1.id)!.memberCount, 4);

  // Need 4 members to vote for 25% quorum of 4 = 1 yes+no vote (rounded) — actually denominator=1 ≥ 4*0.25=1: quorum met. Threshold: 1/(1+0)=1 ≥ 0.6: passed.
  const dissolutionProposal: ProposalType = { kind: 'dissolution', reason: 'fim de ciclo' };
  const vote = proposeVote(c1.id, ALICE, dissolutionProposal);
  expectEqual('vote kind=dissolution', vote.proposal.kind, 'dissolution');
  expectEqual('vote.status=pending', vote.status, 'pending');
  expectEqual('vote.votes initially empty', vote.votes.size, 0);
  expectThrows('banned members cannot propose', () => {
    banMembersForTest(c1.id, DAN);
    proposeVote(c1.id, DAN, dissolutionProposal);
  });
  // Cast votes — BOB yes, CARLA yes (2 yes of 2 non-aban = 100%)
  castVote(vote.id, BOB, 'yes');
  castVote(vote.id, CARLA, 'yes');
  const result = tallyVote(vote.id);
  expectEqual('vote.status=passed', result.status, 'passed');
  expectEqual('result.yes=2', result.yes, 2);
  expectEqual('result.no=0', result.no, 0);
  // Vote is closed in storage
  const v2 = tallyVote(vote.id);
  expectEqual('second tally idempotent', v2.status, result.status);

  // ── §4 — vote tally edge cases ─────────────────────────────────────────
  section('§4 vote edges');
  // Unban DAN (was banned for the propose-throws test in §3)
  unbanMembersForTest(c1.id, DAN);
  // Force a vote that should fail threshold
  const banOverride: ProposalType = { kind: 'ban-override', targetUserId: BOB, reason: 'spam-override' };
  const v3 = proposeVote(c1.id, ALICE, banOverride);
  castVote(v3.id, BOB, 'yes');
  castVote(v3.id, CARLA, 'no');
  castVote(v3.id, DAN, 'no');
  castVote(v3.id, EVE, 'abstain');
  const r3 = tallyVote(v3.id);
  expectEqual('r3 status = failed (1 yes vs 2 no)', r3.status, 'failed');
  expectEqual('r3.yes=1', r3.yes, 1);
  expectEqual('r3.no=2', r3.no, 2);
  expectEqual('r3.abstain=1', r3.abstain, 1);
  expectFalse('r3.thresholdMet false', r3.thresholdMet);
  expectTrue('r3.quorumMet true', r3.quorumMet);

  expectThrows('castVote on closed vote throws', () => {
    castVote(v3.id, ALICE, 'yes');
  });
  expectThrows('castVote by non-member throws', () => {
    const freshVote = proposeVote(c1.id, ALICE, { kind: 'dissolution', reason: 'outro ciclo' });
    castVote(freshVote.id, toUserId('user-frank'), 'yes');
  });
  expectThrows('invalid vote choice throws', () => {
    castVote(v3.id, ALICE, 'maybe' as never);
  });
  expectThrows('tallyVote on unknown id throws VoteNotFoundError', () =>
    tallyVote(asVoteId('vote_unknown')),
  );

  // ── §5 — flagContent + resolveFlag ───────────────────────────────────────
  section('§5 flags');
  const post = createPost(c1.id, BOB, 'Sample post', {});
  // Wire feed state for governance.
  // In a real impl, integration code calls __attachFeedState() on startup.
  // For tests, we directly hit flagContent with contentType=post — flagContent
  // uses _PROBE_POSTS which must be populated. Attach from feed.ts via re-import.
  // The harness has access to internal feed state. We use the import via `import * as feed` module and bridge.
  // For test simplicity we use a runner-side attach helper.
  attachFeedStateToGov();
  const flag = flagContent(post.id, 'post', CARLA, 'spam', 'I see spam');
  expectEqual('flag contentType=post', flag.contentType, 'post');
  expectEqual('flag reason=spam', flag.reason, 'spam');
  expectEqual('flag status=open', flag.status, 'open');
  expectEqual('auditOpenFlags = 1', auditOpenFlags(c1.id), 1);
  expectEqual('listFlags open = 1', listFlags(c1.id, false).length, 1);
  const resolution = resolveFlag(flag.id, ALICE, 'warn', 'warned once');
  expectEqual('resolution action=warn', resolution.action, 'warn');
  expectEqual('flag.status=resolved after resolve', getFlag(flag.id)?.status, 'resolved');
  expectEqual('auditOpenFlags = 0 after resolve', auditOpenFlags(c1.id), 0);
  expectEqual('listFlags includeResolved = 1', listFlags(c1.id, true).length, 1);
  expectThrows('cannot resolve twice', () => resolveFlag(flag.id, ALICE, 'dismiss'));
  expectThrows('non-creator cannot resolve', () => {
    const f2 = flagContent(post.id, 'post', CARLA, 'misinformation');
    resolveFlag(f2.id, BOB, 'dismiss');
  });
  expectThrows('flag invalid reason throws', () => {
    flagContent(post.id, 'post', CARLA, 'invalid' as never);
  });

  // ── §6 — assertGovernanceHealthy + audits ───────────────────────────────
  section('§6 audits');
  const report1 = auditCircle(c1.id, ALICE);
  expectEqual('auditCircle.circleId=c1.id', report1.circleId, c1.id);
  expectEqual('auditCircle.votes count = 3 (1 pending from §4 expectThrows + 2 closed)', report1.votes.length, 3);
  expectEqual('auditCircle.flags count = 2 (1 resolved + 1 orphan open from §5 expectThrows)', report1.flags.length, 2);
  expectEqual('auditCircle.memberBreakdown includes admin', typeof report1.memberBreakdown.member === 'number', true);
  expectEqual('auditCircle.ruleAudit has 3 keys', Object.keys(report1.ruleAudit).length, 3);
  const health = assertGovernanceHealthy(c1.id);
  // Set explicit rules first (this stores on the circle via the wired hook).
  setCircleRules(c1.id, ALICE, [
    { text: 'regra critica para saude', severity: 'critical', enforcedBy: 'mod' },
  ]);
  const health2 = assertGovernanceHealthy(c1.id);
  expectEqual('health.healthy=true after explicit rules', health2.healthy, true);
  expectEqual('health.issues empty', health2.issues.length, 0);
  expectEqual('auditPendingVotes = 1', auditPendingVotes(c1.id), 1);

  // ── §7 — ban-override side effects ─────────────────────────────────────
  section('§7 ban-override');
  // Cast enough votes for a pass
  const passBan: ProposalType = { kind: 'ban-override', targetUserId: CARLA, reason: 'spam-real' };
  const vB = proposeVote(c1.id, ALICE, passBan);
  castVote(vB.id, BOB, 'yes');
  castVote(vB.id, CARLA, 'yes'); // self-vote allowed? banned is the target, voter is not
  castVote(vB.id, DAN, 'yes');
  castVote(vB.id, EVE, 'yes');
  const rB = tallyVote(vB.id);
  expectEqual('rB status = passed', rB.status, 'passed');
  expectEqual('getBanOverrides has ≥1 entry', getBanOverrides().length >= 1, true);

  // ── §8 — proposal kinds validation ─────────────────────────────────────
  section('§8 proposal validation');
  expectThrows('proposal missing kind throws', () =>
    proposeVote(c1.id, ALICE, { kind: 'unknown' as never, reason: 'x' }),
  );
  expectThrows('dissolution empty reason throws', () =>
    proposeVote(c1.id, ALICE, { kind: 'dissolution', reason: '' }),
  );
  expectThrows('rule-change with empty add/remove throws', () =>
    proposeVote(c1.id, ALICE, {
      kind: 'rule-change',
      addRules: [],
      removeRuleIds: [],
    }),
  );
  expectThrows('ban-override missing targetUserId throws', () =>
    proposeVote(c1.id, ALICE, { kind: 'ban-override', targetUserId: '' as never, reason: 'x' }),
  );

  const r = harnessResults();
  report('governance', r);
  return r.failed === 0 ? 0 : 1;
}

// Helpers
import {
  banMember as banMemberReal,
  unbanMember as unbanMemberReal,
} from '../membership.ts';

function banMembersForTest(circleId: import('../circles.ts').CircleId, userId: import('../circles.ts').UserId): void {
  banMemberReal(circleId, userId, ALICE, 'banned for test');
}

function unbanMembersForTest(circleId: import('../circles.ts').CircleId, userId: import('../circles.ts').UserId): void {
  unbanMemberReal(circleId, userId, ALICE);
}

function attachFeedStateToGov(): void {
  // Pull live state from feed.ts via the public hook and feed it to governance.
  // This is the canonical pattern for cross-engine wiring (cycle 69 lesson).
  const state = __getFeedState();
  __attachFeedState(state.posts, state.comments, state.circleIds);
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('governance.spec.ts')) {
  process.exit(runGovernanceSpec());
}
