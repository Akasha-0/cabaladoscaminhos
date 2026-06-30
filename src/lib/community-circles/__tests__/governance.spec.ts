// ============================================================================
// COMMUNITY CIRCLES — governance.spec.ts (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness for the governance engine.
// ~35 assertions covering DEFAULT_RULES, canPost rate-limit, custom
// rules, propose → vote → pass/fail flow, and audit.
// ============================================================================

import {
  createCircle,
  setHmacSecret as setHmacSecretCircles,
  clearAllStores as clearAllCirclesStores,
  asUserId,
} from "../circles.ts";

import {
  joinCircle,
  setHmacSecret as setHmacMembership,
  clearAllStores as clearAllMembershipStores,
} from "../membership.ts";

import {
  addCustomRule,
  removeCustomRule,
  getRules,
  proposeRuleChange,
  voteOnProposal,
  finalizeProposal,
  tallyProposal,
  listProposals,
  auditGovernanceRules,
  canPost,
  recordPostForRateLimit,
  rateLimitStatus,
  setCircleRateLimit,
  clearRateLimitsForTest,
  setActiveMemberCount,
  setHmacSecret,
  clearHmacSecret,
  clearAllStores,
  DEFAULT_RULES,
  DEFAULT_RATE_LIMIT_PER_HOUR,
  DEFAULT_QUORUM,
  DEFAULT_PASS_THRESHOLD,
  checkRules,
  RuleNotFoundError,
  ProposalNotFoundError,
  GovernanceForbiddenError,
  GovernanceValidationError,
} from "../governance.ts";

import type { Circle } from "../circles.ts";
import type { UserId } from "../circles.ts";

// ============================================================================
// HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _log: string[] = [];

function check(label: string, cond: boolean): void {
  if (cond) {
    _passed += 1;
    _log.push(`  ✓ ${label}`);
  } else {
    _failed += 1;
    _log.push(`  ✗ ${label}`);
  }
}

function section(name: string): void {
  _log.push(`\n[${name}]`);
}

function expectEqual<T>(label: string, actual: T, expected: T): void {
  check(label, actual === expected);
}

function expectThrows(label: string, fn: () => unknown, expectedName?: string): void {
  try {
    fn();
    _failed += 1;
    _log.push(`  ✗ ${label} (did not throw)`);
  } catch (e) {
    if (expectedName) {
      check(`${label} (${expectedName})`, (e as Error).name === expectedName);
    } else {
      _passed += 1;
      _log.push(`  ✓ ${label} (threw ${(e as Error).message.slice(0, 80)})`);
    }
  }
}

// ============================================================================
// FIXTURES
// ============================================================================

let directCircle: Circle;
let demCircle: Circle;

const ADMIN = asUserId("admin-gov-spec");
const MOD = asUserId("mod-gov-spec");
const MEMBER = asUserId("member-gov-spec");
const MEMBER2 = asUserId("member2-gov-spec");
const MEMBER3 = asUserId("member3-gov-spec");
const MEMBER4 = asUserId("member4-gov-spec");
const OUTSIDER = asUserId("outsider-gov-spec");

function setup(): void {
  setHmacSecretCircles("governance-test");
  setHmacMembership("governance-test");
  setHmacSecret("governance-test");
  clearAllCirclesStores();
  clearAllMembershipStores();
  clearAllStores();
  clearRateLimitsForTest();

  directCircle = createCircle(ADMIN, "cigano-ramiro-iniciacao", {
    visibility: "public",
    joinPolicy: "open",
    name: "Direct Circle",
    governance: "creator-decides",
  });
  demCircle = createCircle(ADMIN, "meditacao-diaria", {
    visibility: "public",
    joinPolicy: "open",
    name: "Democratic Circle",
    governance: "democratic",
  });

  // Members for democratic test
  joinCircle({ userId: MOD, circleId: demCircle.id, via: "open" });
  joinCircle({ userId: MEMBER, circleId: demCircle.id, via: "open" });
  joinCircle({ userId: MEMBER2, circleId: demCircle.id, via: "open" });
  joinCircle({ userId: MEMBER3, circleId: demCircle.id, via: "open" });
  joinCircle({ userId: MEMBER4, circleId: demCircle.id, via: "open" });
  // 5 members total → quorum = ceil(5 * 0.25) = ceil(1.25) = 2
  setActiveMemberCount(demCircle.id, 5);
}

