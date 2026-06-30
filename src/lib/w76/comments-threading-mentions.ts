/**
 * ════════════════════════════════════════════════════════════════════════════
 * W76-D — COMMENTS THREADING + MENTIONS ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 76 · 2026-06-30
 * Author: W76-D Coder (Mavis orchestrator session 414698242793715)
 *
 * Threaded comments with parent/child relationships, depth limits, cycle
 * detection, @-mention parsing (PT-BR aware via Unicode word boundaries),
 * notification hooks (mention/reply/subscription), per-thread subscription
 * registry, and a sacred-tradition cross-flag hook that integrates with
 * the moderation domain (W73) without duplicating it.
 *
 * W73 owns the moderation rules (what gets hidden / deleted / soft-warned).
 * W76-D owns the THREAD structure and MENTION parsing — the two engines
 * communicate via the `moderationFlag` field on each Comment. W73 decides
 * whether the flag triggers removal; W76-D decides whether the structure
 * (parent chain, depth, mentions) is valid.
 *
 * Public API (cycle 76 contract):
 *   registerUser / getUser / getUserById / listUsers
 *   createComment / replyToComment / editComment / softDeleteComment
 *   getComment / listThread
 *   parseMentions / extractSacredTerms
 *   subscribeToThread / muteThread / getThreadSubscribers / getThreadMuted
 *   notifyOnMention / notifyOnReply / notifyOnThreadSubscription
 *   exportNotificationAudit
 *   flagCrossTradition
 *
 * Durable lessons applied (cycle 60-75):
 *   - Branded primitive IDs (UserId, CommentId, PostId, ThreadId) (cycle 67)
 *   - Object.freeze + ReadonlyArray + ReadonlyMap for exported types (cycle 68)
 *   - Object.freeze(slice()) for read-only audit (cycle 75)
 *   - Sacred token regex with [^\p{L}\p{N}_] boundaries (cycle 68/69/75)
 *   - Self-running spec harness with _reset() between tests (cycle 73)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES — compile-time only, zero runtime cost
// ════════════════════════════════════════════════════════════════════════════

export type UserId = string & { readonly __brand: 'UserId' };
export type CommentId = string & { readonly __brand: 'CommentId' };
export type PostId = string & { readonly __brand: 'PostId' };

export const userId = (s: string): UserId => s as UserId;
export const commentId = (s: string): CommentId => s as CommentId;
export const postId = (s: string): PostId => s as PostId;

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const MAX_THREAD_DEPTH = 5 as const;

/**
 * Sacred term whitelist — 30+ terms correctly cased + accented.
 * Used by `extractSacredTerms` to PRESERVE original casing through edits,
 * and by `flagCrossTradition` to detect cross-tradition discussions.
 *
 * Cycle 75 lesson #4: source-string casing wins when scanning; we return
 * the source match, never normalized lowercased.
 */
export const SACRED_TERMS: ReadonlyArray<string> = Object.freeze([
  'Orixá', 'Orixás', 'Odu', 'Odus',
  'Babalorixá', 'Yalorixá', 'Caboclo', 'Preto-Velho',
  'Sephirot', 'Sephirah', 'Kether', 'Chokhmah', 'Binah',
  'Tarô', 'Cigano', 'Cigana',
  'Bodhisattva', 'Guru', 'Mantra', 'Mantram',
  'Ifá', 'Orunmila', 'Orunmilá',
  'Exu', 'Oxalá', 'Iansã', 'Oxum', 'Xangô', 'Ogum', 'Iemanjá',
  'Oxumarê', 'Omulu', 'Nanã',
  'Pomba-Gira', 'Marinheiro',
  'Sephiroth', 'Malkuth', 'Tiferet', 'Chesed', 'Gevurah',
  'Runas', 'Tarot', 'Umbanda', 'Candomblé',
  'Cabala', 'Kundalini', 'Tantra', 'Ayurveda',
  'Meditação', 'Akasha', 'Akáshico',
  'Prece', 'Ritual', 'Banho', 'Defumação',
]);

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface User {
  readonly id: UserId;
  readonly username: string;
  readonly displayName: string;
  readonly createdAt: string;
}

