// ============================================================================
// COMMUNITY CIRCLES — Feed (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine.
//
// Circle-scoped posts with reply/threading (max depth 1 — direct replies
// only), pinning, reporting, search. Visibility per-post (members-only
// or public-preview). Auth check: members-only posts are rejected for
// non-members.
//
// Rate limiting consumed via governance.rateLimitStatus (governance
// owns the actual rate-limit map). Reporting feeds into moderation
// queue as a soft log (moderation engine owns the actual triage).
// ============================================================================

import {
  getCircle,
} from "./circles.ts";

import type {
  CircleId,
  UserId,
} from "./circles.ts";

import {
  findActiveMembership,
} from "./membership.ts";

import type {
  Role,
} from "./membership.ts";

import {
  rateLimitStatus,
  recordPostForRateLimit,
  clearRateLimitsForTest,
  canPost,
} from "./governance.ts";

import type {
  PostVisibility,
} from "./governance.ts";

// ============================================================================
// BRANDED TYPES
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type PostId = Brand<string, "PostId">;
export type ReportId = Brand<string, "ReportId">;

const asPostId = (s: string): PostId => s as PostId;
const asReportId = (s: string): ReportId => s as ReportId;

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export interface CirclePost {
  readonly id: PostId;
  readonly circleId: CircleId;
  readonly authorId: UserId;
  readonly content: string;
  readonly sacredRefs: readonly string[];
  readonly visibility: PostVisibility;
  readonly replyTo: PostId | null;
  readonly pinned: boolean;
  readonly reported: boolean;
  readonly reportCount: number;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  /** Soft-delete marker (moderation). */
  readonly hiddenAt: string | null;
  readonly hiddenReason: string | null;
  /** LGPD deletion marker. */
  readonly piiScrubbedAt: string | null;
}

export interface PostReport {
  readonly id: ReportId;
  readonly postId: PostId;
  readonly reporterId: UserId;
  readonly reason: string;
  readonly details: string | null;
  readonly status: "open" | "triaged" | "resolved" | "dismissed";
  readonly createdAt: string;
  readonly triagedAt: string | null;
  readonly triagedBy: UserId | null;
}

export interface PostToCircleOptions {
  readonly replyTo?: PostId | string | null;
  readonly sacredRefs?: readonly string[];
  readonly visibility: PostVisibility;
}