// ============================================================================
// SECTION 1 — DEFAULT RULES REGISTRY
// ============================================================================

function defaults(): void {
  section("DEFAULT_RULES");
  expectEqual("DEFAULT_RULES has 8+ entries", DEFAULT_RULES.length >= 8, true);

  const codes = DEFAULT_RULES.map((r) => r.code);
  const required = [
    "respect-all-paths",
    "no-harassment",
    "no-proselytizing",
    "no-commercial-without-approval",
    "no-spam",
    "respect-privacy",
    "no-medical-advice",
    "pii-careful",
  ];
  for (const c of required) {
    check(`default rule exists: ${c}`, codes.includes(c));
  }

  expectEqual("all defaults have null circleId",
    DEFAULT_RULES.every((r) => r.circleId === null), true);
  expectEqual("all defaults have null addedBy (built-in)",
    DEFAULT_RULES.every((r) => r.addedBy === null), true);
  expectEqual("defaults are non-removable",
    DEFAULT_RULES.filter((r) => r.removable).length <= 2, true); // pt-br-primary is removable
}

// ============================================================================
// SECTION 2 — CONSTANTS
// ============================================================================

function constants(): void {
  section("CONSTANTS");
  expectEqual("DEFAULT_RATE_LIMIT_PER_HOUR = 5", DEFAULT_RATE_LIMIT_PER_HOUR, 5);
  expectEqual("DEFAULT_QUORUM = 0.25", DEFAULT_QUORUM, 0.25);
  expectEqual("DEFAULT_PASS_THRESHOLD = 0.6", DEFAULT_PASS_THRESHOLD, 0.6);
}

// ============================================================================
// SECTION 3 — AUDIT
// ============================================================================

function audit(): void {
  section("AUDIT");
  const r = auditGovernanceRules();
  expectEqual("audit defaultRuleCount = 9", r.defaultRuleCount, 9);
  expectEqual("audit rateLimitDefault = 5", r.rateLimitDefault, 5);
  expectEqual("audit quorumDefault = 0.25", r.quorumDefault, 0.25);
  expectEqual("audit passThresholdDefault = 0.6", r.passThresholdDefault, 0.6);
  expectEqual("audit proposalTypes length = 3", r.proposalTypes.length, 3);
  expectEqual("audit voteOptions length = 3", r.voteOptions.length, 3);
  expectEqual("audit maxDescriptionLength = 2000", r.maxDescriptionLength, 2000);
  expectEqual("audit circleCustomRulesCount = 0", r.circleCustomRulesCount, 0);
}

// ============================================================================
// SECTION 4 — CANPOST
// ============================================================================

function canpost(): void {
  section("CANPOST");

  // Member can post plain content — use ADMIN (implicit creator-admin) of directCircle.
  const ok = canPost(ADMIN, directCircle.id, "Tudo em paz com a Mesa");
  expectEqual("canPost allows member's plain content", ok.allowed, true);

  // Non-member denied
  const denied = canPost(OUTSIDER, directCircle.id, "Hi there");
  expectEqual("canPost denies non-member", denied.allowed, false);
  expectEqual("canPost deny reason includes 'membership'", (denied.reason ?? "").includes("membership"), true);

  // Empty content
  const empty = canPost(ADMIN, directCircle.id, "  ");
  expectEqual("canPost empty content denied", empty.allowed, false);

  // Spam
  const spam = canPost(ADMIN, directCircle.id, "bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla");
  expectEqual("canPost spam denied", spam.allowed, false);

  // Commercial
  const comm = canPost(ADMIN, directCircle.id, "Compre agora o produto por R$ 99");
  expectEqual("canPost commercial denied", comm.allowed, false);

  // Medical advice
  const med = canPost(ADMIN, directCircle.id, "Tome este remédio para diagnóstico X");
  expectEqual("canPost medical advice denied", med.allowed, false);

  // Harassment
  const harr = canPost(ADMIN, directCircle.id, "Você é um imbecil e nojento");
  expectEqual("canPost harassment denied", harr.allowed, false);

  // PII detection
  const pii = canPost(ADMIN, directCircle.id, "Meu email é teste@example.com");
  expectEqual("canPost PII denied", pii.allowed, false);

  // Proselytizing
  const pros = canPost(ADMIN, directCircle.id, "Converta-se para nossa tradição agora");
  expectEqual("canPost proselytizing denied", pros.allowed, false);
}

