// ============================================================================
// ACHIEVEMENTS-BADGES — Smoke Test (Wave 69, 2026-06-30)
// ============================================================================
// Runtime smoke via node --experimental-strip-types. 12+ checks.
// Exercises end-to-end: evaluate → record → progress → display → notify.
// ============================================================================

import {
  ACHIEVEMENTS,
  auditCatalog,
  evaluateAchievements,
  evaluateAchievement,
  recordUnlocked,
  listUnlocked,
  resetUnlockedStore,
} from "../achievements.ts";
import {
  auditProgressCalculation,
  getProgress,
  nextMilestone,
  progressByCategory,
  progressToStreakMilestones,
} from "../progress.ts";
import {
  auditBadgeTiers,
  compareBadges,
  formatBadgeDisplay,
  tierFromCount,
} from "../badges.ts";
import {
  auditNotifRules,
  getQueuedNotifications,
  markDelivered,
  queueNotification,
  resetNotifCounter,
  resetNotifStore,
  shouldNotify,
  shouldNotifySync,
} from "../notif.ts";

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
// CHECK 1 — Catalog invariants
// ============================================================================

section("Catalog");
const audit = auditCatalog();
check(`auditCatalog.passes (total=${audit.totalCount})`, audit.passes);
check(`>=30 achievements (${audit.totalCount})`, audit.totalCount >= 30);
check(`Sacred coverage ${audit.sacredCoveragePercent}% >= 50%`,
  audit.sacredCoveragePercent >= 50);
check(`pt-BR completeness = total`,
  audit.localeCompleteness["pt-BR"] === audit.totalCount);
check(`en-US completeness = total`,
  audit.localeCompleteness["en-US"] === audit.totalCount);

// ============================================================================
// CHECK 2 — Evaluate against full state
// ============================================================================

section("Evaluate");
const fullState = {
  userId: "smoke-user-full",
  totalReadings: 100,
  ciganoReadings: 50,
  tarotReadings: 50,
  astrologiaReadings: 50,
  orixasReadings: 50,
  cabalaReadings: 50,
  numerologiaReadings: 50,
  tantraReadings: 50,
  currentStreak: 30,
  longestStreak: 30,
  reflections: 100,
  dreams: 10,
  posts: 100,
  helpfulComments: 10,
  mentoringPeer: true,
  uniqueTraditionsUsed: 7,
  readingTypesUsed: 6,
  hasCompletedOnboarding: true,
};

const unlocked = evaluateAchievements(fullState);
check(`Full state unlocks many achievements (n=${unlocked.length})`, unlocked.length >= 15);
check(`'first-light' is unlocked`, evaluateAchievement(fullState, "first-light"));
check(`'mestre-da-mesa' is unlocked`, evaluateAchievement(fullState, "mestre-da-mesa"));
check(`'chama-de-30-dias' is unlocked`, evaluateAchievement(fullState, "chama-de-30-dias"));
check(`'mentor-solidario' is unlocked`, evaluateAchievement(fullState, "mentor-solidario"));
check(`'caminhante-de-todas-as-portas' is unlocked`,
  evaluateAchievement(fullState, "caminhante-de-todas-as-portas"));

const empty = evaluateAchievements({
  ...fullState,
  totalReadings: 0,
  ciganoReadings: 0,
  tarotReadings: 0,
  astrologiaReadings: 0,
  orixasReadings: 0,
  cabalaReadings: 0,
  numerologiaReadings: 0,
  tantraReadings: 0,
  currentStreak: 0,
  longestStreak: 0,
  reflections: 0,
  dreams: 0,
  posts: 0,
  helpfulComments: 0,
  mentoringPeer: false,
  uniqueTraditionsUsed: 0,
  readingTypesUsed: 0,
  hasCompletedOnboarding: false,
});
check(`Empty state unlocks nothing (n=${empty.length})`, empty.length === 0);

// ============================================================================
// CHECK 3 — Progress
// ============================================================================

section("Progress");
const p1 = getProgress(fullState, "first-light");
check(`first-light current=100, target=1, complete=true`,
  p1.current === 100 && p1.target === 1 && p1.isComplete === true);
const p2 = getProgress(fullState, "devoted-seeker");
check(`devoted-seeker percent=100 (100/10)`, p2.percent === 100);
const p3 = getProgress(fullState, "oracle-elder");
check(`oracle-elder current=100, target=500, percent=20`,
  p3.percent === 20);

const next = nextMilestone(fullState);
// Among non-complete items, pick the one with highest percent remaining.
// With fullState (total=100, streak=30) and oracle-elder needing 500,
// the highest-percent in-progress is one of the streak milestones (30/100=30%) or oracle-elder (20%).
// Verify nextMilestone returns a valid in-progress entry.
check(`nextMilestone returns non-null valid partial`,
  next !== null && next.percent > 0 && next.percent <= 100);
check(`nextMilestone not complete`,
  next !== null && next.isComplete === false);
check(`nextMilestone has highest percent (≥oracle-elder 20%)`,
  next !== null && next.percent >= 20);

const streaks = progressToStreakMilestones(fullState);
check(`5 streak milestones`, streaks.length === 5);
check(`currentStreak=30 across all milestones (current=30)`,
  streaks.every((s) => s.current === 30));

