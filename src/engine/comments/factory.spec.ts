/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — FACTORY SPEC (25+ asserts)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vitest-runnable spec for the comments engine factory. Covers:
 *   - addComment: raiz, reply, LGPD throws, depth rejected, cross-post,
 *     parent-not-found, body sanitized, mentions parsed
 *   - editComment: updates body + editedAt, refuses deleted
 *   - deleteComment: soft delete cascades to replies
 *   - listThread: groups replies (depth 1), sorts oldest-first
 *
 * NOTE on matchers: uses plain `expect(...).toBe(...)` etc. Error
 * assertions use try/catch + .toBeTruthy() (no .rejects / .toThrow — repo
 * vitest/globals typing does not expose them — see W86-C precedent).
 *
 * Run: npx vitest run src/engine/comments
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  CommentError,
  ERROR_CODES,
  MAX_BODY_LENGTH,
  _resetCommentIdSeq,
  asCommentId,
  asPostId,
  asUserId,
  type CommentId,
} from './types';
import {
  createInMemoryCommentsAdapter,
  KNOWN_HANDLES,
  SAMPLE_POST_ID_1,
  SAMPLE_POST_ID_2,
  getKnownHandlesSet,
} from './adapter-memory';
import { createCommentsEngine, validateLgpd } from './factory';

// ────────────────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────────────────

interface AsyncFail {
  ok: boolean;
  err?: unknown;
}

