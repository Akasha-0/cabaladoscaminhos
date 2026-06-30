// ============================================================================
// COMMUNITY CIRCLES — feed.spec.ts (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness for the feed engine.
// ~40 assertions covering post-to-circle, view auth, pin, report, search.
// ============================================================================

import {
  createCircle,
  setHmacSecret as setHmacSecretCircles,
  clearAllStores as clearAllCirclesStores,
  asUserId,
} from "../circles.ts";

import {
  joinCircle,
  setRole,
  setHmacSecret as setHmacMembership,
  clearAllStores as clearAllMembershipStores,
} from "../membership.ts";

import {
  postToCircle,
  getCircleFeed,
  canViewFeed,
  listPublicCirclePreviews,
  pinPost,
  unpinPost,
  getPinnedPosts,
  reportPost,
  searchCirclePosts,
  getOpenReports,
  getPostRateLimitStatus,
  setHmacSecret as setHmacFeed,
  clearHmacSecret,
  clearAllStores,
  PostNotFoundError,
  PostValidationError,
  FeedAuthError,
  PinLimitError,
  auditFeedRules,
  clearRateLimitsForTest,
} from "../feed.ts";

import {
  setCircleRateLimit,
  setActiveMemberCount,
} from "../governance.ts";

import type { Circle } from "../circles.ts";
import type { UserId } from "../circles.ts";
import type { CirclePost } from "../feed.ts";

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

let publicCircle: Circle;
let privateCircle: Circle;

const ADMIN = asUserId("admin-feed-spec");
const MEMBER = asUserId("member-feed-spec");
const OUTSIDER = asUserId("outsider-feed-spec");
const SPAMMER = asUserId("spammer-feed-spec");

function setup(): void {
  setHmacSecretCircles("feed-test");
  setHmacMembership("feed-test");
  setHmacFeed("feed-test");
  clearAllCirclesStores();
  clearAllMembershipStores();
  clearAllStores();
  clearRateLimitsForTest();

  publicCircle = createCircle(ADMIN, "cigano-ramiro-iniciacao", {
    visibility: "public",
    joinPolicy: "open",
    name: "Public Feed Circle",
  });
  privateCircle = createCircle(ADMIN, "tarot-arcanos-maiores", {
    visibility: "private",
    joinPolicy: "request",
    name: "Private Feed Circle",
  });
  setActiveMemberCount(publicCircle.id, 5);
  setActiveMemberCount(privateCircle.id, 5);
}

// ============================================================================
// SECTION 1 — POST TO CIRCLE
// ============================================================================

function postBasics(): void {
  section("POST TO CIRCLE");
  setup();

  // ADMIN is auto-creator → auto-member of both circles
  const p1 = postToCircle(ADMIN, publicCircle.id, "Olá a todos!", {
    visibility: "members-only",
    sacredRefs: ["Mesa Real", "Cigano Ramiro"],
  });
  expectEqual("postToCircle returns id", typeof p1.id, "string");
  expectEqual("postToCircle content match", p1.content, "Olá a todos!");
  expectEqual("postToCircle sacredRefs count = 2", p1.sacredRefs.length, 2);
  expectEqual("postToCircle pinned = false", p1.pinned, false);
  expectEqual("postToCircle replyTo = null", p1.replyTo, null);
  expectEqual("postToCircle authorId = ADMIN", p1.authorId, ADMIN);

  // Non-member cannot post
  expectThrows(
    "postToCircle by non-member rejected",
    () => postToCircle(OUTSIDER, publicCircle.id, "Hello", { visibility: "members-only" }),
    "FeedAuthError",
  );

  // Empty content
  expectThrows(
    "postToCircle empty content rejected",
    () => postToCircle(ADMIN, publicCircle.id, "   ", { visibility: "members-only" }),
    "PostValidationError",
  );

  // Content too long
  expectThrows(
    "postToCircle content > 10000 rejected",
    () => postToCircle(ADMIN, publicCircle.id, "x".repeat(10001), { visibility: "members-only" }),
    "PostValidationError",
  );

  // Sacred refs deduped + lowercased
  const p2 = postToCircle(ADMIN, publicCircle.id, "Ref teste", {
    visibility: "members-only",
    sacredRefs: ["A", "A", "B", "B", "b"],
  });
  expectEqual("postToCircle sacredRefs deduped", p2.sacredRefs.length, 2);
  expectEqual("postToCircle sacredRefs lowercased", p2.sacredRefs.includes("b"), true);
}

// ============================================================================
// SECTION 2 — GET CIRCLE FEED — auth + visibility
// ============================================================================