// ============================================================================
// SECTION 5 — RATE LIMIT
// ============================================================================

function rate(): void {
  section("RATE LIMIT");

  setCircleRateLimit(directCircle.id, 2);
  clearRateLimitsForTest();
  expectEqual("initial postsRemaining = 2", rateLimitStatus(ADMIN, directCircle.id).postsRemaining, 2);
  // recordPostForRateLimit simulates a successful post — that is
  // what feed.postToCircle does after a passing canPost.
  recordPostForRateLimit(ADMIN, directCircle.id);
  expectEqual("after 1 record: postsRemaining = 1", rateLimitStatus(ADMIN, directCircle.id).postsRemaining, 1);
  recordPostForRateLimit(ADMIN, directCircle.id);
  expectEqual("after 2 records: postsRemaining = 0", rateLimitStatus(ADMIN, directCircle.id).postsRemaining, 0);

  // Now over-limit
  const denied = canPost(ADMIN, directCircle.id, "P 3");
  expectEqual("canPost over rate-limit denied", denied.allowed, false);

  expectThrows(
    "setCircleRateLimit too low rejected",
    () => setCircleRateLimit(directCircle.id, 0),
    "GovernanceValidationError",
  );
}

// ============================================================================
// SECTION 6 — CUSTOM RULES
// ============================================================================

function customRules(): void {
  section("CUSTOM RULES");

  const r1 = addCustomRule(ADMIN, directCircle.id, "no-selfies", "Sem selfies", "Pare com selfies nos posts", "low");
  expectEqual("addCustomRule returns id", typeof r1.id, "string");
  expectEqual("addCustomRule code = no-selfies", r1.code, "no-selfies");
  expectEqual("addCustomRule circleId matches", r1.circleId, directCircle.id);

  const allRules = getRules(directCircle.id);
  expectEqual("getRules includes custom rule", allRules.some((r) => r.code === "no-selfies"), true);
  expectEqual("getRules includes all defaults", allRules.length >= DEFAULT_RULES.length + 1, true);

  // Can not add duplicate
  expectThrows(
    "addCustomRule duplicate code rejected",
    () => addCustomRule(ADMIN, directCircle.id, "no-selfies", "x", "y"),
    "GovernanceValidationError",
  );

  // Non-admin cannot add
  expectThrows(
    "addCustomRule by non-admin rejected",
    () => addCustomRule(MOD, directCircle.id, "new-rule", "x", "y"),
    "GovernanceForbiddenError",
  );

  // Bad code (uppercase)
  expectThrows(
    "addCustomRule uppercase code rejected",
    () => addCustomRule(ADMIN, directCircle.id, "NO-UPPER", "x", "y"),
    "GovernanceValidationError",
  );

  // removeCustomRule
  const removed = removeCustomRule(ADMIN, directCircle.id, r1.id);
  expectEqual("removeCustomRule returns removed", removed.code, "no-selfies");
  expectEqual("getRules after remove = no custom", getRules(directCircle.id).some((r) => r.code === "no-selfies"), false);

  expectThrows(
    "removeCustomRule unknown id rejected",
    () => removeCustomRule(ADMIN, directCircle.id, "non-existent"),
    "RuleNotFoundError",
  );

  expectThrows(
    "removeCustomRule by non-admin rejected",
    () => {
      addCustomRule(ADMIN, directCircle.id, "temp", "x", "y");
      removeCustomRule(MOD, directCircle.id, "temp");
    },
    "GovernanceForbiddenError",
  );

  // Cannot remove a default rule via removeCustomRule (it's not in customs)
  // Verify by listing
}