export interface GetCircleFeedOptions {
  readonly viewer: UserId | string;
  readonly includeHidden?: boolean;
  readonly pinnedOnly?: boolean;
  readonly authorId?: UserId | string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface GetCircleFeedResult {
  readonly posts: readonly CirclePost[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface SearchOptions {
  readonly viewer: UserId | string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface SearchResult {
  readonly posts: readonly CirclePost[];
  readonly total: number;
  readonly query: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_CONTENT_LENGTH = 10000;
const MAX_PINNED_POSTS = 5;
const MAX_THREAD_DEPTH = 1;

let _hmacSecret = "";

// ============================================================================
// ERRORS
// ============================================================================

export class PostNotFoundError extends Error {
  readonly id: string;
  constructor(id: string) {
    super(`Post not found: ${id}`);
    this.name = "PostNotFoundError";
    this.id = id;
  }
}

export class PostValidationError extends Error {
  constructor(reason: string) {
    super(`Post validation: ${reason}`);
    this.name = "PostValidationError";
  }
}

export class FeedAuthError extends Error {
  constructor(reason: string) {
    super(`Auth: ${reason}`);
    this.name = "FeedAuthError";
  }
}

export class PinLimitError extends Error {
  constructor(reason: string) {
    super(`Pin: ${reason}`);
    this.name = "PinLimitError";
  }
}

// ============================================================================
// HMAC
// ============================================================================

export function setHmacSecret(secret: string): void {
  if (typeof secret !== "string") throw new PostValidationError("HMAC secret must be a string");
  _hmacSecret = secret;
}

export function clearHmacSecret(): void {
  _hmacSecret = "";
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function generateId(prefix: string): string {
  const payload = `${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// ============================================================================
// STORAGE
// ============================================================================

const POSTS: Map<string, CirclePost> = new Map();
const REPORTS: Map<string, PostReport> = new Map();

const CIRCLE_POSTS: Map<string, Set<PostId>> = new Map();
const AUTHOR_POSTS: Map<string, Set<PostId>> = new Map();
const PINNED_POSTS: Map<string, Set<PostId>> = new Map();
const REPLY_POSTS: Map<string, PostId> = new Map(); // parentId → direct replies

function indexAdd(map: Map<string, Set<PostId>>, key: string, id: PostId): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(id);
}

function indexRemove(map: Map<string, Set<PostId>>, key: string, id: PostId): void {
  const set = map.get(key);
  if (set) set.delete(id);
}

// ============================================================================
// HELPERS
// ============================================================================

function ensureString(value: unknown, name: string): string {
  if (typeof value !== "string") {
    throw new PostValidationError(`${name} must be a string`);
  }
  return value;
}

function isMemberOrAdmin(actor: UserId, circleId: CircleId): { member: boolean; role: Role | null } {
  const m = findActiveMembership(actor, circleId);
  if (!m) return { member: false, role: null };
  return { member: true, role: m.role };
}

function isAdmin(actor: UserId, circleId: CircleId): boolean {
  const r = isMemberOrAdmin(actor, circleId);
  return r.member && r.role === "admin";
}

function isModerator(actor: UserId, circleId: CircleId): boolean {
  const r = isMemberOrAdmin(actor, circleId);
  return r.member && (r.role === "admin" || r.role === "moderator");
}

// ============================================================================
// CRUD — postToCircle
// ============================================================================

/**
 * Post a message into a circle. Returns the post.
 *
 * Pre-flight checks (governance.canPost):
 *   - membership required (non-members can't post)
 *   - content length + shape
 *   - replyTo must be a post in the same circle and not at max depth
 *   - rate limit (configurable per-circle; default 5/hour)
 *   - sacred refs coerced to lowercase for dedup
 */
export function postToCircle(
  author: UserId | string,
  circleId: CircleId | string,
  content: string,
  opts: PostToCircleOptions,
  now: Date = new Date(),
): CirclePost {
  const authorId = ensureString(author, "author") as UserId;
  const circleIdN = getCircle(circleId).id;

  const contentStr = ensureString(content, "content").trim();
  if (contentStr.length === 0) {
    throw new PostValidationError("content cannot be empty");
  }
  if (contentStr.length > MAX_CONTENT_LENGTH) {
    throw new PostValidationError(
      `content exceeds max length (${contentStr.length} > ${MAX_CONTENT_LENGTH})`,
    );
  }

  // Pre-flight check via governance
  const check = canPost(authorId, circleIdN, contentStr);
  if (!check.allowed) {
    throw new FeedAuthError(check.reason ?? "cannot post");
  }

  // Validate reply parent
  let replyTo: PostId | null = null;
  if (opts.replyTo) {
    const parentIdStr = ensureString(opts.replyTo, "replyTo");
    const parent = POSTS.get(parentIdStr);
    if (!parent) throw new PostNotFoundError(parentIdStr);
    if (parent.circleId !== circleIdN) {
      throw new FeedAuthError("reply target is in a different circle");
    }
    if (parent.hiddenAt) {
      throw new FeedAuthError("cannot reply to a hidden post");
    }
    if (parent.replyTo !== null) {
      // Already a reply — max depth = 1
      throw new FeedAuthError("max thread depth is 1 — replies must target top-level posts");
    }
    replyTo = parent.id;
  }
  void MAX_THREAD_DEPTH;

  // Sacred refs deduped
  const sacredRefs = Array.from(
    new Set(
      (opts.sacredRefs ?? [])
        .map((s) => s.toLowerCase().trim())
        .filter((s) => s.length > 0 && s.length < 200),
    ),
  );

  const id = asPostId(generateId("post"));
  const post: CirclePost = {
    id,
    circleId: circleIdN,
    authorId,
    content: contentStr,
    sacredRefs,
    visibility: opts.visibility,
    replyTo,
    pinned: false,
    reported: false,
    reportCount: 0,
    createdAt: now.toISOString(),
    updatedAt: null,
    hiddenAt: null,
    hiddenReason: null,
    piiScrubbedAt: null,
  };
  POSTS.set(id, post);
  indexAdd(CIRCLE_POSTS, circleIdN, id);
  indexAdd(AUTHOR_POSTS, authorId, id);
  if (replyTo) REPLY_POSTS.set(replyTo, id);
  // Record rate-limit hit via governance engine
  recordPostForRateLimit(authorId, circleIdN, now);
  return post;
}

// ============================================================================
// QUERY — getCircleFeed
// ===========================================================================

/**
 * Get paginated feed for a circle. Viewer must be a member OR the
 * circle must have public-preview visibility for the post. Hidden
 * posts are filtered unless the viewer is admin/moderator AND
 * opts.includeHidden=true.
 */
export function getCircleFeed(
  circleId: CircleId | string,
  opts: GetCircleFeedOptions,
): GetCircleFeedResult {
  const circleIdN = getCircle(circleId).id;
  const viewerId = ensureString(opts.viewer, "viewer") as UserId;
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;
  if (limit < 1 || limit > 100) throw new PostValidationError(`invalid limit ${limit}`);
  if (offset < 0) throw new PostValidationError("negative offset");

  const viewerInfo = isMemberOrAdmin(viewerId, circleIdN);
  const viewerIsMod = isModerator(viewerId, circleIdN);

  const ids = CIRCLE_POSTS.get(circleIdN);
  if (!ids) return { posts: [], total: 0, limit, offset };

  const filtered: CirclePost[] = [];
  for (const id of ids) {
    const p = POSTS.get(id);
    if (!p) continue;
    // Hidden filtering
    if (p.hiddenAt) {
      if (!opts.includeHidden || !viewerIsMod) continue;
    }
    // Visibility filter
    if (p.visibility === "members-only" && !viewerInfo.member) continue;
    // Top-level vs reply
    if (!opts.pinnedOnly && p.replyTo !== null) continue; // feed is top-level only by default
    if (opts.pinnedOnly && !p.pinned) continue;
    if (opts.authorId) {
      const a = ensureString(opts.authorId, "authorId");
      if (p.authorId !== a) continue;
    }
    filtered.push(p);
  }
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    posts: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset,
  };
}

/** Public listing (no viewer). Used for the discover feed. */
export function listPublicCirclePreviews(
  opts: { readonly limit?: number; readonly offset?: number } = {},
): GetCircleFeedResult {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;
  const out: CirclePost[] = [];
  for (const p of POSTS.values()) {
    if (p.hiddenAt) continue;
    if (p.visibility !== "public-preview") continue;
    if (p.replyTo !== null) continue;
    const c = getCircle(p.circleId);
    if (c.visibility !== "public") continue;
    out.push(p);
  }
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    posts: out.slice(offset, offset + limit),
    total: out.length,
    limit,
    offset,
  };
}

// ============================================================================
// CRUD — pinPost / unpinPost
// ============================================================================

/**
 * Pin a post to the circle. Admin/moderator only. Max MAX_PINNED_POSTS
 * pinned per circle.
 */
export function pinPost(actor: UserId | string, postId: PostId | string): CirclePost {
  const actorId = ensureString(actor, "actor") as UserId;
  const idStr = ensureString(postId, "postId");
  const post = POSTS.get(idStr);
  if (!post) throw new PostNotFoundError(idStr);
  if (!isModerator(actorId, post.circleId)) {
    throw new FeedAuthError("only admin/moderator can pin");
  }
  if (post.pinned) return post;
  const pinned = PINNED_POSTS.get(post.circleId);
  if (pinned && pinned.size >= MAX_PINNED_POSTS) {
    throw new PinLimitError(
      `max pinned posts reached (${MAX_PINNED_POSTS})`,
    );
  }
  indexAdd(PINNED_POSTS, post.circleId, post.id);
  const updated: CirclePost = { ...post, pinned: true };
  POSTS.set(post.id, updated);
  return updated;
}

export function unpinPost(actor: UserId | string, postId: PostId | string): CirclePost {
  const actorId = ensureString(actor, "actor") as UserId;
  const idStr = ensureString(postId, "postId");
  const post = POSTS.get(idStr);
  if (!post) throw new PostNotFoundError(idStr);
  if (!isModerator(actorId, post.circleId)) {
    throw new FeedAuthError("only admin/moderator can unpin");
  }
  if (!post.pinned) return post;
  indexRemove(PINNED_POSTS, post.circleId, post.id);
  const updated: CirclePost = { ...post, pinned: false };
  POSTS.set(post.id, updated);
  return updated;
}

export function getPinnedPosts(circleId: CircleId | string): readonly CirclePost[] {
  const circleIdN = getCircle(circleId).id;
  const pinned = PINNED_POSTS.get(circleIdN);
  if (!pinned) return [];
  const out: CirclePost[] = [];
  for (const id of pinned) {
    const p = POSTS.get(id);
    if (p && !p.hiddenAt) out.push(p);
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ============================================================================
// CRUD — reportPost
// ============================================================================

/**
 * Report a post to moderation. Returns the report record.
 * Hidden flag is NOT set automatically — moderation engine triages.
 */
export function reportPost(
  reporter: UserId | string,
  postId: PostId | string,
  reason: string,
  details: string | null = null,
  now: Date = new Date(),
): PostReport {
  const reporterId = ensureString(reporter, "reporter") as UserId;
  const idStr = ensureString(postId, "postId");
  const post = POSTS.get(idStr);
  if (!post) throw new PostNotFoundError(idStr);
  const trimmedReason = ensureString(reason, "reason").trim();
  if (trimmedReason.length === 0) {
    throw new PostValidationError("reason cannot be empty");
  }
  if (trimmedReason.length > 500) {
    throw new PostValidationError("reason exceeds max length (500)");
  }
  const trimmedDetails = details?.trim().slice(0, 2000) ?? null;

  const id = asReportId(generateId("rpt"));
  const report: PostReport = {
    id,
    postId: post.id,
    reporterId,
    reason: trimmedReason,
    details: trimmedDetails,
    status: "open",
    createdAt: now.toISOString(),
    triagedAt: null,
    triagedBy: null,
  };
  REPORTS.set(id, report);

  // Increment report count + flag
  const updated: CirclePost = {
    ...post,
    reportCount: post.reportCount + 1,
    reported: true,
  };
  POSTS.set(post.id, updated);
  return report;
}

/** Get all open reports for a circle (admin/mod). */
export function getOpenReports(circleId: CircleId | string): readonly PostReport[] {
  const circleIdN = getCircle(circleId).id;
  const out: PostReport[] = [];
  for (const r of REPORTS.values()) {
    if (r.status !== "open") continue;
    const post = POSTS.get(r.postId);
    if (!post || post.circleId !== circleIdN) continue;
    out.push(r);
  }
  return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Internal: moderation engine marks a report triaged. */
export function _markReportTriaged(
  moderator: UserId | string,
  reportId: string,
  status: "triaged" | "resolved" | "dismissed",
): PostReport {
  const r = REPORTS.get(reportId);
  if (!r) throw new PostNotFoundError(reportId);
  const moderatorId = ensureString(moderator, "moderator") as UserId;
  const post = POSTS.get(r.postId);
  if (!post) throw new PostNotFoundError(r.postId);
  if (!isModerator(moderatorId, post.circleId)) {
    throw new FeedAuthError("only admin/moderator can triage reports");
  }
  const updated: PostReport = {
    ...r,
    status,
    triagedAt: new Date().toISOString(),
    triagedBy: moderatorId,
  };
  REPORTS.set(reportId, updated);
  return updated;
}

// ============================================================================
// QUERY — searchCirclePosts
// ============================================================================

/**
 * Search posts within a circle. Viewer must be a member for
 * members-only posts. Text + sacred-ref match (AND).
 */
export function searchCirclePosts(
  circleId: CircleId | string,
  query: string,
  opts: SearchOptions,
): SearchResult {
  const circleIdN = getCircle(circleId).id;
  const q = ensureString(query, "query").trim().toLowerCase();
  const viewerId = ensureString(opts.viewer, "viewer") as UserId;
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;
  const viewerInfo = isMemberOrAdmin(viewerId, circleIdN);

  if (q.length === 0) return { posts: [], total: 0, query: q };

  const ids = CIRCLE_POSTS.get(circleIdN);
  if (!ids) return { posts: [], total: 0, query: q };

  const matches: CirclePost[] = [];
  for (const id of ids) {
    const p = POSTS.get(id);
    if (!p) continue;
    if (p.hiddenAt) continue;
    if (p.visibility === "members-only" && !viewerInfo.member) continue;
    const qWords = q.split(/\s+/).filter((w) => w.length > 1);
    const textMatch = qWords.length > 0 &&
      qWords.every((w) => p.content.toLowerCase().includes(w));
    const refMatch = p.sacredRefs.some((r) => qWords.some((w) => r.includes(w)));
    if (!textMatch && !refMatch) continue;
    matches.push(p);
  }
  matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    posts: matches.slice(offset, offset + limit),
    total: matches.length,
    query: q,
  };
}

// ============================================================================
// AUTH — view checks exposed for API layer
// ============================================================================

/**
 * Permission check for feed routes. Returns error reason if denied.
 */
export function canViewFeed(viewer: UserId | string, circleId: CircleId | string): {
  readonly allowed: boolean;
  readonly reason?: string;
} {
  const viewerId = ensureString(viewer, "viewer") as UserId;
  const circleIdN = getCircle(circleId).id;
  const circle = getCircle(circleIdN);
  if (circle.status !== "active") {
    return { allowed: false, reason: "circle is archived" };
  }
  if (circle.visibility === "private") {
    const m = findActiveMembership(viewerId, circleIdN);
    if (!m) return { allowed: false, reason: "private circle — membership required" };
  }
  return { allowed: true };
}

// ============================================================================
// AUDIT — exported shape for external audit consumers
// ============================================================================

export interface FeedAuditRules {
  readonly maxContentLength: number;
  readonly maxPinnedPosts: number;
  readonly maxThreadDepth: number;
  readonly visibilityOptions: readonly PostVisibility[];
  readonly membersOnlyEnforced: boolean;
  readonly hideForNonModerator: boolean;
  readonly sacredRefsLowercased: boolean;
}

export function auditFeedRules(): FeedAuditRules {
  return {
    maxContentLength: MAX_CONTENT_LENGTH,
    maxPinnedPosts: MAX_PINNED_POSTS,
    maxThreadDepth: MAX_THREAD_DEPTH,
    visibilityOptions: ["members-only", "public-preview"],
    membersOnlyEnforced: true,
    hideForNonModerator: true,
    sacredRefsLowercased: true,
  };
}

// ============================================================================
// TEST-ONLY
// ============================================================================

export function clearAllStores(): void {
  POSTS.clear();
  REPORTS.clear();
  CIRCLE_POSTS.clear();
  AUTHOR_POSTS.clear();
  PINNED_POSTS.clear();
  REPLY_POSTS.clear();
  _hmacSecret = "";
}

/** Re-export rate-limit status for UI. */
export function getPostRateLimitStatus(userId: UserId | string, circleId: CircleId | string) {
  return rateLimitStatus(ensureString(userId, "userId"), ensureString(circleId, "circleId"));
}

/** Test-only passthrough — governance owns the actual storage. */
export { clearRateLimitsForTest };
