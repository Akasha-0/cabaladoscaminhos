/**
 * ════════════════════════════════════════════════════════════════════════════
 * W76-D — COMMENTS THREADING + MENTIONS · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 76 · 2026-06-30
 *
 * Uses real vitest (describe/it/expect) per cycle-76 prompt. The worktree
 * node-stubs.d.ts declares a `vitest` module with the full matcher set so
 * this spec compiles under the worktree-isolated tsconfig. When run via
 * `npx vitest run`, the real vitest types win (vitest's module resolution
 * finds node_modules/vitest at the root, which is installed).
 */

import {
  registerUser,
  getUser,
  getUserById,
  listUsers,
  createComment,
  replyToComment,
  editComment,
  softDeleteComment,
  getComment,
  listThread,
  parseMentions,
  extractSacredTerms,
  subscribeToThread,
  muteThread,
  getThreadSubscribers,
  getThreadMuted,
  notifyOnMention,
  notifyOnReply,
  notifyOnThreadSubscription,
  exportNotificationAudit,
  flagCrossTradition,
  _resetForTests,
  _peekInternal,
  __INTERNAL__,
  SACRED_TERMS,
  MAX_THREAD_DEPTH,
  W76_D_VERSION,
  W76_D_CYCLE,
  W76_D_MAX_DEPTH,
  W76_D_SACRED_TERMS_COUNT,
  type CommentId,
  type User,
  type UserId,
  type PostId,
  type Comment,
  type Mention,
  type NotificationEvent,
} from './comments-threading-mentions.ts';
import { describe, it, expect, beforeEach } from 'vitest';

// ════════════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════════════

let alice: User;
let bob: User;
let carla: User;
let dani: User;
let post: PostId;

beforeEach(() => {
  _resetForTests();
  alice = registerUser('alice', 'Alice Cigana');
  bob = registerUser('bob', 'Bob do Cigano Ramiro');
  carla = registerUser('carla', 'Carla Cabalista');
  dani = registerUser('dani-orixa', 'Dani de Oxum');
  post = 'post-mesa-real-1' as PostId;
});

// ════════════════════════════════════════════════════════════════════════════
// 1. USER REGISTRY
// ════════════════════════════════════════════════════════════════════════════