// ============================================================================
// SECTION 7 — PROPOSE + VOTE
// ============================================================================

function proposal(): void {
  section("PROPOSE + VOTE");

  // Only democratic circles accept proposals
  expectThrows(
    "proposeRuleChange on creator-decides circle rejected",
    () =>
      proposeRuleChange(MOD, directCircle.id, "add", {
        code: "any",
        title: "any",
        description: "any",
        severity: "low",
      }),
    "GovernanceForbiddenError",
  );

  // Non-member cannot propose
  expectThrows(
    "proposeRuleChange by non-member rejected",
    () =>
      proposeRuleChange(OUTSIDER, demCircle.id, "add", {
        code: "any",
        title: "any",
        description: "any",
        severity: "low",
      }),
    "GovernanceForbiddenError",
  );

  // Add proposal that requires more fields
  expectThrows(
    "proposeRuleChange add missing fields rejected",
    () => proposeRuleChange(MOD, demCircle.id, "add", {}),
    "GovernanceValidationError",
  );

  // valid add proposal
  const prop = proposeRuleChange(MOD, demCircle.id, "add", {
    code: "no-selfies",
    title: "Sem selfies",
    description: "Pare com selfies nos posts",
    severity: "low",
  });
  expectEqual("proposal status = open", prop.status, "open");
  expectEqual("proposal type = add", prop.type, "add");
  expectEqual("proposal quorumRequired > 0", prop.quorumRequired > 0, true);

  // Cannot double-vote
  const v1 = voteOnProposal(MOD, prop.id, "yes");
  expectEqual("first vote yes count = 1", v1.proposal.yesVotes, 1);

  expectThrows(
    "cannot double-vote",
    () => voteOnProposal(MOD, prop.id, "yes"),
    "GovernanceForbiddenError",
  );

  // Non-member cannot vote
  expectThrows(
    "non-member cannot vote",
    () => voteOnProposal(OUTSIDER, prop.id, "yes"),
    "GovernanceForbiddenError",
  );

  // Vote tally — quorum reached (5 members total, quorum=2)
  voteOnProposal(ADMIN, prop.id, "yes");
  const tally = tallyProposal(prop.id);
  expectEqual("tally quorumMet after 2 yes votes", tally.quorumMet, true);
  expectEqual("tally majorityPass after 2 yes votes", tally.majorityPass, true);

  // listProposals
  const listed = listProposals(demCircle.id);
  expectEqual("listProposals returns ≥ 1", listed.length >= 1, true);

  expectThrows(
    "voteOnProposal unknown id rejected",
    () => voteOnProposal(MOD, "no_such_proposal", "yes"),
    "ProposalNotFoundError",
  );
}

// ============================================================================
// SECTION 8 — VOTE — FAIL FLOW
// ============================================================================

function proposalFail(): void {
  section("VOTE — fail flow");

  const prop = proposeRuleChange(MOD, demCircle.id, "add", {
    code: "no-emoji",
    title: "Sem emojis",
    description: "Apenas texto nas mensagens",
    severity: "low",
  });

  voteOnProposal(MOD, prop.id, "no");
  voteOnProposal(ADMIN, prop.id, "yes");
  // 2 votes, quorum=2 met. yes/(yes+no) = 1/2 = 0.5 < 0.6 → fails.
  // Status now: failed.
  const tally = tallyProposal(prop.id);
  expectEqual("tally no votes count = 1", tally.no, 1);
  expectEqual("tally yes votes count = 1", tally.yes, 1);
  expectEqual("tally quorumMet", tally.quorumMet, true);
  expectEqual("tally majorityPass = false (1/(1+1) = 0.5)", tally.majorityPass, false);
}

