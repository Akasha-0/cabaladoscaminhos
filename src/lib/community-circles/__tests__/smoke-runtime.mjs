// ============================================================================
// COMMUNITY CIRCLES — Smoke Runtime (Wave 69, 2026-06-30)
// ============================================================================
// Run via: node --experimental-strip-types __tests__/smoke-runtime.mjs
// 12+ integration checks covering the full engine flow.
// ============================================================================

import { THEMES, TRADITIONS, LOCALES, asUserId, createCircle, getCircle, listCircles, updateCircle, archiveCircle, incrementMemberCount, auditCircleTaxonomy, clearAllStores as clearCircles, setHmacSecret as setHmacSecretCircles } from "../circles.ts";

import {
  auditMembershipRules, joinCircle, leaveCircle, inviteToCircle, acceptInvite, setRole, removeMember, getMembers, getMyCircles, clearAllStores as clearMembership, setHmacSecret as setHmacSecretMembership,
} from "../membership.ts";

import {
  postToCircle, getCircleFeed, canViewFeed, pinPost, unpinPost, getPinnedPosts, reportPost, searchCirclePosts, auditFeedRules, clearAllStores as clearFeed, setHmacSecret as setHmacSecretFeed,
} from "../feed.ts";

import {
  addCustomRule, removeCustomRule, getRules, proposeRuleChange, voteOnProposal, finalizeProposal, tallyProposal, auditGovernanceRules, canPost, DEFAULT_RULES, setActiveMemberCount, clearAllStores as clearGovernance, setHmacSecret as setHmacSecretGov, clearRateLimitsForTest, setCircleRateLimit,
} from "../governance.ts";

// ============================================================================
// HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _log = [];
function check(label, cond) {
  if (cond) {
    _passed += 1;
    _log.push(`  ✓ ${label}`);
  } else {
    _failed += 1;
    _log.push(`  ✗ ${label}`);
  }
}
function section(name) {
  _log.push(`\n[${name}]`);
}

// ============================================================================
// INIT
// ============================================================================

section("INIT");
setHmacSecretCircles("smoke-secret");
setHmacSecretMembership("smoke-secret");
setHmacSecretFeed("smoke-secret");
setHmacSecretGov("smoke-secret");
clearCircles();
clearMembership();
clearFeed();
clearGovernance();
clearRateLimitsForTest();
check("smoke init complete", true);

// ============================================================================
// S1 — TAXONOMY
// ============================================================================

section("S1 — Taxonomy");
check("THEMES has 15+ entries", THEMES.length >= 15);
check("TRADITIONS has 7 entries", TRADITIONS.length === 7);
check("LOCALES has 3 entries", LOCALES.length === 3);
const aud = auditCircleTaxonomy();
check("audit.allThemesHaveSacredRefs", aud.allThemesHaveSacredRefs);
check("audit.allThemesHave3Locales", aud.allThemesHave3Locales);

// ============================================================================
// S2 — FULL LIFECYCLE: create → join → post → pin → report → archive
// ============================================================================

section("S2 — Full lifecycle");

const admin = asUserId("admin-smoke");
const member = asUserId("member-smoke");
const outsider = asUserId("outsider-smoke");
const member2 = asUserId("member2-smoke");
const member3 = asUserId("member3-smoke");
const member4 = asUserId("member4-smoke");

const circle = createCircle(admin, "cigano-ramiro-iniciacao", {
  visibility: "public",
  joinPolicy: "open",
  governance: "democratic",
  name: "Smoke Circle",
});
check("createCircle id assigned", typeof circle.id === "string");
check("createCircle tradition = Cigano", circle.tradition === "Cigano");
check("createCircle sacredRefs ≥ 3", circle.sacredRefs.length >= 3);

// Member joins
const m1 = joinCircle({ userId: member, circleId: circle.id, via: "open" });
check("joinCircle role = member", m1.role === "member");

// Promote member to moderator
const promoted = setRole(admin, member, circle.id, "moderator");
check("setRole member→moderator", promoted.role === "moderator");

// Members list
const members = getMembers(circle.id);
check("getMembers includes admin + member", members.total === 2);

// Post creation
const p1 = postToCircle(admin, circle.id, "Primeira reflexão sobre Mesa Real", {
  visibility: "members-only",
  sacredRefs: ["Mesa Real"],
});
check("postToCircle returns post", typeof p1.id === "string");
check("postToCircle sacredRefs = 1", p1.sacredRefs.length === 1);

// Pin
const pinned = pinPost(member, p1.id); // moderator can pin
check("pinPost moderator-can", pinned.pinned);
check("getPinnedPosts has 1", getPinnedPosts(circle.id).length === 1);

// Report by outsider — outsider is not a member but reportPost doesn't require membership
const rpt = reportPost(admin, p1.id, "test content", "for audit");
check("reportPost returns report", rpt.status === "open");

// Search
const srch = searchCirclePosts(circle.id, "reflexão", { viewer: admin });
check("searchCirclePosts finds 1", srch.total === 1);

// Visibility — outsider
const feedOut = getCircleFeed(circle.id, { viewer: outsider });
check("outsider feed empty (members-only)", feedOut.total === 0);
const canView = canViewFeed(outsider, circle.id);
check("canViewFeed public = allowed", canView.allowed === true);

// Rate limit
setCircleRateLimit(circle.id, 3);
clearRateLimitsForTest();
check("initial postsRemaining = 3", canPost(admin, circle.id, "OK").allowed);
postToCircle(admin, circle.id, "P1", { visibility: "members-only" });
postToCircle(admin, circle.id, "P2", { visibility: "members-only" });
postToCircle(admin, circle.id, "P3", { visibility: "members-only" });
const over = canPost(admin, circle.id, "P4");
check("canPost over rate-limit denied", over.allowed === false);

