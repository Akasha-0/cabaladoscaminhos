/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — COMMENTS THREADING — TYPES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Canonical type definitions for the Cabala dos Caminhos comments threading
 * engine (W87-C). Backed by an in-memory adapter (cycle 86 pattern — survives
 * sandbox resets).
 *
 * Threading model:
 *   - Comment may have parentId = null (root) OR a CommentId pointing to its
 *     direct parent (depth 1 reply). Replies of replies are NOT supported —
 *     they are rejected by the factory with a MaxDepthError.
 *   - listThread(postId, viewerId) returns a flat array of ThreadNode (the
 *     roots), each carrying its `replies: ThreadNode[]` already grouped +
 *     sorted oldest-first. depth is 0 for roots and 1 for replies.
 *
 * Sacred-cultural sensitivity (cycle 86/W87-C lessons):
 *   - All Sacred terms (Orixá, Caboclo, Candomblé, Ifá, Cabala, Cigano,
 *     Tarô, Axé, Odu, Sefirá, etc) are preserved verbatim — the parser
 *     does NOT mutate user body content for "purification" of Portuguese
 *     accents or sacred vocabulary.
 *   - Status 'visible' | 'hidden' | 'deleted' allows future moderation
 *     flows (cycle 84-B admin moderation engine reuses this shape).
 *   - Mention is a structural artifact of the body — display rendering is
 *     the component's job (the engine is rendering-agnostic).
 *
 * Branded types (cycle 86 pattern) prevent accidental cross-assignment:
 *   - `CommentId` ≠ `PostId` ≠ `UserId` at compile time, even though all
 *     are strings at runtime. Cast with `as UserId` when needed.
 */

// ────────────────────────────────────────────────────────────────────────────
// Branded primitive ids
// ────────────────────────────────────────────────────────────────────────────

declare const __commentIdBrand: unique symbol;
declare const __userIdBrand: unique symbol;
declare const __postIdBrand: unique symbol;

export type CommentId = string & { readonly [__commentIdBrand]: true };
export type UserId = string & { readonly [__userIdBrand]: true };
export type PostId = string & { readonly [__postIdBrand]: true };

export const asCommentId = (s: string): CommentId => s as CommentId;
export const asUserId = (s: string): UserId => s as UserId;
export const asPostId = (s: string): PostId => s as PostId;

export const ID_PREFIXES = Object.freeze({
  comment: 'c',
  user: 'u',
  post: 'p',
} as const);

// ────────────────────────────────────────────────────────────────────────────
// Mention — structural artifact produced by parseMentions()
// ────────────────────────────────────────────────────────────────────────────

export interface Mention {
  readonly handle: string;
  readonly userId?: UserId;
  readonly start: number;
  readonly end: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Comment
// ────────────────────────────────────────────────────────────────────────────

export type CommentStatus = 'visible' | 'hidden' | 'deleted';

export interface Comment {
  readonly id: CommentId;
  readonly postId: PostId;
  readonly authorId: UserId;
  readonly parentId: CommentId | null;
  readonly body: string;
  readonly mentions: ReadonlyArray<Mention>;
  readonly createdAt: string;
  readonly editedAt?: string;
  readonly status: CommentStatus;
}

// ────────────────────────────────────────────────────────────────────────────
// ThreadNode
// ────────────────────────────────────────────────────────────────────────────

export interface ThreadNode extends Comment {
  readonly replies: ReadonlyArray<ThreadNode>;
  readonly depth: 0 | 1;
}

// ────────────────────────────────────────────────────────────────────────────
// Limits & contracts (frozen)
// ────────────────────────────────────────────────────────────────────────────

export const MAX_THREAD_DEPTH = 1 as const;
export const MAX_BODY_LENGTH = 2000;
export const MIN_BODY_LENGTH = 1;
export const MAX_MENTIONS_PER_COMMENT = 10;

export interface CommentsAdapter {
  insert(c: Omit<Comment, 'id' | 'createdAt' | 'status'>): Promise<Comment>;
  update(
    id: CommentId,
    patch: Pick<Comment, 'body' | 'mentions'> & { editedAt: string },
  ): Promise<Comment>;
  softDelete(id: CommentId): Promise<Comment>;
  listByPost(postId: PostId): Promise<ReadonlyArray<Comment>>;
  findById(id: CommentId): Promise<Comment | null>;
}

export interface CommentsEngine {
  readonly addComment: (
    postId: PostId,
    authorId: UserId,
    body: string,
    parentId: CommentId | null,
    lgpdConsent: boolean,
  ) => Promise<Comment>;
  readonly editComment: (commentId: CommentId, newBody: string) => Promise<Comment>;
  readonly deleteComment: (commentId: CommentId) => Promise<Comment>;
  readonly listThread: (postId: PostId, viewerId: UserId) => Promise<ReadonlyArray<ThreadNode>>;
  readonly findById: (commentId: CommentId) => Promise<Comment | null>;
  readonly knownHandles: () => ReadonlyArray<string>;
}

// ────────────────────────────────────────────────────────────────────────────
// Error taxonomy (frozen)
// ────────────────────────────────────────────────────────────────────────────

export const ERROR_CODES = Object.freeze({
  LGPD_CONSENT_REQUIRED: 'LGPD_CONSENT_REQUIRED',
  MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
  BODY_TOO_LONG: 'BODY_TOO_LONG',
  BODY_TOO_SHORT: 'BODY_TOO_SHORT',
  PARENT_NOT_FOUND: 'PARENT_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  CROSS_POST_REPLY: 'CROSS_POST_REPLY',
  EDIT_ON_DELETED: 'EDIT_ON_DELETED',
} as const);

export type CommentErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class CommentError extends Error {
  readonly code: CommentErrorCode;
  constructor(code: CommentErrorCode, message: string) {
    super(message);
    this.name = 'CommentError';
    this.code = code;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ID minting
// ────────────────────────────────────────────────────────────────────────────

let __seq = 0;
export function mintCommentId(seq?: number): CommentId {
  const n = seq ?? ++__seq;
  return asCommentId(
    `${ID_PREFIXES.comment}_${Date.now().toString(36)}_${n.toString(36)}`,
  );
}

export function _resetCommentIdSeq(): void {
  __seq = 0;
}

export function nowIso(): string {
  return new Date().toISOString();
}