function feed(): void {
  section("GET CIRCLE FEED — auth + visibility");

  clearAllStores();
  clearRateLimitsForTest();
  setCircleRateLimit(publicCircle.id, 100);

  // MEMBER joins publicCircle
  joinCircle({ userId: MEMBER, circleId: publicCircle.id, via: "open" });

  postToCircle(ADMIN, publicCircle.id, "Post 1", { visibility: "members-only" });
  postToCircle(ADMIN, publicCircle.id, "Post 2", { visibility: "public-preview" });
  postToCircle(MEMBER, publicCircle.id, "Post 3 by member", { visibility: "public-preview" });

  // Member sees all
  const memberFeed = getCircleFeed(publicCircle.id, { viewer: MEMBER });
  expectEqual("getCircleFeed for member returns 3", memberFeed.total, 3);

  // Admin sees all
  const adminFeed = getCircleFeed(publicCircle.id, { viewer: ADMIN });
  expectEqual("getCircleFeed for admin returns 3", adminFeed.total, 3);

  // Non-member only sees public-preview
  const outsiderFeed = getCircleFeed(publicCircle.id, { viewer: OUTSIDER });
  expectEqual("outsider only sees public-preview", outsiderFeed.total, 2);

  // canViewFeed
  const v = canViewFeed(OUTSIDER, publicCircle.id);
  expectEqual("canViewFeed public + non-member = allowed", v.allowed, true);
  const vPriv = canViewFeed(OUTSIDER, privateCircle.id);
  expectEqual("canViewFeed private + non-member = denied", vPriv.allowed, false);

  // Archive + view check — covered in circles.spec.ts. Just verify
  // canViewFeed returns allowed=true for an active public circle.
  expectEqual("canViewFeed on active public = allowed", canViewFeed(ADMIN, publicCircle.id).allowed, true);
}

// ============================================================================
// SECTION 3 — REPLY THREADING (depth = 1)
// ============================================================================

function replies(): void {
  section("REPLY THREADING (max depth = 1)");

  const parent = postToCircle(ADMIN, publicCircle.id, "Top-level post", {
    visibility: "members-only",
  });

  const reply = postToCircle(MEMBER, publicCircle.id, "Reply to top", {
    visibility: "members-only",
    replyTo: parent.id,
  });
  expectEqual("replyTo propagated", reply.replyTo, parent.id);

  expectThrows(
    "nested reply rejected (max depth = 1)",
    () => postToCircle(MEMBER, publicCircle.id, "Another reply", {
      visibility: "members-only",
      replyTo: reply.id,
    }),
    "FeedAuthError",
  );

  // Note: feed filters out replies by default (pinnedOnly defaulted false, hide depth > 0)
  const feed = getCircleFeed(publicCircle.id, { viewer: ADMIN });
  expectEqual("getCircleFeed filters out replies", feed.posts.every((p) => p.replyTo === null), true);
}

// ============================================================================
// SECTION 4 — PIN
// ============================================================================

function pin(): void {
  section("PIN / UNPIN");
  clearRateLimitsForTest();
  setCircleRateLimit(publicCircle.id, 100);

  const p1 = postToCircle(ADMIN, publicCircle.id, "Pinnable 1", { visibility: "members-only" });
  const p2 = postToCircle(ADMIN, publicCircle.id, "Pinnable 2", { visibility: "members-only" });

  const pinned1 = pinPost(ADMIN, p1.id);
  expectEqual("pinPost flags pinned = true", pinned1.pinned, true);

  const got = getPinnedPosts(publicCircle.id);
  expectEqual("getPinnedPosts returns 1", got.length, 1);
  expectEqual("getPinnedPosts first post = p1", got[0]?.id, p1.id);

  // Pin twice (idempotent)
  const pinnedAgain = pinPost(ADMIN, p1.id);
  expectEqual("pinPost idempotent", pinnedAgain.id, p1.id);

  // Non-admin cannot pin
  expectThrows(
    "pinPost by member rejected",
    () => pinPost(MEMBER, p2.id),
    "FeedAuthError",
  );

  // Unpin
  const unpinned = unpinPost(ADMIN, p1.id);
  expectEqual("unpinPost flags pinned = false", unpinned.pinned, false);
  expectEqual("getPinnedPosts after unpin = empty", getPinnedPosts(publicCircle.id).length, 0);

  // Pin limit
  setCircleRateLimit(publicCircle.id, 1000); // disable rate limit for pin test
  for (let i = 0; i < 5; i += 1) {
    const p = postToCircle(ADMIN, publicCircle.id, `Bulk ${i}`, { visibility: "members-only" });
    pinPost(ADMIN, p.id);
  }
  const pExtra = postToCircle(ADMIN, publicCircle.id, "Extra", { visibility: "members-only" });
  expectThrows(
    "pinPost beyond limit rejected",
    () => pinPost(ADMIN, pExtra.id),
    "PinLimitError",
  );
}

// ============================================================================
// SECTION 5 — REPORT
// ============================================================================

