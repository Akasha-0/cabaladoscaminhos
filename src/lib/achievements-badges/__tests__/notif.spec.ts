// ============================================================================
// NOTIF — Spec (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness (no vitest needed at runtime). 25+ assertions.
// ============================================================================

import { type AchievementId, type UserId } from "../achievements.ts";
import {
  DEFAULT_RATE_LIMIT,
  DEFAULT_RATE_LIMIT_MS,
  auditNotifRules,
  dropNotification,
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
const _failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, msg: string): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    _passed += 1;
  } else {
    _failed += 1;
    _failures.push(
      `${msg}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
}

function expectTrue(cond: boolean, msg: string): void {
  if (cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected true, got false`);
  }
}

function expectFalse(cond: boolean, msg: string): void {
  if (!cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected false, got true`);
  }
}

// ============================================================================
// shouldNotify — rate limit
// ============================================================================

{
  resetNotifStore();
  // First call within window: YES (last=missing)
  const t0 = "2026-06-30T00:00:00.000Z";
  expectTrue(
    shouldNotify("u1" as UserId, "first-light" as AchievementId, t0),
    "first call returns true (no prior)",
  );
}

{
  resetNotifStore();
  const t0 = "2026-06-30T00:00:00.000Z";
  const t1 = "2026-06-30T00:30:00.000Z"; // 30min later
  const t2 = "2026-06-30T01:00:00.000Z"; // 1h later
  const t3 = "2026-06-29T23:00:00.000Z"; // 1h before (out of window)

  // Seed lastNotifAt = t0
  const e0 = queueNotification("u2" as UserId, "first-light" as AchievementId, "in-app", t0, { force: true });
  expectTrue(e0 !== null, "queue initial returns non-null");

  // 30min later → still in window → false
  expectFalse(
    shouldNotify("u2" as UserId, "first-light" as AchievementId, t1),
    "30min later returns false (in window)",
  );

  // 1h later → exactly at boundary → true
  expectTrue(
    shouldNotify("u2" as UserId, "first-light" as AchievementId, t2),
    "1h later returns true (boundary)",
  );

  // 1h before → still within window (last notif at t0, "now" at t0-1h means diff = -1h < window)
  expectFalse(
    shouldNotify("u2" as UserId, "first-light" as AchievementId, t3),
    "earlier time returns false (window not yet reached)",
  );
}

{
  resetNotifStore();
  // Invalid timestamp → false (safe default)
  expectFalse(
    shouldNotify("u3" as UserId, "first-light" as AchievementId, "not-a-date"),
    "invalid timestamp → false (no crash)",
  );
}

// ============================================================================
// shouldNotifySync — fast variant
// ============================================================================

{
  resetNotifStore();
  // Populate last via in-memory
  queueNotification("u4" as UserId, "first-light" as AchievementId, "in-app",
    new Date(Date.now() - 60 * 60 * 1000 - 1000).toISOString(),
    { force: true });

  // Now > 1h later → true
  expectTrue(
    shouldNotifySync("u4" as UserId, Date.now()),
    "shouldNotifySync after 1h → true",
  );
}

{
  resetNotifStore();
  // No prior → true
  expectTrue(
    shouldNotifySync("u5" as UserId, Date.now()),
    "shouldNotifySync with no prior → true",
  );
}

{
  resetNotifStore();
  // Invalid input → false
  expectFalse(
    shouldNotifySync("u6" as UserId, NaN),
    "shouldNotifySync NaN → false",
  );
}

// ============================================================================
// queueNotification — adds to queue
// ============================================================================

{
  resetNotifStore();
  resetNotifCounter();
  const ts = "2026-06-30T00:00:00.000Z";
  const e = queueNotification(
    "u7" as UserId,
    "first-light" as AchievementId,
    "in-app",
    ts,
    { force: true },
  );
  expectTrue(e !== null, "queue returns non-null with force");
  expectEqual(e!.userId, "u7", "userId set");
  expectEqual(e!.channel, "in-app", "channel set");
  expectEqual(e!.achievementId, "first-light", "achievementId set");
  expectTrue(e!.id.startsWith("notif_"), "id prefix=notif_");
  expectEqual(e!.deliveredAt, null, "deliveredAt=null initially");
}

{
  resetNotifStore();
  resetNotifCounter();
  // Without force + already-throttled → returns null
  const ts = "2026-06-30T00:00:00.000Z";
  queueNotification(
    "u8" as UserId,
    "first-light" as AchievementId,
    "in-app",
    ts,
    { force: true },
  );
  const second = queueNotification(
    "u8" as UserId,
    "devoted-seeker" as AchievementId,
    "email",
    "2026-06-30T00:30:00.000Z", // in window
  );
  expectEqual(second, null, "throttled call returns null");
}

{
  resetNotifStore();
  resetNotifCounter();
  // Multiple channels work
  const e1 = queueNotification(
    "u9" as UserId,
    "first-light" as AchievementId,
    "in-app",
    "2026-06-30T00:00:00.000Z",
    { force: true },
  );
  expectEqual(e1!.channel, "in-app", "in-app channel");

  // Reset last to allow push
  const e2 = queueNotification(
    "u9" as UserId,
    "devoted-seeker" as AchievementId,
    "push",
    "2026-06-30T02:00:00.000Z", // 2h later, beyond window
  );
  expectEqual(e2!.channel, "push", "push channel");
}

// ============================================================================
// getQueuedNotifications
// ============================================================================

{
  resetNotifStore();
  resetNotifCounter();
  const ts = "2026-06-30T00:00:00.000Z";
  queueNotification(
    "u10" as UserId,
    "first-light" as AchievementId,
    "in-app",
    ts,
    { force: true },
  );
  // Mark one delivered, add another
  const q1 = getQueuedNotifications("u10" as UserId);
  expectEqual(q1.length, 1, "1 pending after queue");

  markDelivered(q1[0]!.id, ts);
  const q2 = getQueuedNotifications("u10" as UserId);
  expectEqual(q2.length, 0, "0 pending after markDelivered");

  // Out of window → can enqueue again
  queueNotification(
    "u10" as UserId,
    "devoted-seeker" as AchievementId,
    "email",
    "2026-06-30T02:00:00.000Z",
  );
  const q3 = getQueuedNotifications("u10" as UserId);
  expectEqual(q3.length, 1, "1 pending after re-enqueue (delivered still removed)");
}

// ============================================================================
// markDelivered
// ============================================================================

{
  resetNotifStore();
  resetNotifCounter();
  const e = queueNotification(
    "u11" as UserId,
    "first-light" as AchievementId,
    "in-app",
    "2026-06-30T00:00:00.000Z",
    { force: true },
  );
  const r1 = markDelivered(e!.id, "2026-06-30T00:01:00.000Z");
  expectEqual(r1, true, "first mark returns true");

  // Idempotent: second mark returns false
  const r2 = markDelivered(e!.id, "2026-06-30T00:02:00.000Z");
  expectEqual(r2, false, "second mark returns false (already delivered)");
}

// Unknown id
{
  resetNotifStore();
  const r = markDelivered("notif_xyz_unknown", "2026-06-30T00:00:00.000Z");
  expectEqual(r, false, "markDelivered unknown id → false");
}

// ============================================================================
// dropNotification
// ============================================================================

{
  resetNotifStore();
  resetNotifCounter();
  const e = queueNotification(
    "u12" as UserId,
    "first-light" as AchievementId,
    "in-app",
    "2026-06-30T00:00:00.000Z",
    { force: true },
  );
  expectEqual(getQueuedNotifications("u12" as UserId).length, 1, "1 pending");
  const r1 = dropNotification(e!.id);
  expectEqual(r1, true, "drop returns true");
  expectEqual(getQueuedNotifications("u12" as UserId).length, 0, "0 pending after drop");
  const r2 = dropNotification(e!.id);
  expectEqual(r2, false, "drop again → false");
}

// ============================================================================
// auditNotifRules — chain exposed
// ============================================================================

{
  const a = auditNotifRules();
  expectTrue(a.passes, "auditNotifRules.passes");
  expectEqual(a.channels.length, 3, "3 channels");
  expectTrue(a.channels.includes("in-app"), "in-app channel present");
  expectTrue(a.channels.includes("email"), "email channel present");
  expectTrue(a.channels.includes("push"), "push channel present");
  expectEqual(a.rateLimit.windowMs, DEFAULT_RATE_LIMIT_MS, "rateLimit.windowMs matches default");
  expectEqual(a.idPrefix, "notif_", "idPrefix=notif_");
  expectTrue(a.idFormat.startsWith("notif_"), "idFormat starts with notif_");
  expectEqual(a.forceAllowed, true, "forceAllowed=true (admin path)");
}

// ============================================================================
// OUTPUT
// ============================================================================

console.log(
  `[notif.spec.ts] ${_passed} passed, ${_failed} failed`,
);
if (_failed > 0) {
  console.error(_failures.join("\n"));
  process.exit(1);
}
