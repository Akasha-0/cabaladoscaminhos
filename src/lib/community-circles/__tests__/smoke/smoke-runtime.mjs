/**
 * ════════════════════════════════════════════════════════════════════════════
 *  community-circles smoke runner — wave 70, 2026-06-30 B2 RETRY
 *
 *  Cross-runtime aggregator: runs all 4 spec files via the self-running
 *  harness AND adds 14+ cross-engine integration checks that prove the
 *  4 engines work together end-to-end.
 *
 *  Invocation:
 *    node --experimental-strip-types \
 *      src/lib/community-circles/__tests__/smoke/smoke-runtime.mjs
 *
 *  Pattern: cycle 60–69 (smoke aggregator)
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  createCircle,
  auditThemeCoverage,
  __resetCircleStore,
  setHmacSecret,
  toUserId,
  THEME_TRADITION,
  listCircles,
  getCircle,
} from '../../circles.ts';

import {
  joinCircle,
  promoteToAdmin,
  banMember,
  findActiveMembership,
  __resetMembershipStore,
  setMembershipHmacSecret,
} from '../../membership.ts';

import {
  createPost,
  commentOnPost,
  reactToPost,
  pinPost,
  __resetFeedStore,
  setFeedHmacSecret,
  __getFeedState,
  getCircleFeed,
} from '../../feed.ts';

import {
  setCircleRules,
  applyRuleTemplate,
  proposeVote,
  castVote,
  tallyVote,
  flagContent,
  resolveFlag,
  auditCircle,
  assertGovernanceHealthy,
  __resetGovernanceStore,
  setGovernanceHmacSecret,
  __attachFeedState,
} from '../../governance.ts';

import { runCirclesSpec } from '../circles.spec.ts';
import { runMembershipSpec } from '../membership.spec.ts';
import { runFeedSpec } from '../feed.spec.ts';
import { runGovernanceSpec } from '../governance.spec.ts';

let PASSED = 0;
let FAILED = 0;
const FAILURES = [];
function check(label, ok, detail) {
  if (ok) { PASSED += 1; console.log('  \u2713 ' + label); }
  else { FAILED += 1; FAILURES.push(label + (detail ? ': ' + detail : '')); console.log('  \u2717 ' + label + ' ' + (detail || '')); }
}
function section(name) { console.log('\n=== ' + name + ' ==='); }

// ════════════════════════════════════════════════════════════════════════════
// SPEC RUNNERS — 4 spec files
// ════════════════════════════════════════════════════════════════════════════
console.log('=== SPEC RUNNERS ===');
const rc = runCirclesSpec();
check('circles.spec.ts exit 0', rc === 0, 'non-zero: ' + rc);
const rm = runMembershipSpec();
check('membership.spec.ts exit 0', rm === 0, 'non-zero: ' + rm);
const rf = runFeedSpec();
check('feed.spec.ts exit 0', rf === 0, 'non-zero: ' + rf);
const rg = runGovernanceSpec();
check('governance.spec.ts exit 0', rg === 0, 'non-zero: ' + rg);

// ════════════════════════════════════════════════════════════════════════════
// CROSS-ENGINE INTEGRATION — fresh store, real workflow
// ════════════════════════════════════════════════════════════════════════════

section('INTEGRATION \u2014 fresh store');
__resetCircleStore();
__resetMembershipStore();
__resetFeedStore();
__resetGovernanceStore();
setHmacSecret('smoke-secret-c');
setMembershipHmacSecret('smoke-secret-m');
setFeedHmacSecret('smoke-secret-f');
setGovernanceHmacSecret('smoke-secret-g');

const ALICE = toUserId('alice-master');
const BOB = toUserId('bob-member-1');
const CARLA = toUserId('carla-member-2');
const DAN = toUserId('dan-member-3');
const EVE = toUserId('eve-member-4');

// 1. Create a smoke circle
const c = createCircle(ALICE, {
  name: 'Smoke Tantra',
  theme: 'tantra-meditation',
  isPublic: true,
  maxMembers: 50,
  description: 'integration test',
});
check('create-circle returns active', c.status === 'active', 'got ' + c.status);

// 2. Members join (4 real members)
joinCircle(c.id, BOB);
joinCircle(c.id, CARLA);
joinCircle(c.id, DAN);
joinCircle(c.id, EVE);
const cFresh = getCircle(c.id);
check('4 joins recorded', cFresh.memberCount === 4, 'got ' + cFresh.memberCount);

// 3. Promote Bob to admin
const promoted = promoteToAdmin(c.id, BOB, ALICE);
check('promote-bob true', promoted === true, 'got ' + promoted);

// 4. Creator-fusion virtual membership
const aliceVirtual = findActiveMembership(c.id, ALICE);
check('virtual creator membership', aliceVirtual !== null && aliceVirtual.role === 'creator');

// 5. Apply rule template
const devRules = applyRuleTemplate(c.id, ALICE, 'devotional');
check('devotional template applied', devRules.length === 3, 'got ' + devRules.length);

// 6. Members post + comment + react
const post1 = createPost(c.id, BOB, 'Primeira meditacao do dia', { tags: ['meditacao'] });
const post2 = createPost(c.id, CARLA, 'Segunda meditacao', { tags: ['meditacao'] });
check('posts created', post1.id !== post2.id);

commentOnPost(post1.id, DAN, 'Otima postagem');
commentOnPost(post1.id, EVE, 'Concordo totalmente');
reactToPost(post1.id, ALICE, '\ud83c\udf19');
reactToPost(post1.id, BOB, '\u2728');
const r1 = reactToPost(post1.id, CARLA, '\ud83c\udf19');
check('reactions work', r1.id.startsWith('rct_'), 'got ' + r1.id);

// 7. Pin post
const pinOk = pinPost(post1.id, BOB);
check('pin returns true', pinOk === true, 'got ' + pinOk);

// 8. Vote on a rule change — 4 yes on 5 member (alice + 4) circle
// Note: memberCount=4 (real) at this point. Quorum = 25% of 4 = 1.0; threshold = 60%.
const ruleProposal = {
  kind: 'rule-change',
  addRules: [{ text: 'Regras extras de meditacao', severity: 'info', enforcedBy: 'auto' }],
  removeRuleIds: [],
};
const v = proposeVote(c.id, ALICE, ruleProposal);
castVote(v.id, BOB, 'yes');
castVote(v.id, CARLA, 'yes');
castVote(v.id, DAN, 'yes');
castVote(v.id, EVE, 'yes');
const result = tallyVote(v.id);
check('rule-change vote passes', result.status === 'passed', 'got ' + result.status);

// 9. Apply result via setCircleRules (caller's responsibility)
const mergedRules = setCircleRules(c.id, ALICE, [
  ...devRules,
  { text: 'Regras extras de meditacao', severity: 'info', enforcedBy: 'auto' },
]);
check('merged rules = 4', mergedRules.length === 4, 'got ' + mergedRules.length);

// 10. Governance health
const health = assertGovernanceHealthy(c.id);
check('governance healthy', health.healthy === true, JSON.stringify(health.issues));

// 11. Flag a post — wire feed state for governance
const liveFeedState = __getFeedState();
__attachFeedState(liveFeedState.posts, liveFeedState.comments, liveFeedState.circleIds);
const flag = flagContent(post2.id, 'post', BOB, 'spam', 'low effort');
check('flag created', flag.id.startsWith('flag_'), 'got ' + flag.id);
const resolved = resolveFlag(flag.id, ALICE, 'warn', 'warned for low effort');
check('flag resolved', resolved.action === 'warn', 'got ' + resolved.action);

// 12. Ban flow via membership
const banOk = banMember(c.id, DAN, ALICE, 'rule violation');
check('ban works', banOk === true);

// 13. Cache-clear isolation
__resetCircleStore();
__resetMembershipStore();
__resetFeedStore();
__resetGovernanceStore();
check('cache isolation clean', listCircles().length === 0, 'listCircles not empty after reset');

// 14. Sacred coverage
section('SACRED COVERAGE');
const themesByTradition = {};
for (const theme of Object.keys(THEME_TRADITION)) {
  const trad = THEME_TRADITION[theme];
  if (!themesByTradition[trad]) themesByTradition[trad] = 0;
  themesByTradition[trad] += 1;
}
const allTraditionsCovered = ['cigano','orixas','astrologia','cabala','numerologia','tantra','tarot']
  .every((t) => themesByTradition[t] > 0);
check('all 7 traditions have themes', allTraditionsCovered,
  Object.keys(themesByTradition).join(','));

// 15. Audit report completeness
section('AUDIT');
// Re-create a small circle for audit
const c2 = createCircle(ALICE, {
  name: 'Audit Target',
  theme: 'tarot-practice',
  isPublic: true,
  maxMembers: 20,
});
setCircleRules(c2.id, ALICE, [{ text: 'regra aud', severity: 'critical', enforcedBy: 'mod' }]);
joinCircle(c2.id, BOB);
const p = createPost(c2.id, BOB, 'post aud', {});
const liveFeedState2 = __getFeedState();
__attachFeedState(liveFeedState2.posts, liveFeedState2.comments, liveFeedState2.circleIds);
const f2 = flagContent(p.id, 'post', ALICE, 'spam');
resolveFlag(f2.id, ALICE, 'dismiss');
const v2 = proposeVote(c2.id, ALICE, { kind: 'dissolution', reason: 'end cycle' });
castVote(v2.id, BOB, 'yes');
tallyVote(v2.id);
const ar = auditCircle(c2.id, ALICE);
check('auditReport has votes', ar.votes.length >= 1, 'got ' + ar.votes.length);
check('auditReport has flags', ar.flags.length >= 1, 'got ' + ar.flags.length);
check('auditReport has ruleAudit with 3 keys', Object.keys(ar.ruleAudit).length === 3,
  'got ' + Object.keys(ar.ruleAudit).length);
check('auditReport.memberBreakdown has 4 keys',
  Object.keys(ar.memberBreakdown).length === 6, // creator, admin, moderator, member, banned, left
  'got ' + Object.keys(ar.memberBreakdown).length);

// 16. Coverage: all 7 traditions can be the active theme
section('TRADITION-THEME ROUND-TRIP');
const onePerTradition = ['cigano-study','tarot-practice','astrology-readings','numerology-deep-dive','cabala-mysticism','orixa-devotion','tantra-meditation'];
for (const t of onePerTradition) {
  const cc = createCircle(ALICE, { name: 'cov-' + t, theme: t, isPublic: true, maxMembers: 10 });
  check('create ' + t + ' ok', cc.theme === t, 'got ' + cc.theme);
}
const cov = auditThemeCoverage();
const allCovered = Object.values(cov).every((v) => v === true);
check('all 7 traditions covered', allCovered, JSON.stringify(cov));

// ════════════════════════════════════════════════════════════════════════════
// TALLY
// ════════════════════════════════════════════════════════════════════════════
console.log('\n=== TOTAL ===');
console.log('PASSED: ' + PASSED);
console.log('FAILED: ' + FAILED);
if (FAILED > 0) {
  console.log('\nFAILURES:');
  for (const f of FAILURES) console.log('  - ' + f);
}
process.exit(FAILED === 0 ? 0 : 1);