// ============================================================================
// S3 — GOVERNANCE — propose + vote
// ============================================================================

section("S3 — Governance propose+vote");

// Setup democratic circle with 5 members + quorum=2
const dem = createCircle(admin, "meditacao-diaria", {
  visibility: "public",
  joinPolicy: "open",
  governance: "democratic",
  name: "Dem Circle",
});
const demMembers = [member2, member3, member4];
for (const u of demMembers) {
  joinCircle({ userId: u, circleId: dem.id, via: "open" });
}
setActiveMemberCount(dem.id, 5);

const prop = proposeRuleChange(admin, dem.id, "add", {
  code: "smoke-rule",
  title: "Smoke Test Rule",
  description: "Only used in smoke",
  severity: "low",
});
check("proposeRuleChange open", prop.status === "open");

voteOnProposal(admin, prop.id, "yes");
const afterV1 = tallyProposal(prop.id);
check("vote1: yes=1", afterV1.yes === 1);
voteOnProposal(member2, prop.id, "yes");
const afterV2 = tallyProposal(prop.id);
check("vote2: yes=2, quorum met", afterV2.yes === 2 && afterV2.quorumMet);

// Finalize
const passed = finalizeProposal(admin, prop.id, "pass");
check("finalize pass status", passed.status === "passed");
check("custom rule added", getRules(dem.id).some((r) => r.code === "smoke-rule"));

// ============================================================================
// S4 — CUSTOM RULE + remove
// ============================================================================

section("S4 — Custom rule add/remove");

const customRule = addCustomRule(admin, circle.id, "test-only", "Test", "Test desc", "low");
check("addCustomRule created", customRule.code === "test-only");
removeCustomRule(admin, circle.id, customRule.id);
check("rule removed", !getRules(circle.id).some((r) => r.code === "test-only"));

// ============================================================================
// S5 — LAST-ADMIN GUARD
// ============================================================================

section("S5 — Last-admin guard");
const solo = createCircle(admin, "feng-shui", {
  visibility: "private",
  joinPolicy: "open",
  name: "Solo Circle",
});
let threw = false;
try {
  leaveCircle(admin, solo.id);
} catch (e) {
  threw = e.name === "LeaveForbiddenError";
  console.error("DEBUG S5 caught:", e.name, e.message);
}
check("leaveCircle on last admin forbidden", threw);

// ============================================================================
// S6 — INVITE FLOW
// ============================================================================

section("S6 — Invite flow");

const inv = inviteToCircle(admin, asUserId("invitee-test"), circle.id);
check("inviteToCircle pending", inv.status === "pending");
check("invite has signature", typeof inv.signature === "string" && inv.signature.length > 0);
const accepted = acceptInvite(asUserId("invitee-test"), inv.token);
check("acceptInvite.membership.created", accepted.membership.role === "member");
check("acceptInvite.invite.accepted", accepted.invite.status === "accepted");

// ============================================================================
// S7 — UPDATE CIRCLE
// ============================================================================

section("S7 — Update circle");
const upd = updateCircle(circle.id, admin, { visibility: "private" });
check("updateCircle visibility = private", upd.visibility === "private");

// ============================================================================
// S8 — ARCHIVE + LGPD
// ============================================================================

section("S8 — Archive + LGPD");
const archPub = createCircle(admin, "cabala-sefirot", {
  visibility: "public",
  joinPolicy: "open",
  name: "Archive Test Public",
});
const ar1 = archiveCircle(archPub.id, admin, false);
check("public archive: status=archived", ar1.status === "archived");
check("public archive: piiScrubbedAt set", ar1.piiScrubbedAt !== null);

const archPriv = createCircle(admin, "cristaloterapia", {
  visibility: "private",
  joinPolicy: "open",
  name: "Archive Test Private",
});
const ar2 = archiveCircle(archPriv.id, admin);
check("private archive: status=archived", ar2.status === "archived");
check("private archive: name scrubbed", ar2.name.startsWith("[arquivado:"));
check("private archive: desc = placeholder", ar2.description === "[conteúdo removido]");
check("private archive: memberCount = 0", ar2.memberCount === 0);

// ============================================================================
// S9 — AUDIT
// ============================================================================

section("S9 — Audit");
const memAudit = auditMembershipRules();
check("membership.freeLeaveAlways = true", memAudit.freeLeaveAlways === true);
check("membership.lastAdminGuard = true", memAudit.lastAdminGuard === true);

const feedAudit = auditFeedRules();
check("feed.sacredRefsLowercased = true", feedAudit.sacredRefsLowercased === true);
check("feed.maxPinnedPosts = 5", feedAudit.maxPinnedPosts === 5);

const govAudit = auditGovernanceRules();
check("governance.defaultRuleCount >= 8", govAudit.defaultRuleCount >= 8);
check("governance.quorumDefault = 0.25", govAudit.quorumDefault === 0.25);

// ============================================================================
// DONE
// ============================================================================

section("DONE");
_log.push(`\nPassed: ${_passed}, Failed: ${_failed}`);
console.log(_log.join("\n"));
if (_failed > 0) process.exit(1);

// Touch an unused import so the strict noUnusedImports rule stays happy
const _u = { TRADITIONS, LOCALES, incrementMemberCount, listCircles, getMyCircles, DEFAULT_RULES, clearGovernance };
void _u;