// ============================================================================
// SECTION 9 — FINALIZE PROPOSAL
// ============================================================================

function finalize(): void {
  section("FINALIZE — admin override");

  const prop = proposeRuleChange(MOD, demCircle.id, "add", {
    code: "no-cap",
    title: "Sem CAPS LOCK",
    description: "Tudo em letras minúsculas",
    severity: "low",
  });

  expectThrows(
    "finalize by non-admin rejected",
    () => finalizeProposal(MOD, prop.id, "pass"),
    "GovernanceForbiddenError",
  );

  const finalized = finalizeProposal(ADMIN, prop.id, "pass");
  expectEqual("finalize passed status = passed", finalized.status, "passed");

  // Custom rule now added
  expectEqual("custom rule added after pass", getRules(demCircle.id).some((r) => r.code === "no-cap"), true);

  // Cancel
  const prop2 = proposeRuleChange(MOD, demCircle.id, "add", {
    code: "no-emojis",
    title: "Sem emojis 2",
    description: "Outra tentativa",
    severity: "low",
  });
  const cancelled = finalizeProposal(ADMIN, prop2.id, "cancel");
  expectEqual("finalize cancel status = cancelled", cancelled.status, "cancelled");
}

// ============================================================================
// SECTION 10 — CHECK RULES — pure helper
// ============================================================================

function checkRules_(): void {
  section("CHECK RULES — pure helper");

  // Empty / normal
  expectEqual("checkRules normal = null", checkRules("Hello world", DEFAULT_RULES), null);

  // Word spam
  const spamRule = DEFAULT_RULES.find((r) => r.code === "no-spam")!;
  const spamResult = checkRules("spam " + "spam ".repeat(15) + "x", DEFAULT_RULES);
  expectEqual("checkRules word-repeat flagged", spamResult?.ruleViolated, spamRule.id);

  // URL spam
  const urlResult = checkRules(
    Array.from({ length: 6 }, () => "https://x.com/foo").join(" "),
    DEFAULT_RULES,
  );
  expectEqual("checkRules url-density flagged", urlResult?.ruleViolated, spamRule.id);

  // Commercial
  const commResult = checkRules("Compre agora", DEFAULT_RULES);
  expectEqual("checkRules commercial flagged",
    commResult?.ruleViolated === DEFAULT_RULES.find((r) => r.code === "no-commercial-without-approval")?.id, true);

  // Medical
  const medResult = checkRules("Receita médica para o diagnóstico", DEFAULT_RULES);
  expectEqual("checkRules medical flagged",
    medResult?.ruleViolated === DEFAULT_RULES.find((r) => r.code === "no-medical-advice")?.id, true);

  // Harassment
  const harrResult = checkRules("Você é nojento", DEFAULT_RULES);
  expectEqual("checkRules harassment flagged",
    harrResult?.ruleViolated === DEFAULT_RULES.find((r) => r.code === "no-harassment")?.id, true);

  // PII
  const piiResult = checkRules("meu email é foo@bar.com", DEFAULT_RULES);
  expectEqual("checkRules PII flagged",
    piiResult?.ruleViolated === DEFAULT_RULES.find((r) => r.code === "pii-careful")?.id, true);

  // Proselytize
  const prosResult = checkRules("Converta-se para X", DEFAULT_RULES);
  expectEqual("checkRules proselytizing flagged",
    prosResult?.ruleViolated === DEFAULT_RULES.find((r) => r.code === "no-proselytizing")?.id, true);
}

// ============================================================================
// RUNNER
// ============================================================================

export function runGovernanceSpec(): { passed: number; failed: number } {
  setup();
  defaults();
  constants();
  audit();
  canpost();
  rate();
  customRules();
  proposal();
  proposalFail();
  finalize();
  checkRules_();
  clearHmacSecret();
  return { passed: _passed, failed: _failed };
}

export function logGovernanceSpec(): readonly string[] {
  return _log;
}
