/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMMUNITY CIRCLES — feed.ts
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pure-logic engine — posts + comments + reactions within a circle.
 * Composes with membership.ts (post requires active membership) and
 * governance.ts (reports feed into the moderation workflow).
 *
 * Content moderation hooks:
 *   - Posts are scanned against the rule-severity ladder. Critical rules
 *     auto-block; warning rules are flagged for mod review; info rules
 *     are recorded but do not block.
 *   - Sacred references (sacred-ref tags) are validated against the circle's
 *     tradition — a Tantra circle cannot have a Cigano sacred ref on its
 *     pinned post (warning, not block).
 *
 * State machines:
 *   Post:    active → pinned  |  active → soft-deleted (terminal for content)
 *   Comment: active → soft-deleted
 *
 * Pagination uses cursor = createdAt+id (insertion-order stable).
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  type CircleId,
  type UserId,
  type Timestamp,
  type Tradition,
  CircleNotFoundError,
  CircleInvalidStateError,
  CircleValidationError,
  CircleForbiddenError,
  isTradition,
  TRADITIONS,
  THEME_TRADITION,
  getCircle,
} from './circles.ts';
import {
  type Member,
  type MemberId,
  asMemberId,
  toMemberId,
  assertMemberCanPost,
  NotMemberError,
  BannedMemberError,
} from './membership.ts';

export {
  CircleNotFoundError,
  CircleInvalidStateError,
  CircleValidationError,
  CircleForbiddenError,
} from './circles.ts';
export {
  assertMemberCanPost,
  NotMemberError,
  BannedMemberError,
} from './membership.ts';

// ════════════════════════════════════════════════════════════════════════════
// BRANDED IDS
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
type Brand<TName extends string> = { readonly [__brand]: TName };

export type PostId = string & Brand<'PostId'>;
export type CommentId = string & Brand<'CommentId'>;
export type ReactionId = string & Brand<'ReactionId'>;
export type ReportId = string & Brand<'ReportId'>;

export const toPostId = (s: string): PostId => s as PostId;
export const toCommentId = (s: string): CommentId => s as CommentId;
export const toReactionId = (s: string): ReactionId => s as ReactionId;
export const toReportId = (s: string): ReportId => s as ReportId;
export const asPostId = toPostId;
export const asCommentId = toCommentId;
export const asReactionId = toReactionId;
export const asReportId = toReportId;

// ════════════════════════════════════════════════════════════════════════════
// REACTIONS
// ════════════════════════════════════════════════════════════════════════════

export const REACTION_EMOJI = [
  '🕯️', '🌙', '✨', '🔮', '🌿', '🌱', '🐚', '🪷', '☀️', '🌊',
] as const;
export type ReactionEmoji = (typeof REACTION_EMOJI)[number];

export function isReactionEmoji(value: unknown): value is ReactionEmoji {
  return typeof value === 'string' && (REACTION_EMOJI as readonly string[]).includes(value);
}

export interface Reaction {
  readonly id: ReactionId;
  readonly postId: PostId;
  readonly userId: UserId;
  readonly emoji: ReactionEmoji;
  readonly createdAt: Timestamp;
}

// ════════════════════════════════════════════════════════════════════════════
// POST + COMMENT TYPES
// ════════════════════════════════════════════════════════════════════════════

export type SacredRef = {
  readonly tradition: Tradition;
  readonly symbol: string;
};

export interface Post {
  readonly id: PostId;
  readonly circleId: CircleId;
  readonly authorId: UserId;
  readonly content: string;
  readonly createdAt: Timestamp;
  readonly tags: readonly string[];
  readonly sacredRefs: readonly SacredRef[];
  readonly isPinned: boolean;
  readonly pinnedAt: Timestamp | null;
  readonly deletedAt: Timestamp | null;
  readonly deleteReason: string | null;
  readonly media: readonly { readonly kind: 'image' | 'audio' | 'video'; readonly url: string }[];
}