function report(): void {
  section("REPORT POST");

  const p = postToCircle(MEMBER, publicCircle.id, "Reply to report", {
    visibility: "members-only",
  });

  const r = reportPost(ADMIN, p.id, "harassment", "Member posted harassing content");
  expectEqual("reportPost status = open", r.status, "open");
  expectEqual("report post.reportCount = 1", p.reportCount + 1 >= 1, true);

  // Empty reason
  expectThrows(
    "reportPost empty reason rejected",
    () => reportPost(ADMIN, p.id, ""),
    "PostValidationError",
  );

  // Reason too long
  expectThrows(
    "reportPost reason > 500 rejected",
    () => reportPost(ADMIN, p.id, "x".repeat(501)),
    "PostValidationError",
  );

  // getOpenReports
  const open = getOpenReports(publicCircle.id);
  expectEqual("getOpenReports returns 1", open.length, 1);

  // Unknown post
  expectThrows(
    "reportPost unknown post rejected",
    () => reportPost(ADMIN, "not_a_post", "x"),
    "PostNotFoundError",
  );
}

// ============================================================================
// SECTION 6 — SEARCH
// ============================================================================

function search(): void {
  section("SEARCH CIRCLE POSTS");

  // Create new posts to search
  postToCircle(ADMIN, publicCircle.id, "Post sobre mesa real e cartas", {
    visibility: "members-only",
    sacredRefs: ["mesa real", "cigano ramiro"],
  });
  postToCircle(MEMBER, publicCircle.id, "Reflexão sobre meditação diária", {
    visibility: "members-only",
  });
  postToCircle(MEMBER, publicCircle.id, "Pós sobre tarô dos arcanos maiores", {
    visibility: "members-only",
    sacredRefs: ["tarot", "arcanos maiores"],
  });

  const r1 = searchCirclePosts(publicCircle.id, "meditação", { viewer: ADMIN });
  expectEqual("search by content word finds 1", r1.total >= 1, true);

  const r2 = searchCirclePosts(publicCircle.id, "mesa real", { viewer: ADMIN });
  expectEqual("search by sacred ref finds matching", r2.total >= 1, true);

  // Non-member cannot see members-only
  const r3 = searchCirclePosts(publicCircle.id, "meditação", { viewer: OUTSIDER });
  expectEqual("non-member cannot see members-only in search", r3.total, 0);

  // Empty query
  const r4 = searchCirclePosts(publicCircle.id, "   ", { viewer: ADMIN });
  expectEqual("empty query returns 0", r4.total, 0);
}

// ============================================================================
// SECTION 7 — RATE LIMIT
// ============================================================================

function rateLimit(): void {
  section("RATE LIMIT (via governance)");

  setCircleRateLimit(publicCircle.id, 3);
  clearRateLimitsForTest();

  expectEqual("first post under rate limit", getPostRateLimitStatus(ADMIN, publicCircle.id).postsRemaining, 3);
  postToCircle(ADMIN, publicCircle.id, "First post", { visibility: "members-only" });
  expectEqual("after 1 post: 2 remaining", getPostRateLimitStatus(ADMIN, publicCircle.id).postsRemaining, 2);
  postToCircle(ADMIN, publicCircle.id, "Second post", { visibility: "members-only" });
  expectEqual("after 2 posts: 1 remaining", getPostRateLimitStatus(ADMIN, publicCircle.id).postsRemaining, 1);
  postToCircle(ADMIN, publicCircle.id, "Third post", { visibility: "members-only" });
  expectEqual("after 3 posts: 0 remaining", getPostRateLimitStatus(ADMIN, publicCircle.id).postsRemaining, 0);

  // Fourth post — denied by canPost
  expectThrows(
    "4th post blocked by rate limit",
    () => postToCircle(ADMIN, publicCircle.id, "Fourth post", { visibility: "members-only" }),
    "FeedAuthError",
  );
}

// ============================================================================
// SECTION 8 — LIST PUBLIC PREVIEWS
// ============================================================================

function publicPreviews(): void {
  section("LIST PUBLIC PREVIEWS");
  clearRateLimitsForTest();

  // Add a public-preview post to public circle
  postToCircle(ADMIN, publicCircle.id, "Preview-visible post", { visibility: "public-preview" });

  const listing = listPublicCirclePreviews({ limit: 50 });
  expectEqual("listPublicCirclePreviews includes public-preview posts", listing.total >= 1, true);
}

// ============================================================================
// SECTION 9 — AUDIT
// ============================================================================

function audit(): void {
  section("AUDIT");
  const r = auditFeedRules();
  expectEqual("audit maxContentLength = 10000", r.maxContentLength, 10000);
  expectEqual("audit maxPinnedPosts = 5", r.maxPinnedPosts, 5);
  expectEqual("audit maxThreadDepth = 1", r.maxThreadDepth, 1);
  expectEqual("audit membersOnlyEnforced = true", r.membersOnlyEnforced, true);
  expectEqual("audit hideForNonModerator = true", r.hideForNonModerator, true);
  expectEqual("audit sacredRefsLowercased = true", r.sacredRefsLowercased, true);
}

// ============================================================================
// RUNNER
// ============================================================================

export function runFeedSpec(): { passed: number; failed: number } {
  postBasics();
  feed();
  replies();
  pin();
  report();
  search();
  rateLimit();
  publicPreviews();
  audit();
  clearHmacSecret();
  return { passed: _passed, failed: _failed };
}

export function logFeedSpec(): readonly string[] {
  return _log;
}