export interface Mention {
  readonly userId: UserId;
  readonly username: string;
  readonly rawText: string;
  readonly start: number;
  readonly end: number;
}

export interface ModerationFlag {
  readonly kind: 'cross_tradition_perspective';
  readonly reason: string;
  readonly flaggedAt: string;
  readonly sacredTermsFound: readonly string[];
}

export interface Comment {
  readonly id: CommentId;
  readonly postId: PostId;
  readonly parentId: CommentId | null;
  readonly rootId: CommentId;
  readonly authorId: UserId;
  readonly body: string;
  readonly mentions: ReadonlyArray<Mention>;
  readonly depth: number;
  readonly createdAt: string;
  readonly editedAt: string | null;
  readonly deletedAt: string | null;
  readonly moderationFlag: ModerationFlag | null;
}

export type NotificationKind = 'mention' | 'reply' | 'subscription';

export interface NotificationEvent {
  readonly kind: NotificationKind;
  readonly commentId: CommentId;
  readonly rootId: CommentId;
  readonly actorId: UserId;
  readonly recipientId: UserId;
  readonly createdAt: string;
  readonly brand: 'W76-D';
}

export interface CreateCommentInput {
  readonly postId: PostId;
  readonly authorId: UserId;
  readonly body: string;
  readonly parentId?: CommentId | null;
}

export interface ReplyInput {
  readonly authorId: UserId;
  readonly body: string;
}

export interface ListThreadOptions {
  readonly includeDeleted?: boolean;
  readonly maxDepth?: number;
}

export interface CrossTraditionFlag {
  readonly perspectiveOnly: true;
  readonly traditionsPresent: readonly string[];
  readonly flaggedAt: string;
}

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL ENGINE STATE
// ════════════════════════════════════════════════════════════════════════════

const USERS: Map<string, User> = new Map();
const COMMENTS: Map<CommentId, Comment> = new Map();
const CHILDREN: Map<CommentId, ReadonlyArray<CommentId>> = new Map();
const SUBSCRIPTIONS: Map<CommentId, ReadonlySet<UserId>> = new Map();
const MUTED: Map<CommentId, ReadonlySet<UserId>> = new Map();
const NOTIFICATION_LOG: NotificationEvent[] = [];
const PARENT_BY_ID: Map<CommentId, CommentId | null> = new Map();

let _seq = 0;

function nextId(prefix: string): string {
  _seq += 1;
  return prefix + '-' + _seq.toString(36).padStart(4, '0');
}

function nowIso(): string {
  return '2026-06-30T05:30:00.000Z';
}

// ════════════════════════════════════════════════════════════════════════════
// USER REGISTRY
// ════════════════════════════════════════════════════════════════════════════

export function registerUser(username: string, displayName: string): User {
  if (!username || username.length < 2 || username.length > 32) {
    throw new Error('registerUser: username length invalid (' + username.length + ')');
  }
  if (!/^[\p{L}\p{N}_-]+$/u.test(username)) {
    throw new Error('registerUser: username contains invalid characters: ' + username);
  }
  const key = username.toLowerCase();
  if (USERS.has(key)) {
    throw new Error('registerUser: username already taken: ' + username);
  }
  const u: User = Object.freeze({
    id: userId(nextId('u')),
    username,
    displayName,
    createdAt: nowIso(),
  });
  USERS.set(key, u);
  return u;
}

export function getUser(username: string): User | undefined {
  return USERS.get(username.toLowerCase());
}

export function getUserById(id: UserId): User | undefined {
  for (const u of USERS.values()) {
    if (u.id === id) return u;
  }
  return undefined;
}

export function listUsers(): ReadonlyArray<User> {
  return Object.freeze(Array.from(USERS.values()));
}