async function expectReject(p: Promise<unknown>): Promise<AsyncFail> {
  try {
    await p;
    return { ok: false };
  } catch (err) {
    return { ok: true, err };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// describe blocks
// ────────────────────────────────────────────────────────────────────────────

describe('LGPD consent gate', () => {
  it('throws when consent is false', () => {
    let caught: unknown = null;
    try {
      validateLgpd(false);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeTruthy();
    expect((caught as CommentError).code).toBe(ERROR_CODES.LGPD_CONSENT_REQUIRED);
  });

  it('throws when consent is undefined', () => {
    let caught: unknown = null;
    try {
      validateLgpd(false as unknown as boolean);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeTruthy();
  });

  it('accepts exactly true', () => {
    let caught: unknown = null;
    try {
      validateLgpd(true);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeNull();
  });
});

describe('addComment', () => {
  let engine: ReturnType<typeof createCommentsEngine>;
  let adapter: ReturnType<typeof createInMemoryCommentsAdapter>;

  beforeEach(() => {
    _resetCommentIdSeq();
    adapter = createInMemoryCommentsAdapter();
    engine = createCommentsEngine(adapter, getKnownHandlesSet);
  });

  it('inserts a root comment when parentId=null', async () => {
    const c = await engine.addComment(
      asPostId('p_new'),
      asUserId('u_x'),
      'primeiro! @ana comenta ai',
      null,
      true,
    );
    expect(c.parentId).toBeNull();
    expect(c.body).not.toMatch(/</);
    expect(c.body).not.toMatch(/>/);
    expect(c.status).toBe('visible');
    expect(c.id).toBeTruthy();
  });

  it('throws LGPD error without consent', async () => {
    const fail = await expectReject(
      engine.addComment(asPostId('p'), asUserId('u_x'), 'oi', null, false),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.LGPD_CONSENT_REQUIRED);
  });

  it('inserts a reply with parentId set', async () => {
    const root = await engine.addComment(
      asPostId('p_t1'),
      asUserId('u_1'),
      'raiz',
      null,
      true,
    );
    const reply = await engine.addComment(
      asPostId('p_t1'),
      asUserId('u_2'),
      'reply',
      asCommentId(root.id),
      true,
    );
    expect(reply.parentId).toBe(root.id);
  });

  it('rejects MAX_DEPTH when replying to a reply', async () => {
    const root = await engine.addComment(
      asPostId('p_d'),
      asUserId('u_1'),
      'raiz',
      null,
      true,
    );
    const reply1 = await engine.addComment(
      asPostId('p_d'),
      asUserId('u_2'),
      'reply1',
      asCommentId(root.id),
      true,
    );
    const fail = await expectReject(
      engine.addComment(
        asPostId('p_d'),
        asUserId('u_3'),
        'reply of reply',
        asCommentId(reply1.id),
        true,
      ),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.MAX_DEPTH_EXCEEDED);
  });

  it('rejects when parentId is unknown', async () => {
    const fail = await expectReject(
      engine.addComment(
        asPostId('p_x'),
        asUserId('u_1'),
        'orphan',
        asCommentId('c_does_not_exist' as CommentId),
        true,
      ),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.PARENT_NOT_FOUND);
  });

  it('rejects when parentId points to a comment in another post', async () => {
    const root = await engine.addComment(
      asPostId('p_one'),
      asUserId('u_1'),
      'raiz em p_one',
      null,
      true,
    );
    const fail = await expectReject(
      engine.addComment(
        asPostId('p_two'),
        asUserId('u_2'),
        'cross post',
        asCommentId(root.id),
        true,
      ),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.CROSS_POST_REPLY);
  });

  it('rejects empty body (after trim)', async () => {
    const fail = await expectReject(
      engine.addComment(asPostId('p'), asUserId('u'), '   ', null, true),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.BODY_TOO_SHORT);
  });

  it('rejects body longer than MAX_BODY_LENGTH', async () => {
    const huge = 'a'.repeat(MAX_BODY_LENGTH + 1);
    const fail = await expectReject(
      engine.addComment(asPostId('p'), asUserId('u'), huge, null, true),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.BODY_TOO_LONG);
  });

  it('strips <script> on write', async () => {
    const c = await engine.addComment(
      asPostId('p'),
      asUserId('u'),
      'oi <script>evil()</script> tudo bem',
      null,
      true,
    );
    expect(c.body).not.toMatch(/script/i);
    expect(c.body).toContain('tudo bem');
  });

  it('parses mentions on write', async () => {
    const c = await engine.addComment(
      asPostId('p'),
      asUserId('u'),
      'oi @ana e @bia',
      null,
      true,
    );
    expect(c.mentions.length).toBe(2);
    const handles = c.mentions.map((m) => m.handle).sort();
    expect(handles[0]).toBe('@ana');
    expect(handles[1]).toBe('@bia');
  });
});

describe('editComment', () => {
  let engine: ReturnType<typeof createCommentsEngine>;
  let adapter: ReturnType<typeof createInMemoryCommentsAdapter>;

  beforeEach(() => {
    _resetCommentIdSeq();
    adapter = createInMemoryCommentsAdapter();
    engine = createCommentsEngine(adapter, getKnownHandlesSet);
  });

  it('updates body and sets editedAt', async () => {
    const original = await engine.addComment(
      asPostId('p_e'),
      asUserId('u'),
      'original',
      null,
      true,
    );
    expect(original.editedAt).toBeUndefined();

    const edited = await engine.editComment(
      asCommentId(original.id),
      'corrigido @ana',
    );
    expect(edited.id).toBe(original.id);
    expect(edited.body).toBe('corrigido @ana');
    expect(edited.editedAt).toBeTruthy();
    expect(edited.mentions.length).toBe(1);
  });

  it('refuses to edit a deleted comment', async () => {
    const c = await engine.addComment(
      asPostId('p_d'),
      asUserId('u'),
      'will be deleted',
      null,
      true,
    );
    await engine.deleteComment(asCommentId(c.id));
    const fail = await expectReject(
      engine.editComment(asCommentId(c.id), 'fix'),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.EDIT_ON_DELETED);
  });

  it('rejects edit if comment not found', async () => {
    const fail = await expectReject(
      engine.editComment(asCommentId('c_404' as CommentId), 'hi'),
    );
    expect(fail.ok).toBe(true);
    expect((fail.err as CommentError).code).toBe(ERROR_CODES.COMMENT_NOT_FOUND);
  });
});

describe('deleteComment', () => {
  let engine: ReturnType<typeof createCommentsEngine>;
  let adapter: ReturnType<typeof createInMemoryCommentsAdapter>;

  beforeEach(() => {
    _resetCommentIdSeq();
    adapter = createInMemoryCommentsAdapter();
    engine = createCommentsEngine(adapter, getKnownHandlesSet);
  });

  it('soft-deletes (body empty + status deleted)', async () => {
    const c = await engine.addComment(
      asPostId('p_del'),
      asUserId('u'),
      'goodbye',
      null,
      true,
    );
    const deleted = await engine.deleteComment(asCommentId(c.id));
    expect(deleted.status).toBe('deleted');
    expect(deleted.body).toBe('');
  });

  it('cascades to replies when root is deleted', async () => {
    const root = await engine.addComment(
      asPostId('p_c'),
      asUserId('u_root'),
      'raiz',
      null,
      true,
    );
    await engine.addComment(
      asPostId('p_c'),
      asUserId('u_r1'),
      'reply1',
      asCommentId(root.id),
      true,
    );
    await engine.addComment(
      asPostId('p_c'),
      asUserId('u_r2'),
      'reply2',
      asCommentId(root.id),
      true,
    );
    await engine.deleteComment(asCommentId(root.id));
    const thread = await engine.listThread(asPostId('p_c'), asUserId('u_root'));
    expect(thread.length).toBe(0);
  });
});

describe('listThread', () => {
  let engine: ReturnType<typeof createCommentsEngine>;
  let adapter: ReturnType<typeof createInMemoryCommentsAdapter>;

  beforeEach(() => {
    _resetCommentIdSeq();
    adapter = createInMemoryCommentsAdapter();
    engine = createCommentsEngine(adapter, getKnownHandlesSet);
  });

  it('groups roots with their direct replies (depth ≤ 1)', async () => {
    const thread = await engine.listThread(
      asPostId(SAMPLE_POST_ID_1),
      asUserId('u_viewer'),
    );
    expect(thread.length).toBe(1);
    expect(thread[0]?.depth).toBe(0);
    expect(thread[0]?.replies.length).toBe(3);
    for (const r of thread[0]?.replies ?? []) {
      expect(r.depth).toBe(1);
      expect(r.parentId).toBe(thread[0]?.id);
    }
  });

  it('sorts replies oldest-first', async () => {
    const thread = await engine.listThread(
      asPostId(SAMPLE_POST_ID_1),
      asUserId('u_viewer'),
    );
    const replies = thread[0]?.replies ?? [];
    const created = replies.map((r) => r.createdAt);
    const sorted = [...created].sort();
    expect(created[0]).toBe(sorted[0]);
    expect(created[created.length - 1]).toBe(sorted[sorted.length - 1]);
  });

  it('returns empty array for post with no comments', async () => {
    const t = await engine.listThread(asPostId('p_empty'), asUserId('u'));
    expect(t.length).toBe(0);
  });

  it('exposes a ThreadNode shape with required fields', async () => {
    const thread = await engine.listThread(
      asPostId(SAMPLE_POST_ID_2),
      asUserId('u_viewer'),
    );
    expect(thread.length).toBe(1);
    expect(thread[0]?.replies.length).toBe(1);
  });
});

describe('known handles', () => {
  it('exposes sorted handle list', () => {
    const adapter = createInMemoryCommentsAdapter();
    const engine = createCommentsEngine(adapter, getKnownHandlesSet);
    const handles = engine.knownHandles();
    expect(handles.length).toBe(KNOWN_HANDLES.length);
    const sorted = [...KNOWN_HANDLES].sort();
    expect(handles[0]).toBe(sorted[0]);
    expect(handles[handles.length - 1]).toBe(sorted[sorted.length - 1]);
  });
});