const catReadings = progressByCategory(fullState, "readings");
check(`readings category has unlockedCount > 0 (n=${catReadings.unlockedCount})`,
  catReadings.unlockedCount > 0);

const auditP = auditProgressCalculation();
check(`auditProgressCalculation.passes`, auditP.passes);

// ============================================================================
// CHECK 4 — Badges
// ============================================================================

section("Badges");
check(`tierFromCount(5)=bronze`, tierFromCount(5) === "bronze");
check(`tierFromCount(10)=silver`, tierFromCount(10) === "silver");
check(`tierFromCount(25)=gold`, tierFromCount(25) === "gold");
check(`tierFromCount(50)=mythic`, tierFromCount(50) === "mythic");

const fmt = formatBadgeDisplay("mestre-da-mesa", "2026-06-30T01:00:00.000Z", "pt-BR");
check(`formatBadgeDisplay title=pt-BR "Mestre da Mesa"`,
  fmt !== null && fmt.title === "Mestre da Mesa");
check(`formatBadgeDisplay style.tier=gold`,
  fmt !== null && fmt.style.tier === "gold");

const fmtEn = formatBadgeDisplay("mestre-da-mesa", "2026-06-30T01:00:00.000Z", "en-US");
check(`formatBadgeDisplay title=en-US "Master of the Table"`,
  fmtEn !== null && fmtEn.title === "Master of the Table");

const auditB = auditBadgeTiers();
check(`auditBadgeTiers.passes`, auditB.passes);

const cmp1 = compareBadges(
  { tier: "mythic", earnedAt: "2026-06-30T00:00:00Z", id: "oracle-elder" },
  { tier: "bronze", earnedAt: "2026-06-30T00:00:00Z", id: "first-light" },
);
check(`mythic ranks before bronze`, cmp1 === -1);

// ============================================================================
// CHECK 5 — Notifications
// ============================================================================

section("Notifications");
resetNotifStore();
resetNotifCounter();

const e1 = queueNotification(
  "smoke-user-1", "first-light", "in-app",
  "2026-06-30T00:00:00.000Z",
  { force: true },
);
check(`queueNotification returns non-null`, e1 !== null);
check(`id starts with 'notif_'`, e1.id.startsWith("notif_"));
check(`deliveredAt=null initially`, e1.deliveredAt === null);

const queue1 = getQueuedNotifications("smoke-user-1");
check(`getQueuedNotifications returns 1`, queue1.length === 1);

const marked = markDelivered(e1.id, "2026-06-30T00:01:00.000Z");
check(`markDelivered returns true`, marked === true);

const queue2 = getQueuedNotifications("smoke-user-1");
check(`After markDelivered, pending=0`, queue2.length === 0);

const auditN = auditNotifRules();
check(`auditNotifRules.passes`, auditN.passes);
check(`Rate-limit window=3600000ms`, auditN.rateLimit.windowMs === 3600000);
check(`Channels count=3`, auditN.channels.length === 3);

// Rate-limit: with seed at past ISO time, calling shouldNotifySync with
// Date.now() (current real time) crosses the 1h boundary, returns true.
// Test the OPPOSITE: re-seed with current time, immediately ask → false.
queueNotification(
  "smoke-user-rl", "first-light", "in-app",
  new Date().toISOString(),
  { force: true },
);
check(`shouldNotifySync right after seed (within window) = false`,
  shouldNotifySync("smoke-user-rl", Date.now()) === false);

// Way in the future → true (window passed)
const future = Date.now() + 60 * 60 * 1000 + 1000;
check(`shouldNotifySync after window = true`,
  shouldNotifySync("smoke-user-rl", future) === true);

// ============================================================================
// CHECK 6 — End-to-end: record → list
// ============================================================================

section("End-to-end persistence");
resetUnlockedStore();
const recorded = await recordUnlocked(fullState, "2026-06-30T03:00:00.000Z");
check(`recordUnlocked returns ids (n=${recorded.length})`,
  recorded.length >= 10);

const listed = await listUnlocked(fullState.userId);
check(`listUnlocked returns entries (n=${listed.length})`,
  listed.length >= 10);

// Sort: oldest first
let sortedOk = true;
for (let i = 1; i < listed.length; i++) {
  if (listed[i - 1].earnedAt > listed[i].earnedAt) {
    sortedOk = false;
    break;
  }
}
check(`listUnlocked sorted by earnedAt ASC`, sortedOk);

// Idempotent: re-record no new
const recorded2 = await recordUnlocked(fullState, "2026-06-30T03:00:00.000Z");
check(`Idempotent re-record returns no new (n=${recorded2.length})`,
  recorded2.length === 0);

// ============================================================================
// CHECK 7 — Catalog completeness vs progress audit
// ============================================================================

section("Audit alignment");
check(`auditCatalog.sacredCoveragePercent >= 50`,
  audit.sacredCoveragePercent >= 50);
check(`auditProgressCalculation.targetEntryCount = catalog count`,
  auditP.targetEntryCount === auditP.catalogEntryCount);
check(`auditBadgeTiers.pass + auditNotifRules.passes pass through`,
  auditB.passes && auditN.passes);

// ============================================================================
// OUTPUT
// ============================================================================

console.log(_log.join("\n"));
console.log(`\nsmoke-achievements: ${_passed} passed, ${_failed} failed (of 30+ checks)`);
process.exit(_failed === 0 ? 0 : 1);