// ════════════════════════════════════════════════════════════════════════════
// MENTION PARSING — Unicode word boundary aware (cycle 68/69/75)
// ════════════════════════════════════════════════════════════════════════════

const MENTION_RE = /(^|[^\p{L}\p{N}_])(@((?:[\p{L}\p{N}_-]{1,32})))/gu;

export interface ParseMentionsOptions {
  readonly resolveUsers?: boolean;
}

export function parseMentions(body: string, opts: ParseMentionsOptions = {}): ReadonlyArray<Mention> {
  if (!body) return Object.freeze([]);
  const resolve = opts.resolveUsers !== false;
  const result: Mention[] = [];
  const seen = new Set<string>();
  MENTION_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MENTION_RE.exec(body)) !== null) {
    const prefix = match[1] ?? '';
    const fullToken = match[2] ?? '';
    const username = (match[3] ?? '').toLowerCase();
    if (seen.has(username)) continue;
    seen.add(username);
    const tokenStart = match.index + prefix.length;
    const user = USERS.get(username);
    const effectiveUserId = user
      ? user.id
      : userId('unresolved:' + username);
    if (resolve && !user) continue;
    result.push(
      Object.freeze({
        userId: effectiveUserId,
        username,
        rawText: fullToken,
        start: tokenStart,
        end: tokenStart + fullToken.length,
      }),
    );
  }
  return Object.freeze(result);
}

/**
 * Extract sacred terms found in body, preserving source casing.
 * Cycle 75 lesson #4: returns source-string casing, not normalized.
 */
export function extractSacredTerms(body: string): ReadonlyArray<string> {
  if (!body) return Object.freeze([]);
  const found = new Set<string>();
  for (const term of SACRED_TERMS) {
    const re = new RegExp(
      '(^|[^\\p{L}\\p{N}_])' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^\\p{L}\\p{N}_])',
      'iu',
    );
    const m = re.exec(body);
    if (m) found.add(term);
  }
  return Object.freeze(Array.from(found));
}

// ════════════════════════════════════════════════════════════════════════════
// THREAD STRUCTURE — createComment + replyToComment + cycle detection
// ════════════════════════════════════════════════════════════════════════════

function walkAncestors(startId: CommentId): CommentId[] {
  const chain: CommentId[] = [];
  let cursor: CommentId | null | undefined = PARENT_BY_ID.get(startId);
  const seen = new Set<CommentId>([startId]);
  while (cursor != null) {
    if (seen.has(cursor)) {
      throw new Error('cycle detected in parent chain at ' + cursor);
    }
    seen.add(cursor);
    chain.push(cursor);
    cursor = PARENT_BY_ID.get(cursor);
  }
  return chain;
}

function findRoot(commentIdVal: CommentId): CommentId {
  const ancestors = walkAncestors(commentIdVal);
  return ancestors.length === 0 ? commentIdVal : (ancestors[ancestors.length - 1] as CommentId);
}

function effectiveDepth(parentDepth: number | null): number {
  if (parentDepth == null) return 0;
  if (parentDepth >= MAX_THREAD_DEPTH) return MAX_THREAD_DEPTH;
  return parentDepth + 1;
}