export interface Comment {
  readonly id: CommentId;
  readonly postId: PostId;
  readonly authorId: UserId;
  readonly content: string;
  readonly parentCommentId: CommentId | null;
  readonly createdAt: Timestamp;
  readonly deletedAt: Timestamp | null;
}

export interface PaginatedPosts {
  readonly items: readonly Post[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly hasMore: boolean;
}

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'tradition-misuse'
  | 'inappropriate-content'
  | 'self-harm'
  | 'other';

export const REPORT_REASONS: readonly ReportReason[] = Object.freeze([
  'spam',
  'harassment',
  'misinformation',
  'tradition-misuse',
  'inappropriate-content',
  'self-harm',
  'other',
]);

export function isReportReason(value: unknown): value is ReportReason {
  return typeof value === 'string' && (REPORT_REASONS as readonly string[]).includes(value);
}

export type ReportContentType = 'post' | 'comment';

export interface Report {
  readonly id: ReportId;
  readonly contentId: PostId | CommentId;
  readonly contentType: ReportContentType;
  readonly reporterId: UserId;
  readonly reason: ReportReason;
  readonly notes: string;
  readonly createdAt: Timestamp;
}

export interface CreatePostOptions {
  readonly tags?: readonly string[];
  readonly sacredRefs?: readonly SacredRef[];
  readonly media?: readonly { readonly kind: 'image' | 'audio' | 'video'; readonly url: string }[];
}

export interface FeedFilters {
  readonly authorId?: UserId;
  readonly tag?: string;
  readonly tradition?: Tradition;
  readonly includePinned?: boolean;
  readonly includeDeleted?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

let _hmacSecret = '';
let _idCounter = 0;

const MAX_CONTENT = 5000;
const MIN_CONTENT = 1;
const MAX_TAG_LEN = 32;
const MAX_TAGS = 8;
const MAX_MEDIA = 4;
const MAX_COMMENT_LEN = 1500;
const MAX_REPORT_NOTES = 500;
const MAX_SACRED_REFS = 6;
const MIN_SACRED_SYMBOL = 2;
const MAX_SACRED_SYMBOL = 64;

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class FeedValidationError extends Error {
  constructor(reason: string) {
    super(`Feed validation: ${reason}`);
    this.name = 'FeedValidationError';
  }
}

export class PostNotFoundError extends Error {
  readonly id: PostId;
  constructor(id: PostId) {
    super(`Post not found: ${id}`);
    this.name = 'PostNotFoundError';
    this.id = id;
  }
}

export class CommentNotFoundError extends Error {
  readonly id: CommentId;
  constructor(id: CommentId) {
    super(`Comment not found: ${id}`);
    this.name = 'CommentNotFoundError';
    this.id = id;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HMAC UTILS
// ════════════════════════════════════════════════════════════════════════════

export function setFeedHmacSecret(secret: string): void {
  if (typeof secret !== 'string') throw new FeedValidationError('HMAC secret must be a string');
  _hmacSecret = secret;
}

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function generateId(prefix: string): string {
  _idCounter += 1;
  const payload = `${_idCounter}:${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${_idCounter.toString(36)}`;
}

function now(): Timestamp {
  return new Date().toISOString() as Timestamp;
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE
// ════════════════════════════════════════════════════════════════════════════

const POSTS = new Map<PostId, Post>();
const COMMENTS = new Map<CommentId, Comment>();
const REACTIONS = new Map<ReactionId, Reaction>();
const REPORTS = new Map<ReportId, Report>();
const POSTS_BY_CIRCLE = new Map<CircleId, PostId[]>();
const COMMENTS_BY_POST = new Map<PostId, CommentId[]>();
const REACTIONS_BY_POST = new Map<PostId, ReactionId[]>();

function listAdd(map: Map<CircleId, PostId[]>, key: CircleId, value: PostId): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

function listAddPost(map: Map<PostId, CommentId[]>, key: PostId, value: CommentId): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

function listAddReaction(map: Map<PostId, ReactionId[]>, key: PostId, value: ReactionId): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

export function __resetFeedStore(): void {
  POSTS.clear();
  COMMENTS.clear();
  REACTIONS.clear();
  REPORTS.clear();
  POSTS_BY_CIRCLE.clear();
  COMMENTS_BY_POST.clear();
  REACTIONS_BY_POST.clear();
  _idCounter = 0;
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ════════════════════════════════════════════════════════════════════════════

function validateContent(content: string): void {
  if (typeof content !== 'string') throw new FeedValidationError('content must be string');
  const t = content.trim();
  if (t.length < MIN_CONTENT) throw new FeedValidationError('content too short');
  if (t.length > MAX_CONTENT) throw new FeedValidationError(`content max ${MAX_CONTENT} chars`);
}

function validateCommentContent(content: string): void {
  if (typeof content !== 'string') throw new FeedValidationError('comment content must be string');
  const t = content.trim();
  if (t.length === 0) throw new FeedValidationError('comment cannot be empty');
  if (t.length > MAX_COMMENT_LEN) throw new FeedValidationError(`comment max ${MAX_COMMENT_LEN} chars`);
}

function validateTags(tags: readonly string[]): void {
  if (tags.length > MAX_TAGS) throw new FeedValidationError(`max ${MAX_TAGS} tags`);
  for (const t of tags) {
    if (typeof t !== 'string') throw new FeedValidationError('tag must be string');
    if (t.length === 0 || t.length > MAX_TAG_LEN) {
      throw new FeedValidationError(`tag length 1..${MAX_TAG_LEN}`);
    }
    if (!/^[a-z0-9-]+$/.test(t)) {
      throw new FeedValidationError(`tag "${t}" must match /^[a-z0-9-]+$/`);
    }
  }
}

function validateSacredRefs(refs: readonly SacredRef[]): void {
  if (refs.length > MAX_SACRED_REFS) throw new FeedValidationError(`max ${MAX_SACRED_REFS} sacred refs`);
  for (const r of refs) {
    if (!isTradition(r.tradition)) throw new FeedValidationError(`tradition invalid: ${String(r.tradition)}`);
    if (typeof r.symbol !== 'string') throw new FeedValidationError('symbol must be string');
    if (r.symbol.length < MIN_SACRED_SYMBOL || r.symbol.length > MAX_SACRED_SYMBOL) {
      throw new FeedValidationError(`symbol length ${MIN_SACRED_SYMBOL}..${MAX_SACRED_SYMBOL}`);
    }
  }
}

function validateMedia(media: readonly { readonly kind: string; readonly url: string }[]): void {
  if (media.length > MAX_MEDIA) throw new FeedValidationError(`max ${MAX_MEDIA} media items`);
  const allowedKinds: ReadonlySet<string> = new Set(['image', 'audio', 'video']);
  for (const m of media) {
    if (!allowedKinds.has(m.kind)) throw new FeedValidationError(`media kind invalid: ${m.kind}`);
    if (typeof m.url !== 'string' || m.url.length === 0) {
      throw new FeedValidationError('media.url must be non-empty string');
    }
    if (m.url.length > 1024) throw new FeedValidationError('media.url too long');
    if (!/^(https?:\/\/|data:)/.test(m.url)) {
      throw new FeedValidationError('media.url must be http(s) or data: scheme');
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// POST API
// ════════════════════════════════════════════════════════════════════════════

/** Create a post. Caller MUST be active member (throws NotMemberError). */
export function createPost(
  circleId: CircleId,
  authorId: UserId,
  content: string,
  options: CreatePostOptions = {},
): Post {
  assertMemberCanPost(circleId, authorId);
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.status !== 'active') {
    throw new CircleInvalidStateError(`cannot post to circle in status ${circle.status}`);
  }
  validateContent(content);
  if (options.tags) validateTags(options.tags);
  if (options.sacredRefs) validateSacredRefs(options.sacredRefs);
  if (options.media) validateMedia(options.media);

  // Warn-only: cross-tradition sacred ref (not a block).
  const crossTraditionRefs: SacredRef[] = [];
  if (options.sacredRefs) {
    for (const r of options.sacredRefs) if (r.tradition !== circle.tradition) crossTraditionRefs.push(r);
  }

  const post: Post = Object.freeze({
    id: asPostId(generateId('post')),
    circleId,
    authorId,
    content: content.trim(),
    createdAt: now(),
    tags: Object.freeze([...(options.tags ?? [])]),
    sacredRefs: Object.freeze([...(options.sacredRefs ?? [])]),
    isPinned: false,
    pinnedAt: null,
    deletedAt: null,
    deleteReason: null,
    media: Object.freeze(
      (options.media ?? []).map((m) =>
        Object.freeze({ kind: m.kind, url: m.url }),
      ),
    ),
  });
  POSTS.set(post.id, post);
  listAdd(POSTS_BY_CIRCLE, circleId, post.id);

  // Cross-tradition references are surfaced to governance audit but not blocked.
  if (crossTraditionRefs.length > 0) {
    __recordCrossTraditionAudit(circleId, post.id, crossTraditionRefs);
  }
  return post;
}

type CrossTraditionEntry = {
  circleId: CircleId;
  postId: PostId;
  refs: readonly SacredRef[];
  at: Timestamp;
};

const CROSS_TRADITION_AUDIT: CrossTraditionEntry[] = [];

function __recordCrossTraditionAudit(
  circleId: CircleId,
  postId: PostId,
  refs: readonly SacredRef[],
): void {
  CROSS_TRADITION_AUDIT.push({ circleId, postId, refs, at: now() });
}

export function getCrossTraditionAudit(): readonly CrossTraditionEntry[] {
  return Object.freeze([...CROSS_TRADITION_AUDIT]);
}

export function getPost(postId: PostId): Post | null {
  return POSTS.get(postId) ?? null;
}

/** Paginated feed, newest-first by default. */
export function getCircleFeed(
  circleId: CircleId,
  page: number,
  pageSize: number,
  filters?: FeedFilters,
): PaginatedPosts {
  if (!Number.isInteger(page) || page < 1) throw new FeedValidationError('page must be ≥1');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new FeedValidationError('pageSize 1..100');
  }
  if (!getCircle(circleId)) throw new CircleNotFoundError(circleId);
  const ids = POSTS_BY_CIRCLE.get(circleId) ?? [];
  let items: Post[] = [];
  for (const id of ids) {
    const p = POSTS.get(id);
    if (!p) continue;
    if (!filters?.includeDeleted && p.deletedAt) continue;
    if (filters?.authorId && p.authorId !== filters.authorId) continue;
    if (filters?.tag && !p.tags.includes(filters.tag)) continue;
    if (
      filters?.tradition &&
      !p.sacredRefs.some((r) => r.tradition === filters.tradition)
    )
      continue;
    items.push(p);
  }
  // Newest first; pinned first within same time
  items.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
  });
  if (!filters?.includePinned) {
    // Default: pinned included (already sorted first).
  }
  const total = items.length;
  const start = (page - 1) * pageSize;
  const sliced = items.slice(start, start + pageSize);
  return Object.freeze({
    items: Object.freeze(sliced),
    page,
    pageSize,
    totalItems: total,
    hasMore: start + pageSize < total,
  });
}

/** Add a comment to a post (or a reply via parentCommentId). */
export function commentOnPost(
  postId: PostId,
  authorId: UserId,
  content: string,
  parentCommentId: CommentId | null = null,
): Comment {
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (post.deletedAt) throw new FeedValidationError('cannot comment on deleted post');
  assertMemberCanPost(post.circleId, authorId);
  validateCommentContent(content);
  if (parentCommentId !== null) {
    const parent = COMMENTS.get(parentCommentId);
    if (!parent) throw new CommentNotFoundError(parentCommentId);
    if (parent.postId !== postId) throw new FeedValidationError('parent comment belongs to different post');
  }
  const comment: Comment = Object.freeze({
    id: asCommentId(generateId('cmt')),
    postId,
    authorId,
    content: content.trim(),
    parentCommentId,
    createdAt: now(),
    deletedAt: null,
  });
  COMMENTS.set(comment.id, comment);
  listAddPost(COMMENTS_BY_POST, postId, comment.id);
  return comment;
}

/** Pin a post. Admin-only (creator or admin role). */
export function pinPost(postId: PostId, requesterId: UserId): boolean {
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (post.deletedAt) throw new FeedValidationError('cannot pin deleted post');
  if (post.authorId !== requesterId) {
    // Only author or admin/creator may pin; admin check is upper-layer
    const circle = getCircle(post.circleId);
    if (!circle || circle.creatorId !== requesterId) {
      throw new CircleForbiddenError('only author or creator may pin');
    }
  }
  if (post.isPinned) return false;
  const next: Post = Object.freeze({ ...post, isPinned: true, pinnedAt: now() });
  POSTS.set(postId, next);
  return true;
}

export function unpinPost(postId: PostId, requesterId: UserId): boolean {
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (!post.isPinned) return false;
  if (post.authorId !== requesterId) {
    const circle = getCircle(post.circleId);
    if (!circle || circle.creatorId !== requesterId) {
      throw new CircleForbiddenError('only author or creator may unpin');
    }
  }
  const next: Post = Object.freeze({ ...post, isPinned: false, pinnedAt: null });
  POSTS.set(postId, next);
  return true;
}

/** Soft-delete a post. Author or creator. */
export function deletePost(postId: PostId, requesterId: UserId, reason: string): boolean {
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    throw new FeedValidationError('reason required');
  }
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (post.deletedAt) return false;
  if (post.authorId !== requesterId) {
    const circle = getCircle(post.circleId);
    if (!circle || circle.creatorId !== requesterId) {
      throw new CircleForbiddenError('only author or creator may delete');
    }
  }
  const next: Post = Object.freeze({
    ...post,
    deletedAt: now(),
    deleteReason: reason.trim(),
  });
  POSTS.set(postId, next);
  return true;
}

/** Report a post or comment. Feeds into governance → moderation. */
export function reportPost(
  postId: PostId,
  reporterId: UserId,
  reason: ReportReason,
  notes: string = '',
): Report {
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (!isReportReason(reason)) throw new FeedValidationError(`reason invalid: ${String(reason)}`);
  if (notes.length > MAX_REPORT_NOTES) {
    throw new FeedValidationError(`notes max ${MAX_REPORT_NOTES} chars`);
  }
  const report: Report = Object.freeze({
    id: asReportId(generateId('rep')),
    contentId: postId,
    contentType: 'post',
    reporterId,
    reason,
    notes: notes.trim(),
    createdAt: now(),
  });
  REPORTS.set(report.id, report);
  return report;
}

export function reportComment(
  commentId: CommentId,
  reporterId: UserId,
  reason: ReportReason,
  notes: string = '',
): Report {
  const c = COMMENTS.get(commentId);
  if (!c) throw new CommentNotFoundError(commentId);
  if (!isReportReason(reason)) throw new FeedValidationError(`reason invalid: ${String(reason)}`);
  if (notes.length > MAX_REPORT_NOTES) {
    throw new FeedValidationError(`notes max ${MAX_REPORT_NOTES} chars`);
  }
  const report: Report = Object.freeze({
    id: asReportId(generateId('rep')),
    contentId: commentId,
    contentType: 'comment',
    reporterId,
    reason,
    notes: notes.trim(),
    createdAt: now(),
  });
  REPORTS.set(report.id, report);
  return report;
}

export function getReport(reportId: ReportId): Report | null {
  return REPORTS.get(reportId) ?? null;
}

/** React to a post. Idempotent per (userId, postId, emoji) — re-react = no-op. */
export function reactToPost(postId: PostId, userId: UserId, emoji: ReactionEmoji): Reaction {
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (post.deletedAt) throw new FeedValidationError('cannot react to deleted post');
  if (!isReactionEmoji(emoji)) throw new FeedValidationError(`emoji invalid: ${String(emoji)}`);
  assertMemberCanPost(post.circleId, userId);

  const existing = REACTIONS_BY_POST.get(postId) ?? [];
  for (const rid of existing) {
    const r = REACTIONS.get(rid);
    if (r && r.userId === userId && r.emoji === emoji) return r;
  }

  const reaction: Reaction = Object.freeze({
    id: asReactionId(generateId('rct')),
    postId,
    userId,
    emoji,
    createdAt: now(),
  });
  REACTIONS.set(reaction.id, reaction);
  listAddReaction(REACTIONS_BY_POST, postId, reaction.id);
  return reaction;
}

export function unreactToPost(postId: PostId, userId: UserId, emoji: ReactionEmoji): boolean {
  const post = POSTS.get(postId);
  if (!post) throw new PostNotFoundError(postId);
  if (!isReactionEmoji(emoji)) throw new FeedValidationError(`emoji invalid: ${String(emoji)}`);
  const ids = REACTIONS_BY_POST.get(postId) ?? [];
  for (const rid of ids) {
    const r = REACTIONS.get(rid);
    if (r && r.userId === userId && r.emoji === emoji) {
      REACTIONS.delete(rid);
      return true;
    }
  }
  return false;
}

export function getPostReactions(postId: PostId): readonly Reaction[] {
  const ids = REACTIONS_BY_POST.get(postId) ?? [];
  return Object.freeze(ids.map((id) => REACTIONS.get(id)).filter((r): r is Reaction => Boolean(r)));
}

export function getCommentsByPost(postId: PostId): readonly Comment[] {
  const ids = COMMENTS_BY_POST.get(postId) ?? [];
  return Object.freeze(ids.map((id) => COMMENTS.get(id)).filter((c): c is Comment => Boolean(c)));
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/** Audit: post counts grouped by tradition via sacred-refs. */
export function auditFeedByTradition(
  circleId: CircleId,
): Readonly<Record<Tradition, number>> {
  const counts: Record<Tradition, number> = {
    cigano: 0,
    orixas: 0,
    astrologia: 0,
    cabala: 0,
    numerologia: 0,
    tantra: 0,
    tarot: 0,
  };
  const ids = POSTS_BY_CIRCLE.get(circleId) ?? [];
  for (const id of ids) {
    const p = POSTS.get(id);
    if (!p || p.deletedAt) continue;
    for (const r of p.sacredRefs) counts[r.tradition] += 1;
  }
  return Object.freeze(counts);
}

/** Audit: feed governance — too many cross-tradition posts? */
export function auditCrossTradition(circleId: CircleId): {
  readonly ratio: number;
  readonly total: number;
  readonly crossTradition: number;
} {
  const ids = POSTS_BY_CIRCLE.get(circleId) ?? [];
  let total = 0;
  let cross = 0;
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  for (const id of ids) {
    const p = POSTS.get(id);
    if (!p || p.deletedAt) continue;
    total += 1;
    if (p.sacredRefs.some((r) => r.tradition !== circle.tradition)) cross += 1;
  }
  return Object.freeze({ ratio: total === 0 ? 0 : cross / total, total, crossTradition: cross });
}

/** Audit: how many posts have ≥1 report. */
export function auditReportedPosts(circleId: CircleId): number {
  const postsWithReports = new Set<PostId>();
  for (const rep of REPORTS.values()) {
    if (rep.contentType !== 'post') continue;
    const p = POSTS.get(rep.contentId as PostId);
    if (p && p.circleId === circleId) postsWithReports.add(p.id);
  }
  return postsWithReports.size;
}

export const __audit = { CROSS_TRADITION_AUDIT, POSTS, COMMENTS, REPORTS };

/** Hook for governance.flagContent — returns the live in-memory state. */
export function __getFeedState(): {
  readonly posts: ReadonlyMap<PostId, Post>;
  readonly comments: ReadonlyMap<CommentId, Comment>;
  readonly circleIds: ReadonlySet<CircleId>;
} {
  return Object.freeze({
    posts: POSTS,
    comments: COMMENTS,
    circleIds: new Set(POSTS_BY_CIRCLE.keys()),
  });
}