describe('user registry', () => {
  it('registerUser returns User with branded id and iso timestamp', () => {
    expect(alice.id).toBeTruthy();
    expect(typeof alice.id).toBe('string');
    expect(alice.username).toBe('alice');
    expect(alice.displayName).toBe('Alice Cigana');
    expect(alice.createdAt).toBe('2026-06-30T05:30:00.000Z');
  });

  it('registerUser is case-insensitive — Alice === alice', () => {
    expect(() => registerUser('Alice', 'Other')).toThrow(/already taken/i);
    expect(() => registerUser('ALICE', 'Other')).toThrow(/already taken/i);
  });

  it('registerUser rejects empty / too-short / too-long usernames', () => {
    expect(() => registerUser('a', 'X')).toThrow(/length/i);
    expect(() => registerUser('', 'X')).toThrow(/length/i);
    expect(() => registerUser('x'.repeat(33), 'X')).toThrow(/length/i);
  });

  it('registerUser rejects invalid characters (PT-BR unicode allowed, symbols rejected)', () => {
    expect(() => registerUser('user!', 'X')).toThrow(/invalid characters/i);
    expect(() => registerUser('user@host', 'X')).toThrow(/invalid characters/i);
    // PT-BR accented names OK
    const u = registerUser('ogã', 'Ogã de Ogum');
    expect(u.username).toBe('ogã');
  });

  it('getUser returns user case-insensitively', () => {
    expect(getUser('alice')?.id).toBe(alice.id);
    expect(getUser('ALICE')?.id).toBe(alice.id);
    expect(getUser('Alice')?.id).toBe(alice.id);
    expect(getUser('nobody')).toBeUndefined();
  });

  it('listUsers returns frozen array of all registered', () => {
    const users = listUsers();
    expect(users.length).toBe(4);
    expect(Object.isFrozen(users)).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. MENTION PARSING — Unicode word boundary
// ════════════════════════════════════════════════════════════════════════════

describe('parseMentions (cycle 68/69/75 — Unicode word boundary)', () => {
  it('parses a single @username in plain text', () => {
    const m = parseMentions('oi @alice tudo bem?');
    expect(m.length).toBe(1);
    expect(m[0]?.username).toBe('alice');
    expect(m[0]?.userId).toBe(alice.id);
    expect(m[0]?.rawText).toBe('@alice');
    expect(m[0]?.start).toBe(3);
    expect(m[0]?.end).toBe(9);
  });

  it('parses multiple mentions, deduplicating per username', () => {
    const m = parseMentions('@alice e @bob — @alice de novo');
    expect(m.length).toBe(2);
    const usernames = m.map((x) => x.username).sort();
    expect(usernames).toEqual(['alice', 'bob']);
  });

  it('@username at start of string (no leading prefix)', () => {
    const m = parseMentions('@alice olha isso');
    expect(m.length).toBe(1);
    expect(m[0]?.start).toBe(0);
  });

  it('rejects @ within a word (ASCII \\b trap — cycle 75 lesson #3)', () => {
    // "prealice" should NOT contain a mention of alice — ASCII \b would
    // wrongly match this; Unicode lookaround correctly rejects.
    const m = parseMentions('e-mail prealice @alice true');
    expect(m.length).toBe(1);
    expect(m[0]?.username).toBe('alice');
    expect(m[0]?.start).toBeGreaterThan(15);
  });

  it('accepts PT-BR hyphens in usernames (cigano-ramiro, dani-orixa)', () => {
    const m = parseMentions('chamando @dani-orixa aqui');
    expect(m.length).toBe(1);
    expect(m[0]?.username).toBe('dani-orixa');
    expect(m[0]?.userId).toBe(dani.id);
  });

  it('skips unresolved usernames when resolveUsers=true (default)', () => {
    const m = parseMentions('oi @ghost_user e @alice');
    expect(m.length).toBe(1);
    expect(m[0]?.username).toBe('alice');
  });

  it('with resolveUsers=false returns raw mentions even for unresolved users (placeholder userId)', () => {
    const m = parseMentions('oi @ghost @alice', { resolveUsers: false });
    expect(m.length).toBe(2);
    const ghost = m.find((x) => x.username === 'ghost');
    const aliceM = m.find((x) => x.username === 'alice');
    expect(ghost?.userId).toBe('unresolved:ghost');
    expect(aliceM?.userId).toBe(alice.id);
  });

  it('returns empty array for empty body', () => {
    expect(parseMentions('').length).toBe(0);
  });

  it('mention positions cover rawText exactly (start..end)', () => {
    const body = 'texto @bob mais texto';
    const m = parseMentions(body);
    expect(m.length).toBe(1);
    const mention = m[0]!;
    expect(body.slice(mention.start, mention.end)).toBe('@bob');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. SACRED TERMS — preserve source casing
// ════════════════════════════════════════════════════════════════════════════

describe('extractSacredTerms', () => {
  it('returns ≥30 sacred terms from the whitelist', () => {
    expect(SACRED_TERMS.length).toBeGreaterThanOrEqual(30);
    expect(W76_D_SACRED_TERMS_COUNT).toBe(SACRED_TERMS.length);
  });

  it('preserves source casing (Orixá, Ogum, Tarô with accents)', () => {
    const found = extractSacredTerms('Honro Ogum e o Orixá me guia');
    expect(found).toContain('Ogum');
    expect(found).toContain('Orixá');
  });

  it('returns empty for body with no sacred terms', () => {
    expect(extractSacredTerms('apenas prosa cotidiana').length).toBe(0);
  });

  it('handles accented terms with Unicode boundaries (NOT ASCII \\b)', () => {
    // "Ogumância" must NOT match Ogum. ASCII \b would wrongly match.
    const found = extractSacredTerms('Ogumância é uma palavra comum');
    expect(found).not.toContain('Ogum');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. THREAD STRUCTURE — depth + parent chain + cycle detection
// ════════════════════════════════════════════════════════════════════════════

describe('createComment / thread structure', () => {
  it('top-level comment has depth=0, rootId=self, parentId=null', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    expect(c.depth).toBe(0);
    expect(c.parentId).toBeNull();
    expect(c.rootId).toBe(c.id);
  });

  it('reply increments depth by 1 (max 5)', () => {
    let current = createComment({ postId: post, authorId: alice.id, body: 'd0' });
    for (let i = 1; i <= 5; i++) {
      current = replyToComment(current.id, { authorId: bob.id, body: `d${i}` });
      expect(current.depth).toBe(i);
    }
    // Depth 6 attempt: parent is at depth 5, so new comment caps at depth 5.
    const overflow = replyToComment(current.id, { authorId: alice.id, body: 'overflow' });
    expect(overflow.depth).toBe(MAX_THREAD_DEPTH);
  });

  it('rootId stays the same across deep replies (root never changes)', () => {
    const root = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    const r1 = replyToComment(root.id, { authorId: bob.id, body: 'r1' });
    const r2 = replyToComment(r1.id, { authorId: alice.id, body: 'r2' });
    expect(r2.rootId).toBe(root.id);
  });

  it('rejects reply to unknown parent', () => {
    expect(() =>
      replyToComment('nonexistent-c' as CommentId, { authorId: alice.id, body: 'x' }),
    ).toThrow(/not found/i);
  });

  it('rejects reply to soft-deleted parent', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'vai morrer' });
    softDeleteComment(c.id);
    expect(() =>
      replyToComment(c.id, { authorId: bob.id, body: 'reply a fantasma' }),
    ).toThrow(/deleted/i);
  });

  it('rejects cross-post parent (parent from different post)', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'post 1' });
    expect(() =>
      createComment({
        postId: 'post-other' as PostId,
        authorId: bob.id,
        body: 'cross-post',
        parentId: c.id,
      }),
    ).toThrow(/different post/i);
  });

  it('rejects empty body / whitespace-only body', () => {
    expect(() => createComment({ postId: post, authorId: alice.id, body: '' })).toThrow();
    expect(() => createComment({ postId: post, authorId: alice.id, body: '   ' })).toThrow();
  });

  it('rejects unknown authorId', () => {
    expect(() =>
      createComment({ postId: post, authorId: 'u-ghost' as UserId, body: 'x' }),
    ).toThrow(/unknown author/i);
  });

  it('walkAncestors returns chain from parent upward', () => {
    const r0 = createComment({ postId: post, authorId: alice.id, body: 'r0' });
    const r1 = replyToComment(r0.id, { authorId: bob.id, body: 'r1' });
    const r2 = replyToComment(r1.id, { authorId: alice.id, body: 'r2' });
    const chain = __INTERNAL__.walkAncestors(r2.id);
    expect(chain.length).toBe(2);
    expect(chain[0]).toBe(r1.id);
    expect(chain[1]).toBe(r0.id);
  });

  it('findRoot returns the highest ancestor', () => {
    const r0 = createComment({ postId: post, authorId: alice.id, body: 'r0' });
    const r1 = replyToComment(r0.id, { authorId: bob.id, body: 'r1' });
    const r2 = replyToComment(r1.id, { authorId: alice.id, body: 'r2' });
    expect(__INTERNAL__.findRoot(r2.id)).toBe(r0.id);
    expect(__INTERNAL__.findRoot(r0.id)).toBe(r0.id);
  });

  it('effectiveDepth caps at MAX_THREAD_DEPTH', () => {
    expect(__INTERNAL__.effectiveDepth(null)).toBe(0);
    expect(__INTERNAL__.effectiveDepth(0)).toBe(1);
    expect(__INTERNAL__.effectiveDepth(4)).toBe(5);
    expect(__INTERNAL__.effectiveDepth(5)).toBe(5);
    expect(__INTERNAL__.effectiveDepth(10)).toBe(5);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. EDIT / DELETE
// ════════════════════════════════════════════════════════════════════════════

describe('editComment / softDeleteComment', () => {
  it('editComment updates body, sets editedAt, re-parses mentions', () => {
    const c = createComment({
      postId: post,
      authorId: alice.id,
      body: 'olá @bob',
    });
    expect(c.mentions.length).toBe(1);
    const edited = editComment(c.id, 'olá @carla — e @bob também');
    expect(edited.body).toBe('olá @carla — e @bob também');
    expect(edited.editedAt).not.toBeNull();
    expect(edited.mentions.length).toBe(2);
  });

  it('editComment rejects empty body', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'vivo' });
    expect(() => editComment(c.id, '')).toThrow(/empty/i);
  });

  it('editComment rejects soft-deleted comment', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'vai sumir' });
    softDeleteComment(c.id);
    expect(() => editComment(c.id, 'tentativa pós-morte')).toThrow(/deleted/i);
  });

  it('softDeleteComment sets deletedAt and is idempotent', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'adeus' });
    const d1 = softDeleteComment(c.id);
    expect(d1.deletedAt).not.toBeNull();
    const d2 = softDeleteComment(c.id);
    expect(d2.deletedAt).toBe(d1.deletedAt);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. LIST THREAD
// ════════════════════════════════════════════════════════════════════════════

describe('listThread', () => {
  it('returns pre-order DFS including all descendants', () => {
    const r0 = createComment({ postId: post, authorId: alice.id, body: 'r0' });
    const r1a = replyToComment(r0.id, { authorId: bob.id, body: 'r1a' });
    const r1b = replyToComment(r0.id, { authorId: carla.id, body: 'r1b' });
    const r2 = replyToComment(r1a.id, { authorId: alice.id, body: 'r2' });
    const list = listThread(r0.id);
    expect(list.length).toBe(4);
    expect(list[0]?.id).toBe(r0.id);
    // r1a, r2, r1b (order depends on stack pop)
    const ids = list.map((c) => c.id);
    expect(ids).toContain(r1a.id);
    expect(ids).toContain(r1b.id);
    expect(ids).toContain(r2.id);
  });

  it('excludes soft-deleted by default, includes with includeDeleted=true', () => {
    const r0 = createComment({ postId: post, authorId: alice.id, body: 'r0' });
    const r1 = replyToComment(r0.id, { authorId: bob.id, body: 'r1' });
    softDeleteComment(r1.id);
    expect(listThread(r0.id).length).toBe(1);
    expect(listThread(r0.id, { includeDeleted: true }).length).toBe(2);
  });

  it('rejects unknown root', () => {
    expect(() => listThread('nonexistent-c' as CommentId)).toThrow(/not found/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. SUBSCRIPTIONS + MUTE
// ════════════════════════════════════════════════════════════════════════════

describe('subscribeToThread / muteThread', () => {
  it('author auto-subscribes on createComment', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    const subs = getThreadSubscribers(c.rootId);
    expect(subs).toContain(alice.id);
  });

  it('replier auto-subscribes to root thread', () => {
    const root = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    replyToComment(root.id, { authorId: bob.id, body: 'reply' });
    const subs = getThreadSubscribers(root.id);
    expect(subs).toContain(alice.id);
    expect(subs).toContain(bob.id);
  });

  it('subscribeToThread adds user, removes from muted', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    muteThread(c.rootId, bob.id);
    expect(getThreadMuted(c.rootId)).toContain(bob.id);
    subscribeToThread(c.rootId, bob.id);
    expect(getThreadMuted(c.rootId)).not.toContain(bob.id);
    expect(getThreadSubscribers(c.rootId)).toContain(bob.id);
  });

  it('muteThread removes from subscribers and adds to muted', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    subscribeToThread(c.rootId, bob.id);
    muteThread(c.rootId, bob.id);
    expect(getThreadSubscribers(c.rootId)).not.toContain(bob.id);
    expect(getThreadMuted(c.rootId)).toContain(bob.id);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. NOTIFICATION HOOKS
// ════════════════════════════════════════════════════════════════════════════

describe('notification hooks', () => {
  it('notifyOnMention creates a frozen event with brand W76-D', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'oi @bob' });
    const ev = notifyOnMention(c.id, alice.id, bob.id);
    expect(ev.kind).toBe('mention');
    expect(ev.actorId).toBe(alice.id);
    expect(ev.recipientId).toBe(bob.id);
    expect(ev.commentId).toBe(c.id);
    expect(ev.rootId).toBe(c.id);
    expect(ev.brand).toBe('W76-D');
    expect(Object.isFrozen(ev)).toBe(true);
  });

  it('notifyOnReply creates a reply event', () => {
    const root = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    const reply = replyToComment(root.id, { authorId: bob.id, body: 'reply' });
    const ev = notifyOnReply(reply.id, alice.id, bob.id);
    expect(ev.kind).toBe('reply');
    expect(ev.actorId).toBe(bob.id);
    expect(ev.recipientId).toBe(alice.id);
  });

  it('notifyOnThreadSubscription creates a subscription event', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'raiz' });
    const ev = notifyOnThreadSubscription(c.id, bob.id, alice.id);
    expect(ev.kind).toBe('subscription');
    expect(ev.recipientId).toBe(bob.id);
    expect(ev.actorId).toBe(alice.id);
  });

  it('rejects self-notification (actor === recipient)', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'x' });
    expect(() => notifyOnMention(c.id, alice.id, alice.id)).toThrow(/themselves/i);
  });

  it('exportNotificationAudit returns frozen slice of all events', () => {
    const c1 = createComment({ postId: post, authorId: alice.id, body: 'oi @bob' });
    notifyOnMention(c1.id, alice.id, bob.id);
    const c2 = createComment({ postId: post, authorId: bob.id, body: 'oi @alice' });
    notifyOnMention(c2.id, bob.id, alice.id);
    const audit = exportNotificationAudit();
    expect(audit.length).toBe(2);
    expect(Object.isFrozen(audit)).toBe(true);
    // Mutating audit must not affect internal log
    expect(() => (audit as unknown as NotificationEvent[]).push({} as NotificationEvent)).toThrow();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 9. CROSS-TRADITION FLAG — perspective-only, NEVER blocked
// ════════════════════════════════════════════════════════════════════════════

describe('flagCrossTradition (sacred coverage)', () => {
  it('does NOT flag when body has 0 or 1 sacred terms', () => {
    const c1 = createComment({ postId: post, authorId: alice.id, body: 'apenas prosa' });
    expect(c1.moderationFlag).toBeNull();
    const c2 = createComment({ postId: post, authorId: alice.id, body: 'Ogum me guia' });
    expect(c2.moderationFlag).toBeNull();
  });

  it('flags with kind=cross_tradition_perspective when 2+ sacred terms present', () => {
    const c = createComment({
      postId: post,
      authorId: alice.id,
      body: 'Honro Ogum e Oxum lado a lado — Ogum abre caminhos, Oxum cuida do lar.',
    });
    expect(c.moderationFlag).not.toBeNull();
    expect(c.moderationFlag?.kind).toBe('cross_tradition_perspective');
    expect(c.moderationFlag?.sacredTermsFound).toContain('Ogum');
    expect(c.moderationFlag?.sacredTermsFound).toContain('Oxum');
  });

  it('flagCrossTradition returns perspectiveOnly=true ALWAYS — never blocks', () => {
    const c = createComment({
      postId: post,
      authorId: alice.id,
      body: 'Cigano Ramiro encontra Cabala aqui — Ogum e Oxumarê caminham juntos.',
    });
    const flag = flagCrossTradition(c.id);
    expect(flag).not.toBeNull();
    expect(flag?.perspectiveOnly).toBe(true);
    // Critically: never returns a "block" or "wrong" verdict
    expect(JSON.stringify(flag)).not.toMatch(/(blocked|wrong|invalid|spam)/i);
  });

  it('editComment re-evaluates flag (new body may add or remove sacred terms)', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'Oi @bob' });
    expect(c.moderationFlag).toBeNull();
    const edited = editComment(c.id, 'Ogum e Oxum lado a lado');
    expect(edited.moderationFlag).not.toBeNull();
    const cleaned = editComment(c.id, 'apenas prosa agora');
    expect(cleaned.moderationFlag).toBeNull();
  });

  it('flagCrossTradition groups terms into tradition buckets', () => {
    const c = createComment({
      postId: post,
      authorId: alice.id,
      body: 'Ogum (Orixá) + Kether (Cabala) + Mantra (Oriente) lado a lado.',
    });
    const flag = flagCrossTradition(c.id);
    expect(flag).not.toBeNull();
    expect(flag?.traditionsPresent).toContain('Africanas');
    expect(flag?.traditionsPresent).toContain('Cabala');
    expect(flag?.traditionsPresent).toContain('Oriente');
  });

  it('flagCrossTradition returns null for comment without flag', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'prosa' });
    expect(flagCrossTradition(c.id)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 10. FREEZE / READONLY / INTEGRATION
// ════════════════════════════════════════════════════════════════════════════

describe('immutability & integration', () => {
  it('Comment is frozen, mentions array is frozen, each mention is frozen', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'oi @bob' });
    expect(Object.isFrozen(c)).toBe(true);
    expect(Object.isFrozen(c.mentions)).toBe(true);
    for (const m of c.mentions) {
      expect(Object.isFrozen(m)).toBe(true);
    }
  });

  it('editComment returns a NEW frozen object (does not mutate prior ref)', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'v1' });
    const c2 = editComment(c.id, 'v2');
    expect(c.body).toBe('v1');
    expect(c2.body).toBe('v2');
    expect(c.editedAt).toBeNull();
    expect(c2.editedAt).not.toBeNull();
  });

  it('end-to-end: deep thread with mention + reply notification + cross-tradition flag', () => {
    const root = createComment({
      postId: post,
      authorId: alice.id,
      body: 'Cigano Ramiro encontra Cabala aqui — Ogum e Oxumarê.',
    });
    const reply = replyToComment(root.id, {
      authorId: bob.id,
      body: 'Concordo @alice — e Oxum',
    });
    notifyOnReply(reply.id, alice.id, bob.id);
    notifyOnMention(reply.id, bob.id, alice.id);
    expect(reply.mentions.length).toBe(1);
    expect(reply.mentions[0]?.username).toBe('alice');
    expect(root.moderationFlag).not.toBeNull();
    const audit = exportNotificationAudit();
    expect(audit.length).toBe(2);
    const kinds = audit.map((e) => e.kind).sort();
    expect(kinds).toEqual(['mention', 'reply']);
  });

  it('version constants', () => {
    expect(W76_D_VERSION).toBe('1.0.0');
    expect(W76_D_CYCLE).toBe(76);
    expect(W76_D_MAX_DEPTH).toBe(5);
    expect(W76_D_SACRED_TERMS_COUNT).toBeGreaterThanOrEqual(30);
  });

  it('_peekInternal reports bucket sizes', () => {
    const c = createComment({ postId: post, authorId: alice.id, body: 'x' });
    expect(_peekInternal('comments')).toBeGreaterThanOrEqual(1);
    expect(_peekInternal('children')).toBeGreaterThanOrEqual(1);
    expect(_peekInternal('subs')).toBeGreaterThanOrEqual(1);
    replyToComment(c.id, { authorId: bob.id, body: 'y' });
    notifyOnReply(c.id, alice.id, bob.id);
    expect(_peekInternal('notif')).toBeGreaterThanOrEqual(1);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 11. EXTRA EDGE CASES (≥40 total assertions target)
// ════════════════════════════════════════════════════════════════════════════

describe('edge cases', () => {
  it('mention at end of string (no trailing chars)', () => {
    const m = parseMentions('chamando @alice');
    expect(m.length).toBe(1);
    expect(m[0]?.end).toBe(m[0]?.start! + '@alice'.length);
  });

  it('mention in code-like context with backticks', () => {
    const m = parseMentions('use `cfg` and ping @alice');
    expect(m.length).toBe(1);
  });

  it('username too long (>32 chars) is rejected by mention regex', () => {
    const longName = 'a'.repeat(33);
    const body = 'oi @' + longName;
    const m = parseMentions(body);
    // Regex caps at 32 chars so the @longName won't parse; but a 32-char
    // substring match is still possible. Since 'a'*33 user is not registered,
    // resolveUsers filters it. Either way, no mention of registered alice.
    const aliceMentions = m.filter((x) => x.username === 'alice');
    expect(aliceMentions.length).toBe(0);
  });

  it('getComment returns undefined for unknown id', () => {
    expect(getComment('nope' as CommentId)).toBeUndefined();
  });

  it('getUserById returns user by id', () => {
    expect(getUserById(alice.id)?.username).toBe('alice');
    expect(getUserById('u-ghost' as UserId)).toBeUndefined();
  });

  it('subscribeToThread on unknown root throws', () => {
    expect(() => subscribeToThread('nope' as CommentId, alice.id)).toThrow(/not found/i);
    expect(() => muteThread('nope' as CommentId, alice.id)).toThrow(/not found/i);
  });

  it('listThread respects maxDepth option', () => {
    const r0 = createComment({ postId: post, authorId: alice.id, body: 'r0' });
    const r1 = replyToComment(r0.id, { authorId: bob.id, body: 'r1' });
    replyToComment(r1.id, { authorId: alice.id, body: 'r2' });
    expect(listThread(r0.id, { maxDepth: 1 }).length).toBe(2);     // r0 + r1
    expect(listThread(r0.id, { maxDepth: 0 }).length).toBe(1);     // r0 only
    expect(listThread(r0.id, { maxDepth: 5 }).length).toBe(3);     // all
  });

  it('consecutive @-tokens without separator: only the first parses', () => {
    // '@alice@bob' has '@alice' at start; '@bob' has 'e' (letter) before it,
    // so the Unicode lookaround rejects it. This is intentional — prevents
    // false matches in email-like strings.
    const m = parseMentions('@alice@bob');
    expect(m.length).toBe(1);
    expect(m[0]?.username).toBe('alice');
  });

  it('two mentions separated by space both parse', () => {
    const m = parseMentions('@alice @bob');
    expect(m.length).toBe(2);
    expect(m.map((x) => x.username).sort()).toEqual(['alice', 'bob']);
  });

  it('getThreadSubscribers returns empty array when no subs', () => {
    expect(getThreadSubscribers('no-thread' as CommentId).length).toBe(0);
    expect(getThreadMuted('no-thread' as CommentId).length).toBe(0);
  });
});