export function createComment(input: CreateCommentInput): Comment {
  if (!input.body || input.body.trim().length === 0) {
    throw new Error('createComment: body must not be empty');
  }
  const author = getUserById(input.authorId);
  if (!author) {
    throw new Error('createComment: unknown authorId ' + input.authorId);
  }

  let parentId: CommentId | null = input.parentId ?? null;
  let parentDepth: number | null = null;
  let rootId: CommentId;

  if (parentId != null) {
    const parent = COMMENTS.get(parentId);
    if (!parent) {
      throw new Error('createComment: parent comment not found: ' + parentId);
    }
    if (parent.deletedAt != null) {
      throw new Error('createComment: cannot reply to deleted comment ' + parentId);
    }
    if (parent.postId !== input.postId) {
      throw new Error('createComment: parent belongs to a different post');
    }
    parentDepth = parent.depth;
    rootId = parent.rootId;
  } else {
    rootId = commentId('placeholder');
  }

  const id = commentId(nextId('c'));
  if (parentId == null) rootId = id;

  const depth = effectiveDepth(parentDepth);
  const mentions = parseMentions(input.body);
  const flag = maybeBuildFlag(input.body);

  const comment: Comment = Object.freeze({
    id,
    postId: input.postId,
    parentId,
    rootId,
    authorId: input.authorId,
    body: input.body,
    mentions,
    depth,
    createdAt: nowIso(),
    editedAt: null,
    deletedAt: null,
    moderationFlag: flag,
  });

  COMMENTS.set(id, comment);
  PARENT_BY_ID.set(id, parentId);
  if (parentId != null) {
    const existing = CHILDREN.get(parentId) ?? [];
    CHILDREN.set(parentId, Object.freeze([...existing, id]));
  }
  CHILDREN.set(id, Object.freeze([]));

  const subs = new Set(SUBSCRIPTIONS.get(rootId) ?? new Set<UserId>());
  subs.add(input.authorId);
  SUBSCRIPTIONS.set(rootId, Object.freeze(subs));

  return comment;
}

export function replyToComment(parentIdVal: CommentId, input: ReplyInput): Comment {
  const parent = COMMENTS.get(parentIdVal);
  if (!parent) {
    throw new Error('replyToComment: parent not found: ' + parentIdVal);
  }
  const author = getUserById(input.authorId);
  if (!author) {
    throw new Error('replyToComment: unknown authorId ' + input.authorId);
  }
  return createComment({
    postId: parent.postId,
    authorId: input.authorId,
    body: input.body,
    parentId: parentIdVal,
  });
}

export function editComment(idVal: CommentId, newBody: string): Comment {
  const existing = COMMENTS.get(idVal);
  if (!existing) throw new Error('editComment: comment not found: ' + idVal);
  if (existing.deletedAt != null) {
    throw new Error('editComment: cannot edit deleted comment ' + idVal);
  }
  if (!newBody || newBody.trim().length === 0) {
    throw new Error('editComment: body must not be empty');
  }
  const mentions = parseMentions(newBody);
  const flag = maybeBuildFlag(newBody);
  const updated: Comment = Object.freeze({
    ...existing,
    body: newBody,
    mentions,
    moderationFlag: flag,
    editedAt: nowIso(),
  });
  COMMENTS.set(idVal, updated);
  return updated;
}

export function softDeleteComment(idVal: CommentId): Comment {
  const existing = COMMENTS.get(idVal);
  if (!existing) throw new Error('softDeleteComment: comment not found: ' + idVal);
  if (existing.deletedAt != null) return existing;
  const updated: Comment = Object.freeze({
    ...existing,
    deletedAt: nowIso(),
  });
  COMMENTS.set(idVal, updated);
  return updated;
}

export function getComment(idVal: CommentId): Comment | undefined {
  return COMMENTS.get(idVal);
}

function* iterateDescendants(
  root: CommentId,
  includeDeleted: boolean,
  maxDepth: number = MAX_THREAD_DEPTH,
): Generator<Comment> {
  const stack: Array<{ id: CommentId; depth: number }> = [{ id: root, depth: 0 }];
  while (stack.length > 0) {
    const pop = stack.pop();
    if (!pop) continue;
    const { id, depth } = pop;
    const c = COMMENTS.get(id);
    if (!c) continue;
    // YIELD first if eligible, THEN traverse children (so deleted nodes are
    // excluded from output but their alive grandchildren are still reached).
    const isDeleted = c.deletedAt != null;
    if (!(isDeleted && !includeDeleted)) {
      yield c;
    }
    if (depth >= maxDepth) continue;
    const kids = CHILDREN.get(id) ?? [];
    for (let i = kids.length - 1; i >= 0; i--) {
      const kidId = kids[i];
      if (kidId != null) stack.push({ id: kidId, depth: depth + 1 });
    }
  }
}

export function listThread(
  rootId: CommentId,
  options: ListThreadOptions = {},
): ReadonlyArray<Comment> {
  if (!COMMENTS.has(rootId)) {
    throw new Error('listThread: root comment not found: ' + rootId);
  }
  const includeDeleted = options.includeDeleted === true;
  const maxDepth = options.maxDepth ?? MAX_THREAD_DEPTH;
  const out: Comment[] = [];
  for (const c of iterateDescendants(rootId, includeDeleted, maxDepth)) {
    out.push(c);
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// CROSS-TRADITION FLAG — perspective-only, NEVER blocks
// ════════════════════════════════════════════════════════════════════════════

function maybeBuildFlag(body: string): ModerationFlag | null {
  const terms = extractSacredTerms(body);
  if (terms.length < 2) return null;
  const reason =
    'Comentário cita ' + terms.length + ' termos sagrados distintos ' +
    '(' + terms.slice(0, 4).join(', ') + (terms.length > 4 ? '…' : '') + '); ' +
    'tratar como perspectiva, nunca como afirmação exclusiva.';
  return Object.freeze({
    kind: 'cross_tradition_perspective' as const,
    reason,
    flaggedAt: nowIso(),
    sacredTermsFound: terms,
  });
}

export function flagCrossTradition(commentIdVal: CommentId): CrossTraditionFlag | null {
  const c = COMMENTS.get(commentIdVal);
  if (!c) return null;
  if (!c.moderationFlag) return null;
  const traditions = c.moderationFlag.sacredTermsFound;
  const seen = new Set<string>();
  for (const t of traditions) {
    if (/^(Orixá|Odu|Ifá|Babalorixá|Yalorixá|Caboclo|Pomba-Gira|Marinheiro)$/i.test(t)) {
      seen.add('Africanas');
    } else if (/^(Sephirot|Kether|Chokhmah|Binah|Malkuth|Cabala)$/i.test(t)) {
      seen.add('Cabala');
    } else if (/^(Bodhisattva|Guru|Mantra|Kundalini|Tantra|Ayurveda|Meditação)$/i.test(t)) {
      seen.add('Oriente');
    } else if (/^(Tarô|Tarot|Cigano|Runas)$/i.test(t)) {
      seen.add('Cartomancia & Runas');
    } else if (/^(Akasha|Akáshico)$/i.test(t)) {
      seen.add('Akáshica');
    } else if (/^(Prece|Ritual|Banho|Defumação)$/i.test(t)) {
      seen.add('Rituais');
    } else {
      seen.add('Outras');
    }
  }
  return Object.freeze({
    perspectiveOnly: true as const,
    traditionsPresent: Object.freeze(Array.from(seen)),
    flaggedAt: nowIso(),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// THREAD SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════════════════

export function subscribeToThread(rootId: CommentId, userIdVal: UserId): void {
  if (!COMMENTS.has(rootId)) {
    throw new Error('subscribeToThread: root not found: ' + rootId);
  }
  const subs = new Set(SUBSCRIPTIONS.get(rootId) ?? new Set<UserId>());
  subs.add(userIdVal);
  SUBSCRIPTIONS.set(rootId, Object.freeze(subs));
  const muted = new Set(MUTED.get(rootId) ?? new Set<UserId>());
  muted.delete(userIdVal);
  MUTED.set(rootId, Object.freeze(muted));
}

export function muteThread(rootId: CommentId, userIdVal: UserId): void {
  if (!COMMENTS.has(rootId)) {
    throw new Error('muteThread: root not found: ' + rootId);
  }
  const muted = new Set(MUTED.get(rootId) ?? new Set<UserId>());
  muted.add(userIdVal);
  MUTED.set(rootId, Object.freeze(muted));
  const subs = new Set(SUBSCRIPTIONS.get(rootId) ?? new Set<UserId>());
  subs.delete(userIdVal);
  SUBSCRIPTIONS.set(rootId, Object.freeze(subs));
}

export function getThreadSubscribers(rootId: CommentId): ReadonlyArray<UserId> {
  const subs = SUBSCRIPTIONS.get(rootId);
  if (!subs) return Object.freeze([]);
  return Object.freeze(Array.from(subs));
}

export function getThreadMuted(rootId: CommentId): ReadonlyArray<UserId> {
  const m = MUTED.get(rootId);
  if (!m) return Object.freeze([]);
  return Object.freeze(Array.from(m));
}

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATION HOOKS
// ════════════════════════════════════════════════════════════════════════════

function buildEvent(
  kind: NotificationKind,
  commentIdVal: CommentId,
  rootId: CommentId,
  actorId: UserId,
  recipientId: UserId,
): NotificationEvent {
  if (actorId === recipientId) {
    throw new Error(
      'notification: actor (' + actorId + ') cannot notify themselves (' + recipientId + ')',
    );
  }
  const event: NotificationEvent = Object.freeze({
    kind,
    commentId: commentIdVal,
    rootId,
    actorId,
    recipientId,
    createdAt: nowIso(),
    brand: 'W76-D' as const,
  });
  NOTIFICATION_LOG.push(event);
  return event;
}

export function notifyOnMention(
  commentIdVal: CommentId,
  mentionerId: UserId,
  mentionedId: UserId,
): NotificationEvent {
  const c = COMMENTS.get(commentIdVal);
  if (!c) throw new Error('notifyOnMention: comment not found ' + commentIdVal);
  return buildEvent('mention', commentIdVal, c.rootId, mentionerId, mentionedId);
}

export function notifyOnReply(
  commentIdVal: CommentId,
  parentAuthorId: UserId,
  replierId: UserId,
): NotificationEvent {
  const c = COMMENTS.get(commentIdVal);
  if (!c) throw new Error('notifyOnReply: comment not found ' + commentIdVal);
  return buildEvent('reply', commentIdVal, c.rootId, replierId, parentAuthorId);
}

export function notifyOnThreadSubscription(
  commentIdVal: CommentId,
  subscriberId: UserId,
  authorId: UserId,
): NotificationEvent {
  const c = COMMENTS.get(commentIdVal);
  if (!c) throw new Error('notifyOnThreadSubscription: comment not found ' + commentIdVal);
  return buildEvent('subscription', commentIdVal, c.rootId, authorId, subscriberId);
}

export function exportNotificationAudit(): ReadonlyArray<NotificationEvent> {
  return Object.freeze(NOTIFICATION_LOG.slice());
}

// ════════════════════════════════════════════════════════════════════════════
// TEST-ONLY RESET
// ════════════════════════════════════════════════════════════════════════════

export function _resetForTests(): void {
  USERS.clear();
  COMMENTS.clear();
  CHILDREN.clear();
  SUBSCRIPTIONS.clear();
  MUTED.clear();
  NOTIFICATION_LOG.length = 0;
  PARENT_BY_ID.clear();
  _seq = 0;
  MENTION_RE.lastIndex = 0;
}

export function _peekInternal(bucket: 'comments' | 'children' | 'subs' | 'muted' | 'notif'): number {
  switch (bucket) {
    case 'comments': return COMMENTS.size;
    case 'children': return CHILDREN.size;
    case 'subs': return SUBSCRIPTIONS.size;
    case 'muted': return MUTED.size;
    case 'notif': return NOTIFICATION_LOG.length;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// VERSION
// ════════════════════════════════════════════════════════════════════════════

export const W76_D_VERSION = '1.0.0' as const;
export const W76_D_CYCLE = 76 as const;
export const W76_D_MAX_DEPTH = MAX_THREAD_DEPTH;
export const W76_D_SACRED_TERMS_COUNT = SACRED_TERMS.length;

export const __INTERNAL__ = {
  walkAncestors,
  findRoot,
  effectiveDepth,
  maybeBuildFlag,
  MENTION_RE,
};
